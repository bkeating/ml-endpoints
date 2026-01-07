<script>
	import * as d3 from 'd3';
	import { isModelVisible, getHideLabels } from '$lib/stores/chartSettings.svelte.js';

	/**
	 * @typedef {Object} BarDataPoint
	 * @property {string} id - GPU identifier
	 * @property {string} name - Display name
	 * @property {string} color - Hex color code
	 * @property {number} value - Percentage value (0-100)
	 */

	/**
	 * @typedef {Object} Props
	 * @property {BarDataPoint[]} data - Array of bar data
	 * @property {number} [width] - Chart width
	 * @property {number} [height] - Chart height
	 * @property {[number, number]} [yDomain] - Y-axis domain
	 * @property {string} [xAxisLabel] - X-axis label text
	 * @property {string} [yAxisLabel] - Y-axis label text
	 */

	/** @type {Props} */
	let {
		data,
		width = 700,
		height = 400,
		yDomain = [0, 15],
		xAxisLabel = 'Hardware Model',
		yAxisLabel = 'Failure Rate (%)'
	} = $props();

	const margin = { top: 30, right: 30, bottom: 80, left: 70 };

	// Derived dimensions
	let innerWidth = $derived(width - margin.left - margin.right);
	let innerHeight = $derived(height - margin.top - margin.bottom);

	// Filter visible models
	let visibleData = $derived(data.filter((d) => isModelVisible(d.id)));

	// D3 scales
	let xScale = $derived(
		d3
			.scaleBand()
			.domain(visibleData.map((d) => d.id))
			.range([0, innerWidth])
			.padding(0.3)
	);

	let yScale = $derived(d3.scaleLinear().domain(yDomain).range([innerHeight, 0]));

	// Axis ticks
	let yTicks = $derived(yScale.ticks(6));

	// Get hide labels setting reactively
	let hideLabels = $derived(getHideLabels());

	// Generate unique clip path ID
	const clipId = `bar-chart-clip-${Math.random().toString(36).slice(2, 9)}`;

	// Format Y-axis values with "%" suffix
	const formatY = (/** @type {number} */ value) => `${value}%`;
</script>

<svg {width} {height} class="overflow-visible font-instrument-sans">
	<defs>
		<!-- Gradient for chart background -->
		<linearGradient id="barChartBg" x1="0%" y1="0%" x2="0%" y2="100%">
			<stop offset="0%" class="[stop-color:var(--color-slate-50)] dark:[stop-color:var(--color-slate-900)]" />
			<stop offset="100%" class="[stop-color:var(--color-slate-100)] dark:[stop-color:var(--color-slate-800)]" />
		</linearGradient>
		<!-- Clip path to constrain data to chart area -->
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
		fill="url(#barChartBg)"
		rx="4"
	/>

	<g transform="translate({margin.left}, {margin.top})">
		<!-- Grid lines -->
		<g class="grid">
			<!-- Horizontal grid lines -->
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
			<!-- Y-axis label -->
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
			{#each visibleData as item (item.id)}
				<g transform="translate({(xScale(item.id) ?? 0) + (xScale.bandwidth() / 2)}, 0)">
					<line x1="0" x2="0" y1="0" y2="6" class="stroke-slate-400 dark:stroke-slate-500" />
					<text
						x="0"
						y="20"
						text-anchor="middle"
						class="fill-slate-600 text-xs dark:fill-slate-400"
					>
						{item.name}
					</text>
				</g>
			{/each}
			<!-- X-axis label -->
			<text
				x={innerWidth / 2}
				y="65"
				text-anchor="middle"
				class="fill-slate-700 text-sm font-medium dark:fill-slate-300"
			>
				{xAxisLabel}
			</text>
		</g>

		<!-- Bars (clipped to chart area) -->
		<g clip-path="url(#{clipId})">
			{#each visibleData as item (item.id)}
				{@const barX = xScale(item.id) ?? 0}
				{@const barHeight = innerHeight - yScale(item.value)}
				{@const barY = yScale(item.value)}
				<g class="bar-group">
					<!-- Bar -->
					<rect
						x={barX}
						y={barY}
						width={xScale.bandwidth()}
						height={barHeight}
						fill={item.color}
						rx="3"
						class="transition-all duration-200"
					/>
					<!-- Value label on top of bar -->
					{#if !hideLabels}
						<text
							x={barX + xScale.bandwidth() / 2}
							y={barY - 8}
							text-anchor="middle"
							class="fill-slate-600 text-xs font-medium dark:fill-slate-400"
						>
							{item.value.toFixed(1)}%
						</text>
					{/if}
				</g>
			{/each}
		</g>
	</g>
</svg>

