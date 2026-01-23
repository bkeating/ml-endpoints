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
	import ChartSettingsSidebar from '$lib/components/ChartSettingsSidebar.svelte';
	import ErrorBanner from '$lib/components/ErrorBanner.svelte';
	import SparklineTable from '$lib/components/SparklineTable.svelte';
	import { getChartData } from '$lib/remotes/chartData.js';
	import { getFilters } from '$lib/stores/chartFilters.svelte.js';
	import { gpuInferenceBenchmarks, gpuBenchmarkColumns } from '$lib/data/placeholders.js';

	// Route-local components
	import ChartLoadingState from './_components/ChartLoadingState.svelte';
	import ParetoChartSection from './_components/ParetoChartSection.svelte';
	import GpuReliabilitySection from './_components/GpuReliabilitySection.svelte';
	import SubmissionRequirements from './_components/SubmissionRequirements.svelte';

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

{#await chartDataQuery}
	<ChartLoadingState />
{:then chartData}
	<!-- Charts rendered from API data -->
	<ChartFilters />

	<div class="bg-pattern-container relative w-full md:py-6">
		<div class="relative z-10 mx-auto flex max-w-7xl flex-col gap-6 px-3">
			<ChartSection chart={chartData.latencyChart} layout="side-by-side" useTimelineRange={true} />
		</div>
	</div>

	<div class="bg-slate-950">
		<ParetoChartSection />
	</div>

	<GpuReliabilitySection chart={chartData.gpuReliabilityChart} />

	<div class="mx-auto max-w-7xl px-3 pt-12">
		<SubmissionRequirements />

		<!-- Interactivity Chart with Settings Sidebar -->
		<div class="flex flex-col gap-6 lg:flex-row">
			<div class="min-w-0 flex-1">
				<ChartSection chart={chartData.interactivityChart} useTimelineRange={true} />
			</div>

			<!-- Quick Settings Sidebar (hidden on mobile) -->
			<div class="sticky top-4 hidden w-56 shrink-0 lg:block">
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
