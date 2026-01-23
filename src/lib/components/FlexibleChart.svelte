<script>
	/**
	 * Flexible Chart Component
	 * Renders a line chart with configurable X and Y axes
	 */
	import * as d3 from 'd3';

	/**
	 * @typedef {Object} Props
	 * @property {Array<{x: number, y: number, original?: any}>} data - Chart data points
	 * @property {string} [color] - Line color
	 * @property {number} [width] - Chart width
	 * @property {number} [height] - Chart height
	 * @property {string} [title] - Chart title
	 * @property {string} [xLabel] - X-axis label
	 * @property {string} [yLabel] - Y-axis label
	 * @property {boolean} [useLogScaleX] - Use log scale for X-axis
	 * @property {boolean} [useLogScaleY] - Use log scale for Y-axis
	 */

	/** @type {Props} */
	let {
		data = [],
		color = '#2563eb',
		width = 400,
		height = 300,
		title = '',
		xLabel = 'X-Axis',
		yLabel = 'Y-Axis',
		useLogScaleX = false,
		useLogScaleY = false
	} = $props();

	// Margins
	let isMobile = $derived(width < 500);
	let margin = $derived({
		top: 20,
		right: isMobile ? 15 : 20,
		bottom: 55,
		left: isMobile ? 55 : 65
	});
	let innerWidth = $derived(width - margin.left - margin.right);
	let innerHeight = $derived(height - margin.top - margin.bottom);

	// Unique clip path ID
	let clipId = $derived(`clip-${Math.random().toString(36).slice(2, 9)}`);

	// Calculate domains with padding
	let xExtent = $derived(d3.extent(data, (d) => d.x));
	let yExtent = $derived(d3.extent(data, (d) => d.y));

	let xDomain = $derived.by(() => {
		if (!xExtent[0] || !xExtent[1]) return [1, 100];
		if (useLogScaleX) {
			return [Math.max(1, xExtent[0] * 0.9), xExtent[1] * 1.1];
		}
		const padding = (xExtent[1] - xExtent[0]) * 0.1 || 1;
		return [xExtent[0] - padding, xExtent[1] + padding];
	});

	let yDomain = $derived.by(() => {
		if (!yExtent[0] || !yExtent[1]) return [0, 100];
		if (useLogScaleY) {
			return [Math.max(1, yExtent[0] * 0.9), yExtent[1] * 1.1];
		}
		const padding = (yExtent[1] - yExtent[0]) * 0.1 || 1;
		return [Math.max(0, yExtent[0] - padding), yExtent[1] + padding];
	});

	// Scales
	let xScale = $derived.by(() => {
		if (useLogScaleX) {
			return d3.scaleLog().domain(xDomain).range([0, innerWidth]).nice();
		}
		return d3.scaleLinear().domain(xDomain).range([0, innerWidth]).nice();
	});

	let yScale = $derived.by(() => {
		if (useLogScaleY) {
			return d3.scaleLog().domain(yDomain).range([innerHeight, 0]).nice();
		}
		return d3.scaleLinear().domain(yDomain).range([innerHeight, 0]).nice();
	});

	// Ticks
	let xTicks = $derived.by(() => {
		if (useLogScaleX) {
			const [min, max] = xExtent;
			if (!min || !max) return [1, 10, 100];
			const ticks = [];
			let current = Math.pow(2, Math.floor(Math.log2(min)));
			while (current <= max * 1.1) {
				if (current >= min * 0.9) ticks.push(current);
				current *= 2;
			}
			return ticks.length > 0 ? ticks : [1, 2, 4, 8, 16, 32, 64];
		}
		return xScale.ticks(6);
	});

	let yTicks = $derived(yScale.ticks(6));

	// Line generator
	let lineGenerator = $derived(
		d3
			.line()
			.x((d) => xScale(d.x))
			.y((d) => yScale(d.y))
			.curve(d3.curveMonotoneX)
	);

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

	/**
	 * Format axis values
	 * @param {number} value
	 * @returns {string}
	 */
	function formatValue(value) {
		if (value >= 1000) {
			return `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}k`;
		}
		return value.toFixed(value < 10 ? 1 : 0);
	}
</script>

<div class="flexible-chart relative">
	{#if title}
		<h3 class="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">{title}</h3>
	{/if}

	{#if data.length === 0}
		<div
			class="flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800"
			style="width: {width}px; height: {height}px;"
		>
			<p class="text-sm text-slate-500 dark:text-slate-400">No data available for this combination</p>
		</div>
	{:else}
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
					<!-- Line -->
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
							aria-label="Data point at x={point.x}, y={point.y}"
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
								{formatValue(tick)}
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
						{yLabel}
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
								{formatValue(tick)}
							</text>
						</g>
					{/each}
					<text
						x={innerWidth / 2}
						y="45"
						text-anchor="middle"
						class="fill-slate-700 text-xs font-medium dark:fill-slate-300"
					>
						{xLabel}
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
					<div><strong>{xLabel}:</strong> {formatValue(tooltipData.x)}</div>
					<div><strong>{yLabel}:</strong> {formatValue(tooltipData.y)}</div>
					{#if tooltipData.original}
						<div class="mt-1 border-t border-slate-200 pt-1 dark:border-slate-700">
							<div><strong>Concurrent Users:</strong> {tooltipData.original.concurrentUsers}</div>
							{#if tooltipData.original.ttft}
								<div><strong>TTFT:</strong> {tooltipData.original.ttft}ms</div>
							{/if}
						</div>
					{/if}
				</div>
			</div>
		{/if}
	{/if}
</div>

<style lang="postcss">
	@reference "@app-css";

	.flexible-chart svg {
		max-width: 100%;
		height: auto;
		display: block;
	}
</style>
