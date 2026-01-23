<script>
	/**
	 * Chart 1: TTFT vs Concurrent Users (Step Function, Log Scale)
	 * Shows time-to-first-token progression as concurrent users increase
	 */
	import * as d3 from 'd3';
	import {
		createMargins,
		getInnerDimensions,
		createLogScale,
		createLinearScale,
		createStepLineGenerator,
		getLogTicks,
		formatYAxis,
		calculateDomain,
		calculateLogDomain,
		generateClipPathId
	} from './chartUtils.js';

	/**
	 * @typedef {Object} Props
	 * @property {Array<{x: number, y: number, original?: any}>} data - Chart data points
	 * @property {string} color - Line color
	 * @property {number} [width] - Chart width
	 * @property {number} [height] - Chart height
	 * @property {string} [title] - Chart title
	 */

	/** @type {Props} */
	let { data, color, width = 400, height = 300, title = 'TTFT vs Concurrent Users' } = $props();

	// Responsive margins
	let isMobile = $derived(width < 500);
	let margin = $derived(createMargins(isMobile));
	let { width: innerWidth, height: innerHeight } = $derived(
		getInnerDimensions(width, height, margin)
	);

	// Calculate domains
	let xDomain = $derived(calculateLogDomain(data, 'x'));
	let yDomain = $derived(calculateDomain(data, 'y'));

	// Scales
	let xScale = $derived(createLogScale(xDomain, [0, innerWidth]));
	let yScale = $derived(createLinearScale(yDomain, [innerHeight, 0]));

	// Ticks
	let xExtent = $derived(d3.extent(data.map((d) => d.x)));
	let xTicks = $derived(getLogTicks(xExtent));
	let yTicks = $derived(yScale.ticks(6));

	// Line generator
	let lineGenerator = $derived(createStepLineGenerator(xScale, yScale, 'after'));

	// Tooltip state
	let tooltipData = $state(null);
	let tooltipPosition = $state({ x: 0, y: 0 });

	function handlePointHover(event, point) {
		const svgRect = event.currentTarget.closest('svg')?.getBoundingClientRect();
		if (!svgRect) return;

		tooltipData = point;
		tooltipPosition = {
			x: event.clientX - svgRect.left + 15,
			y: event.clientY - svgRect.top - 10
		};
	}

	function handlePointLeave() {
		tooltipData = null;
	}

	const clipId = generateClipPathId();
</script>

<div class="benchmark-chart relative">
	{#if title}
		<h3 class="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">{title}</h3>
	{/if}
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
				<!-- Step line -->
				<path
					d={lineGenerator(data)}
					fill="none"
					stroke={color}
					stroke-width="2.5"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>

				<!-- Data points -->
				{#each data as point, i (i)}
					<circle
						cx={xScale(point.x)}
						cy={yScale(point.y)}
						r="4"
						fill={color}
						stroke={color}
						stroke-width="1.5"
						class="hover:r-[6px] cursor-pointer transition-all duration-150"
						role="img"
						aria-label="Data point at {point.x} users, {point.y}ms TTFT"
						onmouseenter={(e) => handlePointHover(e, point)}
						onmouseleave={handlePointLeave}
					/>
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
					class="fill-slate-700 text-xs font-medium dark:fill-slate-300"
				>
					TTFT (ms, P9x)
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
							{tick}
						</text>
					</g>
				{/each}
				<text
					x={innerWidth / 2}
					y="45"
					text-anchor="middle"
					class="fill-slate-700 text-xs font-medium dark:fill-slate-300"
				>
					# Concurrent Users
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
				<div><strong>Concurrent Users:</strong> {tooltipData.x}</div>
				<div><strong>TTFT:</strong> {tooltipData.y}ms</div>
				{#if tooltipData.original}
					<div>
						<strong>Throughput:</strong>
						{formatYAxis(tooltipData.original.systemThroughput)} tok/s
					</div>
					<div>
						<strong>Interactivity:</strong>
						{formatYAxis(tooltipData.original.interactivity)} tok/s/user
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>

<style lang="postcss">
	@reference "@app-css";

	.benchmark-chart svg {
		max-width: 100%;
		height: auto;
		display: block;
	}
</style>
