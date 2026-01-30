<script>
	/**
	 * GTC Page - LLM Inference Benchmark dashboard with sidebar layout.
	 *
	 * This page demonstrates:
	 * - Two-column layout with sticky sidebar for chart filters
	 * - Synchronous data loading from normalized JSON structure
	 * - Reactive filtering with $derived() for visibility toggles
	 * - Component composition for maintainable, skinny page files
	 */
	import GtcChartSection from './_components/GtcChartSection.svelte';
	import GtcChartFiltersSidebar from './_components/GtcChartFiltersSidebar.svelte';
	import {
		isSystemVisible,
		getSelectedBenchmarkModelId,
		isSystemDisabledByAccelerator
	} from '$lib/stores/chartSettings.svelte.js';

	// Import normalized benchmark data from local JSON
	import endpointsData from './endpoints-benchmark-data.json';

	// ============================================================================
	// DATA TRANSFORMATION
	// ============================================================================

	/**
	 * Build Pareto curves from normalized endpoints data.
	 * Joins submissions with their systems, models, and runs.
	 * @param {typeof endpointsData} data - The endpoints benchmark data
	 * @returns {Array<{id: string, name: string, color: string, system: Object, model: Object, runs: Array}>}
	 */
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
				color: system?.color ?? '#64748b',
				system,
				model,
				runs
			};
		});
	}

	// Build all Pareto curves from the data
	const paretoCurves = buildParetoCurves(endpointsData);

	/**
	 * Filter pareto curves by selected benchmark model.
	 * When a specific model is selected, only submissions for that model are shown.
	 * This prevents duplicate curves when a system has multiple submissions (one per model).
	 */
	let filteredParetoCurves = $derived.by(() => {
		const selectedModelId = getSelectedBenchmarkModelId();
		if (selectedModelId === 'all') {
			return paretoCurves;
		}
		return paretoCurves.filter((curve) => curve.model?.model_id === selectedModelId);
	});

	// ============================================================================
	// CHART DATA STRUCTURES
	// ============================================================================

	/**
	 * Check if a system should be displayed on charts.
	 * Must be visible AND not disabled by accelerator filter.
	 * @param {Object} curve - The pareto curve object
	 * @returns {boolean}
	 */
	function isSystemDisplayed(curve) {
		return isSystemVisible(curve.systemId) &&
			!isSystemDisabledByAccelerator(curve.system?.accelerator_model_name);
	}

	/**
	 * Chart 1: System Throughput vs Interactivity
	 * X = tps_per_user (Tokens/s/user), Y = system_tps (Tokens/s)
	 */
	let throughputVsInteractivityChart = $derived({
		title: 'System Throughput vs Interactivity',
		subtitle: 'Trade-off between total system capacity and per-user token delivery speed.',
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
					meta: {
						systemId: curve.systemId,
						runId: run.run_id,
						system: curve.system,
						model: curve.model,
						...run
					}
				}))
			}))
	});

	/**
	 * Chart 2: Throughput vs Concurrency
	 * X = concurrency (Concurrent Clients), Y = system_tps (Total System Throughput)
	 */
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
					meta: {
						systemId: curve.systemId,
						runId: run.run_id,
						system: curve.system,
						model: curve.model,
						...run
					}
				}))
			}))
	});

	/**
	 * Chart 3: Capacity Utilization
	 * X = concurrency (Concurrent Users), Y = utilization (Utilization of Max Sys Throughput)
	 */
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
					meta: {
						systemId: curve.systemId,
						runId: run.run_id,
						system: curve.system,
						model: curve.model,
						...run
					}
				}))
			}))
	});

	/**
	 * Chart 4: Per-User Performance
	 * X = concurrency (Concurrent Clients), Y = tps_per_user (Interactivity Tokens/s/user)
	 */
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
					meta: {
						systemId: curve.systemId,
						runId: run.run_id,
						system: curve.system,
						model: curve.model,
						...run
					}
				}))
			}))
	});
</script>

<!-- Side-by-side layout with filters sidebar and charts -->
<div class="mx-auto max-w-7xl px-3 pb-3 md:pt-9">
	<div class="flex flex-col gap-6 lg:flex-row">
		<!-- Charts area -->
		<div class="min-w-0 flex-1">
			<!-- Small page hero -->
			<header class="mb-12 flex flex-col md:mb-12 md:flex-row" aria-label="Page introduction">
				<h1
					class="instrument-serif-regular-italic mt-8 text-4xl font-bold text-balance text-slate-700 md:mt-0 md:text-5xl dark:text-white"
				>
					MLCommons <br />
					<span class="mr-1 mb-2 inline-block h-7 w-7 rounded-full bg-[#CCEBD4]"></span>
					Benchmarks
				</h1>
				<p
					class="font-instrument-sans text-md mt-2 ml-3 max-w-lg border-l-4 border-l-[#ccead463] pl-3 leading-relaxed text-pretty text-slate-600 md:ml-6 md:pl-6 md:text-balance dark:text-slate-400"
				>
					MLPerf Endpoints turns complex AI benchmark data into clear, interactive visualizations
					that reveal performance trade-offs at a glance. Compare systems, understand what you're
					acquiring, and make confident infrastructure decisions.
				</p>
			</header>

			<!-- Main content area - 2x2 grid layout -->
			<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
				<!-- Chart 1: System Throughput vs Interactivity -->
				<GtcChartSection chart={throughputVsInteractivityChart} lineType="line" />

				<!-- Chart 2: Throughput vs Concurrency -->
				<GtcChartSection chart={throughputVsConcurrencyChart} lineType="step" />
				<!-- Chart 4: Per-User Performance -->
				<GtcChartSection chart={perUserPerformanceChart} lineType="step" />

				<!-- Chart 3: Capacity Utilization -->
				<GtcChartSection chart={capacityUtilizationChart} lineType="step" />
			</div>
		</div>

		<!-- Chart Filters Sidebar (hidden on mobile) -->
		<GtcChartFiltersSidebar />
	</div>
</div>
