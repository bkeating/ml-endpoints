<script>
	/**
	 * GTC Chart Component - Supports both step and line chart types
	 * with configurable linear or logarithmic scales
	 */
	import { goto } from '$app/navigation';
	import {
		createMargins,
		getInnerDimensions,
		createLinearScale,
		createLogScale,
		createStepLineGenerator,
		createSmoothLineGenerator,
		formatYAxis,
		calculateDomain,
		calculateLogDomain,
		generateClipPathId
	} from '../pareto-charts/_components/chartUtils.js';
	import { getStart, getEnd } from '$lib/stores/timelineRange.svelte.js';
	import { setHoveredRunId, getHoveredRunId, getHoveredRunInfo } from '$lib/stores/chartSettings.svelte.js';

	/**
	 * @typedef {Object} PointMeta
	 * @property {string} systemId - System identifier (UUID)
	 * @property {string} runId - Run identifier (UUID)
	 * @property {number} concurrency - Number of concurrent users
	 * @property {number} system_tps - System tokens per second
	 * @property {number} tps_per_user - Tokens per second per user (interactivity)
	 * @property {number} ttft - Time to first token P99 (seconds)
	 * @property {number} utilization - System utilization (0-1)
	 * @property {string} config_detail - Configuration details
	 * @property {Object} system - Full system object
	 * @property {Object} model - Full model object
	 */

	/**
	 * @typedef {Object} Props
	 * @property {Array<{id: string, name: string, color: string, points: Array<{x: number, y: number, meta?: PointMeta}>}>} data - Chart data with models
	 * @property {string} xAxisLabel - X-axis label
	 * @property {string} yAxisLabel - Y-axis label
	 * @property {number} [width] - Chart width
	 * @property {number} [height] - Chart height
	 * @property {'step' | 'line'} [lineType='line'] - Type of line to render
	 * @property {'linear' | 'log'} [xScaleType='linear'] - X-axis scale type
	 * @property {'linear' | 'log'} [yScaleType='linear'] - Y-axis scale type
	 * @property {boolean} [useTimelineRange=false] - Whether to use the shared timeline range store for X-axis filtering
	 * @property {boolean} [showComparison=false] - Whether to show comparison lines between systems on hover
	 */
	/** @type {Props} */
	let {
		data,
		xAxisLabel,
		yAxisLabel,
		width = 700,
		height = 450,
		lineType = 'line',
		xScaleType = 'linear',
		yScaleType = 'linear',
		useTimelineRange = false,
		showComparison = false
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

	// Calculate full domain from all models based on scale type
	let allPoints = $derived(data.flatMap((model) => model.points));
	let fullXDomain = $derived(
		xScaleType === 'log'
			? calculateLogDomain(allPoints, 'x')
			: calculateDomain(allPoints, 'x')
	);

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

	// Calculate Y domain based on scale type
	let yDomain = $derived(
		yScaleType === 'log'
			? calculateLogDomain(filteredData.flatMap((model) => model.points), 'y')
			: calculateDomain(filteredData.flatMap((model) => model.points), 'y')
	);

	// Create scales based on scale type
	let xScale = $derived(
		xScaleType === 'log'
			? createLogScale(xDomain, [0, innerWidth])
			: createLinearScale(xDomain, [0, innerWidth])
	);
	let yScale = $derived(
		yScaleType === 'log'
			? createLogScale(yDomain, [innerHeight, 0])
			: createLinearScale(yDomain, [innerHeight, 0])
	);

	/**
	 * Generate clean tick values for logarithmic scales
	 * Uses powers of 10 and key intermediate values (2, 5) for readability
	 * @param {[number, number]} domain - Scale domain [min, max]
	 * @param {number} maxTicks - Maximum number of ticks
	 * @returns {number[]} Array of tick values
	 */
	function getLogTicks(domain, maxTicks = 5) {
		const [min, max] = domain;
		const logMin = Math.floor(Math.log10(Math.max(min, 0.001)));
		const logMax = Math.ceil(Math.log10(max));

		// Generate candidate ticks at powers of 10 and intermediate values
		const candidates = [];
		for (let exp = logMin; exp <= logMax; exp++) {
			const base = Math.pow(10, exp);
			[1, 2, 5].forEach(mult => {
				const val = base * mult;
				if (val >= min * 0.9 && val <= max * 1.1) {
					candidates.push(val);
				}
			});
		}

		// If too many candidates, filter to just powers of 10
		if (candidates.length > maxTicks) {
			const powersOf10 = candidates.filter(v => {
				const log = Math.log10(v);
				return Math.abs(log - Math.round(log)) < 0.001;
			});
			if (powersOf10.length >= 3) return powersOf10;
		}

		return candidates.slice(0, maxTicks);
	}

	// Ticks - use custom generator for log scales to avoid overcrowding
	let xTicks = $derived(
		xScaleType === 'log'
			? getLogTicks(xDomain, isMobile ? 4 : 5)
			: xScale.ticks(isMobile ? 4 : 6)
	);
	let yTicks = $derived(
		yScaleType === 'log'
			? getLogTicks(yDomain, 5)
			: yScale.ticks(6)
	);

	// Line generator based on type
	let lineGenerator = $derived(
		lineType === 'step'
			? createStepLineGenerator(xScale, yScale, 'after')
			: createSmoothLineGenerator(xScale, yScale)
	);

	// Smooth line generator for dashed overlay on step charts
	// Shows the "imagined" smooth curve that the step function conservatively approximates
	let smoothLineGenerator = $derived(createSmoothLineGenerator(xScale, yScale));

	/**
	 * Find the Y value on a step-after curve at a given X value.
	 * For step-after: use the Y value of the point with the largest X <= queryX
	 * @param {Array<{x: number, y: number}>} points - Sorted points array
	 * @param {number} queryX - The X value to query
	 * @returns {number | null} - The Y value at queryX, or null if out of range
	 */
	function getStepYAtX(points, queryX) {
		if (!points || points.length === 0) return null;

		// Sort by X to ensure correct step evaluation
		const sorted = [...points].sort((a, b) => a.x - b.x);

		// Find the point with the largest X <= queryX (step-after behavior)
		let result = null;
		for (const p of sorted) {
			if (p.x <= queryX) {
				result = p.y;
			} else {
				break;
			}
		}
		return result;
	}

	/**
	 * Compute comparison data when hovering over a point.
	 * Finds where a vertical line from the hovered point intersects other systems' curves.
	 * @param {Object} hoveredPoint - The point being hovered
	 * @param {Object} hoveredModel - The model/system being hovered
	 * @returns {Array<{model: Object, y: number, ratio: number}>} - Comparison data for other systems
	 */
	function computeComparisonPoints(hoveredPoint, hoveredModel) {
		if (!hoveredPoint || !showComparison || lineType !== 'step') return [];

		const queryX = hoveredPoint.x;
		const hoveredY = hoveredPoint.y;
		const comparisons = [];

		for (const model of filteredData) {
			if (model.id === hoveredModel.id) continue; // Skip the hovered system

			const y = getStepYAtX(model.points, queryX);
			if (y !== null && y > 0) {
				const ratio = hoveredY / y;
				comparisons.push({
					model,
					y,
					ratio,
					// Calculate which is better and by how much
					betterSystem: hoveredY >= y ? hoveredModel.name : model.name,
					multiplier: hoveredY >= y ? ratio : 1 / ratio
				});
			}
		}

		return comparisons;
	}

	// Tooltip state
	let tooltipData = $state(null);
	let tooltipPosition = $state({ x: 0, y: 0 });

	// Cross-chart hover state (reactive getter)
	let globalHoveredRunId = $derived(getHoveredRunId());
	let globalHoveredRunInfo = $derived(getHoveredRunInfo());

	// Find the highlighted point in this chart's data for synced tooltip
	let syncedTooltipPoint = $derived.by(() => {
		if (!globalHoveredRunId || tooltipData) return null; // Don't show synced tooltip if we're the source

		for (const model of filteredData) {
			const point = model.points.find((p) => p.meta?.runId === globalHoveredRunId);
			if (point) {
				return { point, model };
			}
		}
		return null;
	});

	// Calculate synced tooltip position based on the point's position in this chart
	let syncedTooltipPosition = $derived.by(() => {
		if (!syncedTooltipPoint) return null;
		const x = xScale(syncedTooltipPoint.point.x) + margin.left + 15;
		const y = yScale(syncedTooltipPoint.point.y) + margin.top - 10;
		return { x, y };
	});

	// Compute comparison points when hovering (for system comparison feature)
	let comparisonData = $derived.by(() => {
		if (!tooltipData || !showComparison) return [];
		return computeComparisonPoints(tooltipData.point, tooltipData.model);
	});

	/**
	 * Format value for display based on scale type and magnitude
	 * @param {number} value - Value to format
	 * @param {'linear' | 'log'} scaleType - Scale type
	 * @returns {string} Formatted value
	 */
	function formatValue(value, scaleType) {
		if (scaleType === 'log' && value < 1) {
			return value.toFixed(3);
		}
		return formatYAxis(value);
	}

	function handlePointHover(event, point, model) {
		const svgRect = event.currentTarget.closest('svg')?.getBoundingClientRect();
		if (!svgRect) return;

		tooltipData = { point, model };
		tooltipPosition = {
			x: event.clientX - svgRect.left + 15,
			y: event.clientY - svgRect.top - 10
		};

		// Set global hovered run ID for cross-chart highlighting
		if (point.meta?.runId) {
			setHoveredRunId(point.meta.runId, { modelName: model.name, modelColor: model.color });
		}
	}

	function handlePointLeave() {
		tooltipData = null;
		setHoveredRunId(null);
	}

	/**
	 * Navigate to the report page with submission and run IDs.
	 * @param {Object} point - The data point with x, y, and meta
	 * @param {Object} _model - The model containing id and name (unused)
	 */
	function handlePointClick(point, _model) {
		if (!point.meta?.submission_id) return;

		const params = new URLSearchParams({
			submission: point.meta.submission_id,
			run: point.meta.run_id ?? ''
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
					<!-- Dashed smooth curve (for step charts only) - shows "imagined" interpolation -->
					{#if lineType === 'step'}
						<path
							d={smoothLineGenerator(model.points)}
							fill="none"
							stroke={model.color}
							stroke-width="1.5"
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-dasharray="6,4"
							opacity="0.6"
							class="transition-opacity duration-300"
						/>
					{/if}
					<!-- Primary line path (step or smooth based on lineType) -->
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
						{@const isHighlighted = globalHoveredRunId && point.meta?.runId === globalHoveredRunId}
						<circle
							cx={xScale(point.x)}
							cy={yScale(point.y)}
							r={isHighlighted ? 7 : 4}
							fill={isHighlighted ? 'white' : model.color}
							stroke={model.color}
							stroke-width={isHighlighted ? 3 : 1.5}
							class="cursor-pointer transition-all duration-150 hover:brightness-110"
							class:ring-highlight={isHighlighted}
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

				<!-- Comparison lines between systems (when hovering with comparison mode on) -->
				{#if tooltipData && showComparison && comparisonData.length > 0}
					{@const hoveredX = xScale(tooltipData.point.x)}
					{@const hoveredY = yScale(tooltipData.point.y)}
					{#each comparisonData as comparison (comparison.model.id)}
						{@const compY = yScale(comparison.y)}
						<!-- Vertical dotted line from hovered point to comparison point -->
						<line
							x1={hoveredX}
							y1={hoveredY}
							x2={hoveredX}
							y2={compY}
							stroke={comparison.model.color}
							stroke-width="2"
							stroke-dasharray="4,4"
							opacity="0.8"
						/>
						<!-- Comparison point marker on the other system's curve -->
						<circle
							cx={hoveredX}
							cy={compY}
							r="5"
							fill="white"
							stroke={comparison.model.color}
							stroke-width="2"
						/>
						<!-- Y-value label at comparison point -->
						<g transform="translate({hoveredX + 8}, {compY})">
							<rect
								x="-2"
								y="-10"
								width="50"
								height="20"
								rx="3"
								class="fill-white dark:fill-slate-800"
								opacity="0.9"
							/>
							<text
								class="fill-slate-700 dark:fill-slate-200"
								font-size="11"
								font-weight="600"
								dy="4"
							>
								{formatValue(comparison.y, yScaleType)}
							</text>
						</g>
					{/each}
					<!-- Ratio badge near the hovered point -->
					{#if comparisonData.length === 1}
						{@const comp = comparisonData[0]}
						<g transform="translate({hoveredX + 12}, {(hoveredY + yScale(comp.y)) / 2})">
							<rect
								x="-4"
								y="-12"
								width="42"
								height="24"
								rx="4"
								class="fill-slate-800 dark:fill-slate-200"
							/>
							<text
								class="fill-white dark:fill-slate-800"
								font-size="12"
								font-weight="700"
								dy="4"
							>
								{comp.multiplier.toFixed(1)}x
							</text>
						</g>
					{/if}
				{/if}
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
						{formatValue(tick, yScaleType)}
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
						{formatValue(tick, xScaleType)}
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

	<!-- Tooltip (source chart - user is hovering here) -->
	{#if tooltipData}
		<div
			class="pointer-events-none absolute z-50 min-w-48 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-lg dark:border-slate-700 dark:bg-slate-800"
			style="left: {tooltipPosition.x}px; top: {tooltipPosition.y}px;"
		>
			<div class="space-y-0.5 text-xs text-slate-600 dark:text-slate-400">
				<div class="font-semibold text-slate-800 dark:text-slate-200">{tooltipData.model.name}</div>
				<div>
					<strong>{xAxisLabel}:</strong> {formatValue(tooltipData.point.x, xScaleType)}
				</div>
				<div>
					<strong>{yAxisLabel}:</strong> {formatValue(tooltipData.point.y, yScaleType)}
				</div>
				{#if tooltipData.point.meta?.model}
					<div class="mt-1 pt-1 border-t border-slate-200 dark:border-slate-600">
						<span class="text-slate-500">{tooltipData.point.meta.model.model_name}</span>
					</div>
				{/if}
			</div>
		</div>
	{/if}

	<!-- Synced Tooltip (other charts - showing the same run) -->
	{#if syncedTooltipPoint && syncedTooltipPosition}
		<div
			class="pointer-events-none absolute z-50 min-w-48 whitespace-nowrap rounded-lg border px-3 py-2 shadow-lg bg-white dark:bg-slate-800"
			style="left: {syncedTooltipPosition.x}px; top: {syncedTooltipPosition.y}px; border-color: {globalHoveredRunInfo?.modelColor ?? '#94a3b8'};"
		>
			<div class="space-y-0.5 text-xs text-slate-600 dark:text-slate-400">
				<div class="font-semibold text-slate-800 dark:text-slate-200">{globalHoveredRunInfo?.modelName ?? syncedTooltipPoint.model.name}</div>
				<div>
					<strong>{xAxisLabel}:</strong> {formatValue(syncedTooltipPoint.point.x, xScaleType)}
				</div>
				<div>
					<strong>{yAxisLabel}:</strong> {formatValue(syncedTooltipPoint.point.y, yScaleType)}
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

	/* Highlighted point styling for cross-chart hover sync */
	.ring-highlight {
		filter: drop-shadow(0 0 4px currentColor);
	}
</style>
