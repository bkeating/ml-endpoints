<script>
	import GtcChartSection from '../_components/GtcChartSection.svelte';
	import GtcChartFiltersTopNav from '../_components/GtcChartFiltersTopNav.svelte';
	import ConcurrencyHighlightCharts from '../_components/ConcurrencyHighlightCharts.svelte';
	import SubmissionMiniChart from '../_components/SubmissionMiniChart.svelte';
	import {
		isSystemVisible,
		getSelectedBenchmarkModelId,
		isSystemDisabledByAccelerator
	} from '$lib/stores/chartSettings.svelte.js';
	import { resolve } from '$app/paths';
	import { getTheme } from '$lib/stores/theme.svelte.js';
	import endpointsData from '../endpoints-benchmark-data.json';

	function buildParetoCurves(data) {
		return data.submissions.map((submission) => {
			const system = data.systems.find((s) => s.id === submission.system_id);
			const model = data.models.find((m) => m.model_id === submission.model_id);
			const runs = data.runs
				.filter((r) => r.submission_id === submission.submission_id)
				.sort((a, b) => a.concurrency - b.concurrency);

			return {
				id: submission.submission_id,
				systemId: submission.system_id,
				name: system?.system_name ?? submission.submission_id,
				color: system?.color ?? '#535869',
				system,
				model,
				runs
			};
		});
	}

	const paretoCurves = buildParetoCurves(endpointsData);

	function getRecentSubmissions(data, limit = 10) {
		return [...data.submissions]
			.sort((a, b) => new Date(b.submission_date) - new Date(a.submission_date))
			.slice(0, limit);
	}

	function getModelLogoUrl(submission) {
		const model = endpointsData.models.find((m) => m.model_id === submission.model_id);
		return model?.logo_url ?? null;
	}

	function getHardwareLogoUrl(submission) {
		const orgName = submission.submitter_org_names?.toLowerCase() ?? '';
		const isDarkTheme = getTheme() === 'dark';
		if (orgName.includes('nvidia')) return isDarkTheme ? '/logo-nvidia-dark.svg' : '/logo-nvidia.svg';
		if (orgName.includes('amd')) return isDarkTheme ? '/logo-amd-dark.svg' : '/logo-amd.svg';
		if (orgName.includes('intel')) return null;
		return null;
	}

	const recentSubmissions = getRecentSubmissions(endpointsData);

	function getRunsForSubmission(submissionId) {
		return endpointsData.runs
			.filter((r) => r.submission_id === submissionId)
			.sort((a, b) => a.concurrency - b.concurrency);
	}

	let chartColors = $derived({
		ttft: getTheme() === 'dark' ? '#B3CEBA' : '#62826C',
		throughput: getTheme() === 'dark' ? '#A0B5DD' : '#37548A',
		sysTps: getTheme() === 'dark' ? '#BED3FB' : '#535869'
	});

	let filteredParetoCurves = $derived.by(() => {
		const selectedModelId = getSelectedBenchmarkModelId();
		if (selectedModelId === 'all') return paretoCurves;
		return paretoCurves.filter((curve) => curve.model?.model_id === selectedModelId);
	});

	function isSystemDisplayed(curve) {
		return isSystemVisible(curve.systemId) && !isSystemDisabledByAccelerator(curve.system?.accelerator_model_name);
	}

	let throughputVsInteractivityChart = $derived({
		title: 'System Throughput vs Interactivity',
		subtitle: 'Trade-off between total system capacity and per-user token delivery speed.',
		subline: 'Each dot is a single submission.',
		xLabel: 'Tokens/s/user',
		yLabel: 'Tokens/s',
		xScale: 'log',
		yScale: 'linear',
		models: filteredParetoCurves
			.filter((curve) => isSystemDisplayed(curve))
			.map((curve) => ({
				id: curve.id,
				name: curve.name,
				color: curve.color,
				points: curve.runs.map((run) => ({
					x: run.tps_per_user,
					y: run.system_tps,
					meta: { systemId: curve.systemId, runId: run.run_id, system: curve.system, model: curve.model, ...run }
				}))
			}))
	});

	let throughputVsConcurrencyChart = $derived({
		title: 'Throughput vs Concurrency',
		subtitle: 'How total system throughput scales with increasing concurrent clients.',
		xLabel: 'Concurrent Clients',
		yLabel: 'Total System Throughput (Tok/s)',
		xScale: 'log',
		yScale: 'linear',
		models: filteredParetoCurves
			.filter((curve) => isSystemDisplayed(curve))
			.map((curve) => ({
				id: curve.id,
				name: curve.name,
				color: curve.color,
				points: curve.runs.map((run) => ({
					x: run.concurrency,
					y: run.system_tps,
					meta: { systemId: curve.systemId, runId: run.run_id, system: curve.system, model: curve.model, ...run }
				}))
			}))
	});

	let capacityUtilizationChart = $derived({
		title: 'Capacity Utilization',
		subtitle: 'Concurrent user capacity at different system utilization levels.',
		xLabel: 'Concurrent Users',
		yLabel: 'Utilization of Max Sys Throughput',
		xScale: 'log',
		yScale: 'linear',
		models: filteredParetoCurves
			.filter((curve) => isSystemDisplayed(curve))
			.map((curve) => ({
				id: curve.id,
				name: curve.name,
				color: curve.color,
				points: curve.runs.map((run) => ({
					x: run.concurrency,
					y: run.utilization,
					meta: { systemId: curve.systemId, runId: run.run_id, system: curve.system, model: curve.model, ...run }
				}))
			}))
	});

	let perUserPerformanceChart = $derived({
		title: 'Per-User Performance',
		subtitle: 'How per-user token delivery speed changes with concurrent load.',
		xLabel: 'Concurrent Clients',
		yLabel: 'Interactivity (Tokens/s/user)',
		xScale: 'log',
		yScale: 'log',
		models: filteredParetoCurves
			.filter((curve) => isSystemDisplayed(curve))
			.map((curve) => ({
				id: curve.id,
				name: curve.name,
				color: curve.color,
				points: curve.runs.map((run) => ({
					x: run.concurrency,
					y: run.tps_per_user,
					meta: { systemId: curve.systemId, runId: run.run_id, system: curve.system, model: curve.model, ...run }
				}))
			}))
	});

	let showTtft = $state(true);
	let showThroughput = $state(true);

	const CARDS_PER_PAGE = 4;
	let carouselPage = $state(0);
	let totalPages = $derived(Math.ceil(recentSubmissions.length / CARDS_PER_PAGE));
	let carouselTranslateX = $derived(-(carouselPage * 100));
	function prevPage() {
		if (carouselPage > 0) carouselPage--;
	}
	function nextPage() {
		if (carouselPage < totalPages - 1) carouselPage++;
	}
	let isPrevDisabled = $derived(carouselPage === 0);
	let isNextDisabled = $derived(carouselPage >= totalPages - 1);
</script>

<div class="mx-auto max-w-7xl px-3 pb-3 md:pt-9 bg-white dark:bg-slate-900 transition-colors duration-200">
	<div class="min-w-0">
		<header class="mb-12 ml-12 flex flex-col md:mb-12" aria-label="Page introduction">
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
				MLPerf Endpoints turns complex AI benchmark data into clear, interactive visualizations that reveal
				performance trade-offs at a glance. Compare systems, understand what you're acquiring, and make
				confident infrastructure decisions.
			</p>
		</header>

		<div class="sticky top-[80px] z-50 mt-6 mb-12 transition-all duration-300 ease-out">
			<GtcChartFiltersTopNav />
		</div>

		<GtcChartSection chart={throughputVsInteractivityChart} lineType="step" />

		<div class="mt-6 flex flex-col gap-6">
			<div class="grid gap-6 md:grid-cols-2">
				<GtcChartSection chart={throughputVsConcurrencyChart} lineType="step" />
				<GtcChartSection chart={capacityUtilizationChart} lineType="step" />
			</div>
			<GtcChartSection chart={perUserPerformanceChart} lineType="step" />
		</div>
	</div>

	<ConcurrencyHighlightCharts curves={filteredParetoCurves.filter((curve) => isSystemDisplayed(curve))} />

	<section class="mt-12 pt-8" aria-label="Most recent submissions">
		<div class="flex flex-col gap-6">
			<div class="flex items-center justify-between">
				<h2 class="text-2xl font-semibold text-slate-700 dark:text-white">Most Recent Submissions</h2>
				<div class="flex items-center gap-4" role="group" aria-label="Chart legend">
					<button
						type="button"
						class="flex items-center gap-2 transition-opacity {showTtft ? 'opacity-100' : 'opacity-40'}"
						onclick={() => showTtft = !showTtft}
						aria-pressed={showTtft}
						aria-label="Toggle TTFT data"
					>
						<div class="h-3 w-3 rounded-full" style="background-color: {chartColors.ttft}"></div>
						<span class="text-sm font-medium text-slate-700 dark:text-slate-300">TTFT</span>
					</button>
					<button
						type="button"
						class="flex items-center gap-2 transition-opacity {showThroughput ? 'opacity-100' : 'opacity-40'}"
						onclick={() => showThroughput = !showThroughput}
						aria-pressed={showThroughput}
						aria-label="Toggle Throughput vs Interactivity data"
					>
						<div class="h-3 w-3 rounded-full" style="background-color: {chartColors.throughput}"></div>
						<span class="text-sm font-medium text-slate-700 dark:text-slate-300">Thru vs Int</span>
					</button>
					<div class="ml-2 flex items-center gap-1">
						<button
							type="button"
							class="flex h-7 w-7 items-center justify-center rounded-md border cursor-pointer {isPrevDisabled ? 'border-slate-200 bg-slate-50 text-slate-300 cursor-not-allowed dark:border-slate-700 dark:bg-slate-800 dark:text-slate-600' : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'}"
							onclick={prevPage}
							disabled={isPrevDisabled}
							aria-label="Previous submissions"
						>
							<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
								<path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
							</svg>
						</button>
						<button
							type="button"
							class="flex h-7 w-7 items-center justify-center rounded-md border cursor-pointer {isNextDisabled ? 'border-slate-200 bg-slate-50 text-slate-300 cursor-not-allowed dark:border-slate-700 dark:bg-slate-800 dark:text-slate-600' : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'}"
							onclick={nextPage}
							disabled={isNextDisabled}
							aria-label="Next submissions"
						>
							<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
								<path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
							</svg>
						</button>
					</div>
				</div>
			</div>

			<div class="relative overflow-hidden">
				<div class="flex transition-transform duration-300 ease-out" style="transform: translateX({carouselTranslateX}%)">
					{#each { length: totalPages }, pageIndex (pageIndex)}
						<div class="grid w-full shrink-0 grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
							{#each recentSubmissions.slice(pageIndex * CARDS_PER_PAGE, (pageIndex + 1) * CARDS_PER_PAGE) as submission (submission.submission_id)}
								{@const runs = getRunsForSubmission(submission.submission_id)}
								{@const modelLogoUrl = getModelLogoUrl(submission)}
								{@const hardwareLogoUrl = getHardwareLogoUrl(submission)}
								<a
									href={resolve(`/report?submission=${submission.submission_id}`)}
									class="group relative flex flex-col overflow-hidden rounded-lg border border-slate-200 transition-shadow hover:shadow-lg dark:border-slate-700"
								>
									<SubmissionMiniChart
										{runs}
										submissionId={submission.submission_id}
										{showTtft}
										{showThroughput}
										{chartColors}
									/>
									<div class="relative z-10 border-t border-slate-200/50 bg-white/95 px-3 py-3 backdrop-blur-sm dark:border-slate-700/50 dark:bg-slate-800/95">
										<div class="flex items-center justify-between">
											<span class="dm-mono-medium rounded border border-[#9ebba5] bg-[#CCEBD460] px-2 text-sm font-medium text-[#343b36] shadow-xs dark:border-[#736628] dark:bg-[#736628]/20 dark:text-[#c9b856]">
												{submission.model_name}
											</span>
											<div class="flex items-center gap-2 opacity-75">
												{#if hardwareLogoUrl}
													<img src={hardwareLogoUrl} alt="Hardware Logo" class="max-h-5 max-w-14 grayscale dark:invert" />
												{/if}
												{#if modelLogoUrl}
													<img src={modelLogoUrl} alt="Model Logo" class="max-h-5 max-w-16 grayscale dark:invert" />
												{/if}
											</div>
										</div>
									</div>
								</a>
							{/each}
						</div>
					{/each}
				</div>
			</div>
		</div>
	</section>
</div>
