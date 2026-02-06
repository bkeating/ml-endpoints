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
	 * @typedef {'original' | 'ascending' | 'descending'} SortOrder
	 */

	/**
	 * @typedef {Object} Props
	 * @property {BarDataPoint[]} data - Array of bar data
	 * @property {number} [width] - Chart width
	 * @property {number} [height] - Chart height
	 * @property {[number, number]} [yDomain] - Y-axis domain
	 * @property {string} [xAxisLabel] - X-axis label text
	 * @property {string} [yAxisLabel] - Y-axis label text
	 * @property {SortOrder} [sortOrder] - Current sort order
	 * @property {boolean} [showLineOverlay] - Show line chart overlay
	 * @property {boolean} [showThresholds] - Show threshold horizontal lines
	 */

	/** @type {Props} */
	let {
		data,
		width = 700,
		height = 400,
		yDomain = [0, 15],
		xAxisLabel = 'Hardware Model',
		yAxisLabel = 'Failure Rate (%)',
		sortOrder = 'original',
		showLineOverlay = false,
		showThresholds = false
	} = $props();

	const margin = { top: 30, right: 30, bottom: 80, left: 70 };

	// Derived dimensions
	let innerWidth = $derived(width - margin.left - margin.right);
	let innerHeight = $derived(height - margin.top - margin.bottom);

	// Filter visible models
	let visibleData = $derived(data.filter((d) => isModelVisible(d.id)));

	// Sort data based on sortOrder
	let sortedData = $derived.by(() => {
		const dataCopy = [...visibleData];
		if (sortOrder === 'ascending') {
			return dataCopy.sort((a, b) => a.value - b.value);
		} else if (sortOrder === 'descending') {
			return dataCopy.sort((a, b) => b.value - a.value);
		}
		return dataCopy; // original order
	});

	// D3 scales - update when sort changes
	let xScale = $derived(
		d3
			.scaleBand()
			.domain(sortedData.map((d) => d.id))
			.range([0, innerWidth])
			.padding(0.3)
	);

	let yScale = $derived(d3.scaleLinear().domain(yDomain).range([innerHeight, 0]));

	// Axis ticks
	let yTicks = $derived(yScale.ticks(6));

	// Get hide labels setting reactively
	let hideLabels = $derived(getHideLabels());

	// Generate unique clip path ID
	const clipId = `bar-chart-enhanced-clip-${Math.random().toString(36).slice(2, 9)}`;

	// Format Y-axis values with "%" suffix
	const formatY = (/** @type {number} */ value) => `${value}%`;

	// Fake trend line data (efficiency score that correlates inversely with failure rate)
	let trendLineData = $derived.by(() => {
		return sortedData.map((d, i) => ({
			...d,
			trendValue: Math.max(2, 14 - d.value + Math.sin(i * 0.8) * 2) // Inverse correlation with some variation
		}));
	});

	// D3 line generator for overlay
	let lineGenerator = $derived(
		d3
			.line()
			.x((d) => (xScale(d.id) ?? 0) + xScale.bandwidth() / 2)
			.y((d) => yScale(d.trendValue))
			.curve(d3.curveMonotoneX)
	);

	// Threshold values (industry standards) - ML Commons palette
	const thresholds = {
		warning: { value: 7, label: 'Industry Avg', color: '#F7CB84' },
		critical: { value: 10, label: 'Critical', color: '#D49681' }
	};
</script>

<svg {width} {height} class="font-instrument-sans overflow-visible">
	<defs>
		<!-- Gradient for chart background -->
		<linearGradient id="barChartEnhancedBg" x1="0%" y1="0%" x2="0%" y2="100%">
			<stop
				offset="0%"
				class="[stop-color:var(--color-slate-50)] dark:[stop-color:var(--color-slate-900)]"
			/>
			<stop
				offset="100%"
				class="[stop-color:var(--color-slate-100)] dark:[stop-color:var(--color-slate-800)]"
			/>
		</linearGradient>

		<!-- Gradient for line overlay -->
		<linearGradient id="trendLineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
			<stop offset="0%" stop-color="#06b6d4" />
			<stop offset="50%" stop-color="#8b5cf6" />
			<stop offset="100%" stop-color="#ec4899" />
		</linearGradient>

		<!-- Glow filter for line -->
		<filter id="lineGlow" x="-50%" y="-50%" width="200%" height="200%">
			<feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
			<feMerge>
				<feMergeNode in="blur" />
				<feMergeNode in="SourceGraphic" />
			</feMerge>
		</filter>

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
		fill="url(#barChartEnhancedBg)"
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
		</g>

		<!-- Threshold lines (when enabled) -->
		{#if showThresholds}
			<!-- Warning threshold -->
			<g class="threshold-warning">
				<line
					x1="0"
					x2={innerWidth}
					y1={yScale(thresholds.warning.value)}
					y2={yScale(thresholds.warning.value)}
					stroke={thresholds.warning.color}
					stroke-width="2"
					stroke-dasharray="8,4"
					class="transition-opacity duration-300"
				/>
				<rect
					x={innerWidth - 90}
					y={yScale(thresholds.warning.value) - 10}
					width="85"
					height="20"
					rx="4"
					fill={thresholds.warning.color}
					opacity="0.9"
				/>
				<text
					x={innerWidth - 48}
					y={yScale(thresholds.warning.value) + 4}
					text-anchor="middle"
					class="fill-white text-xs font-semibold"
				>
					{thresholds.warning.label}
				</text>
			</g>

			<!-- Critical threshold -->
			<g class="threshold-critical">
				<line
					x1="0"
					x2={innerWidth}
					y1={yScale(thresholds.critical.value)}
					y2={yScale(thresholds.critical.value)}
					stroke={thresholds.critical.color}
					stroke-width="2"
					stroke-dasharray="8,4"
					class="transition-opacity duration-300"
				/>
				<rect
					x={innerWidth - 70}
					y={yScale(thresholds.critical.value) - 10}
					width="65"
					height="20"
					rx="4"
					fill={thresholds.critical.color}
					opacity="0.9"
				/>
				<text
					x={innerWidth - 38}
					y={yScale(thresholds.critical.value) + 4}
					text-anchor="middle"
					class="fill-white text-xs font-semibold"
				>
					{thresholds.critical.label}
				</text>
			</g>
		{/if}

		<!-- Y-axis -->
		<g class="y-axis">
			<line
				x1="0"
				x2="0"
				y1="0"
				y2={innerHeight}
				class="stroke-slate-300 dark:stroke-slate-600"
				stroke-width="1"
			/>
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
			<line
				x1="0"
				x2={innerWidth}
				y1="0"
				y2="0"
				class="stroke-slate-300 dark:stroke-slate-600"
				stroke-width="1"
			/>
			{#each sortedData as item (item.id)}
				{@const xPos = (xScale(item.id) ?? 0) + xScale.bandwidth() / 2}
				<g transform="translate({xPos}, 0)" class="transition-transform duration-700 ease-out">
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

		<!-- Bars (clipped to chart area) with animated transitions -->
		<g clip-path="url(#{clipId})">
			{#each sortedData as item, i (item.id)}
				{@const barX = xScale(item.id) ?? 0}
				{@const barHeight = innerHeight - yScale(item.value)}
				{@const barY = yScale(item.value)}
				<g class="bar-group" style="--delay: {i * 30}ms">
					<!-- Bar with animated position -->
					<rect
						x={barX}
						y={barY}
						width={xScale.bandwidth()}
						height={barHeight}
						fill={item.color}
						rx="3"
						class="bar-rect transition-all duration-700 ease-out"
						style="transition-delay: var(--delay);"
					>
						<title>{item.name}: {item.value.toFixed(1)}%</title>
					</rect>

					<!-- Subtle gradient overlay for depth -->
					<rect
						x={barX}
						y={barY}
						width={xScale.bandwidth()}
						height={barHeight}
						fill="url(#barSheen)"
						rx="3"
						class="pointer-events-none transition-all duration-700 ease-out"
						style="transition-delay: var(--delay);"
						opacity="0.15"
					/>

					<!-- Value label on top of bar -->
					{#if !hideLabels}
						<text
							x={barX + xScale.bandwidth() / 2}
							y={barY - 8}
							text-anchor="middle"
							class="fill-slate-600 text-xs font-semibold transition-all duration-700 ease-out dark:fill-slate-400"
							style="transition-delay: var(--delay);"
						>
							{item.value.toFixed(1)}%
						</text>
					{/if}
				</g>
			{/each}
		</g>

		<!-- Line chart overlay (when enabled) -->
		{#if showLineOverlay && trendLineData.length > 1}
			<g class="line-overlay" clip-path="url(#{clipId})">
				<!-- Glow effect path -->
				<path
					d={lineGenerator(trendLineData)}
					fill="none"
					stroke="url(#trendLineGradient)"
					stroke-width="4"
					filter="url(#lineGlow)"
					opacity="0.5"
					class="transition-all duration-500"
				/>

				<!-- Main line path -->
				<path
					d={lineGenerator(trendLineData)}
					fill="none"
					stroke="url(#trendLineGradient)"
					stroke-width="3"
					stroke-linecap="round"
					stroke-linejoin="round"
					class="transition-all duration-700"
				/>

				<!-- Data points on line -->
				{#each trendLineData as point, i (point.id)}
					{@const cx = (xScale(point.id) ?? 0) + xScale.bandwidth() / 2}
					{@const cy = yScale(point.trendValue)}
					<g class="transition-all duration-700 ease-out" style="transition-delay: {i * 30}ms;">
						<!-- Outer ring -->
						<circle
							{cx}
							{cy}
							r="8"
							fill="none"
							stroke="url(#trendLineGradient)"
							stroke-width="2"
							opacity="0.3"
						/>
						<!-- Inner filled circle -->
						<circle
							{cx}
							{cy}
							r="5"
							class="fill-white dark:fill-slate-900"
							stroke="url(#trendLineGradient)"
							stroke-width="2"
						/>
						<!-- Trend value label -->
						{#if !hideLabels}
							<text
								x={cx}
								y={cy - 14}
								text-anchor="middle"
								class="fill-violet-600 text-[10px] font-bold dark:fill-violet-400"
							>
								{point.trendValue.toFixed(1)}
							</text>
						{/if}
					</g>
				{/each}
			</g>

			<!-- Line legend -->
			<g transform="translate({innerWidth - 140}, -15)">
				<rect
					x="-8"
					y="-12"
					width="155"
					height="24"
					rx="4"
					class="fill-slate-100/80 dark:fill-slate-800/80"
				/>
				<line
					x1="0"
					y1="0"
					x2="24"
					y2="0"
					stroke="url(#trendLineGradient)"
					stroke-width="3"
					stroke-linecap="round"
				/>
				<circle
					cx="12"
					cy="0"
					r="4"
					class="fill-white dark:fill-slate-900"
					stroke="url(#trendLineGradient)"
					stroke-width="2"
				/>
				<text x="32" y="4" class="fill-slate-600 text-xs dark:fill-slate-400">
					Efficiency Score
				</text>
			</g>
		{/if}
	</g>

	<!-- Additional gradient definitions -->
	<defs>
		<linearGradient id="barSheen" x1="0%" y1="0%" x2="100%" y2="100%">
			<stop offset="0%" stop-color="white" stop-opacity="0.3" />
			<stop offset="50%" stop-color="white" stop-opacity="0" />
			<stop offset="100%" stop-color="black" stop-opacity="0.1" />
		</linearGradient>
	</defs>
</svg>

<style lang="postcss">
	@reference "@app-css";

	.bar-rect {
		filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
	}

	.bar-rect:hover {
		filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2)) brightness(1.05);
	}

	.bar-group:hover .bar-rect {
		transform: translateY(-2px);
	}
</style>
