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
</script>

<!-- Report Page Layout -->
<div class="min-h-screen bg-slate-50 dark:bg-slate-900">
	<!-- Header Navigation -->
	<header
		class="sticky top-0 z-10 border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-800"
	>
		<div class="mx-auto flex max-w-7xl items-center justify-between gap-4">
			<!-- Left: Navigation & Title -->
			<div class="flex min-w-0 flex-1 items-center gap-3">
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
				<div class="min-w-0 flex-1">
					<h1 class="truncate text-base font-semibold text-slate-800 dark:text-white sm:text-lg">
						Report Name: {reportData?.system?.system_name ?? 'Loading...'}
					</h1>
				</div>
			</div>

			<!-- Right: Submission Metadata -->
			<div class="hidden text-right text-sm text-slate-500 dark:text-slate-400 md:block">
				<div>
					<span class="text-slate-400">Submitter</span>
					<span class="ml-2 font-medium text-slate-700 dark:text-slate-200"
						>{reportData?.submission?.submitter_org_names ?? '—'}</span
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
		<!-- Back Link -->
		<a
			href="/benchmarks/gtc"
			class="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
		>
			<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
				<path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
			</svg>
			Back to Benchmarks
		</a>

		<h2 class="mb-6 text-xl font-bold text-slate-800 dark:text-white">Report Details</h2>

		{#if reportData}
			<!-- Two-column layout: Details + Charts -->
			<div class="grid gap-6 lg:grid-cols-3">
				<!-- Left Column: Report Details (2/3 width on desktop) -->
				<div class="space-y-4 lg:col-span-2">
					<!-- SUT Summary Card -->
					<section class="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
						<header class="bg-slate-600 px-4 py-2 text-sm font-semibold text-white">
							SUT Summary
						</header>
						<div class="grid gap-4 p-4 sm:grid-cols-2">
							<div class="space-y-2">
								<div class="flex gap-2 text-sm">
									<span class="w-32 shrink-0 text-slate-500 dark:text-slate-400">System Name</span>
									<span class="font-medium text-slate-800 dark:text-slate-200"
										>{reportData.system?.system_name ?? '—'}</span
									>
								</div>
								<div class="flex gap-2 text-sm">
									<span class="w-32 shrink-0 text-slate-500 dark:text-slate-400">System Type</span>
									<span class="font-medium text-slate-800 dark:text-slate-200"
										>{reportData.system?.system_category ?? '—'}</span
									>
								</div>
								<div class="flex gap-2 text-sm">
									<span class="w-32 shrink-0 text-slate-500 dark:text-slate-400">System Type Detail</span>
									<span class="font-medium text-slate-800 dark:text-slate-200">Cloud</span>
								</div>
								<div class="flex gap-2 text-sm">
									<span class="w-32 shrink-0 text-slate-500 dark:text-slate-400">System Availability</span>
									<span class="font-medium text-slate-800 dark:text-slate-200"
										>{reportData.system?.system_availability_status ?? '—'}</span
									>
								</div>
							</div>
							<div class="space-y-2">
								<div class="flex gap-2 text-sm">
									<span class="w-36 shrink-0 text-slate-500 dark:text-slate-400">Total Node Count</span>
									<span class="font-medium text-slate-800 dark:text-slate-200">2</span>
								</div>
								<div class="flex gap-2 text-sm">
									<span class="w-36 shrink-0 text-slate-500 dark:text-slate-400">Node Ensemble Total</span>
									<span class="font-medium text-slate-800 dark:text-slate-200">48</span>
								</div>
								<div class="flex gap-2 text-sm">
									<span class="w-36 shrink-0 text-slate-500 dark:text-slate-400">Node Ensemble ID</span>
									<span class="font-medium text-slate-800 dark:text-slate-200">1</span>
								</div>
								<div class="flex gap-2 text-sm">
									<span class="w-36 shrink-0 text-slate-500 dark:text-slate-400">Number of Nodes</span>
									<span class="font-medium text-slate-800 dark:text-slate-200"
										>{reportData.system?.number_of_nodes ?? '—'}</span
									>
								</div>
							</div>
						</div>
					</section>

					<!-- Hardware & Software Row -->
					<div class="grid gap-4 md:grid-cols-2">
						<!-- Hardware Card -->
						<section class="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
							<header class="bg-slate-600 px-4 py-2 text-sm font-semibold text-white">
								Hardware
							</header>
							<div class="space-y-4 p-4">
								<!-- Processor Section -->
								<div>
									<h4 class="mb-2 text-sm font-semibold text-slate-700 underline dark:text-slate-300">
										Processor
									</h4>
									<div class="space-y-1 text-sm">
										<div class="flex gap-2">
											<span class="w-36 shrink-0 text-slate-500 dark:text-slate-400"
												>Processor Model Name</span
											>
											<span class="font-medium text-slate-800 dark:text-slate-200"
												>{reportData.system?.host_processor_model_name ?? '—'}</span
											>
										</div>
										<div class="flex gap-2">
											<span class="w-36 shrink-0 text-slate-500 dark:text-slate-400"
												>Processors per Node</span
											>
											<span class="font-medium text-slate-800 dark:text-slate-200"
												>{reportData.system?.host_processors_per_node ?? '—'}</span
											>
										</div>
										<div class="flex gap-2">
											<span class="w-36 shrink-0 text-slate-500 dark:text-slate-400"
												>Processor Core Count</span
											>
											<span class="font-medium text-slate-800 dark:text-slate-200">56</span>
										</div>
										<div class="flex gap-2">
											<span class="w-36 shrink-0 text-slate-500 dark:text-slate-400"
												>Processor VCPU Count</span
											>
											<span class="font-medium text-slate-800 dark:text-slate-200">8</span>
										</div>
									</div>
								</div>

								<!-- Accelerator Section -->
								<div>
									<h4 class="mb-2 text-sm font-semibold text-slate-700 underline dark:text-slate-300">
										Accelerator
									</h4>
									<div class="space-y-1 text-sm">
										<div class="flex gap-2">
											<span class="w-36 shrink-0 text-slate-500 dark:text-slate-400"
												>Accelerator Model Name</span
											>
											<span class="font-medium text-slate-800 dark:text-slate-200"
												>{reportData.system?.accelerator_model_name ?? '—'}</span
											>
										</div>
										<div class="flex gap-2">
											<span class="w-36 shrink-0 text-slate-500 dark:text-slate-400"
												>Accelerators per Node</span
											>
											<span class="font-medium text-slate-800 dark:text-slate-200"
												>{reportData.system?.accelerators_per_node ?? '—'}</span
											>
										</div>
										<div class="flex gap-2">
											<span class="w-36 shrink-0 text-slate-500 dark:text-slate-400"
												>Host Interconnect</span
											>
											<span class="font-medium text-slate-800 dark:text-slate-200">PCIe Gen5</span>
										</div>
										<div class="flex gap-2">
											<span class="w-36 shrink-0 text-slate-500 dark:text-slate-400">Interconnect</span>
											<span class="font-medium text-slate-800 dark:text-slate-200"
												>18x 5th Gen NVLink, 14.4 TB/s aggregated bandwidth</span
											>
										</div>
										<div class="flex gap-2">
											<span class="w-36 shrink-0 text-slate-500 dark:text-slate-400">Memory Type</span>
											<span class="font-medium text-slate-800 dark:text-slate-200"
												>{reportData.system?.accelerator_memory_type ?? '—'}</span
											>
										</div>
										<div class="flex gap-2">
											<span class="w-36 shrink-0 text-slate-500 dark:text-slate-400"
												>Memory Capacity</span
											>
											<span class="font-medium text-slate-800 dark:text-slate-200"
												>{reportData.system?.accelerator_memory_capacity ?? '—'}</span
											>
										</div>
									</div>
								</div>

								<!-- Additional Hardware Section -->
								<div>
									<h4 class="mb-2 text-sm font-semibold text-slate-700 underline dark:text-slate-300">
										Additional Hardware
									</h4>
									<div class="space-y-1 text-sm">
										<div class="flex gap-2">
											<span class="w-36 shrink-0 text-slate-500 dark:text-slate-400"
												>Memory Capacity</span
											>
											<span class="font-medium text-slate-800 dark:text-slate-200"
												>{reportData.system?.accelerator_memory_capacity ?? '—'}</span
											>
										</div>
										<div class="flex gap-2">
											<span class="w-36 shrink-0 text-slate-500 dark:text-slate-400"
												>Memory Configuration</span
											>
											<span class="font-medium text-slate-800 dark:text-slate-200"
												>32x 64GB HMCG94AGBRA179N</span
											>
										</div>
										<div class="flex gap-2">
											<span class="w-36 shrink-0 text-slate-500 dark:text-slate-400"
												>Network Card Count</span
											>
											<span class="font-medium text-slate-800 dark:text-slate-200"
												>10x 400Gbe Infiniband</span
											>
										</div>
										<div class="flex gap-2">
											<span class="w-36 shrink-0 text-slate-500 dark:text-slate-400"
												>Host Networking</span
											>
											<span class="font-medium text-slate-800 dark:text-slate-200"
												>Infiniband; Data bandwidth for GPU-PCIe: 504GB/s; PCIe-NIC: 500GB/s</span
											>
										</div>
										<div class="flex gap-2">
											<span class="w-36 shrink-0 text-slate-500 dark:text-slate-400"
												>Host Storage Capacity</span
											>
											<span class="font-medium text-slate-800 dark:text-slate-200"
												>2 TB SSD, 5 TB CIFS</span
											>
										</div>
										<div class="flex gap-2">
											<span class="w-36 shrink-0 text-slate-500 dark:text-slate-400"
												>Host Storage Type</span
											>
											<span class="font-medium text-slate-800 dark:text-slate-200"
												>NVMe SSD, CIFS mounted disk storage</span
											>
										</div>
										<div class="flex gap-2">
											<span class="w-36 shrink-0 text-slate-500 dark:text-slate-400"
												>Other Hardware</span
											>
											<span class="font-medium text-slate-800 dark:text-slate-200">—</span>
										</div>
										<div class="flex gap-2">
											<span class="w-36 shrink-0 text-slate-500 dark:text-slate-400">Cooling</span>
											<span class="font-medium text-slate-800 dark:text-slate-200">Air-cooled</span>
										</div>
										<div class="flex gap-2">
											<span class="w-36 shrink-0 text-slate-500 dark:text-slate-400">HW Notes</span>
											<span class="font-medium text-slate-800 dark:text-slate-200">B200 TGP 1000W</span>
										</div>
									</div>
								</div>
							</div>
						</section>

						<!-- Software, Model, Datasets Column -->
						<div class="space-y-4">
							<!-- Software Card -->
							<section class="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
								<header class="bg-slate-600 px-4 py-2 text-sm font-semibold text-white">
									Software
								</header>
								<div class="space-y-2 p-4 text-sm">
									<div class="flex gap-2">
										<span class="w-32 shrink-0 text-slate-500 dark:text-slate-400">Framework</span>
										<span class="font-medium text-slate-800 dark:text-slate-200"
											>{reportData.system?.framework ?? '—'}</span
										>
									</div>
									<div class="flex gap-2">
										<span class="w-32 shrink-0 text-slate-500 dark:text-slate-400">Operating System</span>
										<span class="font-medium text-slate-800 dark:text-slate-200">Ubuntu 24.04</span>
									</div>
									<div class="flex gap-2">
										<span class="w-32 shrink-0 text-slate-500 dark:text-slate-400">File System</span>
										<span class="font-medium text-slate-800 dark:text-slate-200">—</span>
									</div>
									<div class="flex gap-2">
										<span class="w-32 shrink-0 text-slate-500 dark:text-slate-400"
											>Other Software Stack</span
										>
										<span class="font-medium text-slate-800 dark:text-slate-200"
											>TensorRT 10.11, CUDA 12.9, cuDNN 9.10, Driver 570.148</span
										>
									</div>
									<div class="flex gap-2">
										<span class="w-32 shrink-0 text-slate-500 dark:text-slate-400">Software Notes</span>
										<span class="font-medium text-slate-800 dark:text-slate-200">—</span>
									</div>
								</div>
							</section>

							<!-- Model Card -->
							<section class="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
								<header class="bg-slate-600 px-4 py-2 text-sm font-semibold text-white">Model</header>
								<div class="space-y-2 p-4 text-sm">
									<div class="flex gap-2">
										<span class="w-40 shrink-0 text-slate-500 dark:text-slate-400">Division</span>
										<span class="font-medium text-slate-800 dark:text-slate-200"
											>{reportData.submission?.division ?? '—'}</span
										>
									</div>
									<div class="flex gap-2">
										<span class="w-40 shrink-0 text-slate-500 dark:text-slate-400">Model Name</span>
										<span class="font-medium text-slate-800 dark:text-slate-200"
											>{reportData.model?.model_name ?? '—'}</span
										>
									</div>
									<div class="flex gap-2">
										<span class="w-40 shrink-0 text-slate-500 dark:text-slate-400">Model Link</span>
										<span class="font-medium text-slate-800 dark:text-slate-200">—</span>
									</div>
									<div class="flex gap-2">
										<span class="w-40 shrink-0 text-slate-500 dark:text-slate-400"
											>Model Transformation Link</span
										>
										<span class="font-medium text-slate-800 dark:text-slate-200">—</span>
									</div>
									<div class="flex gap-2">
										<span class="w-40 shrink-0 text-slate-500 dark:text-slate-400">Model Notes</span>
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
										<span class="w-40 shrink-0 text-slate-500 dark:text-slate-400">Dataset ID</span>
										<span class="font-medium text-slate-800 dark:text-slate-200">—</span>
									</div>
									<div class="flex gap-2">
										<span class="w-40 shrink-0 text-slate-500 dark:text-slate-400">Dataset Name</span>
										<span class="font-medium text-slate-800 dark:text-slate-200"
											>{reportData.submission?.dataset_name ?? '—'}</span
										>
									</div>
									<div class="flex gap-2">
										<span class="w-40 shrink-0 text-slate-500 dark:text-slate-400">Dataset Type</span>
										<span class="font-medium text-slate-800 dark:text-slate-200">Both</span>
									</div>
									<div class="flex gap-2">
										<span class="w-40 shrink-0 text-slate-500 dark:text-slate-400">Dataset Link</span>
										<span class="font-medium text-slate-800 dark:text-slate-200">—</span>
									</div>
									<div class="flex gap-2">
										<span class="w-40 shrink-0 text-slate-500 dark:text-slate-400"
											>Measured Accuracy Score</span
										>
										<span class="font-medium text-slate-800 dark:text-slate-200">—</span>
									</div>
								</div>
							</section>
						</div>
					</div>
				</div>

				<!-- Right Column: Charts (1/3 width on desktop) -->
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
				</div>
			</div>

			<!-- Bottom: Full-width Chart/Grid Section -->
			<section class="mt-6">
				<div
					class="flex aspect-2/1 items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-800"
				>
					<div class="text-center text-slate-400 dark:text-slate-500">
						<svg
							class="mx-auto h-16 w-16"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							stroke-width="1"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
							/>
						</svg>
						<p class="mt-2 text-sm font-medium">Chart / Grid</p>
					</div>
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
					href="/benchmarks/gtc"
					class="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
				>
					View Benchmarks
				</a>
			</div>
		{/if}
	</main>
</div>
