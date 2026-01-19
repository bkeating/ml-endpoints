<script>
	/**
	 * Chart Preview Component
	 * 
	 * Real-time D3-powered chart preview supporting:
	 * - Bar charts with multiple layers (grouped)
	 * - Line charts with multiple layers (overlaid)
	 * 
	 * Uses the same D3+Svelte hybrid pattern as existing charts.
	 */
	import * as d3 from 'd3';

	/**
	 * @typedef {Object} LayerData
	 * @property {string} layerId
	 * @property {string} layerName
	 * @property {string} color
	 * @property {{ x: any, y: number, label: string }[]} data
	 */

	/**
	 * @typedef {Object} Props
	 * @property {'bar' | 'line'} chartType
	 * @property {LayerData[]} layers
	 * @property {string} title
	 * @property {string} xAxisLabel
	 * @property {string} yAxisLabel
	 * @property {number} [width]
	 * @property {number} [height]
	 */

	/** @type {Props} */
	let {
		chartType,
		layers,
		title,
		xAxisLabel,
		yAxisLabel,
		width = 600,
		height = 400
	} = $props();

	const margin = { top: 40, right: 30, bottom: 60, left: 70 };

	// Derived dimensions
	let innerWidth = $derived(width - margin.left - margin.right);
	let innerHeight = $derived(height - margin.top - margin.bottom);

	// Check if we have any data to display
	let hasData = $derived(layers.some((l) => l.data.length > 0));

	// Get all unique x values across layers
	let allXValues = $derived.by(() => {
		const values = new Set();
		layers.forEach((layer) => {
			layer.data.forEach((d) => values.add(String(d.x)));
		});
		return Array.from(values);
	});

	// Calculate y domain (min 0 to max value with padding)
	let yMax = $derived.by(() => {
		let max = 0;
		layers.forEach((layer) => {
			layer.data.forEach((d) => {
				if (d.y > max) max = d.y;
			});
		});
		return max * 1.1 || 100;
	});

	// D3 Scales
	let xScale = $derived(
		chartType === 'bar'
			? d3.scaleBand()
				.domain(allXValues)
				.range([0, innerWidth])
				.padding(0.2)
			: d3.scalePoint()
				.domain(allXValues)
				.range([0, innerWidth])
				.padding(0.5)
	);

	let yScale = $derived(
		d3.scaleLinear()
			.domain([0, yMax])
			.range([innerHeight, 0])
	);

	// Axis ticks
	let yTicks = $derived(yScale.ticks(6));

	// Line generator for line charts
	let lineGenerator = $derived(
		d3.line()
			.x((d) => xScale(String(d.x)) ?? 0)
			.y((d) => yScale(d.y))
			.curve(d3.curveMonotoneX)
	);

	// Group width for bar charts
	let groupWidth = $derived(chartType === 'bar' ? xScale.bandwidth() : 0);
	let barWidth = $derived(layers.length > 0 ? groupWidth / layers.length : groupWidth);

	// Format Y-axis values
	const formatY = (/** @type {number} */ value) => {
		if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
		if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
		return String(Math.round(value));
	};

	// Unique clip path ID
	const clipId = `chart-preview-clip-${Math.random().toString(36).slice(2, 9)}`;
</script>

<div class="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden">
	<!-- Header -->
	<div class="px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
		<h3 class="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide dm-mono">
			Preview
		</h3>
		{#if hasData}
			<span class="text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400">
				{layers.reduce((sum, l) => sum + l.data.length, 0)} data points
			</span>
		{/if}
	</div>

	<div class="p-4">
		{#if !hasData}
			<div class="flex items-center justify-center h-64 text-slate-500 dark:text-slate-400">
				<div class="text-center">
					<svg class="h-12 w-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
					</svg>
					<p class="text-sm">Configure a data layer to see the preview</p>
				</div>
			</div>
		{:else}
			<svg {width} {height} class="overflow-visible font-instrument-sans">
				<defs>
					<!-- Gradient for chart background -->
					<linearGradient id="chartPreviewBg" x1="0%" y1="0%" x2="0%" y2="100%">
						<stop offset="0%" class="[stop-color:var(--color-slate-50)] dark:[stop-color:var(--color-slate-900)]" />
						<stop offset="100%" class="[stop-color:var(--color-slate-100)] dark:[stop-color:var(--color-slate-800)]" />
					</linearGradient>

					<!-- Clip path -->
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
					fill="url(#chartPreviewBg)"
					rx="4"
				/>

				<!-- Title -->
				<text
					x={margin.left + innerWidth / 2}
					y="24"
					text-anchor="middle"
					class="fill-slate-800 dark:fill-slate-200 text-sm font-semibold"
				>
					{title}
				</text>

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
							class="fill-slate-700 text-xs font-medium dark:fill-slate-300"
						>
							{yAxisLabel}
						</text>
					</g>

					<!-- X-axis -->
					<g class="x-axis" transform="translate(0, {innerHeight})">
						<line x1="0" x2={innerWidth} y1="0" y2="0" class="stroke-slate-300 dark:stroke-slate-600" stroke-width="1" />
						{#each allXValues as xVal, i (xVal)}
							{@const xPos = chartType === 'bar' 
								? (xScale(xVal) ?? 0) + (xScale.bandwidth?.() ?? 0) / 2 
								: xScale(xVal) ?? 0}
							<g transform="translate({xPos}, 0)">
								<line x1="0" x2="0" y1="0" y2="6" class="stroke-slate-400 dark:stroke-slate-500" />
								<text
									x="0"
									y="20"
									text-anchor="middle"
									class="fill-slate-600 text-[10px] dark:fill-slate-400"
									transform="rotate(-45, 0, 20)"
								>
									{String(xVal).length > 10 ? String(xVal).slice(0, 10) + '...' : xVal}
								</text>
							</g>
						{/each}
						<text
							x={innerWidth / 2}
							y="50"
							text-anchor="middle"
							class="fill-slate-700 text-xs font-medium dark:fill-slate-300"
						>
							{xAxisLabel}
						</text>
					</g>

					<!-- Data visualization -->
					<g clip-path="url(#{clipId})">
						{#if chartType === 'bar'}
							<!-- Bar chart -->
							{#each allXValues as xVal, xIndex (xVal)}
								{@const groupX = xScale(xVal) ?? 0}
								{#each layers as layer, layerIndex (layer.layerId)}
									{@const dataPoint = layer.data.find((d) => String(d.x) === xVal)}
									{#if dataPoint}
										{@const barX = groupX + layerIndex * barWidth}
										{@const barHeight = innerHeight - yScale(dataPoint.y)}
										{@const barY = yScale(dataPoint.y)}
										<rect
											x={barX}
											y={barY}
											width={Math.max(0, barWidth - 2)}
											height={barHeight}
											fill={layer.color}
											rx="2"
											class="transition-all duration-300"
										>
											<title>{layer.layerName}: {dataPoint.label} = {dataPoint.y}</title>
										</rect>
									{/if}
								{/each}
							{/each}
						{:else}
							<!-- Line chart -->
							{#each layers as layer (layer.layerId)}
								{#if layer.data.length > 1}
									<!-- Line path -->
									<path
										d={lineGenerator(layer.data)}
										fill="none"
										stroke={layer.color}
										stroke-width="2.5"
										stroke-linecap="round"
										stroke-linejoin="round"
										class="transition-all duration-300"
									/>
								{/if}
								<!-- Data points -->
								{#each layer.data as point, i (i)}
									{@const cx = xScale(String(point.x)) ?? 0}
									{@const cy = yScale(point.y)}
									<circle
										{cx}
										{cy}
										r="4"
										fill={layer.color}
										class="transition-all duration-200"
									>
										<title>{layer.layerName}: {point.label} = {point.y}</title>
									</circle>
								{/each}
							{/each}
						{/if}
					</g>
				</g>

				<!-- Legend -->
				{#if layers.length > 1}
					<g transform="translate({margin.left}, {height - 15})">
						{#each layers as layer, i (layer.layerId)}
							{@const offset = i * 100}
							<g transform="translate({offset}, 0)">
								<rect x="0" y="-6" width="12" height="12" rx="2" fill={layer.color} />
								<text x="16" y="4" class="fill-slate-600 text-[10px] dark:fill-slate-400">
									{layer.layerName.length > 10 ? layer.layerName.slice(0, 10) + '...' : layer.layerName}
								</text>
							</g>
						{/each}
					</g>
				{/if}
			</svg>
		{/if}
	</div>
</div>
