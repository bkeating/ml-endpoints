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
	import { getChartData } from '$lib/remotes/chartData.js';
	import { getFilters } from '$lib/stores/chartFilters.svelte.js';
	import TimelineRange from '$lib/components/TimelineRange.svelte';
	import BarChartEnhanced from '$lib/components/BarChartEnhanced.svelte';
	import BarChartToolbar from '$lib/components/BarChartToolbar.svelte';
	import SparklineTable from '$lib/components/SparklineTable.svelte';
	import { gpuInferenceBenchmarks, gpuBenchmarkColumns } from '$lib/data/placeholders.js';

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
</script>

<Hero />


	{#await chartDataQuery}
		<!-- Loading state -->
		<div class="flex items-center justify-center py-12 mx-auto max-w-7xl px-4">
			<div class="flex items-center gap-3 text-slate-500 dark:text-slate-400">
				<Icon name="Spinner" class="h-5 w-5 animate-spin" />
				<span>Loading chart data...</span>
			</div>
		</div>
	{:then chartData}
		<!-- Charts rendered from API data -->
    <div class="bg-pattern-container relative w-full py-12">
		<div class="relative z-10 flex flex-col gap-6 mx-auto max-w-7xl px-4">
      <ChartFilters />


			<ChartSection
				chart={chartData.latencyChart}
				layout="side-by-side"
				useTimelineRange={true}
			/>
		</div>
    </div>

    <div class="w-full py-12 bg-linear-to-b from-slate-100 to-slate-500/20 dark:from-slate-100/10 dark:to-slate-500/10">
        <div class="mx-auto max-w-7xl px-4">
            <!-- Enhanced GPU Reliability Section with Local Toolbar -->
            <section class="mb-6">

                <h2 class="mb-1 text-3xl font-semibold text-slate-800 dark:text-slate-200 font-instrument-sans">
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

      <div class="mx-auto max-w-7xl px-4 pt-12">

        <div class="mx-auto max-w-7xl px-4">
          <div class="flex items-start gap-6 mb-12 border-b-2 border-[#CCEBD4] dark:border-slate-700 pb-12">
            <div class="w-1/2 pr-6">
              <h2 class="md:text-5xl text-3xl text-slate-800 dark:text-slate-200 instrument-serif-regular-italic mb-3">How to submit MLPerf results</h2>
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
            <div class="relative w-1/2">
              <!-- Page corner fold effect -->
              <div class="absolute top-0 right-0 w-12 h-12 "></div>
              <div class="absolute top-0 right-12 w-0 h-0 border-l-48 border-l-transparent border-b-[48px] border-b-slate-700"></div>
              <div class="absolute top-12 right-0 w-0 h-0 border-t-[48px] border-t-transparent border-l-[48px] border-l-slate-600"></div>

              <!-- Main card -->
              <div class="bg-slate-800 text-white p-10 pr-16 clip-corner">
                <h2 class="text-sm tracking-[0.2em] font-medium mb-8 text-gray-300">SUBMISSION REQUIREMENTS:</h2>

                <ul class="space-y-6">
                  <li class="flex items-start gap-4 pb-6 border-b border-slate-600">
                    <svg class="w-5 h-5 mt-0.5 flex-shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <span class="text-gray-200">Join an appropriate MLCommons Working Group</span>
                  </li>

                  <li class="flex items-start gap-4 pb-6 border-b border-slate-600">
                    <svg class="w-5 h-5 mt-0.5 flex-shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <span class="text-gray-200">A signed Contributor License Agreement (CLA) to enable contributing code, logs, etc. to MLCommons GitHub repositories.</span>
                  </li>

                  <li class="flex items-start gap-4 pb-6 border-b border-slate-600">
                    <svg class="w-5 h-5 mt-0.5 flex-shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <span class="text-gray-200">Membership in MLCommons OR a signed Non-member Test Agreement</span>
                  </li>

                  <li class="flex items-start gap-4 pb-6 border-b border-slate-600">
                    <svg class="w-5 h-5 mt-0.5 flex-shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <span class="text-gray-200">A signed trademark license agreement (either the member OR non-member version, as appropriate)</span>
                  </li>
                </ul>

                <div class="mt-8 text-sm text-gray-400 space-y-4">
                  <p>MLPerf is a registered trademark of MLCommons. The use of the MLPerf results and trademark are described in our <a href="#" class="underline hover:text-gray-300">Policies</a>.</p>
                  <p>Both member and non-member trademark agreements are available upon request by contacting <a href="mailto:support@mlcommons.org" class="underline hover:text-gray-300">support@mlcommons.org</a>.</p>
                </div>
              </div>
            </div>
          </div>
        </div>


			<ChartSection
				chart={chartData.interactivityChart}
				useTimelineRange={true}
			/>

      <TimelineRange
				height={60}
				label="Interactivity Range (s)"
				minBound={0}
				maxBound={350}
			/>

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
		opacity: 0.1;
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
      clip-path: polygon(0 0, calc(100% - 48px) 0, 100% 48px, 100% 100%, 0 100%);
    }
</style>
