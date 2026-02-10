<script>
	/**
	 * GTC Page - LLM Inference Benchmark dashboard with sidebar layout.
	 * Synchronous data loading, reactive filtering, component composition.
	 */
	import GtcChartSection from './_components/GtcChartSection.svelte';
	import GtcChartFiltersSidebar from './_components/GtcChartFiltersSidebar.svelte';
	import ConcurrencyHighlightCharts from './_components/ConcurrencyHighlightCharts.svelte';
	import RecentSubmissionsCarousel from './_components/RecentSubmissionsCarousel.svelte';
	import {
		isSystemVisible,
		getSelectedBenchmarkModelId,
		isSystemDisabledByAccelerator
	} from '$lib/stores/chartSettings.svelte.js';
	import { buildParetoCurves, getRecentSubmissions } from '$lib/utils/endpointsDataUtils.js';
	import { buildChartConfig } from '$lib/utils/chartConfigUtils.js';
	import { endpointsData } from '$lib/data/index.js';

	const paretoCurves = buildParetoCurves(endpointsData);
	const recentSubmissions = getRecentSubmissions(endpointsData);

	let filteredParetoCurves = $derived.by(() => {
		const selectedModelId = getSelectedBenchmarkModelId();
		if (selectedModelId === 'all') return paretoCurves;
		return paretoCurves.filter((curve) => curve.model?.model_id === selectedModelId);
	});

	function isSystemDisplayed(curve) {
		return (
			isSystemVisible(curve.systemId) &&
			!isSystemDisabledByAccelerator(curve.system?.accelerator_model_name)
		);
	}

	let displayedCurves = $derived(
		filteredParetoCurves.filter((curve) => isSystemDisplayed(curve))
	);

	let throughputVsInteractivityChart = $derived(
		buildChartConfig(displayedCurves, {
			title: 'System Throughput vs Interactivity',
			subtitle: 'Trade-off between total system capacity and per-user token delivery speed.',
			subline: 'Each dot is a single submission.',
			xLabel: 'Tokens/s/user',
			yLabel: 'Tokens/s',
			xKey: 'tps_per_user',
			yKey: 'system_tps'
		})
	);

	let throughputVsConcurrencyChart = $derived(
		buildChartConfig(displayedCurves, {
			title: 'Throughput vs Concurrency',
			subtitle: 'How total system throughput scales with increasing concurrent clients.',
			xLabel: 'Concurrent Clients',
			yLabel: 'Total System Throughput (Tok/s)',
			xKey: 'concurrency',
			yKey: 'system_tps'
		})
	);

	let capacityUtilizationChart = $derived(
		buildChartConfig(displayedCurves, {
			title: 'Capacity Utilization',
			subtitle: 'Concurrent user capacity at different system utilization levels.',
			xLabel: 'Concurrent Users',
			yLabel: 'Utilization of Max Sys Throughput',
			xKey: 'concurrency',
			yKey: 'utilization'
		})
	);

	let perUserPerformanceChart = $derived(
		buildChartConfig(displayedCurves, {
			title: 'Per-User Performance',
			subtitle: 'How per-user token delivery speed changes with concurrent load.',
			xLabel: 'Concurrent Clients',
			yLabel: 'Interactivity (Tokens/s/user)',
			xScale: 'log',
			yScale: 'log',
			xKey: 'concurrency',
			yKey: 'tps_per_user'
		})
	);
</script>

<div class="mx-auto max-w-7xl px-3 pb-3 md:pt-9 bg-white dark:bg-slate-900 transition-colors duration-200">
	<div class="relative flex flex-col gap-6 lg:flex-row">
		<GtcChartFiltersSidebar />

		<div class="min-w-0 flex-1">
			<header class="mb-9 ml-12 flex flex-col md:mb-12" aria-label="Page introduction">
				<h1
					class="instrument-serif-regular-italic mt-8 text-4xl font-bold text-balance text-slate-700 md:mt-0 md:text-5xl dark:text-white"
				>
					MLPerf <br />
					<span class="mr-1 mb-2 inline-block h-7 w-7 rounded-full bg-[#CCEBD4]"></span>
					Endpoints
				</h1>
				<p
					class="font-instrument-sans text-md mt-6 border-l-4 border-l-[#ccead463] pl-3 leading-relaxed text-pretty text-slate-600 md:pl-6 md:text-balance dark:text-slate-400"
				>
					MLPerf Endpoints turns complex AI benchmark data into clear, interactive visualizations
					that reveal performance trade-offs at a glance. Compare systems, understand what you're
					acquiring, and make confident infrastructure decisions.
				</p>
			</header>

			<GtcChartSection chart={throughputVsInteractivityChart} lineType="step" />

			<div class="mt-6 flex flex-col gap-6">
				<div class="grid gap-6 md:grid-cols-2">
					<GtcChartSection chart={throughputVsConcurrencyChart} lineType="step" />
					<GtcChartSection chart={capacityUtilizationChart} lineType="step" />
				</div>
				<GtcChartSection chart={perUserPerformanceChart} lineType="step" />
			</div>
		</div>
	</div>

	<ConcurrencyHighlightCharts curves={displayedCurves} />

	<RecentSubmissionsCarousel submissions={recentSubmissions} />
</div>
