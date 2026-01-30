<script>
	/**
	 * GTC Report Page - Displays detailed benchmark report for a specific data point.
	 *
	 * Layout based on wireframe design:
	 * - Header with navigation, report name, and submission metadata
	 * - Report Details section with SUT Summary, Hardware, Software, Model, Datasets cards
	 * - Charts area (right side on desktop, stacked on mobile)
	 * - Chart/Grid section at bottom
	 *
	 * Query Parameters:
	 * - submission: Submission ID
	 * - run: Run ID for specific data point
	 */
	import { page } from '$app/stores';
	import endpointsData from '../endpoints-benchmark-data.json';
	import ReportMiniChart from './_components/ReportMiniChart.svelte';
	import ReportRunsTable from './_components/ReportRunsTable.svelte';
	import ThroughputRTChart from './_components/ThroughputRTChart.svelte';

	// ============================================================================
	// THROUGHPUT RT CHART DATA
	// ============================================================================

	const throughputRTData = {
		criticalJops: 1086256.0,
		maxJops: 1200016.0,
		dataPoints: [
			{ jops: 14118.0, min: 300.0, median: 600.0, p90: 800.0, p95: 900.0, p99: 1100.0, max: 3400.0 },
			{ jops: 28236.0, min: 300.0, median: 800.0, p90: 1000.0, p95: 1100.0, p99: 1300.0, max: 7500.0 },
			{ jops: 42353.0, min: 300.0, median: 1000.0, p90: 1300.0, p95: 1400.0, p99: 1600.0, max: 3800.0 },
			{ jops: 56471.0, min: 300.0, median: 1100.0, p90: 1500.0, p95: 1600.0, p99: 2000.0, max: 4800.0 },
			{ jops: 70589.0, min: 300.0, median: 1100.0, p90: 1500.0, p95: 1700.0, p99: 2000.0, max: 42000.0 },
			{ jops: 84707.0, min: 300.0, median: 1100.0, p90: 1600.0, p95: 1700.0, p99: 2000.0, max: 64000.0 },
			{ jops: 98825.0, min: 300.0, median: 1100.0, p90: 1600.0, p95: 1700.0, p99: 2000.0, max: 4900.0 },
			{ jops: 112943.0, min: 300.0, median: 1100.0, p90: 1600.0, p95: 1700.0, p99: 2000.0, max: 4700.0 },
			{ jops: 127060.0, min: 300.0, median: 1200.0, p90: 1600.0, p95: 1700.0, p99: 2100.0, max: 57000.0 },
			{ jops: 141178.0, min: 300.0, median: 1200.0, p90: 1600.0, p95: 1700.0, p99: 2100.0, max: 25000.0 },
			{ jops: 155296.0, min: 300.0, median: 1200.0, p90: 1700.0, p95: 2000.0, p99: 2500.0, max: 58000.0 },
			{ jops: 169414.0, min: 300.0, median: 1200.0, p90: 1600.0, p95: 1700.0, p99: 2200.0, max: 29000.0 },
			{ jops: 183532.0, min: 300.0, median: 1200.0, p90: 1600.0, p95: 1900.0, p99: 2500.0, max: 69000.0 },
			{ jops: 197650.0, min: 300.0, median: 1200.0, p90: 2000.0, p95: 2400.0, p99: 3100.0, max: 86000.0 },
			{ jops: 211767.0, min: 300.0, median: 1200.0, p90: 1700.0, p95: 1900.0, p99: 2400.0, max: 43000.0 },
			{ jops: 225885.0, min: 400.0, median: 1200.0, p90: 1600.0, p95: 1800.0, p99: 2300.0, max: 72000.0 },
			{ jops: 240003.0, min: 300.0, median: 1200.0, p90: 1700.0, p95: 1900.0, p99: 2900.0, max: 50000.0 },
			{ jops: 254121.0, min: 300.0, median: 1200.0, p90: 1700.0, p95: 2100.0, p99: 3200.0, max: 63000.0 },
			{ jops: 268239.0, min: 400.0, median: 1200.0, p90: 1900.0, p95: 2500.0, p99: 3500.0, max: 34000.0 },
			{ jops: 282357.0, min: 300.0, median: 1200.0, p90: 1700.0, p95: 2000.0, p99: 3000.0, max: 78000.0 },
			{ jops: 296474.0, min: 400.0, median: 1200.0, p90: 1600.0, p95: 1800.0, p99: 2800.0, max: 55000.0 },
			{ jops: 310592.0, min: 300.0, median: 1200.0, p90: 1700.0, p95: 2000.0, p99: 3500.0, max: 91000.0 },
			{ jops: 324710.0, min: 400.0, median: 1200.0, p90: 1600.0, p95: 1900.0, p99: 3200.0, max: 58000.0 },
			{ jops: 338828.0, min: 400.0, median: 1200.0, p90: 1900.0, p95: 2700.0, p99: 3900.0, max: 63000.0 },
			{ jops: 352946.0, min: 400.0, median: 1200.0, p90: 1800.0, p95: 2400.0, p99: 3900.0, max: 110000.0 },
			{ jops: 367064.0, min: 400.0, median: 1200.0, p90: 1600.0, p95: 1800.0, p99: 2600.0, max: 101000.0 },
			{ jops: 381181.0, min: 400.0, median: 1200.0, p90: 1700.0, p95: 2100.0, p99: 3600.0, max: 56000.0 },
			{ jops: 395299.0, min: 400.0, median: 1200.0, p90: 1600.0, p95: 1800.0, p99: 3000.0, max: 93000.0 },
			{ jops: 409417.0, min: 300.0, median: 1200.0, p90: 1700.0, p95: 2100.0, p99: 4000.0, max: 53000.0 },
			{ jops: 423535.0, min: 300.0, median: 1200.0, p90: 1700.0, p95: 2000.0, p99: 3600.0, max: 72000.0 },
			{ jops: 437653.0, min: 400.0, median: 1200.0, p90: 1700.0, p95: 2000.0, p99: 4000.0, max: 60000.0 },
			{ jops: 451771.0, min: 400.0, median: 1300.0, p90: 1800.0, p95: 2400.0, p99: 4500.0, max: 64000.0 },
			{ jops: 465888.0, min: 400.0, median: 1200.0, p90: 1700.0, p95: 2000.0, p99: 4200.0, max: 55000.0 },
			{ jops: 480006.0, min: 400.0, median: 1200.0, p90: 1800.0, p95: 2300.0, p99: 4900.0, max: 66000.0 },
			{ jops: 494124.0, min: 400.0, median: 1200.0, p90: 1700.0, p95: 1800.0, p99: 2600.0, max: 56000.0 },
			{ jops: 508242.0, min: 400.0, median: 1200.0, p90: 1700.0, p95: 2000.0, p99: 4200.0, max: 66000.0 },
			{ jops: 522360.0, min: 400.0, median: 1200.0, p90: 1700.0, p95: 1900.0, p99: 3200.0, max: 90000.0 },
			{ jops: 536478.0, min: 400.0, median: 1300.0, p90: 1800.0, p95: 2400.0, p99: 4900.0, max: 71000.0 },
			{ jops: 550595.0, min: 400.0, median: 1200.0, p90: 1700.0, p95: 1900.0, p99: 2700.0, max: 102000.0 },
			{ jops: 564713.0, min: 400.0, median: 1300.0, p90: 1700.0, p95: 1900.0, p99: 3300.0, max: 82000.0 },
			{ jops: 578831.0, min: 400.0, median: 1300.0, p90: 1700.0, p95: 1900.0, p99: 3000.0, max: 76000.0 },
			{ jops: 592949.0, min: 400.0, median: 1300.0, p90: 1700.0, p95: 1900.0, p99: 3100.0, max: 76000.0 },
			{ jops: 607067.0, min: 400.0, median: 1300.0, p90: 1800.0, p95: 2000.0, p99: 3700.0, max: 76000.0 },
			{ jops: 621185.0, min: 400.0, median: 1300.0, p90: 2300.0, p95: 3700.0, p99: 6200.0, max: 100000.0 },
			{ jops: 635302.0, min: 400.0, median: 1300.0, p90: 1700.0, p95: 2000.0, p99: 4000.0, max: 76000.0 },
			{ jops: 649420.0, min: 400.0, median: 1300.0, p90: 1700.0, p95: 1900.0, p99: 2900.0, max: 83000.0 },
			{ jops: 663538.0, min: 400.0, median: 1300.0, p90: 1800.0, p95: 2000.0, p99: 3400.0, max: 118000.0 },
			{ jops: 677656.0, min: 400.0, median: 1300.0, p90: 1800.0, p95: 2200.0, p99: 5800.0, max: 88000.0 },
			{ jops: 691774.0, min: 400.0, median: 1300.0, p90: 2200.0, p95: 3900.0, p99: 7200.0, max: 107000.0 },
			{ jops: 705891.0, min: 400.0, median: 1300.0, p90: 1900.0, p95: 2700.0, p99: 6200.0, max: 93000.0 },
			{ jops: 720009.0, min: 400.0, median: 1300.0, p90: 1800.0, p95: 2000.0, p99: 4100.0, max: 91000.0 },
			{ jops: 734127.0, min: 400.0, median: 1300.0, p90: 2100.0, p95: 3400.0, p99: 7800.0, max: 121000.0 },
			{ jops: 748245.0, min: 400.0, median: 1300.0, p90: 1800.0, p95: 2100.0, p99: 5800.0, max: 94000.0 },
			{ jops: 762363.0, min: 400.0, median: 1300.0, p90: 1800.0, p95: 2100.0, p99: 5100.0, max: 91000.0 },
			{ jops: 776481.0, min: 400.0, median: 1300.0, p90: 1900.0, p95: 2300.0, p99: 6500.0, max: 105000.0 },
			{ jops: 790598.0, min: 400.0, median: 1400.0, p90: 2100.0, p95: 3700.0, p99: 8300.0, max: 136000.0 },
			{ jops: 804716.0, min: 400.0, median: 1300.0, p90: 1900.0, p95: 2300.0, p99: 7200.0, max: 128000.0 },
			{ jops: 818834.0, min: 400.0, median: 1400.0, p90: 2000.0, p95: 2700.0, p99: 8200.0, max: 130000.0 },
			{ jops: 832952.0, min: 400.0, median: 1400.0, p90: 1900.0, p95: 2300.0, p99: 7800.0, max: 117000.0 },
			{ jops: 847070.0, min: 400.0, median: 1400.0, p90: 2100.0, p95: 3300.0, p99: 8400.0, max: 124000.0 },
			{ jops: 861188.0, min: 400.0, median: 1400.0, p90: 2000.0, p95: 2400.0, p99: 7900.0, max: 141000.0 },
			{ jops: 875305.0, min: 400.0, median: 1400.0, p90: 2100.0, p95: 3100.0, p99: 9100.0, max: 129000.0 },
			{ jops: 889423.0, min: 400.0, median: 1400.0, p90: 2500.0, p95: 4100.0, p99: 8900.0, max: 123000.0 },
			{ jops: 903541.0, min: 400.0, median: 1400.0, p90: 2000.0, p95: 2600.0, p99: 7900.0, max: 133000.0 },
			{ jops: 917659.0, min: 400.0, median: 1400.0, p90: 2300.0, p95: 3800.0, p99: 9800.0, max: 164000.0 },
			{ jops: 931777.0, min: 400.0, median: 1400.0, p90: 2400.0, p95: 4000.0, p99: 10000.0, max: 173000.0 },
			{ jops: 945895.0, min: 400.0, median: 1500.0, p90: 2800.0, p95: 4400.0, p99: 9900.0, max: 168000.0 },
			{ jops: 960012.0, min: 400.0, median: 1400.0, p90: 2400.0, p95: 4100.0, p99: 9700.0, max: 141000.0 },
			{ jops: 974130.0, min: 400.0, median: 1400.0, p90: 2100.0, p95: 3200.0, p99: 11100.0, max: 284000.0 },
			{ jops: 988248.0, min: 400.0, median: 1500.0, p90: 2300.0, p95: 3600.0, p99: 10100.0, max: 194000.0 },
			{ jops: 1002366.0, min: 400.0, median: 1400.0, p90: 2200.0, p95: 3300.0, p99: 11000.0, max: 195000.0 },
			{ jops: 1016484.0, min: 400.0, median: 1400.0, p90: 2200.0, p95: 3400.0, p99: 11500.0, max: 181000.0 },
			{ jops: 1030602.0, min: 400.0, median: 1500.0, p90: 2200.0, p95: 3600.0, p99: 23000.0, max: 259000.0 },
			{ jops: 1044719.0, min: 400.0, median: 1500.0, p90: 2200.0, p95: 3500.0, p99: 16200.0, max: 306000.0 },
			{ jops: 1058837.0, min: 400.0, median: 1500.0, p90: 2300.0, p95: 4300.0, p99: 17100.0, max: 240000.0 },
			{ jops: 1072955.0, min: 400.0, median: 1500.0, p90: 2500.0, p95: 5700.0, p99: 42000.0, max: 346000.0 },
			{ jops: 1087073.0, min: 400.0, median: 1500.0, p90: 2800.0, p95: 5700.0, p99: 26000.0, max: 274000.0 },
			{ jops: 1101191.0, min: 400.0, median: 1500.0, p90: 3600.0, p95: 7900.0, p99: 39000.0, max: 254000.0 },
			{ jops: 1115309.0, min: 400.0, median: 1600.0, p90: 6600.0, p95: 11000.0, p99: 60000.0, max: 307000.0 },
			{ jops: 1129426.0, min: 400.0, median: 1600.0, p90: 6100.0, p95: 9900.0, p99: 55000.0, max: 314000.0 },
			{ jops: 1143544.0, min: 400.0, median: 1600.0, p90: 6300.0, p95: 12300.0, p99: 69000.0, max: 386000.0 },
			{ jops: 1157662.0, min: 400.0, median: 1800.0, p90: 9900.0, p95: 19600.0, p99: 102000.0, max: 381000.0 },
			{ jops: 1171780.0, min: 400.0, median: 1800.0, p90: 10300.0, p95: 24000.0, p99: 141000.0, max: 508000.0 },
			{ jops: 1185898.0, min: 400.0, median: 1800.0, p90: 15500.0, p95: 45000.0, p99: 200000.0, max: 584000.0 },
			{ jops: 1200016.0, min: 400.0, median: 1900.0, p90: 23000.0, p95: 78000.0, p99: 232000.0, max: 690000.0 },
			{ jops: 1214133.0, min: 400.0, median: 950000.0, p90: 2900000.0, p95: 3500000.0, p99: 4000000.0, max: 6400000.0 },
			{ jops: 1228251.0, min: 28000.0, median: 910000.0, p90: 3000000.0, p95: 3400000.0, p99: 4300000.0, max: 4900000.0 },
			{ jops: 1242369.0, min: 75000.0, median: 910000.0, p90: 2800000.0, p95: 3300000.0, p99: 3900000.0, max: 4900000.0 },
			{ jops: 1256487.0, min: 107000.0, median: 1300000.0, p90: 3200000.0, p95: 3600000.0, p99: 4100000.0, max: 4800000.0 }
		]
	};

	// ============================================================================
	// DATA LOADING
	// ============================================================================

	let submissionId = $derived($page.url.searchParams.get('submission') ?? '');
	let runId = $derived($page.url.searchParams.get('run') ?? '');

	/**
	 * Find the submission, system, model, and run data for this report
	 */
	let reportData = $derived.by(() => {
		const submission = endpointsData.submissions.find((s) => s.submission_id === submissionId);
		if (!submission) return null;

		const system = endpointsData.systems.find((s) => s.id === submission.system_id);
		const model = endpointsData.models.find((m) => m.model_id === submission.model_id);
		const runs = endpointsData.runs.filter((r) => r.submission_id === submissionId);
		const currentRun = runs.find((r) => r.run_id === runId) ?? runs[0];

		return {
			submission,
			system,
			model,
			runs,
			currentRun
		};
	});

	// Navigation helpers for prev/next reports
	let allSubmissions = endpointsData.submissions;
	let currentIndex = $derived(allSubmissions.findIndex((s) => s.submission_id === submissionId));
	let prevSubmission = $derived(currentIndex > 0 ? allSubmissions[currentIndex - 1] : null);
	let nextSubmission = $derived(
		currentIndex < allSubmissions.length - 1 ? allSubmissions[currentIndex + 1] : null
	);

	// ============================================================================
	// CHART DATA
	// ============================================================================

	/**
	 * Chart 1: Concurrency vs TTFT for this submission
	 */
	let ttftChartData = $derived.by(() => {
		if (!reportData) return null;
		const { runs, currentRun, system } = reportData;
		const sortedRuns = [...runs].sort((a, b) => a.concurrency - b.concurrency);

		return {
			title: 'Time to First Token',
			xLabel: 'Concurrent Users',
			yLabel: 'TTFT P99 (s)',
			color: system?.color ?? '#64748b',
			points: sortedRuns.map((run) => ({
				x: run.concurrency,
				y: run.ttft,
				isHighlighted: run.run_id === currentRun?.run_id
			}))
		};
	});

	/**
	 * Chart 2: Throughput vs Interactivity for this submission
	 */
	let throughputChartData = $derived.by(() => {
		if (!reportData) return null;
		const { runs, currentRun, system } = reportData;
		const sortedRuns = [...runs].sort((a, b) => a.tps_per_user - b.tps_per_user);

		return {
			title: 'Throughput vs Interactivity',
			xLabel: 'Interactivity (tok/s/user)',
			yLabel: 'System TPS',
			color: system?.color ?? '#64748b',
			points: sortedRuns.map((run) => ({
				x: run.tps_per_user,
				y: run.system_tps,
				isHighlighted: run.run_id === currentRun?.run_id
			}))
		};
	});

	/**
	 * Chart 3: Concurrency vs System Throughput - Shows scaling behavior
	 */
	let concurrencyThroughputData = $derived.by(() => {
		if (!reportData) return null;
		const { runs, currentRun, system } = reportData;
		const sortedRuns = [...runs].sort((a, b) => a.concurrency - b.concurrency);

		return {
			title: 'Concurrency vs Throughput',
			xLabel: 'Concurrent Users',
			yLabel: 'System TPS',
			color: system?.color ?? '#64748b',
			points: sortedRuns.map((run) => ({
				x: run.concurrency,
				y: run.system_tps,
				isHighlighted: run.run_id === currentRun?.run_id
			}))
		};
	});

	/**
	 * Chart 4: Concurrency vs GPU Utilization - Shows resource efficiency
	 */
	let utilizationChartData = $derived.by(() => {
		if (!reportData) return null;
		const { runs, currentRun, system } = reportData;
		const sortedRuns = [...runs].sort((a, b) => a.concurrency - b.concurrency);

		return {
			title: 'GPU Utilization',
			xLabel: 'Concurrent Users',
			yLabel: 'Utilization (%)',
			color: system?.color ?? '#64748b',
			points: sortedRuns.map((run) => ({
				x: run.concurrency,
				y: run.utilization * 100, // Convert to percentage
				isHighlighted: run.run_id === currentRun?.run_id
			}))
		};
	});
</script>

<!-- Report Page Layout -->
<div class="min-h-screen bg-slate-50 dark:bg-slate-900">
	<!-- Header Navigation -->
	<header
		class="sticky top-0 z-10 border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-800"
	>
		<div class="mx-auto flex max-w-7xl items-center justify-between gap-4">
			<!-- Left: Navigation & Title -->
			<div class="flex min-w-0 items-center gap-3">
				<!-- Prev/Next Navigation -->
				<div class="flex items-center gap-1">
					{#if prevSubmission}
						<a
							href="/benchmarks/gtc/report?submission={prevSubmission.submission_id}"
							class="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-300"
							aria-label="Previous report"
						>
							<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
								<path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
							</svg>
						</a>
					{:else}
						<span class="rounded p-1.5 text-slate-200 dark:text-slate-600">
							<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
								<path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
							</svg>
						</span>
					{/if}

					<!-- Mini chart thumbnail placeholder -->
					<div
						class="hidden h-10 w-16 rounded border border-slate-200 bg-slate-50 dark:border-slate-600 dark:bg-slate-700 sm:block"
					>
						<svg class="h-full w-full p-1 text-slate-300 dark:text-slate-500" viewBox="0 0 64 40">
							<polyline
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								points="4,32 16,24 28,28 40,16 52,20 60,8"
							/>
						</svg>
					</div>

					{#if nextSubmission}
						<a
							href="/benchmarks/gtc/report?submission={nextSubmission.submission_id}"
							class="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-300"
							aria-label="Next report"
						>
							<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
								<path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
							</svg>
						</a>
					{:else}
						<span class="rounded p-1.5 text-slate-200 dark:text-slate-600">
							<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
								<path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
							</svg>
						</span>
					{/if}
				</div>

				<!-- Report Title -->
				<div class="min-w-0 flex flex-col">
					<h1 class="truncate text-base font-semibold text-slate-800 dark:text-white sm:text-lg">
						Report Name: {reportData?.system?.system_name ?? 'Loading...'}
					</h1>
				</div>
			</div>

			<!-- Right: Submission Metadata (horizontal layout matching mockup) -->
			<div class="hidden items-center gap-8 text-sm md:flex">
				<div>
					<span class="text-slate-400">Submitter</span>
					<span class="ml-2 font-medium text-slate-700 dark:text-slate-200"
						>{reportData?.submission?.submitter_org_names ?? '—'}</span
					>
				</div>
				<div>
					<span class="text-slate-400">Submission ID</span>
					<span class="ml-2 font-medium text-blue-600 dark:text-blue-400"
						>{reportData?.submission?.submission_id?.slice(0, 20) ?? '—'}...</span
					>
				</div>
				<div>
					<span class="text-slate-400">Submission Date</span>
					<span class="ml-2 font-medium text-slate-700 dark:text-slate-200"
						>{reportData?.submission?.submission_date ?? '—'}</span
					>
				</div>
				<div>
					<span class="text-slate-400">Publication Date</span>
					<span class="ml-2 font-medium text-slate-700 dark:text-slate-200"
						>{reportData?.submission?.publish_date ?? '—'}</span
					>
				</div>
			</div>
		</div>
	</header>

	<!-- Main Content -->
	<main class="mx-auto max-w-7xl px-4 py-6">
		{#if reportData}
			<!-- Back to Benchmarks link -->
			<a
				href="/benchmarks/gtc"
				class="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
			>
				<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
				</svg>
				Back to Benchmarks
			</a>

			<!-- Report Details Section -->
			<h2 class="mb-4 text-lg font-semibold text-slate-800 dark:text-white">Report Details</h2>

			<!-- Two-column layout: Details + Charts -->
			<div class="grid gap-6 lg:grid-cols-4">
				<!-- Left Column: Report Details (3/4 width on desktop) -->
				<div class="space-y-4 lg:col-span-3">
					<!-- Row 1: SUT Summary + Node -->
					<div class="grid gap-4 md:grid-cols-2">
						<!-- SUT Summary Card -->
						<section class="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
							<header class="bg-slate-600 px-4 py-2 text-sm font-semibold text-white">
								SUT Summary
							</header>
							<div class="space-y-2 p-4 text-sm">
								<div class="flex gap-2">
									<span class="w-32 shrink-0 text-slate-500 dark:text-slate-400">System Name</span>
									<span class="font-medium text-slate-800 dark:text-slate-200"
										>{reportData.system?.system_name ?? '—'}</span
									>
								</div>
								<div class="flex gap-2">
									<span class="w-32 shrink-0 text-slate-500 dark:text-slate-400">System Category</span>
									<span class="font-medium text-slate-800 dark:text-slate-200"
										>{reportData.system?.system_category ?? '—'}</span
									>
								</div>
								<div class="flex gap-2">
									<span class="w-32 shrink-0 text-slate-500 dark:text-slate-400">System Type Detail</span>
									<span class="font-medium text-slate-800 dark:text-slate-200">Cloud</span>
								</div>
								<div class="flex gap-2">
									<span class="w-32 shrink-0 text-slate-500 dark:text-slate-400">System Availability</span>
									<span class="font-medium text-slate-800 dark:text-slate-200"
										>{reportData.system?.system_availability_status ?? '—'}</span
									>
								</div>
							</div>
						</section>

						<!-- Node Card -->
						<section class="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
							<header class="bg-slate-600 px-4 py-2 text-sm font-semibold text-white">
								Node
							</header>
							<div class="space-y-2 p-4 text-sm">
								<div class="flex gap-2">
									<span class="w-32 shrink-0 text-slate-500 dark:text-slate-400">Types of Nodes</span>
									<span class="font-medium text-slate-800 dark:text-slate-200">—</span>
								</div>
								<div class="flex gap-2">
									<span class="w-32 shrink-0 text-slate-500 dark:text-slate-400">Total Node Count</span>
									<span class="font-medium text-slate-800 dark:text-slate-200"
										>{reportData.system?.number_of_nodes ?? '—'}</span
									>
								</div>
								<div class="flex gap-2">
									<span class="w-32 shrink-0 text-slate-500 dark:text-slate-400">Node Type ID</span>
									<span class="font-medium text-slate-800 dark:text-slate-200">—</span>
								</div>
								<div class="flex gap-2">
									<span class="w-32 shrink-0 text-slate-500 dark:text-slate-400">Node Count</span>
									<span class="font-medium text-slate-800 dark:text-slate-200"
										>{reportData.system?.number_of_nodes ?? '—'}</span
									>
								</div>
							</div>
						</section>
					</div>

					<!-- Row 2: Model + Datasets -->
					<div class="grid gap-4 md:grid-cols-2">
						<!-- Model Card -->
						<section class="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
							<header class="bg-slate-600 px-4 py-2 text-sm font-semibold text-white">Model</header>
							<div class="space-y-2 p-4 text-sm">
								<div class="flex gap-2">
									<span class="w-44 shrink-0 text-slate-500 dark:text-slate-400">Division</span>
									<span class="font-medium text-slate-800 dark:text-slate-200"
										>{reportData.submission?.division ?? '—'}</span
									>
								</div>
								<div class="flex gap-2">
									<span class="w-44 shrink-0 text-slate-500 dark:text-slate-400">Model Name</span>
									<span class="font-medium text-slate-800 dark:text-slate-200"
										>{reportData.model?.model_name ?? '—'}</span
									>
								</div>
								<div class="flex gap-2">
									<span class="w-44 shrink-0 text-slate-500 dark:text-slate-400">Model Link</span>
									<span class="font-medium text-slate-800 dark:text-slate-200">—</span>
								</div>
								<div class="flex gap-2">
									<span class="w-44 shrink-0 text-slate-500 dark:text-slate-400">Model Transformation Link</span>
									<span class="font-medium text-slate-800 dark:text-slate-200">—</span>
								</div>
								<div class="flex gap-2">
									<span class="w-44 shrink-0 text-slate-500 dark:text-slate-400">Model Notes</span>
									<span class="font-medium text-slate-800 dark:text-slate-200">—</span>
								</div>
							</div>
						</section>

						<!-- Datasets Card -->
						<section class="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
							<header class="bg-slate-600 px-4 py-2 text-sm font-semibold text-white">
								Datasets
							</header>
							<div class="space-y-2 p-4 text-sm">
								<div class="flex gap-2">
									<span class="w-44 shrink-0 text-slate-500 dark:text-slate-400">Dataset ID</span>
									<span class="font-medium text-slate-800 dark:text-slate-200">—</span>
								</div>
								<div class="flex gap-2">
									<span class="w-44 shrink-0 text-slate-500 dark:text-slate-400">Dataset Name</span>
									<span class="font-medium text-slate-800 dark:text-slate-200"
										>{reportData.submission?.dataset_name ?? '—'}</span
									>
								</div>
								<div class="flex gap-2">
									<span class="w-44 shrink-0 text-slate-500 dark:text-slate-400">Dataset Type</span>
									<span class="font-medium text-slate-800 dark:text-slate-200">Both</span>
								</div>
								<div class="flex gap-2">
									<span class="w-44 shrink-0 text-slate-500 dark:text-slate-400">Dataset Link</span>
									<span class="font-medium text-slate-800 dark:text-slate-200">—</span>
								</div>
								<div class="flex gap-2">
									<span class="w-44 shrink-0 text-slate-500 dark:text-slate-400">Measured Accuracy Score</span>
									<span class="font-medium text-slate-800 dark:text-slate-200">—</span>
								</div>
							</div>
						</section>
					</div>

					<!-- Row 3: Node Cards (Node 1, Node 2, etc.) -->
					<!-- Display 2 nodes to match mockup - in production this would come from actual node data -->
					<div class="grid gap-4 md:grid-cols-2">
						{#each Array(2) as _, nodeIndex (nodeIndex)}
							{@const isNode2 = nodeIndex === 1}
							<!-- Node Card -->
							<section class="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
								<header class="bg-slate-700 px-4 py-2 text-sm font-semibold text-white">
									Node {nodeIndex + 1}
								</header>

								<!-- Hardware Section -->
								<div class="bg-slate-500 px-4 py-1.5 text-xs font-semibold text-white">
									Hardware
								</div>
								<div class="space-y-4 p-4">
									<!-- Processor -->
									<div>
										<h4 class="mb-2 text-sm font-semibold text-slate-700 underline dark:text-slate-300">
											Processor
										</h4>
										<div class="space-y-1 text-sm">
											<div class="flex gap-2">
												<span class="w-40 shrink-0 text-slate-500 dark:text-slate-400">Processor Model Name</span>
												<span class="font-medium text-slate-800 dark:text-slate-200"
													>{reportData.system?.host_processor_model_name ?? '—'}</span
												>
											</div>
											<div class="flex gap-2">
												<span class="w-40 shrink-0 text-slate-500 dark:text-slate-400">Processors per Node</span>
												<span class="font-medium text-slate-800 dark:text-slate-200"
													>{reportData.system?.host_processors_per_node ?? '—'}</span
												>
											</div>
											<div class="flex gap-2">
												<span class="w-40 shrink-0 text-slate-500 dark:text-slate-400">Cores Per Processor</span>
												<span class="font-medium text-slate-800 dark:text-slate-200"
													>{isNode2 ? '48' : '56'}</span
												>
											</div>
											<div class="flex gap-2">
												<span class="w-40 shrink-0 text-slate-500 dark:text-slate-400">VCPUs Per Processor</span>
												<span class="font-medium text-slate-800 dark:text-slate-200"
													>{isNode2 ? '4' : '8'}</span
												>
											</div>
										</div>
									</div>

									<!-- Accelerator -->
									<div>
										<h4 class="mb-2 text-sm font-semibold text-slate-700 underline dark:text-slate-300">
											Accelerator
										</h4>
										<div class="space-y-1 text-sm">
											<div class="flex gap-2">
												<span class="w-40 shrink-0 text-slate-500 dark:text-slate-400">Accelerator Model Name</span>
												<span class="font-medium text-slate-800 dark:text-slate-200"
													>{reportData.system?.accelerator_model_name ?? '—'}</span
												>
											</div>
											<div class="flex gap-2">
												<span class="w-40 shrink-0 text-slate-500 dark:text-slate-400">Accelerators per Node</span>
												<span class="font-medium text-slate-800 dark:text-slate-200"
													>{isNode2 ? '4' : reportData.system?.accelerators_per_node ?? '—'}</span
												>
											</div>
											<div class="flex gap-2">
												<span class="w-40 shrink-0 text-slate-500 dark:text-slate-400">Interconnect</span>
												<span class="font-medium text-slate-800 dark:text-slate-200"
													>{isNode2 ? '9x 5th Gen NVLink, 7.2 TB/s aggregated bandwidth' : '18x 5th Gen NVLink, 14.4 TB/s aggregated bandwidth'}</span
												>
											</div>
											<div class="flex gap-2">
												<span class="w-40 shrink-0 text-slate-500 dark:text-slate-400">Memory</span>
												<span class="font-medium text-slate-800 dark:text-slate-200"
													>{reportData.system?.accelerator_memory_type ?? '—'} {isNode2 ? '96 GB' : reportData.system?.accelerator_memory_capacity ?? ''}</span
												>
											</div>
											<div class="flex gap-2">
												<span class="w-40 shrink-0 text-slate-500 dark:text-slate-400">Host Accelerator Interconnect</span>
												<span class="font-medium text-slate-800 dark:text-slate-200"
													>{isNode2 ? 'PCIe Gen4 x16' : 'PCIe Gen5 x16'}</span
												>
											</div>
										</div>
									</div>

									<!-- Section Title (Additional Hardware) -->
									<div>
										<h4 class="mb-2 text-sm font-semibold text-slate-700 underline dark:text-slate-300">
											Section Title
										</h4>
										<div class="space-y-1 text-sm">
											<div class="flex gap-2">
												<span class="w-40 shrink-0 text-slate-500 dark:text-slate-400">Host Memory Capacity</span>
												<span class="font-medium text-slate-800 dark:text-slate-200"
													>{isNode2 ? '512 GB' : '2 TB'}</span
												>
											</div>
											<div class="flex gap-2">
												<span class="w-40 shrink-0 text-slate-500 dark:text-slate-400">Memory Configuration</span>
												<span class="font-medium text-slate-800 dark:text-slate-200"
													>{isNode2 ? '16x 32GB HMCG94AGBRA179N' : '32x 64GB HMCG94AGBRA179N'}</span
												>
											</div>
											<div class="flex gap-2">
												<span class="w-40 shrink-0 text-slate-500 dark:text-slate-400">Network Interfaces</span>
												<span class="font-medium text-slate-800 dark:text-slate-200"
													>{isNode2 ? '4x 200Gbe Infiniband' : '10x 400Gbe Infiniband'}</span
												>
											</div>
											<div class="flex gap-2">
												<span class="w-40 shrink-0 text-slate-500 dark:text-slate-400">Network Details</span>
												<span class="font-medium text-slate-800 dark:text-slate-200"
													>{isNode2 ? 'Infiniband; Data bandwidth for GPU-PCIe: 252GB/s; PCIe-NIC: 250GB/s' : 'Infiniband; Data bandwidth for GPU-PCIe: 504GB/s; PCIe-NIC: 500GB/s'}</span
												>
											</div>
											<div class="flex gap-2">
												<span class="w-40 shrink-0 text-slate-500 dark:text-slate-400">Storage Capacity</span>
												<span class="font-medium text-slate-800 dark:text-slate-200"
													>{isNode2 ? '1 TB SSD, 2 TB CIFS' : '2 TB SSD, 5 TB CIFS'}</span
												>
											</div>
											<div class="flex gap-2">
												<span class="w-40 shrink-0 text-slate-500 dark:text-slate-400">Storage Details</span>
												<span class="font-medium text-slate-800 dark:text-slate-200"
													>NVMe SSD, CIFS mounted disk storage</span
												>
											</div>
											<div class="flex gap-2">
												<span class="w-40 shrink-0 text-slate-500 dark:text-slate-400">Other Hardware</span>
												<span class="font-medium text-slate-800 dark:text-slate-200">—</span>
											</div>
											<div class="flex gap-2">
												<span class="w-40 shrink-0 text-slate-500 dark:text-slate-400">Cooling</span>
												<span class="font-medium text-slate-800 dark:text-slate-200"
													>{isNode2 ? 'Liquid-cooled' : 'Air-cooled'}</span
												>
											</div>
											<div class="flex gap-2">
												<span class="w-40 shrink-0 text-slate-500 dark:text-slate-400">Hardware Notes</span>
												<span class="font-medium text-slate-800 dark:text-slate-200"
													>{isNode2 ? 'B200 TGP 700W' : 'B200 TGP 1000W'}</span
												>
											</div>
										</div>
									</div>
								</div>

								<!-- Software Section -->
								<div class="bg-slate-500 px-4 py-1.5 text-xs font-semibold text-white">
									Software
								</div>
								<div class="space-y-2 p-4 text-sm">
									<div class="flex gap-2">
										<span class="w-40 shrink-0 text-slate-500 dark:text-slate-400">Framework</span>
										<span class="font-medium text-slate-800 dark:text-slate-200"
											>{reportData.system?.framework ?? '—'}</span
										>
									</div>
									<div class="flex gap-2">
										<span class="w-40 shrink-0 text-slate-500 dark:text-slate-400">Operating System</span>
										<span class="font-medium text-slate-800 dark:text-slate-200"
											>{isNode2 ? 'Ubuntu 22.04' : 'Ubuntu 24.04'}</span
										>
									</div>
									<div class="flex gap-2">
										<span class="w-40 shrink-0 text-slate-500 dark:text-slate-400">Filesystem</span>
										<span class="font-medium text-slate-800 dark:text-slate-200"
											>{isNode2 ? 'ext4' : '—'}</span
										>
									</div>
									<div class="flex gap-2">
										<span class="w-40 shrink-0 text-slate-500 dark:text-slate-400">Other Software</span>
										<span class="font-medium text-slate-800 dark:text-slate-200"
											>{isNode2 ? 'TensorRT 10.8, CUDA 12.6, cuDNN 9.8, Driver 565.57' : 'TensorRT 10.11, CUDA 12.9, cuDNN 9.10, Driver 570.148'}</span
										>
									</div>
									<div class="flex gap-2">
										<span class="w-40 shrink-0 text-slate-500 dark:text-slate-400">Software Notes</span>
										<span class="font-medium text-slate-800 dark:text-slate-200">—</span>
									</div>
								</div>
							</section>
						{/each}
					</div>
				</div>

				<!-- Right Column: Charts (1/4 width on desktop) -->
				<div class="space-y-4">
					<!-- Chart 1: TTFT -->
					{#if ttftChartData}
						<ReportMiniChart
							title={ttftChartData.title}
							xLabel={ttftChartData.xLabel}
							yLabel={ttftChartData.yLabel}
							color={ttftChartData.color}
							points={ttftChartData.points}
						/>
					{/if}

					<!-- Chart 2: Throughput -->
					{#if throughputChartData}
						<ReportMiniChart
							title={throughputChartData.title}
							xLabel={throughputChartData.xLabel}
							yLabel={throughputChartData.yLabel}
							color={throughputChartData.color}
							points={throughputChartData.points}
						/>
					{/if}

					<!-- Chart 3: Concurrency vs Throughput -->
					{#if concurrencyThroughputData}
						<ReportMiniChart
							title={concurrencyThroughputData.title}
							xLabel={concurrencyThroughputData.xLabel}
							yLabel={concurrencyThroughputData.yLabel}
							color={concurrencyThroughputData.color}
							points={concurrencyThroughputData.points}
						/>
					{/if}

					<!-- Chart 4: GPU Utilization -->
					{#if utilizationChartData}
						<ReportMiniChart
							title={utilizationChartData.title}
							xLabel={utilizationChartData.xLabel}
							yLabel={utilizationChartData.yLabel}
							color={utilizationChartData.color}
							points={utilizationChartData.points}
						/>
					{/if}
				</div>
			</div>


			<!-- Bottom: Full-width Benchmark Runs Table -->
			<section class="mt-6">
				<ReportRunsTable
					runs={reportData.runs}
					currentRunId={reportData.currentRun?.run_id ?? ''}
					systemColor={reportData.system?.color ?? '#64748b'}
				/>
			</section>


			<!-- Throughput RT Chart -->
			<section class="mt-6">
				<ThroughputRTChart
					criticalJops={throughputRTData.criticalJops}
					maxJops={throughputRTData.maxJops}
					dataPoints={throughputRTData.dataPoints}
				/>
			</section>
		{:else}
			<!-- Loading/Error State -->
			<div class="rounded-lg border border-slate-200 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-800">
				<p class="text-slate-500 dark:text-slate-400">
					{#if submissionId}
						Report not found for submission: {submissionId}
					{:else}
						No submission specified. Please select a data point from the benchmark charts.
					{/if}
				</p>
				<a
					href="/benchmarks/gtc"
					class="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
				>
					View Benchmarks
				</a>
			</div>
		{/if}
	</main>
</div>
