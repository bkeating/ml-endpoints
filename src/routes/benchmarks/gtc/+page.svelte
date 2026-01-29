<script>
	/**
	 * GTC Page - LLM Inference Benchmark dashboard with sidebar layout.
	 *
	 * This page demonstrates:
	 * - Two-column layout with sticky sidebar for chart filters
	 * - Synchronous data loading from local JSON
	 * - Reactive filtering with $derived() for visibility toggles
	 * - Component composition for maintainable, skinny page files
	 */
	import GtcChartSection from './_components/GtcChartSection.svelte';
	import GtcChartFiltersSidebar from './_components/GtcChartFiltersSidebar.svelte';
	import { isModelVisible } from '$lib/stores/chartSettings.svelte.js';
	import { gpuColors } from '$lib/data/placeholders.js';

	// Import benchmark data from local JSON
	import gtcData from './data.json';

	// ============================================================================
	// DATA TRANSFORMATION
	// ============================================================================

	/**
	 * Transform JSON benchmark data into chart-ready format.
	 * Each model gets its points array mapped from measurements.
	 */
	const baseModels = gtcData.benchmarks.map((benchmark) => {
		const system = gtcData.systems[benchmark.system_id];
		return {
			id: benchmark.system_id,
			name: system?.system_name ?? benchmark.system_id,
			color: gpuColors[benchmark.system_id] ?? '#64748b',
			measurements: benchmark.measurements
		};
	});

	// ============================================================================
	// CHART DATA STRUCTURES
	// ============================================================================

	/**
	 * Chart 1: TTFT vs #Users (End-to-end Latency)
	 * X = concurrent_users, Y = ttft_ms_p9x (converted to seconds)
	 */
	let ttftVsUsersChart = $derived({
		title: 'End-to-end Latency',
		subtitle:
			'How quickly users receive their first response as concurrent load increases. Lower curves indicate systems that maintain fast initial responses even under heavy load.',
		xLabel: '#Users',
		yLabel: 'Time to First Token (ms)',
		models: baseModels
			.map((m) => ({
				id: m.id,
				name: m.name,
				color: m.color,
				points: m.measurements.map((p) => ({
					x: p.concurrent_users,
					y: p.ttft_ms_p9x
				}))
			}))
			.filter((m) => isModelVisible(m.id))
	});

	/**
	 * Chart 2: System Throughput vs Interactivity (TPOT-related)
	 * X = interactivity_tokens_sec_user, Y = system_throughput_tokens_sec
	 */
	let throughputVsInteractivityChart = $derived({
		title: 'Time Per Output Token (TPOT)',
		subtitle:
			'The trade-off between total system capacity and per-user token delivery speed. Points closer to the upper-right represent superior systems.',
		xLabel: 'Interactivity (tok/s/user)',
		yLabel: 'System Throughput (tok/s)',
		models: baseModels
			.map((m) => ({
				id: m.id,
				name: m.name,
				color: m.color,
				points: m.measurements.map((p) => ({
					x: p.interactivity_tokens_sec_user,
					y: p.system_throughput_tokens_sec
				}))
			}))
			.filter((m) => isModelVisible(m.id))
	});

	/**
	 * Chart 3: Normalized Throughput vs #Users (Per-GPU Efficiency)
	 * X = concurrent_users, Y = normalized_throughput
	 */
	let normalizedThroughputVsUsersChart = $derived({
		title: 'Per-GPU Efficiency',
		subtitle:
			'How effectively each accelerator maintains performance under growing demand. Flatter curves reveal hardware that scales gracefully.',
		xLabel: '#Users',
		yLabel: 'Normalized Throughput (tok/s/gpu)',
		models: baseModels
			.map((m) => ({
				id: m.id,
				name: m.name,
				color: m.color,
				points: m.measurements.map((p) => ({
					x: p.concurrent_users,
					y: p.normalized_throughput
				}))
			}))
			.filter((m) => isModelVisible(m.id))
	});

	/**
	 * Chart 4: Normalized Throughput vs TTFT
	 * X = ttft_ms_p9x (converted to seconds), Y = normalized_throughput
	 */
	let normalizedThroughputVsTTFTChart = $derived({
		title: 'Time to First Token',
		subtitle:
			'Balancing per-accelerator output against initial response time constraints. The Pareto frontier highlights configurations that maximize token generation per GPU.',
		xLabel: 'Time to First Token (ms)',
		yLabel: 'Normalized Throughput (tok/s/gpu)',
		models: baseModels
			.map((m) => ({
				id: m.id,
				name: m.name,
				color: m.color,
				points: m.measurements.map((p) => ({
					x: p.ttft_ms_p9x,
					y: p.normalized_throughput
				}))
			}))
			.filter((m) => isModelVisible(m.id))
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
				Compare complex analysis of system configurations and results for MLPerf and AIRR benchmarks.
				</p>
			</header>

			<!-- Main content area - 2x2 grid layout -->
			<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
				<!-- Chart 1: TTFT vs #Users (Step Chart) -->
				<GtcChartSection chart={ttftVsUsersChart} lineType="step" />

				<!-- Chart 2: System throughput vs Interactivity (Line Chart) -->
				<GtcChartSection chart={throughputVsInteractivityChart} lineType="line" />

				<!-- Chart 3: Normalized throughput vs #Users (Step Chart) -->
				<GtcChartSection chart={normalizedThroughputVsUsersChart} lineType="step" />

				<!-- Chart 4: Normalized throughput vs TTFT (Line Chart) -->
				<GtcChartSection chart={normalizedThroughputVsTTFTChart} lineType="line" />
			</div>
		</div>

		<!-- Chart Filters Sidebar (hidden on mobile) -->
		<GtcChartFiltersSidebar />
	</div>
</div>
