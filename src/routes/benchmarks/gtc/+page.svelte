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
	import { isSystemVisible } from '$lib/stores/chartSettings.svelte.js';

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

	// Chart configurations from meta
	const chartConfigs = endpointsData.meta.charts;

	// ============================================================================
	// CHART DATA STRUCTURES
	// ============================================================================

	/**
	 * Chart 1: Concurrency vs TTFT (End-to-end Latency)
	 * X = concurrency, Y = ttft (P99 in seconds)
	 */
	let concurrencyVsTtftChart = $derived({
		title: 'End-to-End Latency',
		subtitle: 'How quickly users receive their first response as concurrent load increases. Lower curves indicate better responsiveness under load.',
		xLabel: chartConfigs.pareto_concurrency_ttft.x_axis.label,
		yLabel: chartConfigs.pareto_concurrency_ttft.y_axis.label,
		xScale: chartConfigs.pareto_concurrency_ttft.x_axis.scale,
		yScale: chartConfigs.pareto_concurrency_ttft.y_axis.scale,
		models: paretoCurves
			.filter((curve) => isSystemVisible(curve.systemId))
			.map((curve) => ({
				id: curve.id,
				name: curve.name,
				color: curve.color,
				points: curve.runs.map((run) => ({
					x: run.concurrency,
					y: run.ttft,
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
	 * Chart 2: Time Per Output Token (TPOT)
	 * X = tps_per_user (interactivity), Y = system_tps
	 */
	let throughputVsInteractivityChart = $derived({
		title: 'Time Per Output Token (TPOT)',
		subtitle: 'Trade-off between system capacity and per-user token delivery speed. Upper-right positioning indicates superior throughput-interactivity balance.',
		xLabel: chartConfigs.pareto_throughput_interactivity.x_axis.label,
		yLabel: chartConfigs.pareto_throughput_interactivity.y_axis.label,
		xScale: chartConfigs.pareto_throughput_interactivity.x_axis.scale,
		yScale: chartConfigs.pareto_throughput_interactivity.y_axis.scale,
		models: paretoCurves
			.filter((curve) => isSystemVisible(curve.systemId))
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
	 * Chart 3: System Throughput Scaling
	 * X = concurrency, Y = system_tps
	 */
	let concurrencyVsThroughputChart = $derived({
		title: 'Throughput Scaling',
		subtitle: 'How system throughput scales with concurrent users. Flatter elevated curves demonstrate better scaling under load.',
		xLabel: chartConfigs.pareto_concurrency_throughput.x_axis.label,
		yLabel: chartConfigs.pareto_concurrency_throughput.y_axis.label,
		xScale: chartConfigs.pareto_concurrency_throughput.x_axis.scale,
		yScale: chartConfigs.pareto_concurrency_throughput.y_axis.scale,
		models: paretoCurves
			.filter((curve) => isSystemVisible(curve.systemId))
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
	 * Chart 4: Time to First Token (TTFT)
	 * X = ttft, Y = system_tps
	 */
	let throughputVsTtftChart = $derived({
		title: 'Time to First Token (TTFT)',
		subtitle: 'Balancing throughput against initial response time. The Pareto frontier highlights optimal configurations.',
		xLabel: chartConfigs.pareto_throughput_ttft.x_axis.label,
		yLabel: chartConfigs.pareto_throughput_ttft.y_axis.label,
		xScale: chartConfigs.pareto_throughput_ttft.x_axis.scale,
		yScale: chartConfigs.pareto_throughput_ttft.y_axis.scale,
		models: paretoCurves
			.filter((curve) => isSystemVisible(curve.systemId))
			.map((curve) => ({
				id: curve.id,
				name: curve.name,
				color: curve.color,
				points: curve.runs.map((run) => ({
					x: run.ttft,
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
</script>

<!-- Side-by-side layout with filters sidebar and charts -->
<div class="mx-auto max-w-7xl pb-3 md:pt-9 px-3">
	<div class="flex flex-col gap-6 lg:flex-row">
		<!-- Charts area -->
		<div class="min-w-0 flex-1">
			<!-- Small page hero -->
			<header class="mb-12 md:mb-12" aria-label="Page introduction">
				<h1
				class="instrument-serif-regular-italic mt-8 text-4xl md:text-5xl font-bold text-balance text-slate-700 dark:text-white md:mt-0"
			>
      MLCommons <br />
				<span class="mr-1 mb-2 inline-block h-7 w-7 rounded-full bg-[#CCEBD4]"></span>
				Benchmarks
			</h1>
				<p
					class="font-instrument-sans mt-2 max-w-lg leading-relaxed text-slate-600 dark:text-slate-400 text-md text-pretty md:text-balance"
				>
        MLPerf Endpoints turns complex AI benchmark data into clear, interactive visualizations that reveal performance trade-offs at a glance. Compare systems, understand what you're acquiring, and make confident infrastructure decisions.
      </p>
			</header>

			<!-- Main content area - 2x2 grid layout -->
			<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
				<!-- Chart 1: Concurrency vs TTFT -->
				<GtcChartSection chart={concurrencyVsTtftChart} lineType="step" />

				<!-- Chart 2: System Throughput vs Interactivity -->
				<GtcChartSection chart={throughputVsInteractivityChart} lineType="line" />

				<!-- Chart 3: Concurrency vs System Throughput -->
				<GtcChartSection chart={concurrencyVsThroughputChart} lineType="step" />

				<!-- Chart 4: System Throughput vs TTFT -->
				<GtcChartSection chart={throughputVsTtftChart} lineType="line" />
			</div>
		</div>

		<!-- Chart Filters Sidebar (hidden on mobile) -->
		<GtcChartFiltersSidebar />
	</div>
</div>
