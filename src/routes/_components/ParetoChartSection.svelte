<script>
	/**
	 * Pareto chart section with toolbar and responsive container.
	 * Displays throughput/utilization/interactivity views with configurable display options.
	 *
	 * Data is fetched from db.json (treated as API response) and stored locally
	 * with additional UI state like normalization weights.
	 */
	import { onMount } from 'svelte';
	import ParetoChart from '$lib/components/ParetoChart.svelte';
	import {
		getParetoViewMode,
		setParetoViewMode,
		paretoViewModeOptions
	} from '$lib/stores/chartFilters.svelte.js';
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
		fetchParetoData,
		transformForView,
		normalizeToGlobalMax,
		getGlobalMaxThroughput
	} from '$lib/data/paretoData.js';

	// ============================================================================
	// LOCAL DATA STATE (from API/db.json)
	// ============================================================================

	/** @type {import('$lib/data/paretoData.js').ParetoSeries[]} */
	let paretoSeries = $state([]);

	/** @type {Record<string, any>} */
	let viewModes = $state({
		throughput: { yLabel: 'Total System Throughput (Tok/s)', stepDirection: 'after' },
		utilization: { yLabel: '% Utilization of Max Throughput', stepDirection: 'after' },
		interactivity: { yLabel: 'Interactivity (Tok/s/user)', stepDirection: 'after' }
	});

	/** @type {Record<string, import('$lib/data/paretoData.js').ParetoAnnotation[]>} */
	let annotations = $state({});

	let loading = $state(true);
	let error = $state(null);

	// Container width for responsive Pareto chart
	let paretoContainerWidth = $state(0);

	// Normalization weights per series (user-defined multipliers for cost/power analysis)
	// This is LOCAL UI state that augments the API data
	/** @type {Record<string, number>} */
	let normalizationValues = $state({});

	// ============================================================================
	// DATA FETCHING
	// ============================================================================

	onMount(async () => {
		try {
			const result = await fetchParetoData();
			paretoSeries = result.series;
			viewModes = result.viewModes;
			annotations = result.annotations;
			loading = false;
		} catch (err) {
			console.error('Error loading pareto data:', err);
			error = err.message;
			loading = false;
		}
	});

	/**
	 * Handle normalization weight change from the chart legend
	 * @param {string} seriesId - The series ID to update
	 * @param {number} value - The new weight value
	 */
	function handleNormalizationChange(seriesId, value) {
		// Direct property assignment for proper Svelte 5 reactivity tracking
		normalizationValues[seriesId] = value;
	}

	// Get display options from store
	let showParetoInterpolation = $derived(getShowParetoInterpolation());
	let showParetoAnnotations = $derived(getShowParetoAnnotations());
	let showParetoIdealLine = $derived(getShowParetoIdealLine());

	// Get current pareto view mode from store
	let paretoViewMode = $derived(getParetoViewMode());

	// Filter series based on visibility settings
	let filteredParetoSeries = $derived(paretoSeries.filter((s) => isParetoSeriesVisible(s.id)));

	// Normalize utilization to global max when comparing multiple series
	let normalizedParetoSeries = $derived(normalizeToGlobalMax(filteredParetoSeries));

	// Transform data for active view (before applying user weights)
	let baseChartData = $derived(
		paretoViewMode === 'utilization'
			? transformForView(normalizedParetoSeries, 'utilization')
			: transformForView(filteredParetoSeries, paretoViewMode)
	);

	/**
	 * Apply user-defined normalization weights to chart data
	 * Multiplies Y values by the weight (default 1.0 if not set)
	 */
	let paretoChartData = $derived.by(() => {
		// Access normalizationValues to ensure Svelte tracks dependency
		const weights = normalizationValues;
		return baseChartData.map((series) => {
			const weight = weights[series.id] ?? 1;
			// Only apply weight if it's different from default (1)
			if (weight === 1) return series;
			return {
				...series,
				points: series.points.map((point) => ({
					...point,
					y: point.y * weight,
					// Store original Y for tooltip display
					originalY: point.y,
					appliedWeight: weight
				}))
			};
		});
	});

	// Get current view config (with fallback for loading state)
	let currentParetoViewConfig = $derived(
		viewModes[paretoViewMode] || { yLabel: '', stepDirection: 'after' }
	);

	// Y-axis domain based on view
	let paretoYDomain = $derived(
		paretoViewMode === 'utilization' ? /** @type {[number, number]} */ ([0, 110]) : undefined
	);

	// Calculate chart dimensions based on container
	let paretoChartWidth = $derived(paretoContainerWidth || 900);
	let paretoChartHeight = $derived(
		paretoChartWidth < 640
			? Math.max(280, paretoChartWidth * 0.6) // Shorter aspect ratio on mobile
			: Math.max(400, paretoChartWidth * 0.5)
	);

	// Global max throughput for reference
	let globalMaxThroughput = $derived(getGlobalMaxThroughput(filteredParetoSeries));

	// Get annotations for the current view (from local state)
	let paretoAnnotations = $derived(annotations[paretoViewMode] || []);

	// Chart links
	/** @type {import('$lib/components/ParetoChart.svelte').ChartLink[]} */
	const paretoChartLinks = [
		{ label: 'Analysis', href: '#', icon: 'ReportAnalytics' },
		{ label: 'Files', href: '#', icon: 'FileAnalytics' },
		{ label: 'Downloads', href: '#', icon: 'Download' },
		{ label: 'Links', href: '#', icon: 'Link' }
	];
</script>

<div class="w-full bg-slate-50 py-8 sm:py-12 dark:bg-slate-900/50">
	<div class="mx-auto max-w-7xl sm:px-3">
		<section class="mb-6">
			<h2
				class="font-instrument-sans mb-1 px-3 text-3xl font-semibold text-balance text-slate-800 sm:px-0 sm:text-2xl md:text-3xl dark:text-slate-200"
			>
				{#if paretoViewMode === 'throughput'}
					Total System Throughput vs Concurrent Clients
				{:else if paretoViewMode === 'utilization'}
					% Utilization of Maximum Throughput
				{:else if paretoViewMode === 'interactivity'}
					Per-User Interactivity vs Concurrent Clients
				{/if}
			</h2>
			<p
				class="mb-4 px-3 text-sm text-balance text-slate-500 sm:px-0 sm:text-base dark:text-slate-400"
			>
				{#if paretoViewMode === 'throughput'}
					Measures total system capacity—how many tokens your infrastructure can process when
					serving multiple concurrent clients.
				{:else if paretoViewMode === 'utilization'}
					Shows what percentage of peak performance each configuration achieves as client load
					increases. Normalized to global max: {(globalMaxThroughput / 1000).toFixed(0)}k tok/s.
				{:else if paretoViewMode === 'interactivity'}
					Measures per-user performance—how responsive each system feels to users as more clients
					connect. Reveals if infrastructure delivers snappy interactions under load.
				{/if}
			</p>

			<!-- Pareto Chart Toolbar -->
			<div
				class="flex flex-col gap-3 border-slate-200 bg-slate-100 px-3 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4 sm:rounded-t-xl sm:border sm:border-b-0 sm:px-4 dark:border-slate-700 dark:bg-slate-800/80"
			>
				<!-- View Mode Segmented Control -->
				<div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
					<span
						class="hidden text-xs font-semibold tracking-wide text-slate-500 uppercase sm:inline dark:text-slate-400"
						>View</span
					>
					<div class="inline-flex w-full rounded-lg bg-slate-200 p-1 sm:w-auto dark:bg-slate-700">
						{#each paretoViewModeOptions as option (option.id)}
							<button
								type="button"
								onclick={() => setParetoViewMode(option.id)}
								class="flex-1 cursor-pointer rounded-md px-3 py-2 text-sm font-medium transition-all sm:flex-none sm:py-1.5 sm:text-xs {paretoViewMode ===
								option.id
									? 'bg-white text-slate-900 shadow-sm dark:bg-slate-600 dark:text-white'
									: 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}"
							>
								{option.label}
							</button>
						{/each}
					</div>
				</div>

				<!-- Display Options -->
				<div class="flex w-full items-center sm:w-auto sm:px-0">
					<div class="flex w-full justify-center gap-4 sm:flex-wrap sm:gap-4">
						<label class="inline-flex cursor-pointer items-center gap-1.5">
							<input
								type="checkbox"
								checked={showParetoInterpolation}
								onchange={(e) => setShowParetoInterpolation(e.currentTarget.checked)}
								class="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 sm:h-3.5 sm:w-3.5 dark:border-slate-600 dark:bg-slate-700"
							/>
							<span class="text-sm text-slate-600 sm:text-sm dark:text-slate-400"
								>Interpolation</span
							>
						</label>
						<label class="inline-flex cursor-pointer items-center gap-1.5">
							<input
								type="checkbox"
								checked={showParetoAnnotations}
								onchange={(e) => setShowParetoAnnotations(e.currentTarget.checked)}
								class="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 sm:h-3.5 sm:w-3.5 dark:border-slate-600 dark:bg-slate-700"
							/>
							<span class="text-sm text-slate-600 sm:text-sm dark:text-slate-400">Annotations</span>
						</label>
						<label class="inline-flex cursor-pointer items-center gap-1.5">
							<input
								type="checkbox"
								checked={showParetoIdealLine}
								onchange={(e) => setShowParetoIdealLine(e.currentTarget.checked)}
								class="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 sm:h-3.5 sm:w-3.5 dark:border-slate-600 dark:bg-slate-700"
							/>
							<span class="text-sm text-slate-600 sm:inline dark:text-slate-400">Ideal Scaling</span
							>
						</label>
					</div>
				</div>
			</div>

			<!-- Chart Container -->
			<div
				class="border-slate-200 bg-white px-3 py-2 sm:rounded-b-xl sm:border sm:p-6 sm:shadow-sm dark:border-slate-700 dark:bg-slate-800"
			>
				<!-- Loading State -->
				{#if loading}
					<div class="flex items-center justify-center py-16">
						<div class="text-center">
							<div
								class="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600 dark:border-slate-700 dark:border-t-emerald-500"
							></div>
							<p class="mt-3 text-sm text-slate-500 dark:text-slate-400">Loading chart data...</p>
						</div>
					</div>
				{:else if error}
					<!-- Error State -->
					<div
						class="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-900/20"
					>
						<h3 class="font-semibold text-red-800 dark:text-red-200">Error Loading Data</h3>
						<p class="mt-1 text-sm text-red-700 dark:text-red-300">{error}</p>
					</div>
				{:else}
					<!-- Chart -->
					<div class="w-full" bind:clientWidth={paretoContainerWidth}>
						{#if paretoContainerWidth > 0 && paretoSeries.length > 0}
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
								{normalizationValues}
								onNormalizationChange={handleNormalizationChange}
								normalizationLabel="Weight"
							/>
						{:else if paretoSeries.length === 0}
							<div class="py-12 text-center">
								<p class="text-slate-500 dark:text-slate-400">No benchmark data available</p>
							</div>
						{/if}
					</div>
				{/if}
			</div>
		</section>
	</div>
</div>
