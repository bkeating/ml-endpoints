<script>
	/**
	 * Main page for the LLM Inference Benchmark dashboard.
	 *
	 * This page demonstrates:
	 * - Reactive data fetching with $derived() that auto-refetches when filters change
	 * - Async/await pattern with {#await} blocks for loading states
	 * - Component composition for maintainable, skinny page files
	 */
	import Hero from '$lib/components/Hero.svelte';
	import ChartFilters from '$lib/components/ChartFilters.svelte';
	import ChartSection from '$lib/components/ChartSection.svelte';
	import ErrorBanner from '$lib/components/ErrorBanner.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import { getChartData } from '$lib/remotes/chartData.js';
	import { getFilters } from '$lib/stores/chartFilters.svelte.js';

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
</script>

<Hero />

<div class="mx-auto max-w-7xl px-4 pt-3 text-slate-900 transition-colors duration-200 dark:text-slate-100">
	<ChartFilters />
</div>

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
			<ChartSection
				chart={chartData.latencyChart}
				layout="side-by-side"
				useTimelineRange={true}
			/>
		</div>
    </div>

        <div class="mx-auto max-w-7xl px-4">
        <ChartSection
            chart={chartData.gpuReliabilityChart}
            chartType="bar"
          />
        </div>

      <div class="mx-auto max-w-7xl px-4">
			<ChartSection
				chart={chartData.interactivityChart}
				xDomain={[0, 350]}
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
		background-size: cover;
		background-position: top left;
		opacity: 0.5;
	}
</style>
