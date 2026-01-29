<script>
	/**
	 * GTC Chart Component - Supports both step and line chart types
	 * Similar to BenchmarkChart but with configurable line types
	 */
	import { goto } from '$app/navigation';
	import {
		createMargins,
		getInnerDimensions,
		createLinearScale,
		createStepLineGenerator,
		createSmoothLineGenerator,
		formatYAxis,
		calculateDomain,
		generateClipPathId
	} from '../../../pareto-charts/_components/chartUtils.js';
	import { getStart, getEnd } from '$lib/stores/timelineRange.svelte.js';

	/**
	 * @typedef {Object} PointMeta
	 * @property {string} systemId - System identifier
	 * @property {number} concurrent_users - Number of concurrent users
	 * @property {number} ttft_ms_p9x - Time to first token (ms, p99)
	 * @property {number} system_throughput_tokens_sec - System throughput
	 * @property {number} interactivity_tokens_sec_user - Interactivity tokens per second per user
	 * @property {number} normalized_throughput - Normalized throughput
	 * @property {string} config_detail - Configuration details
	 * @property {number} utilization_percent - Utilization percentage
	 */

	/**
	 * @typedef {Object} Props
	 * @property {Array<{id: string, name: string, color: string, points: Array<{x: number, y: number, meta?: PointMeta}>}>} data - Chart data with models
	 * @property {string} xAxisLabel - X-axis label
	 * @property {string} yAxisLabel - Y-axis label
	 * @property {number} [width] - Chart width
	 * @property {number} [height] - Chart height
	 * @property {'step' | 'line'} [lineType='line'] - Type of line to render
	 * @property {boolean} [useTimelineRange=false] - Whether to use the shared timeline range store for X-axis filtering
	 */
	/** @type {Props} */
	let {
		data,
		xAxisLabel,
		yAxisLabel,
		width = 700,
		height = 450,
		lineType = 'line',
		useTimelineRange = false
	} = $props();

	// Responsive margins
	let isMobile = $derived(width < 500);
	let margin = $derived(createMargins(isMobile));
	let { width: innerWidth, height: innerHeight } = $derived(
		getInnerDimensions(width, height, margin)
	);

	// Get X domain from timeline range store or calculate from data
	let rangeStart = $derived(useTimelineRange ? getStart() : null);
	let rangeEnd = $derived(useTimelineRange ? getEnd() : null);

	// Calculate full domain from all models
	let allPoints = $derived(data.flatMap((model) => model.points));
	let fullXDomain = $derived(calculateDomain(allPoints, 'x'));

	// Use timeline range if enabled, otherwise use full domain
	let xDomain = $derived(
		useTimelineRange && rangeStart !== null && rangeEnd !== null
			? [rangeStart, rangeEnd]
			: fullXDomain
	);

	// Filter data points within the visible X range (with buffer for line continuity)
	let filteredData = $derived(
		useTimelineRange && rangeStart !== null && rangeEnd !== null
			? data.map((model) => ({
					...model,
					points: model.points.filter(
						(p) => p.x >= rangeStart - 10 && p.x <= rangeEnd + 10
					)
				}))
			: data
	);

	let yDomain = $derived(calculateDomain(filteredData.flatMap((model) => model.points), 'y'));

	// Scales
	let xScale = $derived(createLinearScale(xDomain, [0, innerWidth]));
	let yScale = $derived(createLinearScale(yDomain, [innerHeight, 0]));

	// Ticks
	let xTicks = $derived(xScale.ticks(6));
	let yTicks = $derived(yScale.ticks(6));

	// Line generator based on type
	let lineGenerator = $derived(
		lineType === 'step'
			? createStepLineGenerator(xScale, yScale, 'after')
			: createSmoothLineGenerator(xScale, yScale)
	);

	// Tooltip state
	let tooltipData = $state(null);
	let tooltipPosition = $state({ x: 0, y: 0 });

	function handlePointHover(event, point, model) {
		const svgRect = event.currentTarget.closest('svg')?.getBoundingClientRect();
		if (!svgRect) return;

		tooltipData = { point, model };
		tooltipPosition = {
			x: event.clientX - svgRect.left + 15,
			y: event.clientY - svgRect.top - 10
		};
	}

	function handlePointLeave() {
		tooltipData = null;
	}

	/**
	 * Navigate to the report page with point metadata as query params.
	 * @param {Object} point - The data point with x, y, and meta
	 * @param {Object} model - The model containing id and name
	 */
	function handlePointClick(point, model) {
		if (!point.meta) return;

		const params = new URLSearchParams({
			system: point.meta.systemId,
			users: String(point.meta.concurrent_users),
			config: point.meta.config_detail
		});

		goto(`/benchmarks/gtc/report?${params.toString()}`);
	}

	const clipId = generateClipPathId();
</script>

<div class="gtc-chart relative">
	<svg {width} {height} class="font-instrument-sans h-auto w-full overflow-visible">
		<defs>
			<linearGradient id="chartBg-{clipId}" x1="0%" y1="0%" x2="0%" y2="100%">
				<stop
					offset="0%"
					class="[stop-color:var(--color-slate-50)] dark:[stop-color:var(--color-slate-900)]"
				/>
				<stop
					offset="100%"
					class="[stop-color:var(--color-slate-100)] dark:[stop-color:var(--color-slate-800)]"
				/>
			</linearGradient>
			<clipPath id={clipId}>
				<rect x="0" y="0" width={innerWidth} height={innerHeight} />
			</clipPath>
		</defs>

		<!-- Background -->
		<rect
			x={margin.left}
			y={margin.top}
			width={innerWidth}
			height={innerHeight}
			fill="url(#chartBg-{clipId})"
			rx="4"
		/>

		<g transform="translate({margin.left}, {margin.top})">
			<!-- Grid lines -->
			<g class="grid">
				{#each yTicks as tick (tick)}
					<line
						x1="0"
						x2={innerWidth}
						y1={yScale(tick)}
						y2={yScale(tick)}
						class="stroke-slate-200/60 dark:stroke-slate-700/60"
						stroke-dasharray="4,4"
					/>
				{/each}
				{#each xTicks as tick (tick)}
					<line
						x1={xScale(tick)}
						x2={xScale(tick)}
						y1="0"
						y2={innerHeight}
						class="stroke-slate-200/60 dark:stroke-slate-700/60"
						stroke-dasharray="4,4"
					/>
				{/each}
			</g>

			<!-- Data (clipped) -->
			<g clip-path="url(#{clipId})">
				{#each filteredData as model (model.id)}
					<!-- Line path -->
					<path
						d={lineGenerator(model.points)}
						fill="none"
						stroke={model.color}
						stroke-width="2.5"
						stroke-linecap="round"
						stroke-linejoin="round"
						class="transition-opacity duration-300"
					/>
					<!-- Data points -->
					{#each model.points as point, i (i)}
						<circle
							cx={xScale(point.x)}
							cy={yScale(point.y)}
							r="4"
							fill={model.color}
							stroke={model.color}
							stroke-width="1.5"
							class="cursor-pointer transition-all duration-150 hover:brightness-110"
							role="button"
							tabindex="0"
							aria-label="View report for {model.name}: {point.x}, {point.y}"
							onmouseenter={(e) => handlePointHover(e, point, model)}
							onmouseleave={handlePointLeave}
							onclick={() => handlePointClick(point, model)}
							onkeydown={(e) => e.key === 'Enter' && handlePointClick(point, model)}
						/>
					{/each}
				{/each}
			</g>

			<!-- Y-axis -->
			<g class="y-axis">
				<line
					x1="0"
					x2="0"
					y1="0"
					y2={innerHeight}
					class="stroke-slate-400 dark:stroke-slate-500"
					stroke-width="1"
				/>
				{#each yTicks as tick (tick)}
					<g transform="translate(0, {yScale(tick)})">
						<line x1="-6" x2="0" y1="0" y2="0" class="stroke-slate-400 dark:stroke-slate-500" />
						<text
							x="-12"
							y="0"
							dy="0.35em"
							text-anchor="end"
							class="fill-slate-600 text-xs dark:fill-slate-400"
						>
							{formatYAxis(tick)}
						</text>
					</g>
				{/each}
				<text
					transform="rotate(-90)"
					x={-innerHeight / 2}
					y="-50"
					text-anchor="middle"
					class="fill-slate-700 font-semibold font-instrument-sans-bold dark:fill-slate-300"
				>
					{yAxisLabel}
				</text>
			</g>

			<!-- X-axis -->
			<g class="x-axis" transform="translate(0, {innerHeight})">
				<line
					x1="0"
					x2={innerWidth}
					y1="0"
					y2="0"
					class="stroke-slate-400 dark:stroke-slate-500"
					stroke-width="1"
				/>
				{#each xTicks as tick (tick)}
					<g transform="translate({xScale(tick)}, 0)">
						<line x1="0" x2="0" y1="0" y2="6" class="stroke-slate-400 dark:stroke-slate-500" />
						<text
							x="0"
							y="20"
							text-anchor="middle"
							class="fill-slate-600 text-xs dark:fill-slate-400"
						>
							{formatYAxis(tick)}
						</text>
					</g>
				{/each}
				<text
					x={innerWidth / 2}
					y="45"
					text-anchor="middle"
					class="fill-slate-700 font-semibold font-instrument-sans-bold dark:fill-slate-300"
				>
					{xAxisLabel}
				</text>
			</g>
		</g>
	</svg>

	<!-- Tooltip -->
	{#if tooltipData}
		<div
			class="pointer-events-none absolute z-50 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-lg dark:border-slate-700 dark:bg-slate-800"
			style="left: {tooltipPosition.x}px; top: {tooltipPosition.y}px;"
		>
			<div class="space-y-0.5 text-xs text-slate-600 dark:text-slate-400">
				<div class="font-semibold text-slate-800 dark:text-slate-200">{tooltipData.model.name}</div>
				<div>
					<strong>{xAxisLabel}:</strong> {formatYAxis(tooltipData.point.x)}
				</div>
				<div>
					<strong>{yAxisLabel}:</strong> {formatYAxis(tooltipData.point.y)}
				</div>
			</div>
		</div>
	{/if}
</div>

<style lang="postcss">
	@reference "@app-css";

	.gtc-chart svg {
		max-width: 100%;
		height: auto;
		display: block;
	}
</style>
