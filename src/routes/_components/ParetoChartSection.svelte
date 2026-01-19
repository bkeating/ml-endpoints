<script>
	/**
	 * Pareto chart section with toolbar and responsive container.
	 * Displays throughput/utilization/interactivity views with configurable display options.
	 */
	import ParetoChart from '$lib/components/ParetoChart.svelte';
	import { getParetoViewMode, setParetoViewMode, paretoViewModeOptions } from '$lib/stores/chartFilters.svelte.js';
	import { isParetoSeriesVisible, toggleParetoSeries } from '$lib/stores/chartSettings.svelte.js';
	import {
		getShowParetoInterpolation,
		setShowParetoInterpolation,
		getShowParetoAnnotations,
		setShowParetoAnnotations,
		getShowParetoIdealLine,
		setShowParetoIdealLine
	} from '$lib/stores/pageSettings.svelte.js';
	import {
		paretoSeries,
		viewModes,
		transformForView,
		normalizeToGlobalMax,
		getGlobalMaxThroughput,
		getAnnotationsForView
	} from '$lib/data/paretoData.js';

	// Container width for responsive Pareto chart
	let paretoContainerWidth = $state(0);

	// Get display options from store
	let showParetoInterpolation = $derived(getShowParetoInterpolation());
	let showParetoAnnotations = $derived(getShowParetoAnnotations());
	let showParetoIdealLine = $derived(getShowParetoIdealLine());

	// Get current pareto view mode from store
	let paretoViewMode = $derived(getParetoViewMode());

	// Filter series based on visibility settings
	let filteredParetoSeries = $derived(
		paretoSeries.filter((s) => isParetoSeriesVisible(s.id))
	);

	// Normalize utilization to global max when comparing multiple series
	let normalizedParetoSeries = $derived(normalizeToGlobalMax(filteredParetoSeries));

	// Transform data for active view
	let paretoChartData = $derived(
		paretoViewMode === 'utilization'
			? transformForView(normalizedParetoSeries, 'utilization')
			: transformForView(filteredParetoSeries, paretoViewMode)
	);

	// Get current view config
	let currentParetoViewConfig = $derived(viewModes[paretoViewMode]);

	// Y-axis domain based on view
	let paretoYDomain = $derived(
		paretoViewMode === 'utilization' ? /** @type {[number, number]} */ ([0, 110]) : undefined
	);

	// Calculate chart dimensions based on container
	let paretoChartWidth = $derived(paretoContainerWidth || 900);
	let paretoChartHeight = $derived(Math.max(400, paretoChartWidth * 0.5));

	// Global max throughput for reference
	let globalMaxThroughput = $derived(getGlobalMaxThroughput(filteredParetoSeries));

	// Get annotations for the current view
	let paretoAnnotations = $derived(getAnnotationsForView(paretoViewMode));

	// Chart links
	/** @type {import('$lib/components/ParetoChart.svelte').ChartLink[]} */
	const paretoChartLinks = [
		{ label: 'Analysis', href: '#', icon: 'ReportAnalytics' },
		{ label: 'Files', href: '#', icon: 'FileAnalytics' },
		{ label: 'Downloads', href: '#', icon: 'Download' },
		{ label: 'Links', href: '#', icon: 'Link' }
	];
</script>

<div class="w-full py-12 bg-slate-50 dark:bg-slate-900/50">
	<div class="mx-auto max-w-7xl px-3">
		<section class="mb-6">
			<h2 class="mb-1 text-2xl md:text-3xl font-semibold text-slate-800 dark:text-slate-200 font-instrument-sans">
				{#if paretoViewMode === 'throughput'}
					Total System Throughput vs Concurrent Clients
				{:else if paretoViewMode === 'utilization'}
					% Utilization of Maximum Throughput
				{:else if paretoViewMode === 'interactivity'}
					Per-User Interactivity vs Concurrent Clients
				{/if}
			</h2>
			<p class="mb-4 text-sm text-slate-500 dark:text-slate-400">
				Step-function visualization with logarithmic X-axis
				{#if paretoViewMode === 'utilization'}
					• Normalized to global max: {(globalMaxThroughput / 1000).toFixed(0)}k tok/s
				{/if}
			</p>

			<!-- Pareto Chart Toolbar -->
			<div class="flex flex-wrap items-center justify-between gap-4 px-4 py-3 rounded-t-xl border border-b-0 border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800/80">
				<!-- View Mode Segmented Control -->
				<div class="flex items-center gap-3">
					<span class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">View</span>
					<div class="inline-flex rounded-lg bg-slate-200 p-1 dark:bg-slate-700">
						{#each paretoViewModeOptions as option (option.id)}
							<button
								type="button"
								onclick={() => setParetoViewMode(option.id)}
								class="px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer {paretoViewMode === option.id
									? 'bg-white text-slate-900 shadow-sm dark:bg-slate-600 dark:text-white'
									: 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}"
							>
								{option.label}
							</button>
						{/each}
					</div>
				</div>

				<!-- Display Options -->
				<div class="flex items-center gap-3">
					<span class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Display</span>
					<div class="flex flex-wrap gap-2">
						<label class="inline-flex items-center gap-1.5 cursor-pointer">
							<input
								type="checkbox"
								checked={showParetoInterpolation}
								onchange={(e) => setShowParetoInterpolation(e.currentTarget.checked)}
								class="w-3.5 h-3.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 dark:border-slate-600 dark:bg-slate-700"
							/>
							<span class="text-xs text-slate-600 dark:text-slate-400">Interpolation</span>
						</label>
						<label class="inline-flex items-center gap-1.5 cursor-pointer">
							<input
								type="checkbox"
								checked={showParetoAnnotations}
								onchange={(e) => setShowParetoAnnotations(e.currentTarget.checked)}
								class="w-3.5 h-3.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 dark:border-slate-600 dark:bg-slate-700"
							/>
							<span class="text-xs text-slate-600 dark:text-slate-400">Annotations</span>
						</label>
						<label class="inline-flex items-center gap-1.5 cursor-pointer">
							<input
								type="checkbox"
								checked={showParetoIdealLine}
								onchange={(e) => setShowParetoIdealLine(e.currentTarget.checked)}
								class="w-3.5 h-3.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 dark:border-slate-600 dark:bg-slate-700"
							/>
							<span class="text-xs text-slate-600 dark:text-slate-400">Ideal Scaling</span>
						</label>
					</div>
				</div>
			</div>

			<!-- Chart Container -->
			<div class="overflow-x-auto rounded-b-xl rounded-t-none border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800" bind:clientWidth={paretoContainerWidth}>
				{#if paretoContainerWidth > 0}
					<ParetoChart
						data={paretoChartData}
						width={paretoChartWidth}
						height={paretoChartHeight}
						xAxisLabel="Concurrent Clients"
						yAxisLabel={currentParetoViewConfig.yLabel}
						useLogScale={true}
						stepDirection={currentParetoViewConfig.stepDirection}
						annotations={showParetoAnnotations ? paretoAnnotations : []}
						showInterpolation={showParetoInterpolation}
						showIdealLine={showParetoIdealLine}
						yDomain={paretoYDomain}
						links={paretoChartLinks}
						legendSeries={paretoSeries}
						isSeriesVisible={isParetoSeriesVisible}
						onToggleSeries={toggleParetoSeries}
					/>
				{/if}
			</div>
		</section>
	</div>
</div>
