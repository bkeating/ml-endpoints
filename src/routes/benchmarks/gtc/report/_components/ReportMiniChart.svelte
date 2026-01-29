<script>
	/**
	 * ReportMiniChart - A compact chart for the report page sidebar.
	 * Shows a single submission's data with the current run highlighted.
	 */
	import { scaleLinear } from 'd3-scale';
	import { line, curveMonotoneX } from 'd3-shape';

	/**
	 * @typedef {Object} ChartPoint
	 * @property {number} x - X value
	 * @property {number} y - Y value
	 * @property {boolean} [isHighlighted] - Whether this point is the selected run
	 */

	/**
	 * @type {{
	 *   title: string,
	 *   xLabel: string,
	 *   yLabel: string,
	 *   color: string,
	 *   points: ChartPoint[]
	 * }}
	 */
	let { title, xLabel, yLabel, color, points } = $props();

	// Chart dimensions
	const width = 320;
	const height = 240;
	const margin = { top: 24, right: 16, bottom: 40, left: 50 };
	const innerWidth = width - margin.left - margin.right;
	const innerHeight = height - margin.top - margin.bottom;

	// Calculate domains with padding
	let xDomain = $derived.by(() => {
		const xValues = points.map((p) => p.x);
		const min = Math.min(...xValues);
		const max = Math.max(...xValues);
		const padding = (max - min) * 0.1 || 1;
		return [Math.max(0, min - padding), max + padding];
	});

	let yDomain = $derived.by(() => {
		const yValues = points.map((p) => p.y);
		const min = Math.min(...yValues);
		const max = Math.max(...yValues);
		const padding = (max - min) * 0.1 || 1;
		return [Math.max(0, min - padding), max + padding];
	});

	// Scales
	let xScale = $derived(scaleLinear().domain(xDomain).range([0, innerWidth]));
	let yScale = $derived(scaleLinear().domain(yDomain).range([innerHeight, 0]));

	// Line generator
	let lineGenerator = $derived(
		line()
			.x((d) => xScale(d.x))
			.y((d) => yScale(d.y))
			.curve(curveMonotoneX)
	);

	// Generate path
	let linePath = $derived(lineGenerator(points));

	// Ticks
	let xTicks = $derived(xScale.ticks(4));
	let yTicks = $derived(yScale.ticks(4));

	/**
	 * Format axis values for display
	 * @param {number} value
	 * @returns {string}
	 */
	function formatValue(value) {
		if (value >= 10000) return `${(value / 1000).toFixed(0)}k`;
		if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
		if (value < 0.01) return value.toFixed(4);
		if (value < 1) return value.toFixed(2);
		return value.toFixed(0);
	}

	// Find the highlighted point
	let highlightedPoint = $derived(points.find((p) => p.isHighlighted));
</script>

<div class="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
	<!-- Chart Title -->
	<header class="border-b border-slate-100 px-3 py-2 dark:border-slate-700">
		<h3 class="text-sm font-semibold text-slate-700 dark:text-slate-200">{title}</h3>
	</header>

	<!-- SVG Chart -->
	<div class="p-2">
		<svg viewBox="0 0 {width} {height}" class="h-auto w-full">
			<!-- Background -->
			<rect
				x={margin.left}
				y={margin.top}
				width={innerWidth}
				height={innerHeight}
				class="fill-slate-50 dark:fill-slate-900"
				rx="2"
			/>

			<g transform="translate({margin.left}, {margin.top})">
				<!-- Grid lines -->
				{#each yTicks as tick (tick)}
					<line
						x1="0"
						x2={innerWidth}
						y1={yScale(tick)}
						y2={yScale(tick)}
						class="stroke-slate-200 dark:stroke-slate-700"
						stroke-dasharray="2,2"
						stroke-width="0.5"
					/>
				{/each}

				<!-- Line path -->
				<path
					d={linePath}
					fill="none"
					stroke={color}
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>

				<!-- Data points -->
				{#each points as point (point.x)}
					<circle
						cx={xScale(point.x)}
						cy={yScale(point.y)}
						r={point.isHighlighted ? 6 : 3}
						fill={point.isHighlighted ? color : 'white'}
						stroke={color}
						stroke-width={point.isHighlighted ? 2 : 1.5}
						class={point.isHighlighted ? 'drop-shadow-md' : ''}
					/>
				{/each}

				<!-- Highlighted point indicator -->
				{#if highlightedPoint}
					<g transform="translate({xScale(highlightedPoint.x)}, {yScale(highlightedPoint.y)})">
						<!-- Outer ring animation -->
						<circle
							r="10"
							fill="none"
							stroke={color}
							stroke-width="1"
							opacity="0.3"
							class="animate-ping"
						/>
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
							<text
								x="-8"
								y="0"
								dy="0.35em"
								text-anchor="end"
								class="fill-slate-500 text-[10px] dark:fill-slate-400"
							>
								{formatValue(tick)}
							</text>
						</g>
					{/each}
					<text
						transform="rotate(-90)"
						x={-innerHeight / 2}
						y="-38"
						text-anchor="middle"
						class="fill-slate-600 text-[10px] font-medium dark:fill-slate-400"
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
						class="stroke-slate-300 dark:stroke-slate-600"
						stroke-width="1"
					/>
					{#each xTicks as tick (tick)}
						<g transform="translate({xScale(tick)}, 0)">
							<text
								x="0"
								y="14"
								text-anchor="middle"
								class="fill-slate-500 text-[10px] dark:fill-slate-400"
							>
								{formatValue(tick)}
							</text>
						</g>
					{/each}
					<text
						x={innerWidth / 2}
						y="28"
						text-anchor="middle"
						class="fill-slate-600 text-[10px] font-medium dark:fill-slate-400"
					>
						{xLabel}
					</text>
				</g>
			</g>
		</svg>
	</div>

	<!-- Current Value Display -->
	{#if highlightedPoint}
		<footer class="border-t border-slate-100 px-3 py-2 dark:border-slate-700">
			<div class="flex items-center justify-between text-xs">
				<span class="text-slate-500 dark:text-slate-400">Selected Point</span>
				<span class="font-mono font-medium text-slate-700 dark:text-slate-200">
					({formatValue(highlightedPoint.x)}, {formatValue(highlightedPoint.y)})
				</span>
			</div>
		</footer>
	{/if}
</div>
