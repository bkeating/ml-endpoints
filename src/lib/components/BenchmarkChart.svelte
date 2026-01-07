<script>
	/**
	 * Line chart component for benchmark data visualization.
	 *
	 * D3 + SVELTE INTEGRATION PATTERN
	 * -------------------------------
	 * This component demonstrates a hybrid approach:
	 * - D3 handles the MATH: scales, line generation, tick calculations
	 * - Svelte handles the DOM: reactive rendering with {#each} blocks
	 *
	 * WHY this pattern?
	 * - D3's DOM manipulation (d3.select().append()) fights with Svelte's reactivity
	 * - Using D3 only for calculations lets Svelte efficiently update the DOM
	 * - $derived() recalculates D3 scales automatically when data/dimensions change
	 *
	 * The result: smooth, reactive charts without manual DOM management.
	 */
	import * as d3 from 'd3';
	import { isModelVisible, getHideLabels } from '$lib/stores/chartSettings.svelte.js';
	import { getStart, getEnd } from '$lib/stores/timelineRange.svelte.js';

	/**
	 * @typedef {Object} DataPoint
	 * @property {number} x - Latency (seconds)
	 * @property {number} y - Throughput (tok/s/gpu)
	 */

	/**
	 * @typedef {Object} Model
	 * @property {string} id - Unique model identifier
	 * @property {string} name - Display name
	 * @property {string} color - Hex color code
	 * @property {DataPoint[]} points - Array of data points
	 */

	/**
	 * @typedef {Object} Props
	 * @property {Model[]} data - Array of model data
	 * @property {[number, number]} [yDomain] - Y-axis domain
	 * @property {number} [width] - Chart width
	 * @property {number} [height] - Chart height
	 * @property {boolean} [useTimelineRange] - Whether to use the shared timeline range store
	 * @property {[number, number]} [xDomain] - X-axis domain (used when useTimelineRange is false)
	 * @property {string} [xAxisLabel] - X-axis label text
	 * @property {string} [yAxisLabel] - Y-axis label text
	 */

	/** @type {Props} */
	let {
		data,
		yDomain = [0, 12000],
		width = 700,
		height = 450,
		useTimelineRange = true,
		xDomain: propXDomain = [0, 200],
		xAxisLabel = 'End-to-end Latency (s)',
		yAxisLabel = 'Token Throughput per GPU (tok/s/gpu)'
	} = $props();

	// Get X domain from timeline range store or prop
	let rangeStart = $derived(useTimelineRange ? getStart() : propXDomain[0]);
	let rangeEnd = $derived(useTimelineRange ? getEnd() : propXDomain[1]);
	let xDomain = $derived(/** @type {[number, number]} */ ([rangeStart, rangeEnd]));

	const margin = { top: 30, right: 30, bottom: 50, left: 70 };

	// $derived() creates computed values that auto-update when dependencies change
	let innerWidth = $derived(width - margin.left - margin.right);
	let innerHeight = $derived(height - margin.top - margin.bottom);

	// D3 scales - recalculated whenever domain or dimensions change
	let xScale = $derived(d3.scaleLinear().domain(xDomain).range([0, innerWidth]));
	let yScale = $derived(d3.scaleLinear().domain(yDomain).range([innerHeight, 0]));

	// Axis ticks
	let xTicks = $derived(xScale.ticks(8));
	let yTicks = $derived(yScale.ticks(6));

	// D3 line generator - creates SVG path strings from data points
	let lineGenerator = $derived(
		d3
			.line()
			.x((d) => xScale(d.x))
			.y((d) => yScale(d.y))
	);

	// Format Y-axis values with "k" suffix
	const formatY = (/** @type {number} */ value) => {
		if (value >= 1000) {
			return `${value / 1000}k`;
		}
		return String(value);
	};

	// Filter visible models based on store state
	let visibleModels = $derived(data.filter((model) => isModelVisible(model.id)));

	// Filter data points within the visible X range (with buffer for line continuity)
	let filteredModels = $derived(
		visibleModels.map((model) => ({
			...model,
			points: model.points.filter(
				(p) => p.x >= xDomain[0] - 10 && p.x <= xDomain[1] + 10
			)
		}))
	);

	// Get hide labels setting reactively
	let hideLabels = $derived(getHideLabels());

	// Unique clip path ID to prevent conflicts with multiple charts
	const clipId = `chart-clip-${Math.random().toString(36).slice(2, 9)}`;
</script>

<svg {width} {height} class="overflow-visible font-instrument-sans">
	<defs>
		<!-- Gradient for chart background -->
		<linearGradient id="chartBg" x1="0%" y1="0%" x2="0%" y2="100%">
			<stop offset="0%" class="[stop-color:var(--color-slate-50)] dark:[stop-color:var(--color-slate-900)]" />
			<stop offset="100%" class="[stop-color:var(--color-slate-100)] dark:[stop-color:var(--color-slate-800)]" />
		</linearGradient>
		<!-- Clip path constrains data to chart area (prevents overflow) -->
		<clipPath id={clipId}>
			<rect x="0" y="0" width={innerWidth} height={innerHeight} />
		</clipPath>
	</defs>

	<!-- Chart background -->
	<rect
		x={margin.left}
		y={margin.top}
		width={innerWidth}
		height={innerHeight}
		fill="url(#chartBg)"
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
					class="stroke-slate-200 dark:stroke-slate-700"
					stroke-dasharray="4,4"
				/>
			{/each}
			{#each xTicks as tick (tick)}
				<line
					x1={xScale(tick)}
					x2={xScale(tick)}
					y1="0"
					y2={innerHeight}
					class="stroke-slate-200 dark:stroke-slate-700"
					stroke-dasharray="4,4"
				/>
			{/each}
		</g>

		<!-- Y-axis -->
		<g class="y-axis">
			<line x1="0" x2="0" y1="0" y2={innerHeight} class="stroke-slate-300 dark:stroke-slate-600" stroke-width="1" />
			{#each yTicks as tick (tick)}
				<g transform="translate(0, {yScale(tick)})">
					<line x1="-6" x2="0" y1="0" y2="0" class="stroke-slate-400 dark:stroke-slate-500" />
					<text
						x="-10"
						y="0"
						dy="0.35em"
						text-anchor="end"
						class="fill-slate-600 text-xs dark:fill-slate-400"
					>
						{formatY(tick)}
					</text>
				</g>
			{/each}
			<text
				transform="rotate(-90)"
				x={-innerHeight / 2}
				y="-50"
				text-anchor="middle"
				class="fill-slate-700 text-sm font-medium dark:fill-slate-300"
			>
				{yAxisLabel}
			</text>
		</g>

		<!-- X-axis -->
		<g class="x-axis" transform="translate(0, {innerHeight})">
			<line x1="0" x2={innerWidth} y1="0" y2="0" class="stroke-slate-300 dark:stroke-slate-600" stroke-width="1" />
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
				y="40"
				text-anchor="middle"
				class="fill-slate-700 text-sm font-medium dark:fill-slate-300"
			>
				{xAxisLabel}
			</text>
		</g>

		<!-- Data lines (clipped to chart area) -->
		<g clip-path="url(#{clipId})">
			{#each filteredModels as model (model.id)}
				<g class="model-line" style="--model-color: {model.color}">
					<!-- Line path generated by D3's line generator -->
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
						{#if point.x >= xDomain[0] && point.x <= xDomain[1]}
							<circle
								cx={xScale(point.x)}
								cy={yScale(point.y)}
								r="4"
								fill={model.color}
								class="transition-all duration-200"
							/>
							{#if !hideLabels}
								<text
									x={xScale(point.x)}
									y={yScale(point.y) - 10}
									text-anchor="middle"
									class="fill-slate-600 text-[10px] dark:fill-slate-400"
								>
									{formatY(point.y)}
								</text>
							{/if}
						{/if}
					{/each}
				</g>
			{/each}
		</g>
	</g>
</svg>
