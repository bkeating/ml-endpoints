<script>
	/**
	 * Pareto Step-Function Chart for MLPerf Endpoints visualization.
	 *
	 * Features:
	 * - Step function curves (d3.curveStepAfter) showing performance plateaus
	 * - Logarithmic X-axis for concurrent clients (1, 8, 32, 128, 512, 2048, 4096)
	 * - Optional smooth interpolation curve overlay
	 * - Multi-series comparison with distinct colors
	 * - Compliance point markers (min/max concurrency)
	 * - Interactive tooltips on hover
	 * - Annotation callouts with leader lines
	 *
	 * D3 + Svelte Integration:
	 * - D3 handles: scales, line generation, tick calculations
	 * - Svelte handles: DOM rendering, reactivity, event handling
	 */
	import * as d3 from 'd3';
	import Icon from '$lib/components/Icon.svelte';

	/**
	 * @typedef {Object} DataPoint
	 * @property {number} x - Concurrent clients
	 * @property {number} y - Metric value (throughput, utilization, or interactivity)
	 * @property {boolean} [isCompliancePoint] - Whether this is a compliance point
	 * @property {Object} [original] - Original data for tooltips
	 */

	/**
	 * @typedef {Object} Series
	 * @property {string} id - Unique series identifier
	 * @property {string} label - Display label
	 * @property {string} color - Hex color
	 * @property {string} [vendor] - Hardware vendor
	 * @property {DataPoint[]} points - Data points
	 */

	/**
	 * @typedef {Object} Annotation
	 * @property {string} id - Unique identifier
	 * @property {string} text - Annotation text (supports \n)
	 * @property {{ x: number, y: number }} targetPoint - Data coordinates
	 * @property {{ dx: number, dy: number }} labelOffset - Pixel offset
	 * @property {'start' | 'middle' | 'end'} anchor - Text anchor
	 */

	/**
	 * @typedef {Object} ChartLink
	 * @property {string} label - Link display text
	 * @property {string} [href] - Optional URL
	 * @property {() => void} [onclick] - Optional click handler
	 * @property {string} [icon] - Icon name to display (from $lib/components/icons/)
	 */

	/**
	 * @typedef {Object} Props
	 * @property {Series[]} data - Array of series data
	 * @property {number} [width] - Chart width
	 * @property {number} [height] - Chart height
	 * @property {string} [xAxisLabel] - X-axis label
	 * @property {string} [yAxisLabel] - Y-axis label
	 * @property {boolean} [useLogScale] - Use logarithmic X-axis scale
	 * @property {boolean} [showInterpolation] - Show smooth interpolation curve
	 * @property {'after' | 'before'} [stepDirection] - Step function direction
	 * @property {Annotation[]} [annotations] - Chart annotations
	 * @property {boolean} [showIdealLine] - Show ideal linear scaling line (utilization view)
	 * @property {[number, number]} [yDomain] - Custom Y-axis domain
	 * @property {ChartLink[]} [links] - Links to display below the legend
	 */

	/** @type {Props} */
	let {
		data,
		width = 800,
		height = 500,
		xAxisLabel = 'Concurrent Clients',
		yAxisLabel = 'Total System Throughput (Tok/s)',
		useLogScale = true,
		showInterpolation = false,
		stepDirection = 'after',
		annotations = [],
		showIdealLine = false,
		yDomain: customYDomain = undefined,
		links = []
	} = $props();

	// Responsive margins - more room for legend at larger widths
	let margin = $derived({
		top: 40,
		right: width > 800 ? 200 : 160,
		bottom: 60,
		left: 90
	});

	// Derived dimensions
	let innerWidth = $derived(width - margin.left - margin.right);
	let innerHeight = $derived(height - margin.top - margin.bottom);

	// Compute domains from data
	let xExtent = $derived(
		d3.extent(data.flatMap((s) => s.points.map((p) => p.x)))
	);
	let yMax = $derived(
		d3.max(data.flatMap((s) => s.points.map((p) => p.y))) ?? 0
	);
	let yDomain = $derived(customYDomain ?? [0, yMax * 1.1]);

	// D3 scales
	let xScale = $derived(
		useLogScale
			? d3.scaleLog().domain([Math.max(1, xExtent[0] ?? 1), xExtent[1] ?? 4096]).range([0, innerWidth]).nice()
			: d3.scaleLinear().domain([0, xExtent[1] ?? 4096]).range([0, innerWidth]).nice()
	);

	let yScale = $derived(
		d3.scaleLinear().domain(yDomain).range([innerHeight, 0])
	);

	// Axis ticks
	let xTicks = $derived(
		useLogScale
			? [1, 8, 32, 128, 512, 2048, 4096].filter((t) => t >= (xExtent[0] ?? 1) && t <= (xExtent[1] ?? 4096))
			: xScale.ticks(8)
	);
	let yTicks = $derived(yScale.ticks(8));

	// Step function line generator
	let stepLineGenerator = $derived(
		d3.line()
			.x((d) => xScale(d.x))
			.y((d) => yScale(d.y))
			.curve(stepDirection === 'after' ? d3.curveStepAfter : d3.curveStepBefore)
	);

	// Smooth interpolation line generator
	let smoothLineGenerator = $derived(
		d3.line()
			.x((d) => xScale(d.x))
			.y((d) => yScale(d.y))
			.curve(d3.curveMonotoneX)
	);

	// Ideal linear scaling line (for utilization view)
	// On a log-scale X-axis, linear scaling (y = x/max * 100) appears as a curve
	// Generate multiple points to draw it correctly
	let idealLinePoints = $derived.by(() => {
		if (!showIdealLine || !xExtent[0] || !xExtent[1]) return [];

		const minX = xExtent[0];
		const maxX = xExtent[1];
		const points = [];

		// Generate points at log-spaced intervals for smooth curve on log scale
		const logMin = Math.log10(minX);
		const logMax = Math.log10(maxX);
		const numPoints = 50;

		for (let i = 0; i <= numPoints; i++) {
			const logX = logMin + (logMax - logMin) * (i / numPoints);
			const x = Math.pow(10, logX);
			// Ideal utilization: (x / maxX) * 100
			const y = (x / maxX) * 100;
			points.push({ x, y });
		}

		return points;
	});

	// Line generator for ideal line (smooth curve)
	let idealLineGenerator = $derived(
		d3.line()
			.x((d) => xScale(d.x))
			.y((d) => yScale(d.y))
			.curve(d3.curveLinear)
	);

	// Y-axis formatting
	const formatY = (/** @type {number} */ value) => {
		if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
		if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
		if (value < 1) return value.toFixed(1);
		return String(Math.round(value));
	};

	// Tooltip state
	let tooltipData = $state(null);
	let tooltipPosition = $state({ x: 0, y: 0 });

	/**
	 * Handle point hover
	 * @param {MouseEvent} event
	 * @param {DataPoint} point
	 * @param {Series} series
	 */
	function handlePointHover(event, point, series) {
		const svgRect = event.currentTarget.closest('svg')?.getBoundingClientRect();
		if (!svgRect) return;

		tooltipData = { point, series };
		tooltipPosition = {
			x: event.clientX - svgRect.left + 15,
			y: event.clientY - svgRect.top - 10
		};
	}

	function handlePointLeave() {
		tooltipData = null;
	}

	// Unique clip path ID
	const clipId = `pareto-clip-${Math.random().toString(36).slice(2, 9)}`;
</script>

<div class="pareto-chart-container relative">
	<svg {width} {height} class="overflow-visible font-instrument-sans">
		<defs>
			<!-- Chart background gradient -->
			<linearGradient id="paretoBg" x1="0%" y1="0%" x2="0%" y2="100%">
				<stop offset="0%" class="[stop-color:var(--color-slate-50)] dark:[stop-color:var(--color-slate-900)]" />
				<stop offset="100%" class="[stop-color:var(--color-slate-100)] dark:[stop-color:var(--color-slate-800)]" />
			</linearGradient>
			<!-- Clip path for data area -->
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
			fill="url(#paretoBg)"
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

			<!-- Ideal linear scaling line (utilization view) -->
			{#if showIdealLine && idealLinePoints.length > 0}
				<path
					d={idealLineGenerator(idealLinePoints)}
					fill="none"
					class="stroke-emerald-500"
					stroke-width="2"
					stroke-dasharray="8,4"
					opacity="0.7"
				/>
				<!-- Label for ideal line -->
				<text
					x={xScale(idealLinePoints[idealLinePoints.length - 1]?.x ?? 0) + 5}
					y={yScale(100) - 5}
					class="fill-emerald-600 text-[10px] font-medium dark:fill-emerald-400"
				>
					Ideal
				</text>
			{/if}

			<!-- Data series (clipped) -->
			<g clip-path="url(#{clipId})">
				{#each data as series (series.id)}
					<!-- Smooth interpolation curve (behind step function) -->
					{#if showInterpolation}
						<path
							d={smoothLineGenerator(series.points)}
							fill="none"
							stroke={series.color}
							stroke-width="1.5"
							stroke-dasharray="5,5"
							opacity="0.4"
						/>
					{/if}

					<!-- Step function line -->
					<path
						d={stepLineGenerator(series.points)}
						fill="none"
						stroke={series.color}
						stroke-width="2.5"
						stroke-linecap="round"
						stroke-linejoin="round"
						class="transition-all duration-200 hover:stroke-[3.5px]"
					/>

					<!-- Data points -->
					{#each series.points as point, i (i)}
						<circle
							cx={xScale(point.x)}
							cy={yScale(point.y)}
							r={point.isCompliancePoint ? 7 : 5}
							fill={series.color}
							stroke={point.isCompliancePoint ? '#fff' : series.color}
							stroke-width={point.isCompliancePoint ? 2.5 : 1.5}
							class="cursor-pointer transition-all duration-150 hover:r-[8px]"
							onmouseenter={(e) => handlePointHover(e, point, series)}
							onmouseleave={handlePointLeave}
						/>
						<!-- Compliance point indicator ring -->
						{#if point.isCompliancePoint}
							<circle
								cx={xScale(point.x)}
								cy={yScale(point.y)}
								r="11"
								fill="none"
								stroke={series.color}
								stroke-width="1.5"
								stroke-dasharray="3,3"
								opacity="0.6"
							/>
						{/if}
					{/each}
				{/each}
			</g>

			<!-- Y-axis -->
			<g class="y-axis">
				<line x1="0" x2="0" y1="0" y2={innerHeight} class="stroke-slate-400 dark:stroke-slate-500" stroke-width="1" />
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
							{formatY(tick)}
						</text>
					</g>
				{/each}
				<text
					transform="rotate(-90)"
					x={-innerHeight / 2}
					y="-65"
					text-anchor="middle"
					class="fill-slate-700 text-sm font-medium dark:fill-slate-300"
				>
					{yAxisLabel}
				</text>
			</g>

			<!-- X-axis -->
			<g class="x-axis" transform="translate(0, {innerHeight})">
				<line x1="0" x2={innerWidth} y1="0" y2="0" class="stroke-slate-400 dark:stroke-slate-500" stroke-width="1" />
				{#each xTicks as tick (tick)}
					<g transform="translate({xScale(tick)}, 0)">
						<line x1="0" x2="0" y1="0" y2="6" class="stroke-slate-400 dark:stroke-slate-500" />
						<text
							x="0"
							y="22"
							text-anchor="middle"
							class="fill-slate-600 text-xs dark:fill-slate-400"
						>
							{tick.toLocaleString()}
						</text>
					</g>
				{/each}
				<text
					x={innerWidth / 2}
					y="45"
					text-anchor="middle"
					class="fill-slate-700 text-sm font-medium dark:fill-slate-300"
				>
					{xAxisLabel}
				</text>
			</g>

			<!-- Annotations -->
			{#each annotations as ann (ann.id)}
				{@const targetX = xScale(ann.targetPoint.x)}
				{@const targetY = yScale(ann.targetPoint.y)}
				{@const labelX = targetX + ann.labelOffset.dx}
				{@const labelY = targetY + ann.labelOffset.dy}
				{@const textLines = ann.text.split('\n')}
				{@const lineHeight = 16}
				{@const boxPadding = 10}
				{@const boxWidth = Math.max(...textLines.map((t) => t.length)) * 7.5 + boxPadding * 2}
				{@const boxHeight = textLines.length * lineHeight + boxPadding * 1.5}

				<g class="annotation">
					<!-- Leader line -->
					<line
						x1={targetX}
						y1={targetY}
						x2={labelX + (ann.anchor === 'end' ? -boxWidth / 2 : ann.anchor === 'start' ? boxWidth / 2 : 0)}
						y2={labelY + boxHeight / 2}
						class="stroke-slate-600 dark:stroke-slate-400"
						stroke-width="1.5"
						stroke-dasharray="4,2"
					/>

					<!-- Target dot -->
					<circle
						cx={targetX}
						cy={targetY}
						r="5"
						class="fill-slate-700 stroke-white dark:fill-slate-300 dark:stroke-slate-900"
						stroke-width="2"
					/>

					<!-- Callout box -->
					<rect
						x={labelX - (ann.anchor === 'end' ? boxWidth : ann.anchor === 'middle' ? boxWidth / 2 : 0)}
						y={labelY}
						width={boxWidth}
						height={boxHeight}
						rx="4"
						class="fill-slate-800 stroke-slate-600 dark:fill-slate-900 dark:stroke-slate-500"
						stroke-width="1.5"
					/>

					<!-- Text lines -->
					{#each textLines as line, i (i)}
						<text
							x={labelX - (ann.anchor === 'end' ? boxWidth - boxPadding : ann.anchor === 'middle' ? boxWidth / 2 - boxPadding : -boxPadding)}
							y={labelY + boxPadding + (i + 0.75) * lineHeight}
							text-anchor="start"
							class="fill-slate-100 text-xs font-medium dark:fill-slate-200"
						>
							{line}
						</text>
					{/each}
				</g>
			{/each}

			<!-- Legend -->
			<g class="legend" transform="translate({innerWidth + 20}, 0)">
				<!-- Header -->
				<text
					x="0"
					y="0"
					class="fill-slate-500 text-xs uppercase tracking-wide dark:fill-slate-400 font-semibold"
				>
					Hardware
				</text>
				{#each data as series, i (series.id)}
					{@const maxLabelLength = width > 800 ? 28 : 18}
					<g transform="translate(0, {i * 28 + 16})">
						<circle
							cx="10"
							cy="8"
							r="5"
							fill={series.color}
						/>
						<text
							x="28"
							y="12"
							class="fill-slate-700 text-xs dark:fill-slate-300"
						>
							{series.label.length > maxLabelLength ? series.label.slice(0, maxLabelLength) + '...' : series.label}
						</text>
						{#if series.vendor}
							<text
								x="28"
								y="24"
								class="fill-slate-500 text-[10px] dark:fill-slate-400"
							>
								{series.vendor}
							</text>
						{/if}
					</g>
				{/each}
			</g>

			<!-- Links below legend -->
			{#if links.length > 0}
				<foreignObject
					x={innerWidth + 20}
					y={data.length * 28 + 32}
					width={margin.right - 30}
					height="150"
				>
					<div xmlns="http://www.w3.org/1999/xhtml" class="border-t border-slate-200 pt-3 dark:border-slate-700">
						<ul class="space-y-3">
							{#each links as link (link.label)}
								<li>
									<a
										href={link.href ?? '#'}
										onclick={link.onclick}
										class="flex items-center gap-2 text-sm text-slate-300 hover:underline dark:text-surface-400"
									>
										{#if link.icon}
											<Icon name={link.icon} class="h-5 w-5" />
										{/if}
										{link.label}
									</a>
								</li>
							{/each}
						</ul>
					</div>
				</foreignObject>
			{/if}
		</g>
	</svg>

	<!-- Tooltip -->
	{#if tooltipData}
		<div
			class="pointer-events-none absolute z-50 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-lg dark:border-slate-700 dark:bg-slate-800"
			style="left: {tooltipPosition.x}px; top: {tooltipPosition.y}px;"
		>
			<div class="mb-1 flex items-center gap-2">
				<span
					class="h-2.5 w-2.5 rounded-full"
					style="background-color: {tooltipData.series.color}"
				></span>
				<span class="text-sm font-medium text-slate-800 dark:text-slate-200">
					{tooltipData.series.label}
				</span>
			</div>
			<div class="space-y-0.5 text-xs text-slate-600 dark:text-slate-400">
				<div><strong>Concurrent Clients:</strong> {tooltipData.point.x.toLocaleString()}</div>
				{#if tooltipData.point.original}
					<div><strong>Throughput:</strong> {formatY(tooltipData.point.original.total_tput)} tok/s</div>
					<div><strong>Interactivity:</strong> {formatY(tooltipData.point.original.tps_usr)} tok/s/user</div>
					<div><strong>Utilization:</strong> {tooltipData.point.original.util.toFixed(1)}%</div>
				{:else}
					<div><strong>Value:</strong> {formatY(tooltipData.point.y)}</div>
				{/if}
				{#if tooltipData.point.isCompliancePoint}
					<div class="mt-1 text-emerald-600 dark:text-emerald-400">★ Compliance Point</div>
				{/if}
			</div>
		</div>
	{/if}
</div>

<style lang="postcss">
	@reference "@app-css";

	.pareto-chart-container :global(.annotation) {
		transition: opacity 0.2s ease;
	}

	.pareto-chart-container:hover :global(.annotation) {
		opacity: 0.7;
	}

	.pareto-chart-container :global(.annotation:hover) {
		opacity: 1;
	}
</style>
