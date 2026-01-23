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
	import { SvelteSet } from 'svelte/reactivity';

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
	 * @property {() => void} [onTogglePayload]
	 * @property {boolean} [showPayloadToggle]
	 * @property {boolean} [payloadOpen]
	 * @property {string} [chartTitle]
	 * @property {(title: string) => void} [onChartTitleChange]
	 * @property {() => void} [onSave]
	 */

	/** @type {Props} */
	let {
		chartType,
		layers,
		title,
		xAxisLabel,
		yAxisLabel,
		width = 600,
		height = 400,
		onTogglePayload,
		showPayloadToggle = false,
		payloadOpen = false,
		chartTitle,
		onChartTitleChange,
		onSave
	} = $props();

	// Save state
	let saveStatus = $state(/** @type {'idle' | 'saving' | 'saved'} */ ('idle'));

	const margin = { top: 40, right: 30, bottom: 60, left: 70 };

	// Derived dimensions
	let innerWidth = $derived(width - margin.left - margin.right);
	let innerHeight = $derived(height - margin.top - margin.bottom);

	// Check if we have any data to display
	let hasData = $derived(layers.some((l) => l.data.length > 0));

	// Get all unique x values across layers
	let allXValues = $derived.by(() => {
		const values = new SvelteSet();
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
			? d3.scaleBand().domain(allXValues).range([0, innerWidth]).padding(0.2)
			: d3.scalePoint().domain(allXValues).range([0, innerWidth]).padding(0.5)
	);

	let yScale = $derived(d3.scaleLinear().domain([0, yMax]).range([innerHeight, 0]));

	// Axis ticks
	let yTicks = $derived(yScale.ticks(6));

	// Line generator for line charts
	let lineGenerator = $derived(
		d3
			.line()
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

<div
	class="flex h-full w-full flex-col overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800"
>
	<!-- Header -->
	<div
		class="flex shrink-0 items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/50"
	>
		<div class="flex items-center gap-3">
			<h3
				class="dm-mono text-sm font-semibold tracking-wide text-slate-700 uppercase dark:text-slate-300"
			>
				Preview
			</h3>
			{#if chartTitle !== undefined && onChartTitleChange}
				<div class="h-4 w-px bg-slate-300 dark:bg-slate-600"></div>
				<input
					id="chart-title"
					type="text"
					value={chartTitle}
					onchange={(e) => onChartTitleChange(e.target.value)}
					class="h-7 w-48 rounded border border-slate-300 bg-white px-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-[#CCEBD4] focus:ring-1 focus:ring-[#CCEBD4] focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-[#887B40] dark:focus:ring-[#887B40]"
					placeholder="Chart title..."
					aria-label="Chart title"
				/>
			{/if}
		</div>
		<div class="flex items-center gap-2">
			{#if hasData}
				<span
					class="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400"
				>
					{layers.reduce((sum, l) => sum + l.data.length, 0)} data points
				</span>
			{/if}
			{#if showPayloadToggle && onTogglePayload}
				<button
					type="button"
					onclick={onTogglePayload}
					class="flex h-7 items-center gap-1.5 rounded border border-slate-300 bg-white px-2.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 {payloadOpen ? 'bg-[#CCEBD4]/10 border-[#CCEBD4]/50 dark:bg-[#887B40]/10 dark:border-[#887B40]/50' : ''}"
					aria-label="Toggle JSON payload"
				>
					<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
					</svg>
					JSON
				</button>
			{/if}
			{#if onSave}
				<button
					type="button"
					onclick={async () => {
						saveStatus = 'saving';
						onSave();
						await new Promise((resolve) => setTimeout(resolve, 500));
						saveStatus = 'saved';
						setTimeout(() => {
							saveStatus = 'idle';
						}, 2000);
					}}
					disabled={saveStatus !== 'idle'}
					class="flex h-7 items-center gap-1.5 rounded border border-slate-300 bg-white px-2.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
					aria-label="Save chart"
				>
					{#if saveStatus === 'saving'}
						<svg class="h-3.5 w-3.5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
							<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
						</svg>
						Saving...
					{:else if saveStatus === 'saved'}
						<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
						</svg>
						Saved
					{:else}
						<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
						</svg>
						Save
					{/if}
				</button>
			{/if}
		</div>
	</div>

	<div class="p-4">
		{#if !hasData}
			<div class="flex h-64 items-center justify-center text-slate-500 dark:text-slate-400">
				<div class="text-center">
					<svg
						class="mx-auto mb-3 h-12 w-12 text-slate-300 dark:text-slate-600"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="1.5"
							d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
						/>
					</svg>
					<p class="text-sm">Configure a data layer to see the preview</p>
				</div>
			</div>
		{:else}
			<svg
				{width}
				{height}
				class="font-instrument-sans h-auto w-full overflow-visible"
				style="max-width: 100%;"
			>
				<defs>
					<!-- Gradient for chart background -->
					<linearGradient id="chartPreviewBg" x1="0%" y1="0%" x2="0%" y2="100%">
						<stop
							offset="0%"
							class="[stop-color:var(--color-slate-50)] dark:[stop-color:var(--color-slate-900)]"
						/>
						<stop
							offset="100%"
							class="[stop-color:var(--color-slate-100)] dark:[stop-color:var(--color-slate-800)]"
						/>
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
					class="fill-slate-800 text-sm font-semibold dark:fill-slate-200"
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
						<line
							x1="0"
							x2={innerWidth}
							y1="0"
							y2="0"
							class="stroke-slate-300 dark:stroke-slate-600"
							stroke-width="1"
						/>
						{#each allXValues as xVal (xVal)}
							{@const xPos =
								chartType === 'bar'
									? (xScale(xVal) ?? 0) + (xScale.bandwidth?.() ?? 0) / 2
									: (xScale(xVal) ?? 0)}
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
							{#each allXValues as xVal (xVal)}
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
									<circle {cx} {cy} r="4" fill={layer.color} class="transition-all duration-200">
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
									{layer.layerName.length > 10
										? layer.layerName.slice(0, 10) + '...'
										: layer.layerName}
								</text>
							</g>
						{/each}
					</g>
				{/if}
			</svg>
		{/if}
	</div>
</div>
