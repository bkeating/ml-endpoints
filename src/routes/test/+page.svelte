<script>
	/**
	 * MLPerf Endpoints Pareto Visualization Test Page
	 *
	 * This page demonstrates all the visualization features required for
	 * MLPerf Endpoints benchmark charts:
	 *
	 * 1. Pareto Step-Function Chart (Throughput vs Concurrency)
	 * 2. Utilization View (% of Max Throughput)
	 * 3. Interactivity View (TPS/User vs Concurrency)
	 * 4. Trade-off View (Throughput vs Interactivity)
	 * 5. Annotation Callouts with Leader Lines
	 * 6. Multi-Series Hardware Comparison
	 * 7. Interactive Tooltips
	 * 8. View Mode Switching
	 */
	import { onMount } from 'svelte';
	import ParetoChart from '$lib/components/ParetoChart.svelte';
	import {
		initializeParetoData,
		transformForView,
		normalizeToGlobalMax,
		generateTradeoffView,
		getGlobalMaxThroughput,
		getAnnotationsForView
	} from '$lib/data/paretoData.js';

	// ============================================================================
	// STATE
	// ============================================================================

	/** @type {import('$lib/data/paretoData.js').ParetoSeries[]} */
	let paretoSeries = $state([]);

	/** @type {Record<string, any>} */
	let viewModes = $state({});

	let loading = $state(true);
	let error = $state(null);

	/** @type {'throughput' | 'utilization' | 'interactivity'} */
	let activeView = $state('throughput');

	/** @type {string[]} */
	let selectedSeries = $state([]);

	let showInterpolation = $state(false);
	let showAnnotations = $state(true);
	let showIdealLine = $state(false);

	// Responsive width
	let containerWidth = $state(0);

	// ============================================================================
	// DATA LOADING
	// ============================================================================

	onMount(async () => {
		try {
			const result = await initializeParetoData();
			paretoSeries = result.series;
			viewModes = result.viewModes;
			selectedSeries = result.series.map((s) => s.id);
			loading = false;
		} catch (err) {
			console.error('Error loading pareto data:', err);
			error = err.message;
			loading = false;
		}
	});

	// ============================================================================
	// DERIVED DATA
	// ============================================================================

	// Filter to selected series
	let filteredSeries = $derived(paretoSeries.filter((s) => selectedSeries.includes(s.id)));

	// Normalize utilization to global max when comparing multiple series
	let normalizedSeries = $derived(normalizeToGlobalMax(filteredSeries));

	// Transform data for active view
	let chartData = $derived(
		activeView === 'utilization'
			? transformForView(normalizedSeries, 'utilization')
			: transformForView(filteredSeries, activeView)
	);

	// Trade-off view data (separate transformation)
	let tradeoffData = $derived(generateTradeoffView(filteredSeries));

	// Get current view config (with fallback for loading state)
	let currentViewConfig = $derived(
		viewModes[activeView] || { yLabel: '', description: '', stepDirection: 'after' }
	);

	// Y-axis domain based on view
	let yDomain = $derived(activeView === 'utilization' ? [0, 110] : undefined);

	// Show ideal line only for utilization view
	let showIdealLineForView = $derived(activeView === 'utilization' && showIdealLine);

	// Calculate chart width based on container - use full width
	let chartWidth = $derived(containerWidth || 900);
	let chartHeight = $derived(Math.max(400, chartWidth * 0.5));

	// Global max throughput for reference
	let globalMaxThroughput = $derived(getGlobalMaxThroughput(filteredSeries));

	// Get annotations for the current view
	let currentAnnotations = $derived(getAnnotationsForView(activeView));

	// ============================================================================
	// CHART LINKS
	// ============================================================================

	/** @type {import('$lib/components/ParetoChart.svelte').ChartLink[]} */
	const primaryChartLinks = [
		{ label: 'Analysis', href: '#', icon: 'ReportAnalytics' },
		{ label: 'Files', href: '#', icon: 'FileAnalytics' },
		{ label: 'Downloads', href: '#', icon: 'Download' },
		{ label: 'Links', href: '#', icon: 'Link' }
	];

	/** @type {import('$lib/components/ParetoChart.svelte').ChartLink[]} */
	const tradeoffChartLinks = [
		{ label: 'Analysis', href: '#', icon: 'ReportAnalytics' },
		{ label: 'Files', href: '#', icon: 'FileAnalytics' },
		{ label: 'Downloads', href: '#', icon: 'Download' },
		{ label: 'Links', href: '#', icon: 'Link' }
	];

	// ============================================================================
	// HANDLERS
	// ============================================================================

	/**
	 * Toggle a series on/off
	 * @param {string} seriesId
	 */
	function toggleSeries(seriesId) {
		if (selectedSeries.includes(seriesId)) {
			// Don't allow deselecting all
			if (selectedSeries.length > 1) {
				selectedSeries = selectedSeries.filter((id) => id !== seriesId);
			}
		} else {
			selectedSeries = [...selectedSeries, seriesId];
		}
	}

	/**
	 * Select all series
	 */
	function selectAllSeries() {
		selectedSeries = paretoSeries.map((s) => s.id);
	}
</script>

<svelte:head>
	<title>MLPerf Pareto Charts | Test Page</title>
</svelte:head>

<div
	class="min-h-screen bg-linear-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800"
>
	<!-- Hero Header -->
	<header
		class="relative overflow-hidden border-b border-slate-200 bg-slate-900/90 backdrop-blur dark:border-slate-700 dark:bg-slate-900/80"
	>
		<div class="absolute inset-0 bg-[url('/bg-pattern-squares.svg')] opacity-5"></div>
		<div class="relative mx-auto max-w-7xl px-4 py-10">
			<div class="flex flex-col gap-2">
				<span
					class="text-xs font-semibold tracking-[0.2em] text-emerald-600 uppercase dark:text-emerald-100"
				>
					MLPerf Endpoints
				</span>
				<h1
					class="dm-mono text-3xl font-bold text-balance text-slate-100 sm:text-4xl md:text-5xl dark:text-white"
				>
					Pareto Step-Function Charts
				</h1>
				<p class="max-w-2xl text-slate-400 dark:text-slate-400">
					Interactive demo of the Pareto visualization system for MLPerf Endpoints based on what
					I've pulled from docs so far. Features step-function curves, log-scale axes, multi-series
					comparison, and annotation callouts.
				</p>
			</div>
		</div>
	</header>

	<main class="mx-auto max-w-7xl px-4 py-8">
		<!-- Loading State -->
		{#if loading}
			<div class="flex items-center justify-center py-16">
				<div class="text-center">
					<div
						class="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600 dark:border-slate-700 dark:border-t-emerald-500"
					></div>
					<p class="mt-4 text-slate-600 dark:text-slate-400">Loading benchmark data...</p>
				</div>
			</div>
		{/if}

		<!-- Error State -->
		{#if error}
			<div
				class="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-900/20"
			>
				<h3 class="font-semibold text-red-800 dark:text-red-200">Error Loading Data</h3>
				<p class="mt-1 text-sm text-red-700 dark:text-red-300">{error}</p>
			</div>
		{/if}

		{#if !loading && !error}
			<!-- Controls Panel -->
			<section
				class="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800"
			>
				<div class="flex flex-wrap items-start gap-6">
					<!-- View Mode Toggle -->
					<div class="min-w-[200px] flex-1">
						<div class="flex flex-wrap gap-2">
							{#each Object.entries(viewModes) as [key] (key)}
								<button
									type="button"
									onclick={() => (activeView = key)}
									class="cursor-pointer rounded-lg px-4 py-2 text-sm font-medium transition-all {activeView ===
									key
										? 'bg-emerald-600 text-white shadow-md'
										: 'bg-slate-00 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'}"
								>
									{key.charAt(0).toUpperCase() + key.slice(1)}
								</button>
							{/each}
						</div>
						<p class="mt-2 text-xs text-slate-500 dark:text-slate-400">
							{currentViewConfig.description}
						</p>
					</div>

					<!-- Options -->
					<div class="flex flex-wrap items-center gap-4">
						<label class="flex cursor-pointer items-center gap-2">
							<input
								type="checkbox"
								bind:checked={showInterpolation}
								class="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
							/>
							<span class="text-sm text-slate-700 dark:text-slate-300">Show Interpolation</span>
						</label>
						<label class="flex cursor-pointer items-center gap-2">
							<input
								type="checkbox"
								bind:checked={showAnnotations}
								class="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
							/>
							<span class="text-sm text-slate-700 dark:text-slate-300">Show Annotations</span>
						</label>
						{#if activeView === 'utilization'}
							<label class="flex cursor-pointer items-center gap-2">
								<input
									type="checkbox"
									bind:checked={showIdealLine}
									class="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
								/>
								<span class="text-sm text-slate-700 dark:text-slate-300">Ideal Scaling Line</span>
							</label>
						{/if}
					</div>
				</div>

				<!-- Series Selection -->
				<div class="mt-6 border-t border-slate-200 pt-4 dark:border-slate-700">
					<div class="mb-3 flex items-center justify-between">
						<span
							class="text-sm font-medium text-slate-600 dark:text-slate-400"
							id="hardware-config-label"
						>
							Hardware Configurations ({selectedSeries.length}/{paretoSeries.length})
						</span>
						<button
							type="button"
							onclick={selectAllSeries}
							class="text-xs text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
						>
							Select All
						</button>
					</div>
					<div class="flex flex-wrap gap-3">
						{#each paretoSeries as series (series.id)}
							<button
								type="button"
								onclick={() => toggleSeries(series.id)}
								class="flex cursor-pointer items-center gap-2 rounded-lg border-none px-3 py-2 text-sm transition-all {selectedSeries.includes(
									series.id
								)
									? 'bg-emerald-600 text-white shadow-md'
									: 'bg-slate-00 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'}"
							>
								<span class="h-3 w-3 rounded-full" style="background-color: {series.color}"></span>
								<span>{series.label}</span>
								<span class="text-xs opacity-60">({series.vendor})</span>
							</button>
						{/each}
					</div>
				</div>
			</section>

			<!-- Primary Pareto Chart -->
			<section
				class="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800"
			>
				<div class="mb-4">
					<h2 class="text-xl font-semibold text-slate-800 dark:text-slate-200">
						{#if activeView === 'throughput'}
							Total System Throughput vs Concurrent Clients
						{:else if activeView === 'utilization'}
							% Utilization of Maximum Throughput
						{:else if activeView === 'interactivity'}
							Per-User Interactivity vs Concurrent Clients
						{/if}
					</h2>
					<p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
						Step-function visualization with logarithmic X-axis • Hover over points for details
						{#if activeView === 'utilization'}
							• Normalized to global max: {(globalMaxThroughput / 1000).toFixed(0)}k tok/s
						{/if}
					</p>
				</div>

				<div class="overflow-x-auto" bind:clientWidth={containerWidth}>
					{#if containerWidth > 0}
						<ParetoChart
							data={chartData}
							width={chartWidth}
							height={chartHeight}
							xAxisLabel="Concurrent Clients"
							yAxisLabel={currentViewConfig.yLabel}
							useLogScale={true}
							{showInterpolation}
							stepDirection={currentViewConfig.stepDirection}
							annotations={showAnnotations ? currentAnnotations : []}
							showIdealLine={showIdealLineForView}
							{yDomain}
							links={primaryChartLinks}
						/>
					{/if}
				</div>
			</section>

			<!-- Trade-off View -->
			<section
				class="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800"
			>
				<div class="mb-4">
					<h2 class="text-xl font-semibold text-slate-800 dark:text-slate-200">
						Throughput vs Interactivity Trade-off
					</h2>
					<p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
						Direct trade-off visualization • High interactivity (right) = low concurrency • Low
						interactivity (left) = high throughput
					</p>
				</div>

				<div class="overflow-x-auto">
					{#if containerWidth > 0}
						<ParetoChart
							data={tradeoffData}
							width={chartWidth}
							height={chartHeight * 0.8}
							xAxisLabel="Interactivity (Tok/s/user)"
							yAxisLabel="Total System Throughput (Tok/s)"
							useLogScale={false}
							{showInterpolation}
							stepDirection="before"
							links={tradeoffChartLinks}
						/>
					{/if}
				</div>
			</section>
		{/if}
	</main>
</div>

<style lang="postcss">
	@reference "@app-css";
</style>
