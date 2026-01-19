<script>
	/**
	 * Main page for the LLM Inference Benchmark dashboard.
	 *
	 * This page demonstrates:
	 * - Reactive data fetching with $derived() that auto-refetches when filters change
	 * - Async/await pattern with {#await} blocks for loading states
	 * - Component composition for maintainable, skinny page files
	 * - Local component state for enhanced D3 chart features
	 */
	import Hero from '$lib/components/Hero.svelte';
	import ChartFilters from '$lib/components/ChartFilters.svelte';
	import ChartSection from '$lib/components/ChartSection.svelte';
	import ErrorBanner from '$lib/components/ErrorBanner.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import ParetoChart from '$lib/components/ParetoChart.svelte';
	import { getChartData } from '$lib/remotes/chartData.js';
	import { getFilters, getParetoViewMode, setParetoViewMode, paretoViewModeOptions } from '$lib/stores/chartFilters.svelte.js';
	import { isParetoSeriesVisible, toggleParetoSeries } from '$lib/stores/chartSettings.svelte.js';
	import BarChartEnhanced from '$lib/components/BarChartEnhanced.svelte';
	import BarChartToolbar from '$lib/components/BarChartToolbar.svelte';
	import SparklineTable from '$lib/components/SparklineTable.svelte';
	import ChartSettingsSidebar from '$lib/components/ChartSettingsSidebar.svelte';
	import { gpuInferenceBenchmarks, gpuBenchmarkColumns } from '$lib/data/placeholders.js';
	import {
		paretoSeries,
		viewModes,
		transformForView,
		normalizeToGlobalMax,
		getGlobalMaxThroughput,
		getAnnotationsForView
	} from '$lib/data/paretoData.js';

	// $derived() creates a reactive value that automatically updates when getFilters() changes
	let filters = $derived(getFilters());

	// This promise automatically re-runs whenever filters change, triggering a new API call
	let chartDataQuery = $derived(
		getChartData({
			model: filters.model,
			islOsl: filters.islOsl,
			precision: filters.precision,
			yAxisMetric: filters.yAxisMetric
		})
	);

	// Local state for enhanced bar chart features (not global since they're demo-specific)
	/** @type {'original' | 'ascending' | 'descending'} */
	let barSortOrder = $state('original');
	let showLineOverlay = $state(false);
	let showThresholds = $state(false);

	// Reactive container width for fluid chart sizing
	let barChartContainerWidth = $state(0);

	// ============================================================================
	// PARETO CHART STATE
	// ============================================================================

	// Container width for responsive Pareto chart
	let paretoContainerWidth = $state(0);

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

<Hero />

{#await chartDataQuery}
	<!-- Loading state -->
	<div class="flex items-center justify-center py-12 mx-auto max-w-7xl px-3">
		<div class="flex items-center gap-3 text-slate-500 dark:text-slate-400">
			<Icon name="Spinner" class="h-5 w-5 animate-spin" />
			<span>Loading chart data...</span>
		</div>
	</div>
{:then chartData}
	<!-- Charts rendered from API data -->
	<div class="bg-pattern-container relative w-full md:py-12">
		<div class="relative z-10 flex flex-col gap-6 mx-auto max-w-7xl px-3">
			<ChartFilters />

			<ChartSection
				chart={chartData.latencyChart}
				layout="side-by-side"
				useTimelineRange={true}
			/>
		</div>
	</div>

	<!-- Pareto Chart Section -->
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
				<div class="flex flex-wrap items-center justify-between gap-4  px-4 py-3 rounded-t-xl border border-b-0 border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800/80">
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

					<!-- Hardware Selection Pills -->
					<div class="flex items-center gap-3">
						<span class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Hardware</span>
						<div class="flex flex-wrap gap-1.5">
							{#each paretoSeries as series (series.id)}
								<button
									type="button"
									onclick={() => toggleParetoSeries(series.id)}
									class="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full transition-all cursor-pointer border {isParetoSeriesVisible(series.id)
										? 'border-transparent text-white shadow-sm'
										: 'border-slate-300 bg-white text-slate-500 hover:border-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400'}"
									style={isParetoSeriesVisible(series.id) ? `background-color: ${series.color}` : ''}
								>
									<span
										class="w-2 h-2 rounded-full {isParetoSeriesVisible(series.id) ? 'bg-white/80' : ''}"
										style={!isParetoSeriesVisible(series.id) ? `background-color: ${series.color}` : ''}
									></span>
									{series.vendor}
								</button>
							{/each}
						</div>
					</div>
				</div>

				<!-- Chart Container -->
				<div class="overflow-x-auto rounded-b-xl rounded-t-none border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800" bind:clientWidth={paretoContainerWidth}>
					{#if paretoContainerWidth > 0 && filteredParetoSeries.length > 0}
						<ParetoChart
							data={paretoChartData}
							width={paretoChartWidth}
							height={paretoChartHeight}
							xAxisLabel="Concurrent Clients"
							yAxisLabel={currentParetoViewConfig.yLabel}
							useLogScale={true}
							stepDirection={currentParetoViewConfig.stepDirection}
							annotations={paretoAnnotations}
							yDomain={paretoYDomain}
							links={paretoChartLinks}
						/>
					{:else if filteredParetoSeries.length === 0}
						<div class="flex items-center justify-center py-12 text-slate-500 dark:text-slate-400">
							<span>Select at least one hardware configuration to display the chart.</span>
						</div>
					{/if}
				</div>
			</section>
		</div>
	</div>

	<div class="w-full py-12 bg-linear-to-b from-slate-100 to-slate-500/20 dark:from-slate-100/10 dark:to-slate-500/10">
		<div class="mx-auto max-w-7xl px-3">
			<!-- Enhanced GPU Reliability Section with Local Toolbar -->
			<section class="mb-6">
				<h2 class="mb-1 text-2xl md:text-3xl font-semibold text-slate-800 dark:text-slate-200 font-instrument-sans">
					{chartData.gpuReliabilityChart.title}
				</h2>
				<p class="mb-4 text-sm text-slate-500 dark:text-slate-400">
					{chartData.gpuReliabilityChart.subtitle}
				</p>

				<div bind:clientWidth={barChartContainerWidth}>
					{#if barChartContainerWidth > 0}
						<BarChartEnhanced
							data={chartData.gpuReliabilityChart.data}
							width={barChartContainerWidth}
							xAxisLabel={chartData.gpuReliabilityChart.xLabel}
							yAxisLabel={chartData.gpuReliabilityChart.yLabel}
							sortOrder={barSortOrder}
							{showLineOverlay}
							{showThresholds}
						/>
					{/if}
				</div>

				<!-- Local Feature Toolbar -->
				<BarChartToolbar
					sortOrder={barSortOrder}
					{showLineOverlay}
					{showThresholds}
					onSortChange={(order) => barSortOrder = order}
					onLineOverlayChange={(show) => showLineOverlay = show}
					onThresholdsChange={(show) => showThresholds = show}
				/>
			</section>
		</div>
	</div>

	<div class="mx-auto max-w-7xl px-3 pt-12">
		<div class="flex flex-col lg:flex-row lg:items-start gap-8 lg:gap-6 mb-12 border-b-2 border-[#CCEBD4] dark:border-slate-700 pb-12">
			<div class="w-full lg:w-1/2 lg:pr-6">
				<h2 class="text-2xl sm:text-3xl md:text-5xl text-slate-800 dark:text-slate-200 instrument-serif-regular-italic mb-3">How to submit MLPerf results</h2>
				<p class="text-slate-500 dark:text-slate-400 leading-relaxed my-3">If you are interested in submitting MLPerf benchmark results, please join the appropriate working group. Registration deadlines are several weeks in advance of submission dates to ensure that all submitters are aware of benchmark requirements, and to ensure proper provision of all necessary resources. </p>

				<ul class="list-disc list-inside text-slate-500 dark:text-slate-400 leading-relaxed ml-4 indent-4 my-3">
					<li>Enable comparison while encouraging AI/ML innovation.</li>
					<li>Accelerate AI/ML progress through fair and useful measurement.</li>
					<li>Enforce reproducibility to ensure reliable results.</li>
					<li>Serve both the commercial and research communities.</li>
					<li>Keep benchmarking effort affordable so all can participate.</li>
					<li>Keep benchmarking effort affordable so all can participate.</li>
				</ul>

				<p class="text-slate-500 dark:text-slate-400 leading-relaxed my-3">Membership is required for most benchmark working groups (e.g., Training, Inference, Mobile). There are some public benchmark working groups that have no access requirements where non-members may submit to the benchmark by first signing a Non-member Test Agreement. </p>

				<p class="text-slate-500 dark:text-slate-400 leading-relaxed my-3">We encourage people to become MLCommons Members if they wish to contribute to MLCommons projects. However, if you are interested in contributing to one of our open source projects and do not think your organization would be a good fit as a Member, please enter your GitHub ID into our subscription form. </p>
			</div>
			<div class="relative w-full lg:w-1/2">
				<!-- Page corner fold effect (hidden on mobile) -->
				<div class="hidden sm:block absolute top-0 right-0 w-12 h-12 "></div>
				<div class="hidden sm:block absolute top-0 right-12 w-0 h-0 border-l-48 border-l-transparent border-b-[48px] border-b-slate-700"></div>
				<div class="hidden sm:block absolute top-12 right-0 w-0 h-0 border-t-[48px] border-t-transparent border-l-[48px] border-l-slate-600"></div>

				<!-- Main card -->
				<div class="bg-slate-800 text-white p-6 sm:p-10 sm:pr-16 clip-corner">
					<h2 class="text-xs sm:text-sm tracking-[0.1em] sm:tracking-[0.2em] font-medium mb-6 sm:mb-8 text-gray-300">SUBMISSION REQUIREMENTS:</h2>

					<ul class="space-y-4 sm:space-y-6">
						<li class="flex items-start gap-3 sm:gap-4 pb-4 sm:pb-6 border-b border-slate-600">
							<svg class="w-5 h-5 mt-0.5 flex-shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
							</svg>
							<span class="text-sm sm:text-base text-gray-200">Join an appropriate MLCommons Working Group</span>
						</li>

						<li class="flex items-start gap-3 sm:gap-4 pb-4 sm:pb-6 border-b border-slate-600">
							<svg class="w-5 h-5 mt-0.5 flex-shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
							</svg>
							<span class="text-sm sm:text-base text-gray-200">A signed Contributor License Agreement (CLA) to enable contributing code, logs, etc. to MLCommons GitHub repositories.</span>
						</li>

						<li class="flex items-start gap-3 sm:gap-4 pb-4 sm:pb-6 border-b border-slate-600">
							<svg class="w-5 h-5 mt-0.5 flex-shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
							</svg>
							<span class="text-sm sm:text-base text-gray-200">Membership in MLCommons OR a signed Non-member Test Agreement</span>
						</li>

						<li class="flex items-start gap-3 sm:gap-4 pb-4 sm:pb-6 border-b border-slate-600">
							<svg class="w-5 h-5 mt-0.5 flex-shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
							</svg>
							<span class="text-sm sm:text-base text-gray-200">A signed trademark license agreement (either the member OR non-member version, as appropriate)</span>
						</li>
					</ul>

					<div class="mt-6 sm:mt-8 text-xs sm:text-sm text-gray-400 space-y-3 sm:space-y-4">
						<p>MLPerf is a registered trademark of MLCommons. The use of the MLPerf results and trademark are described in our <a href="#" class="underline hover:text-gray-300">Policies</a>.</p>
						<p>Both member and non-member trademark agreements are available upon request by contacting <a href="mailto:support@mlcommons.org" class="underline hover:text-gray-300">support@mlcommons.org</a>.</p>
					</div>
				</div>
			</div>
		</div>

		<!-- Interactivity Chart with Settings Sidebar -->
		<div class="flex flex-col lg:flex-row gap-6">
			<div class="flex-1 min-w-0">
				<ChartSection
					chart={chartData.interactivityChart}
					useTimelineRange={true}
				/>
			</div>

			<!-- Quick Settings Sidebar (hidden on mobile) -->
			<div class="hidden lg:block w-56 shrink-0 sticky top-4">
				<ChartSettingsSidebar />
			</div>
		</div>

		<!-- GPU Inference Benchmark Table with Sparklines -->
		<SparklineTable
			title="GPU Inference Performance"
			rows={gpuInferenceBenchmarks}
			columns={gpuBenchmarkColumns}
			class="mt-12 pb-12"
		/>
	</div>
{:catch error}
	<ErrorBanner message={error?.message} />
{/await}

<style lang="postcss">
	@reference "@app-css";

	.bg-pattern-container::before {
		content: "";
		position: absolute;
		inset: 0;
		z-index: 1;
		background-image: url('/bg-pattern-squares.svg');
		background-size: auto;
		background-repeat: repeat;
		background-position: 0 0;
		opacity: 0.7;
		animation: slide-bg 20s linear infinite;
	}

	:global(.dark) .bg-pattern-container::before {
		opacity: 0.03;
	}

	@keyframes slide-bg {
		from {
			background-position: 0 0;
		}
		to {
			background-position: 80px 0;
		}
	}

	.clip-corner {
		clip-path: none;
	}

	@media (min-width: 640px) {
		.clip-corner {
			clip-path: polygon(0 0, calc(100% - 48px) 0, 100% 48px, 100% 100%, 0 100%);
		}
	}
</style>
