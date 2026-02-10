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
	import { endpointsData } from '$lib/data/index.js';
	import ReportMiniChart from './_components/ReportMiniChart.svelte';

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
			color: system?.color ?? '#535869',
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
			color: system?.color ?? '#535869',
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
			color: system?.color ?? '#535869',
			points: sortedRuns.map((run) => ({
				x: run.concurrency,
				y: run.system_tps,
				isHighlighted: run.run_id === currentRun?.run_id
			}))
		};
	});

	/**
	 * Chart 4: Concurrency vs System Utilization - Shows resource efficiency
	 */
	let utilizationChartData = $derived.by(() => {
		if (!reportData) return null;
		const { runs, currentRun, system } = reportData;
		const sortedRuns = [...runs].sort((a, b) => a.concurrency - b.concurrency);

		return {
			title: 'System Utilization',
			xLabel: 'Concurrent Users',
			yLabel: 'Utilization (%)',
			color: system?.color ?? '#535869',
			points: sortedRuns.map((run) => ({
				x: run.concurrency,
				y: run.utilization * 100, // Convert to percentage
				isHighlighted: run.run_id === currentRun?.run_id
			}))
		};
	});

	// ============================================================================
	// SYNCHRONIZED CROSSHAIRS
	// ============================================================================

	/**
	 * @typedef {Object} CrosshairPosition
	 * @property {number} x - Normalized X position (0-1)
	 * @property {number} y - Normalized Y position (0-1)
	 */

	/** @type {CrosshairPosition | null} */
	let sharedCrosshairPosition = $state(null);

	/**
	 * Handle crosshair position updates from any chart
	 * @param {CrosshairPosition | null} position
	 */
	function handleCrosshairMove(position) {
		sharedCrosshairPosition = position;
	}

	// ============================================================================
	// RUN DATA TABLE
	// ============================================================================

	/** Sorted runs for table display (max 11 columns) */
	let displayRuns = $derived.by(() => {
		if (!reportData?.runs?.length) return [];
		return [...reportData.runs]
			.sort((a, b) => a.concurrency - b.concurrency)
			.slice(0, 11);
	});

	/**
	 * Format run date for display
	 * @param {string} dateStr - ISO date string
	 * @returns {string}
	 */
	function formatRunDate(dateStr) {
		if (!dateStr) return '—';
		try {
			const d = new Date(dateStr);
			return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
		} catch {
			return dateStr;
		}
	}

	/**
	 * Format number with commas
	 * @param {number} num
	 * @param {number} [decimals=1]
	 * @returns {string}
	 */
	function formatNum(num, decimals = 1) {
		if (num == null || Number.isNaN(num)) return '—';
		return Number(num).toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
	}

	/**
	 * Format latency in milliseconds
	 * @param {number} seconds
	 * @returns {string}
	 */
	function formatLatencyMs(seconds) {
		if (seconds == null || Number.isNaN(seconds)) return '—';
		return (seconds * 1000).toFixed(1);
	}

	/**
	 * Format utilization as percentage
	 * @param {number} value - 0–1
	 * @returns {string}
	 */
	function formatUtilization(value) {
		if (value == null || Number.isNaN(value)) return '—';
		return (value * 100).toFixed(1) + '%';
	}

	/**
	 * Get cell value for a run data table row
	 * @param {string} rowKey - Row identifier
	 * @param {Object} run - Run object
	 * @returns {string}
	 */
	function getRunTableCell(rowKey, run) {
		if (!run) return '—';
		switch (rowKey) {
			case 'run_date':
				return formatRunDate(run.run_date);
			case 'concurrency':
				return String(run.concurrency);
			case 'system_tps':
				return formatNum(run.system_tps);
			case 'tps_per_user':
				return formatNum(run.tps_per_user);
			case 'ttft_p99':
				return formatLatencyMs(run.ttft ?? run.measured_latency_ttft_p99);
			case 'utilization':
				return formatUtilization(run.utilization);
			case 'config_detail':
				return run.config_detail ?? '—';
			case 'ttft_min':
				return formatLatencyMs(run.measured_latency_ttft_min);
			case 'ttft_avg':
				return formatLatencyMs(run.measured_latency_ttft_average);
			case 'ttft_p50':
				return formatLatencyMs(run.measured_latency_ttft_p50);
			case 'ttft_p90':
				return formatLatencyMs(run.measured_latency_ttft_p90);
			case 'ttft_p95':
				return formatLatencyMs(run.measured_latency_ttft_p95);
			case 'ttft_p99_row':
				return formatLatencyMs(run.measured_latency_ttft_p99);
			case 'ttft_p999':
				return formatLatencyMs(run.measured_latency_ttft_p999);
			case 'ttft_max':
				return formatLatencyMs(run.measured_latency_ttft_max);
			case 'tpot_min':
				return formatLatencyMs(run.measured_latency_tpot_min);
			case 'tpot_avg':
				return formatLatencyMs(run.measured_latency_tpot_average);
			case 'tpot_p50':
				return formatLatencyMs(run.measured_latency_tpot_p50);
			case 'tpot_p90':
				return formatLatencyMs(run.measured_latency_tpot_p90);
			case 'tpot_p95':
				return formatLatencyMs(run.measured_latency_tpot_p95);
			case 'tpot_p99':
				return formatLatencyMs(run.measured_latency_tpot_p99);
			case 'tpot_p999':
				return formatLatencyMs(run.measured_latency_tpot_p999);
			case 'tpot_max':
				return formatLatencyMs(run.measured_latency_tpot_max);
			default:
				return '—';
		}
	}
</script>

<!-- Report Page Layout -->
<div class="min-h-screen bg-white dark:bg-slate-900">
	<!-- Header -->
	<header class="border-b border-slate-200 px-6 py-4 dark:border-slate-700">
		<div class="mx-auto flex max-w-7xl items-center justify-between">
			<!-- Left: Navigation & Report Title -->
			<div class="flex items-center gap-3">
				<!-- Prev/Next Navigation -->
				<div class="flex items-center gap-1">
					{#if prevSubmission}
						<a
							href="/report?submission={prevSubmission.submission_id}"
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

					{#if nextSubmission}
						<a
							href="/report?submission={nextSubmission.submission_id}"
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
				<h1 class="text-lg font-semibold text-slate-800 dark:text-white">
					Report Name: {reportData?.system?.system_name ?? 'Name of the submission'}
				</h1>
			</div>

			<!-- Right: Submission Metadata -->
			<div class="hidden items-center gap-8 text-sm md:flex">
				<div>
					<span class="text-slate-500 dark:text-slate-400">Submitter</span>
					<span class="ml-2 font-medium text-slate-800 dark:text-slate-200"
						>{reportData?.submission?.submitter_org_names ?? 'NVIDIA; Dell + Broadcom'}</span
					>
				</div>
				<div>
					<div class="text-slate-500 dark:text-slate-400">Submission ID</div>
					<div class="font-medium text-blue-600 dark:text-blue-400"
						>{reportData?.submission?.submission_id?.slice(0, 24) ?? '42cf4c09-e67b-4546-88fe-'}...</div
					>
				</div>
				<div>
					<div class="text-slate-500 dark:text-slate-400">Submission Date</div>
					<div class="font-medium text-slate-800 dark:text-slate-200"
						>{reportData?.submission?.submission_date ?? '20260121-1117'}</div
					>
				</div>
				<div>
					<div class="text-slate-500 dark:text-slate-400">Publication Date</div>
					<div class="font-medium text-slate-800 dark:text-slate-200"
						>{reportData?.submission?.publish_date ?? 'March 16, 2026'}</div
					>
				</div>
			</div>
		</div>
	</header>

	<!-- Main Content -->
	<main class="mx-auto max-w-7xl px-6 py-6">
		{#if reportData}
			<!-- Report Details Section -->
			<h2 class="mb-4 text-base font-semibold text-slate-800 dark:text-white">Report Details</h2>

			<!-- Row 1: SUT Summary + Model + Datasets (3 columns) -->
			<div class="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
				<!-- SUT Summary Card -->
				<section class="overflow-hidden rounded border border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-800">
					<header class="bg-slate-600 px-3 py-1.5 text-sm font-semibold text-white dark:bg-slate-700">
						SUT Summary
					</header>
					<div class="space-y-1.5 p-3 text-xs">
						<div class="flex gap-2">
							<span class="w-28 shrink-0 text-slate-500 dark:text-slate-400">System Name</span>
							<span class="font-medium text-slate-800 dark:text-slate-200"
								>{reportData.system?.system_name ?? 'NVIDIA DGX B200 (8x B200-SXM-180GB, TensorRT)'}</span
							>
						</div>
						<div class="flex gap-2">
							<span class="w-28 shrink-0 text-slate-500 dark:text-slate-400">System Category</span>
							<span class="font-medium text-slate-800 dark:text-slate-200"
								>{reportData.system?.system_category ?? 'Datacenter'}</span
							>
						</div>
						<div class="flex gap-2">
							<span class="w-28 shrink-0 text-slate-500 dark:text-slate-400">System Type Detail</span>
							<span class="font-medium text-slate-800 dark:text-slate-200">Cloud</span>
						</div>
						<div class="flex gap-2">
							<span class="w-28 shrink-0 text-slate-500 dark:text-slate-400">System Availability</span>
							<span class="font-medium text-slate-800 dark:text-slate-200"
								>{reportData.system?.system_availability_status ?? 'Available'}</span
							>
						</div>
						<div class="flex gap-2">
							<span class="w-28 shrink-0 text-slate-500 dark:text-slate-400">System Size</span>
							<span class="font-medium text-slate-800 dark:text-slate-200">8x GB300 Decode + 12x GB300 Pre-fill</span>
						</div>
					</div>
				</section>

				<!-- Model Card -->
				<section class="overflow-hidden rounded border border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-800">
					<header class="bg-slate-600 px-3 py-1.5 text-sm font-semibold text-white dark:bg-slate-700">Model</header>
					<div class="space-y-1.5 p-3 text-xs">
						<div class="flex gap-2">
							<span class="w-36 shrink-0 text-slate-500 dark:text-slate-400">Division</span>
							<span class="font-medium text-slate-800 dark:text-slate-200"
								>{reportData.submission?.division ?? 'Closed'}</span
							>
						</div>
						<div class="flex gap-2">
							<span class="w-36 shrink-0 text-slate-500 dark:text-slate-400">Model Name</span>
							<span class="font-medium text-slate-800 dark:text-slate-200"
								>{reportData.model?.model_name ?? 'GPT-OSS 120B'}</span
							>
						</div>
						<div class="flex gap-2">
							<span class="w-36 shrink-0 text-slate-500 dark:text-slate-400">Model Link</span>
							<span class="font-medium text-slate-800 dark:text-slate-200">—</span>
						</div>
						<div class="flex gap-2">
							<span class="w-36 shrink-0 text-slate-500 dark:text-slate-400">Model Transformation Link</span>
							<span class="font-medium text-slate-800 dark:text-slate-200">—</span>
						</div>
						<div class="flex gap-2">
							<span class="w-36 shrink-0 text-slate-500 dark:text-slate-400">Model Notes</span>
							<span class="font-medium text-slate-800 dark:text-slate-200">—</span>
						</div>
					</div>
				</section>

				<!-- Datasets Card -->
				<section class="overflow-hidden rounded border border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-800">
					<header class="bg-slate-600 px-3 py-1.5 text-sm font-semibold text-white dark:bg-slate-700">
						Datasets
					</header>
					<div class="space-y-1.5 p-3 text-xs">
						<div class="flex gap-2">
							<span class="w-36 shrink-0 text-slate-500 dark:text-slate-400">Dataset ID</span>
							<span class="font-medium text-slate-800 dark:text-slate-200">—</span>
						</div>
						<div class="flex gap-2">
							<span class="w-36 shrink-0 text-slate-500 dark:text-slate-400">Dataset Name</span>
							<span class="font-medium text-slate-800 dark:text-slate-200"
								>{reportData.submission?.dataset_name ?? 'OpenOrca'}</span
							>
						</div>
						<div class="flex gap-2">
							<span class="w-36 shrink-0 text-slate-500 dark:text-slate-400">Dataset Type</span>
							<span class="font-medium text-slate-800 dark:text-slate-200">Both</span>
						</div>
						<div class="flex gap-2">
							<span class="w-36 shrink-0 text-slate-500 dark:text-slate-400">Dataset Link</span>
							<span class="font-medium text-slate-800 dark:text-slate-200">—</span>
						</div>
						<div class="flex gap-2">
							<span class="w-36 shrink-0 text-slate-500 dark:text-slate-400">Measured Accuracy Score</span>
							<span class="font-medium text-slate-800 dark:text-slate-200">—</span>
						</div>
					</div>
				</section>
			</div>

			<!-- Row 2: 4 Charts in a row -->
			<div class="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<!-- Chart 1: TTFT -->
				{#if ttftChartData}
					<div class="aspect-square overflow-hidden rounded border border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-800">
						<ReportMiniChart
							title={ttftChartData.title}
							xLabel={ttftChartData.xLabel}
							yLabel={ttftChartData.yLabel}
							color={ttftChartData.color}
							points={ttftChartData.points}
							crosshairPosition={sharedCrosshairPosition}
							onCrosshairMove={handleCrosshairMove}
						/>
					</div>
				{:else}
					<div class="flex aspect-square items-center justify-center rounded border border-slate-300 bg-slate-50 dark:border-slate-600 dark:bg-slate-800">
						<span class="text-sm text-slate-400">Chart</span>
					</div>
				{/if}

				<!-- Chart 2: Throughput -->
				{#if throughputChartData}
					<div class="aspect-square overflow-hidden rounded border border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-800">
						<ReportMiniChart
							title={throughputChartData.title}
							xLabel={throughputChartData.xLabel}
							yLabel={throughputChartData.yLabel}
							color={throughputChartData.color}
							points={throughputChartData.points}
							crosshairPosition={sharedCrosshairPosition}
							onCrosshairMove={handleCrosshairMove}
						/>
					</div>
				{:else}
					<div class="flex aspect-square items-center justify-center rounded border border-slate-300 bg-slate-50 dark:border-slate-600 dark:bg-slate-800">
						<span class="text-sm text-slate-400">Chart</span>
					</div>
				{/if}

				<!-- Chart 3: Concurrency vs Throughput -->
				{#if concurrencyThroughputData}
					<div class="aspect-square overflow-hidden rounded border border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-800">
						<ReportMiniChart
							title={concurrencyThroughputData.title}
							xLabel={concurrencyThroughputData.xLabel}
							yLabel={concurrencyThroughputData.yLabel}
							color={concurrencyThroughputData.color}
							points={concurrencyThroughputData.points}
							crosshairPosition={sharedCrosshairPosition}
							onCrosshairMove={handleCrosshairMove}
						/>
					</div>
				{:else}
					<div class="flex aspect-square items-center justify-center rounded border border-slate-300 bg-slate-50 dark:border-slate-600 dark:bg-slate-800">
						<span class="text-sm text-slate-400">Chart</span>
					</div>
				{/if}

				<!-- Chart 4: System Utilization -->
				{#if utilizationChartData}
					<div class="aspect-square overflow-hidden rounded border border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-800">
						<ReportMiniChart
							title={utilizationChartData.title}
							xLabel={utilizationChartData.xLabel}
							yLabel={utilizationChartData.yLabel}
							color={utilizationChartData.color}
							points={utilizationChartData.points}
							crosshairPosition={sharedCrosshairPosition}
							onCrosshairMove={handleCrosshairMove}
						/>
					</div>
				{:else}
					<div class="flex aspect-square items-center justify-center rounded border border-slate-300 bg-slate-50 dark:border-slate-600 dark:bg-slate-800">
						<span class="text-sm text-slate-400">Chart</span>
					</div>
				{/if}
			</div>

			<!-- Row 3: Node Summary Bar -->
			<section class="mb-4 overflow-hidden rounded border border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-800">
				<header class="bg-slate-600 px-3 py-1.5 text-sm font-semibold text-white dark:bg-slate-700">
					Node
				</header>
				<div class="grid grid-cols-4 gap-4 p-3 text-xs">
					<div class="flex gap-2">
						<span class="text-slate-500 dark:text-slate-400">Types of Nodes</span>
						<span class="font-medium text-slate-800 dark:text-slate-200">—</span>
					</div>
					<div class="flex gap-2">
						<span class="text-slate-500 dark:text-slate-400">Total Node Count</span>
						<span class="font-medium text-slate-800 dark:text-slate-200"
							>{reportData.system?.number_of_nodes ?? '—'}</span
						>
					</div>
					<div class="flex gap-2">
						<span class="text-slate-500 dark:text-slate-400">Node Type ID</span>
						<span class="font-medium text-slate-800 dark:text-slate-200">—</span>
					</div>
					<div class="flex gap-2">
						<span class="text-slate-500 dark:text-slate-400">Node Count</span>
						<span class="font-medium text-slate-800 dark:text-slate-200"
							>{reportData.system?.number_of_nodes ?? '—'}</span
						>
					</div>
				</div>
			</section>

			<!-- Row 4: Node 1 and Node 2 side by side -->
			<div class="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
				{#each Array(2) as _, nodeIndex (nodeIndex)}
					{@const isNode2 = nodeIndex === 1}
					<!-- Node Card -->
					<section class="overflow-hidden rounded border border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-800">
						<header class="bg-slate-700 px-3 py-1.5 text-sm font-semibold text-white dark:bg-slate-600">
							Node {nodeIndex + 1}
						</header>

						<!-- Hardware Section -->
						<div class="bg-slate-500 px-3 py-1 text-xs font-semibold text-white dark:bg-slate-600">
							Hardware
						</div>
						<div class="space-y-3 p-3">
							<!-- Processor -->
							<div>
								<h4 class="mb-1.5 text-xs font-semibold text-slate-700 underline dark:text-slate-300">
									Processor
								</h4>
								<div class="space-y-0.5 text-xs">
									<div class="flex gap-2">
										<span class="w-36 shrink-0 text-slate-500 dark:text-slate-400">Processor Model Name</span>
										<span class="font-medium text-slate-800 dark:text-slate-200"
											>{reportData.system?.host_processor_model_name ?? 'Intel(R) Xeon(R) Platinum 8570'}</span
										>
									</div>
									<div class="flex gap-2">
										<span class="w-36 shrink-0 text-slate-500 dark:text-slate-400">Processors per Node</span>
										<span class="font-medium text-slate-800 dark:text-slate-200"
											>{reportData.system?.host_processors_per_node ?? '2'}</span
										>
									</div>
									<div class="flex gap-2">
										<span class="w-36 shrink-0 text-slate-500 dark:text-slate-400">Cores Per Processor</span>
										<span class="font-medium text-slate-800 dark:text-slate-200">56</span>
									</div>
									<div class="flex gap-2">
										<span class="w-36 shrink-0 text-slate-500 dark:text-slate-400">VCPUs Per Processor</span>
										<span class="font-medium text-slate-800 dark:text-slate-200">8</span>
									</div>
								</div>
							</div>

							<!-- Accelerator -->
							<div>
								<h4 class="mb-1.5 text-xs font-semibold text-slate-700 underline dark:text-slate-300">
									Accelerator
								</h4>
								<div class="space-y-0.5 text-xs">
									<div class="flex gap-2">
										<span class="w-36 shrink-0 text-slate-500 dark:text-slate-400">Accelerator Model Name</span>
										<span class="font-medium text-slate-800 dark:text-slate-200"
											>{reportData.system?.accelerator_model_name ?? 'NVIDIA B200-SXM-180GB'}</span
										>
									</div>
									<div class="flex gap-2">
										<span class="w-36 shrink-0 text-slate-500 dark:text-slate-400">Accelerators per Node</span>
										<span class="font-medium text-slate-800 dark:text-slate-200"
											>{reportData.system?.accelerators_per_node ?? '8'}</span
										>
									</div>
									<div class="flex gap-2">
										<span class="w-36 shrink-0 text-slate-500 dark:text-slate-400">Interconnect</span>
										<span class="font-medium text-slate-800 dark:text-slate-200"
											>18x 5th Gen NVLink, 14.4 TB/s aggregated bandwidth</span
										>
									</div>
									<div class="flex gap-2">
										<span class="w-36 shrink-0 text-slate-500 dark:text-slate-400">Memory</span>
										<span class="font-medium text-slate-800 dark:text-slate-200">HBM3e 180 GB</span>
									</div>
									<div class="flex gap-2">
										<span class="w-36 shrink-0 text-slate-500 dark:text-slate-400">Host Accelerator Interconnect</span>
										<span class="font-medium text-slate-800 dark:text-slate-200">PCIe Gen5 x16</span>
									</div>
								</div>
							</div>

							<!-- Section Title (Additional Hardware) -->
							<div>
								<h4 class="mb-1.5 text-xs font-semibold text-slate-700 underline dark:text-slate-300">
									Section Title
								</h4>
								<div class="space-y-0.5 text-xs">
									<div class="flex gap-2">
										<span class="w-36 shrink-0 text-slate-500 dark:text-slate-400">Host Memory Capacity</span>
										<span class="font-medium text-slate-800 dark:text-slate-200">{isNode2 ? '180 GB' : '2 TB'}</span>
									</div>
									<div class="flex gap-2">
										<span class="w-36 shrink-0 text-slate-500 dark:text-slate-400">Memory Configuration</span>
										<span class="font-medium text-slate-800 dark:text-slate-200">32x 64GB HMCG94AGBRA179N</span>
									</div>
									<div class="flex gap-2">
										<span class="w-36 shrink-0 text-slate-500 dark:text-slate-400">Network Interfaces</span>
										<span class="font-medium text-slate-800 dark:text-slate-200">10x 400Gbe Infiniband</span>
									</div>
									<div class="flex gap-2">
										<span class="w-36 shrink-0 text-slate-500 dark:text-slate-400">Network Details</span>
										<span class="font-medium text-slate-800 dark:text-slate-200"
											>Infiniband; Data bandwidth for GPU-PCIe: 504GB/s; PCIe-NIC: 500GB/s</span
										>
									</div>
									<div class="flex gap-2">
										<span class="w-36 shrink-0 text-slate-500 dark:text-slate-400">Storage Capacity</span>
										<span class="font-medium text-slate-800 dark:text-slate-200">2 TB SSD, 5 TB CIFS</span>
									</div>
									<div class="flex gap-2">
										<span class="w-36 shrink-0 text-slate-500 dark:text-slate-400">Storage Details</span>
										<span class="font-medium text-slate-800 dark:text-slate-200">NVMe SSD, CIFS mounted disk storage</span>
									</div>
									<div class="flex gap-2">
										<span class="w-36 shrink-0 text-slate-500 dark:text-slate-400">Other Hardware</span>
										<span class="font-medium text-slate-800 dark:text-slate-200">—</span>
									</div>
									<div class="flex gap-2">
										<span class="w-36 shrink-0 text-slate-500 dark:text-slate-400">Cooling</span>
										<span class="font-medium text-slate-800 dark:text-slate-200">Air-cooled</span>
									</div>
									<div class="flex gap-2">
										<span class="w-36 shrink-0 text-slate-500 dark:text-slate-400">Hardware Notes</span>
										<span class="font-medium text-slate-800 dark:text-slate-200">B200 TGP 1000W</span>
									</div>
								</div>
							</div>
						</div>

						<!-- Software Section -->
						<div class="bg-slate-500 px-3 py-1 text-xs font-semibold text-white dark:bg-slate-600">
							Software
						</div>
						<div class="space-y-0.5 p-3 text-xs">
							<div class="flex gap-2">
								<span class="w-36 shrink-0 text-slate-500 dark:text-slate-400">Framework</span>
								<span class="font-medium text-slate-800 dark:text-slate-200"
									>{reportData.system?.framework ?? 'TensorRT 10.11, CUDA 12.9'}</span
								>
							</div>
							<div class="flex gap-2">
								<span class="w-36 shrink-0 text-slate-500 dark:text-slate-400">Operating System</span>
								<span class="font-medium text-slate-800 dark:text-slate-200">Ubuntu 24.04</span>
							</div>
							<div class="flex gap-2">
								<span class="w-36 shrink-0 text-slate-500 dark:text-slate-400">Filesystem</span>
								<span class="font-medium text-slate-800 dark:text-slate-200">—</span>
							</div>
							<div class="flex gap-2">
								<span class="w-36 shrink-0 text-slate-500 dark:text-slate-400">Other Software</span>
								<span class="font-medium text-slate-800 dark:text-slate-200"
									>TensorRT 10.11, CUDA 12.9, cuDNN 9.10, Driver 570.148</span
								>
							</div>
							<div class="flex gap-2">
								<span class="w-36 shrink-0 text-slate-500 dark:text-slate-400">Software Notes</span>
								<span class="font-medium text-slate-800 dark:text-slate-200">—</span>
							</div>
						</div>
					</section>
				{/each}
			</div>

			<!-- Run Data Table -->
			<section class="overflow-hidden rounded border border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-800">
				<header class="bg-slate-700 px-3 py-1.5 text-sm font-semibold text-white dark:bg-slate-600">
					Run Data
				</header>
				<div class="overflow-x-auto">
					<table class="w-full text-xs">
						<thead>
							<tr class="border-b border-slate-200 bg-slate-50 dark:border-slate-600 dark:bg-slate-700">
								<th class="px-3 py-2 text-left font-semibold text-slate-700 dark:text-slate-200">Field Name</th>
								{#each displayRuns as run, i (run.run_id)}
									<th class="px-3 py-2 text-center font-semibold text-slate-700 dark:text-slate-200">Run {i + 1}</th>
								{/each}
							</tr>
						</thead>
						<tbody class="divide-y divide-slate-100 dark:divide-slate-700">
							<tr class="dark:hover:bg-slate-700/50"><td class="px-3 py-1.5 text-slate-600 dark:text-slate-400">Run Date</td>{#each displayRuns as run (run.run_id)}<td class="px-3 py-1.5 text-center text-slate-800 dark:text-slate-200">{getRunTableCell('run_date', run)}</td>{/each}</tr>
							<tr class="dark:hover:bg-slate-700/50"><td class="px-3 py-1.5 text-slate-600 dark:text-slate-400">Concurrency</td>{#each displayRuns as run (run.run_id)}<td class="px-3 py-1.5 text-center text-slate-800 dark:text-slate-200">{getRunTableCell('concurrency', run)}</td>{/each}</tr>
							<tr class="dark:hover:bg-slate-700/50"><td class="px-3 py-1.5 text-slate-600 dark:text-slate-400">System Tokens/Second</td>{#each displayRuns as run (run.run_id)}<td class="px-3 py-1.5 text-center text-slate-800 dark:text-slate-200">{getRunTableCell('system_tps', run)}</td>{/each}</tr>
							<tr class="dark:hover:bg-slate-700/50"><td class="px-3 py-1.5 text-slate-600 dark:text-slate-400">System Tokens/Second per User</td>{#each displayRuns as run (run.run_id)}<td class="px-3 py-1.5 text-center text-slate-800 dark:text-slate-200">{getRunTableCell('tps_per_user', run)}</td>{/each}</tr>
							<tr class="dark:hover:bg-slate-700/50"><td class="px-3 py-1.5 text-slate-600 dark:text-slate-400">Time To First Token P99</td>{#each displayRuns as run (run.run_id)}<td class="px-3 py-1.5 text-center text-slate-800 dark:text-slate-200">{getRunTableCell('ttft_p99', run)}</td>{/each}</tr>
							<tr class="dark:hover:bg-slate-700/50"><td class="px-3 py-1.5 text-slate-600 dark:text-slate-400">Queries/sec</td>{#each displayRuns as run (run.run_id)}<td class="px-3 py-1.5 text-center text-slate-800 dark:text-slate-200">—</td>{/each}</tr>
							<tr class="dark:hover:bg-slate-700/50"><td class="px-3 py-1.5 text-slate-600 dark:text-slate-400">Tokens/sec Utilization</td>{#each displayRuns as run (run.run_id)}<td class="px-3 py-1.5 text-center text-slate-800 dark:text-slate-200">{getRunTableCell('utilization', run)}</td>{/each}</tr>
							<tr class="dark:hover:bg-slate-700/50"><td class="px-3 py-1.5 text-slate-600 dark:text-slate-400">Total Output Tokens</td>{#each displayRuns as run (run.run_id)}<td class="px-3 py-1.5 text-center text-slate-800 dark:text-slate-200">—</td>{/each}</tr>
							<tr class="dark:hover:bg-slate-700/50"><td class="px-3 py-1.5 text-slate-600 dark:text-slate-400">Total Duration</td>{#each displayRuns as run (run.run_id)}<td class="px-3 py-1.5 text-center text-slate-800 dark:text-slate-200">—</td>{/each}</tr>
							<tr class="dark:hover:bg-slate-700/50"><td class="px-3 py-1.5 text-slate-600 dark:text-slate-400">Total Requests</td>{#each displayRuns as run (run.run_id)}<td class="px-3 py-1.5 text-center text-slate-800 dark:text-slate-200">—</td>{/each}</tr>
							<tr class="dark:hover:bg-slate-700/50"><td class="px-3 py-1.5 text-slate-600 dark:text-slate-400">TBD by DK</td>{#each displayRuns as run (run.run_id)}<td class="px-3 py-1.5 text-center text-slate-800 dark:text-slate-200">—</td>{/each}</tr>
							<tr class="dark:hover:bg-slate-700/50"><td class="px-3 py-1.5 text-slate-600 dark:text-slate-400">Configuration Summary</td>{#each displayRuns as run (run.run_id)}<td class="px-3 py-1.5 text-center text-slate-800 dark:text-slate-200">{getRunTableCell('config_detail', run)}</td>{/each}</tr>
							<tr class="dark:hover:bg-slate-700/50"><td class="px-3 py-1.5 text-slate-600 dark:text-slate-400">Link to Full Configuration</td>{#each displayRuns as run (run.run_id)}<td class="px-3 py-1.5 text-center text-slate-800 dark:text-slate-200">—</td>{/each}</tr>
							<tr class="dark:hover:bg-slate-700/50"><td class="px-3 py-1.5 text-slate-600 dark:text-slate-400">Link to Run Logs</td>{#each displayRuns as run (run.run_id)}<td class="px-3 py-1.5 text-center text-slate-800 dark:text-slate-200">—</td>{/each}</tr>
							<!-- TTFT Section -->
							<tr class="bg-slate-50 dark:bg-slate-700"><td class="px-3 py-1.5 font-semibold text-slate-700 dark:text-slate-200">TTFT</td>{#each displayRuns as run (run.run_id)}<td class="px-3 py-1.5"></td>{/each}</tr>
							<tr class="dark:hover:bg-slate-700/50"><td class="px-3 py-1.5 text-slate-600 dark:text-slate-400">Time To First Token Minimum</td>{#each displayRuns as run (run.run_id)}<td class="px-3 py-1.5 text-center text-slate-800 dark:text-slate-200">{getRunTableCell('ttft_min', run)}</td>{/each}</tr>
							<tr class="dark:hover:bg-slate-700/50"><td class="px-3 py-1.5 text-slate-600 dark:text-slate-400">Time To First Token Average</td>{#each displayRuns as run (run.run_id)}<td class="px-3 py-1.5 text-center text-slate-800 dark:text-slate-200">{getRunTableCell('ttft_avg', run)}</td>{/each}</tr>
							<tr class="dark:hover:bg-slate-700/50"><td class="px-3 py-1.5 text-slate-600 dark:text-slate-400">Time To First Token P50</td>{#each displayRuns as run (run.run_id)}<td class="px-3 py-1.5 text-center text-slate-800 dark:text-slate-200">{getRunTableCell('ttft_p50', run)}</td>{/each}</tr>
							<tr class="dark:hover:bg-slate-700/50"><td class="px-3 py-1.5 text-slate-600 dark:text-slate-400">Time To First Token P90</td>{#each displayRuns as run (run.run_id)}<td class="px-3 py-1.5 text-center text-slate-800 dark:text-slate-200">{getRunTableCell('ttft_p90', run)}</td>{/each}</tr>
							<tr class="dark:hover:bg-slate-700/50"><td class="px-3 py-1.5 text-slate-600 dark:text-slate-400">Time To First Token P95</td>{#each displayRuns as run (run.run_id)}<td class="px-3 py-1.5 text-center text-slate-800 dark:text-slate-200">{getRunTableCell('ttft_p95', run)}</td>{/each}</tr>
							<tr class="dark:hover:bg-slate-700/50"><td class="px-3 py-1.5 text-slate-600 dark:text-slate-400">Time To First Token P99</td>{#each displayRuns as run (run.run_id)}<td class="px-3 py-1.5 text-center text-slate-800 dark:text-slate-200">{getRunTableCell('ttft_p99_row', run)}</td>{/each}</tr>
							<tr class="dark:hover:bg-slate-700/50"><td class="px-3 py-1.5 text-slate-600 dark:text-slate-400">Time To First Token P999</td>{#each displayRuns as run (run.run_id)}<td class="px-3 py-1.5 text-center text-slate-800 dark:text-slate-200">{getRunTableCell('ttft_p999', run)}</td>{/each}</tr>
							<tr class="dark:hover:bg-slate-700/50"><td class="px-3 py-1.5 text-slate-600 dark:text-slate-400">Time To First Token Maximum</td>{#each displayRuns as run (run.run_id)}<td class="px-3 py-1.5 text-center text-slate-800 dark:text-slate-200">{getRunTableCell('ttft_max', run)}</td>{/each}</tr>
							<!-- TPOT Section -->
							<tr class="bg-slate-50 dark:bg-slate-700"><td class="px-3 py-1.5 font-semibold text-slate-700 dark:text-slate-200">TPOT</td>{#each displayRuns as run (run.run_id)}<td class="px-3 py-1.5"></td>{/each}</tr>
							<tr class="dark:hover:bg-slate-700/50"><td class="px-3 py-1.5 text-slate-600 dark:text-slate-400">Time Per Output Token Minimum</td>{#each displayRuns as run (run.run_id)}<td class="px-3 py-1.5 text-center text-slate-800 dark:text-slate-200">{getRunTableCell('tpot_min', run)}</td>{/each}</tr>
							<tr class="dark:hover:bg-slate-700/50"><td class="px-3 py-1.5 text-slate-600 dark:text-slate-400">Time Per Output Token P50</td>{#each displayRuns as run (run.run_id)}<td class="px-3 py-1.5 text-center text-slate-800 dark:text-slate-200">{getRunTableCell('tpot_p50', run)}</td>{/each}</tr>
							<tr class="dark:hover:bg-slate-700/50"><td class="px-3 py-1.5 text-slate-600 dark:text-slate-400">Time Per Output Token P90</td>{#each displayRuns as run (run.run_id)}<td class="px-3 py-1.5 text-center text-slate-800 dark:text-slate-200">{getRunTableCell('tpot_p90', run)}</td>{/each}</tr>
							<tr class="dark:hover:bg-slate-700/50"><td class="px-3 py-1.5 text-slate-600 dark:text-slate-400">Time Per Output Token P95</td>{#each displayRuns as run (run.run_id)}<td class="px-3 py-1.5 text-center text-slate-800 dark:text-slate-200">{getRunTableCell('tpot_p95', run)}</td>{/each}</tr>
							<tr class="dark:hover:bg-slate-700/50"><td class="px-3 py-1.5 text-slate-600 dark:text-slate-400">Time Per Output Token P99</td>{#each displayRuns as run (run.run_id)}<td class="px-3 py-1.5 text-center text-slate-800 dark:text-slate-200">{getRunTableCell('tpot_p99', run)}</td>{/each}</tr>
							<tr class="dark:hover:bg-slate-700/50"><td class="px-3 py-1.5 text-slate-600 dark:text-slate-400">Time Per Output Token P999</td>{#each displayRuns as run (run.run_id)}<td class="px-3 py-1.5 text-center text-slate-800 dark:text-slate-200">{getRunTableCell('tpot_p999', run)}</td>{/each}</tr>
							<tr class="dark:hover:bg-slate-700/50"><td class="px-3 py-1.5 text-slate-600 dark:text-slate-400">Time Per Output Token Maximum</td>{#each displayRuns as run (run.run_id)}<td class="px-3 py-1.5 text-center text-slate-800 dark:text-slate-200">{getRunTableCell('tpot_max', run)}</td>{/each}</tr>
						</tbody>
					</table>
				</div>
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
					href="/"
					class="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
				>
					View Benchmarks
				</a>
			</div>
		{/if}
	</main>
</div>
