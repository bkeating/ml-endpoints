<script>
	/**
	 * Chart Builder Main Component
	 * 
	 * Orchestrates the chart building workflow:
	 * 1. Select chart type (bar/line)
	 * 2. Configure data layers with API endpoints
	 * 3. Map properties to chart axes
	 * 4. Preview chart in real-time
	 * 5. Save chart configuration
	 */
	import ChartTypeSelector from './ChartTypeSelector.svelte';
	import DataLayerPanel from './DataLayerPanel.svelte';
	import ChartPreview from './ChartPreview.svelte';
	import {
		getChartType,
		setChartType,
		getLayers,
		getChartConfig,
		setChartConfig,
		addLayer,
		removeLayer,
		updateLayer,
		updateLayerMapping,
		toggleLayerVisibility,
		moveLayer,
		fetchLayerData,
		getAllChartData,
		buildChartPayload,
		resetChartBuilder
	} from '$lib/stores/chartBuilder.svelte.js';

	// Reactive store values
	let chartType = $derived(getChartType());
	let layers = $derived(getLayers());
	let chartConfig = $derived(getChartConfig());
	let chartData = $derived(getAllChartData());

	// Preview container for responsive sizing
	let previewContainerWidth = $state(0);

	// Save feedback state
	let saveStatus = $state(/** @type {'idle' | 'saving' | 'saved'} */ ('idle'));

	/**
	 * Handle save chart action
	 */
	async function handleSave() {
		saveStatus = 'saving';
		
		const payload = buildChartPayload();
		
		// Log the POST payload (as requested)
		console.log('=== CHART SAVE PAYLOAD ===');
		console.log('POST /api/charts');
		console.log(JSON.stringify(payload, null, 2));
		console.log('=========================');

		// Simulate API delay
		await new Promise((resolve) => setTimeout(resolve, 500));
		
		saveStatus = 'saved';
		
		// Reset status after 2 seconds
		setTimeout(() => {
			saveStatus = 'idle';
		}, 2000);
	}

	/**
	 * Handle reset chart action
	 */
	function handleReset() {
		if (confirm('Are you sure you want to reset? All configuration will be lost.')) {
			resetChartBuilder();
		}
	}
</script>

<div class="h-full flex flex-col lg:flex-row gap-4 p-4 overflow-hidden">
	<!-- Left Panel: Configuration -->
	<div class="lg:w-96 xl:w-[420px] shrink-0 flex flex-col gap-4 overflow-y-auto pb-4">
		<!-- Chart Title & Config -->
		<div class="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden">
			<div class="px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
				<h3 class="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide dm-mono">
					Chart Configuration
				</h3>
			</div>
			<div class="p-4 space-y-4">
				<div class="flex flex-col gap-1">
					<label for="chart-title" class="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400 dm-mono">
						Chart Title
					</label>
					<input
						id="chart-title"
						type="text"
						value={chartConfig.title}
						onchange={(e) => setChartConfig({ title: e.target.value })}
						class="h-9 px-3 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
					/>
				</div>
				<div class="grid grid-cols-2 gap-4">
					<div class="flex flex-col gap-1">
						<label for="x-axis-label" class="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400 dm-mono">
							X-Axis Label
						</label>
						<input
							id="x-axis-label"
							type="text"
							value={chartConfig.xAxisLabel}
							onchange={(e) => setChartConfig({ xAxisLabel: e.target.value })}
							class="h-9 px-3 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
						/>
					</div>
					<div class="flex flex-col gap-1">
						<label for="y-axis-label" class="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400 dm-mono">
							Y-Axis Label
						</label>
						<input
							id="y-axis-label"
							type="text"
							value={chartConfig.yAxisLabel}
							onchange={(e) => setChartConfig({ yAxisLabel: e.target.value })}
							class="h-9 px-3 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
						/>
					</div>
				</div>
			</div>
		</div>

		<!-- Chart Type Selector -->
		<ChartTypeSelector 
			{chartType} 
			onTypeChange={setChartType} 
		/>

		<!-- Data Layers -->
		<DataLayerPanel
			{layers}
			onFetch={fetchLayerData}
			onLayerUpdate={updateLayer}
			onMappingUpdate={updateLayerMapping}
			onToggleVisibility={toggleLayerVisibility}
			onMoveLayer={moveLayer}
			onRemoveLayer={removeLayer}
			onAddLayer={addLayer}
		/>
	</div>

	<!-- Right Panel: Preview & Actions -->
	<div class="flex-1 flex flex-col min-w-0 gap-4 overflow-hidden">
		<!-- Preview Area -->
		<div class="flex-1 min-h-0 overflow-auto" bind:clientWidth={previewContainerWidth}>
			{#if previewContainerWidth > 0}
				<ChartPreview
					{chartType}
					layers={chartData}
					title={chartConfig.title}
					xAxisLabel={chartConfig.xAxisLabel}
					yAxisLabel={chartConfig.yAxisLabel}
					width={Math.min(previewContainerWidth - 32, 800)}
					height={400}
				/>
			{/if}
		</div>

		<!-- Action Bar -->
		<div class="shrink-0 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
			<div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
				<!-- Info -->
				<div class="text-sm text-slate-600 dark:text-slate-400">
					<span class="font-medium text-slate-800 dark:text-slate-200">{layers.length}</span> layer{layers.length !== 1 ? 's' : ''} configured
					•
					<span class="font-medium text-slate-800 dark:text-slate-200">{chartData.reduce((sum, l) => sum + l.data.length, 0)}</span> data points
				</div>

				<!-- Actions -->
				<div class="flex items-center gap-3">
					<button
						type="button"
						onclick={handleReset}
						class="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-medium transition-colors"
					>
						Reset
					</button>
					<button
						type="button"
						onclick={handleSave}
						disabled={saveStatus !== 'idle'}
						class="px-6 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-400 text-white text-sm font-medium transition-colors flex items-center gap-2"
					>
						{#if saveStatus === 'saving'}
							<svg class="h-4 w-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
								<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
							</svg>
							Saving...
						{:else if saveStatus === 'saved'}
							<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
							</svg>
							Saved!
						{:else}
							<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
							</svg>
							Save Chart
						{/if}
					</button>
				</div>
			</div>
		</div>
	</div>
</div>
