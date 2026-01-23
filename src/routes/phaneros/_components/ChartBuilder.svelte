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

<div class="flex h-full flex-col gap-4 overflow-hidden p-4 lg:flex-row">
	<!-- Left Panel: Configuration -->
	<div class="flex shrink-0 flex-col gap-4 overflow-y-auto pb-4 lg:w-96 xl:w-[420px]">
		<!-- Chart Title & Config -->
		<div
			class="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800"
		>
			<div
				class="border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/50"
			>
				<h3
					class="dm-mono text-sm font-semibold tracking-wide text-slate-700 uppercase dark:text-slate-300"
				>
					Chart Configuration
				</h3>
			</div>
			<div class="space-y-4 p-4">
				<div class="flex flex-col gap-1">
					<label
						for="chart-title"
						class="dm-mono text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400"
					>
						Chart Title
					</label>
					<input
						id="chart-title"
						type="text"
						value={chartConfig.title}
						onchange={(e) => setChartConfig({ title: e.target.value })}
						class="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
					/>
				</div>
				<div class="grid grid-cols-2 gap-4">
					<div class="flex flex-col gap-1">
						<label
							for="x-axis-label"
							class="dm-mono text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400"
						>
							X-Axis Label
						</label>
						<input
							id="x-axis-label"
							type="text"
							value={chartConfig.xAxisLabel}
							onchange={(e) => setChartConfig({ xAxisLabel: e.target.value })}
							class="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
						/>
					</div>
					<div class="flex flex-col gap-1">
						<label
							for="y-axis-label"
							class="dm-mono text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400"
						>
							Y-Axis Label
						</label>
						<input
							id="y-axis-label"
							type="text"
							value={chartConfig.yAxisLabel}
							onchange={(e) => setChartConfig({ yAxisLabel: e.target.value })}
							class="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
						/>
					</div>
				</div>
			</div>
		</div>

		<!-- Chart Type Selector -->
		<ChartTypeSelector {chartType} onTypeChange={setChartType} />

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
	<div class="flex min-w-0 flex-1 flex-col gap-4 overflow-hidden">
		<!-- Preview Area -->
		<div class="min-h-0 flex-1 overflow-auto" bind:clientWidth={previewContainerWidth}>
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
		<div
			class="shrink-0 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800"
		>
			<div class="flex flex-col items-stretch justify-between gap-4 sm:flex-row sm:items-center">
				<!-- Info -->
				<div class="text-sm text-slate-600 dark:text-slate-400">
					<span class="font-medium text-slate-800 dark:text-slate-200">{layers.length}</span>
					layer{layers.length !== 1 ? 's' : ''} configured •
					<span class="font-medium text-slate-800 dark:text-slate-200"
						>{chartData.reduce((sum, l) => sum + l.data.length, 0)}</span
					> data points
				</div>

				<!-- Actions -->
				<div class="flex items-center gap-3">
					<button
						type="button"
						onclick={handleReset}
						class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
					>
						Reset
					</button>
					<button
						type="button"
						onclick={handleSave}
						disabled={saveStatus !== 'idle'}
						class="flex items-center gap-2 rounded-lg bg-emerald-500 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-600 disabled:bg-emerald-400"
					>
						{#if saveStatus === 'saving'}
							<svg
								class="h-4 w-4 animate-spin"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<circle
									class="opacity-25"
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									stroke-width="4"
								></circle>
								<path
									class="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
								></path>
							</svg>
							Saving...
						{:else if saveStatus === 'saved'}
							<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M5 13l4 4L19 7"
								/>
							</svg>
							Saved!
						{:else}
							<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
								/>
							</svg>
							Save Chart
						{/if}
					</button>
				</div>
			</div>
		</div>
	</div>
</div>
