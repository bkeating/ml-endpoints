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
	import ChevronLeft from '$lib/components/icons/ChevronLeft.svelte';
	import ChevronRight from '$lib/components/icons/ChevronRight.svelte';
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
	 * Get the most recent submissions sorted by submission date.
	 * @param {typeof endpointsData} data - The endpoints benchmark data
	 * @param {number} limit - Maximum number of submissions to return
	 * @returns {Array} - Recent submissions sorted by date descending
	 */
	function getRecentSubmissions(data, limit = 10) {
		return [...data.submissions]
			.sort((a, b) => new Date(b.submission_date) - new Date(a.submission_date))
			.slice(0, limit);
	}

	/**
	 * Format a date string to a human-readable format.
	 * @param {string} dateStr - ISO date string (e.g., "2026-01-21")
	 * @returns {string} - Formatted date (e.g., "January 21, 2026")
	 */
	function formatDate(dateStr) {
		return new Date(dateStr).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}

	// Get recent submissions for the carousel
	const recentSubmissions = getRecentSubmissions(endpointsData);

	// ============================================================================
	// SUBMISSION CARD CHART TOGGLE
	// ============================================================================

	/** @type {'ttft' | 'throughput'} */
	let cardChartType = $state('ttft');

	/**
	 * Get runs for a specific submission.
	 * @param {string} submissionId - The submission ID
	 * @returns {Array} - Runs sorted by concurrency
	 */
	function getRunsForSubmission(submissionId) {
		return endpointsData.runs
			.filter((r) => r.submission_id === submissionId)
			.sort((a, b) => a.concurrency - b.concurrency);
	}

	/**
	 * Get the system color for a submission.
	 * @param {string} systemId - The system ID
	 * @returns {string} - Hex color
	 */
	function getSystemColor(systemId) {
		const system = endpointsData.systems.find((s) => s.id === systemId);
		return system?.color ?? '#64748b';
	}

	/**
	 * Generate an SVG path for a mini sparkline chart.
	 * Normalizes data to fit within the viewBox.
	 * @param {Array} runs - Array of run data
	 * @param {'ttft' | 'throughput'} chartType - Which chart type to render
	 * @returns {{ path: string, points: Array<{x: number, y: number}> }}
	 */
	function generateSparklinePath(runs, chartType) {
		if (!runs || runs.length < 2) return { path: '', points: [] };

		// Get x and y values based on chart type
		const points = runs.map((run) => {
			if (chartType === 'ttft') {
				// TTFT chart: X = ttft, Y = system_tps
				return { x: run.ttft, y: run.system_tps };
			} else {
				// Throughput vs Interactivity: X = tps_per_user, Y = system_tps
				return { x: run.tps_per_user, y: run.system_tps };
			}
		});

		// Sort by x value for proper line drawing
		points.sort((a, b) => a.x - b.x);

		// Find min/max for normalization
		const xMin = Math.min(...points.map((p) => p.x));
		const xMax = Math.max(...points.map((p) => p.x));
		const yMin = Math.min(...points.map((p) => p.y));
		const yMax = Math.max(...points.map((p) => p.y));

		// Avoid division by zero
		const xRange = xMax - xMin || 1;
		const yRange = yMax - yMin || 1;

		// Normalize to viewBox (0-100 with padding)
		const padding = 5;
		const width = 100 - padding * 2;
		const height = 100 - padding * 2;

		const normalizedPoints = points.map((p) => ({
			x: padding + ((p.x - xMin) / xRange) * width,
			y: padding + height - ((p.y - yMin) / yRange) * height // Flip Y axis
		}));

		// Generate SVG path
		const path = normalizedPoints
			.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
			.join(' ');

		return { path, points: normalizedPoints };
	}

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

	<!-- Most Recent Submissions Carousel -->
	<section class="mt-12 border-t border-slate-200 pt-8 dark:border-slate-700" aria-label="Most recent submissions">
		<div class="mb-6 flex items-center justify-between">
			<h2 class="text-xl font-semibold text-slate-700 dark:text-white">Most Recent Submissions</h2>
			<div class="flex items-center gap-4">
				<!-- Chart type toggle -->
				<div class="flex rounded-lg border border-slate-200 p-0.5 dark:border-slate-600" role="group" aria-label="Chart type">
					<button
						type="button"
						onclick={() => cardChartType = 'ttft'}
						class="rounded-md px-3 py-1.5 text-sm font-medium transition-colors {cardChartType === 'ttft' ? 'bg-[#CCEBD4] text-slate-800 dark:bg-[#736628] dark:text-white' : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'}"
					>
						TTFT
					</button>
					<button
						type="button"
						onclick={() => cardChartType = 'throughput'}
						class="rounded-md px-3 py-1.5 text-sm font-medium transition-colors {cardChartType === 'throughput' ? 'bg-[#CCEBD4] text-slate-800 dark:bg-[#736628] dark:text-white' : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'}"
					>
						Throughput vs Interactivity
					</button>
				</div>

				<!-- Navigation arrows -->
				<div class="flex gap-1">
					<button
						type="button"
						class="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200"
						aria-label="Scroll left"
					>
						<ChevronLeft class="h-5 w-5" />
					</button>
					<button
						type="button"
						class="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200"
						aria-label="Scroll right"
					>
						<ChevronRight class="h-5 w-5" />
					</button>
				</div>
			</div>
		</div>

		<div class="relative">
			<!-- Carousel container -->
			<div class="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
				{#each recentSubmissions as submission (submission.submission_id)}
					{@const runs = getRunsForSubmission(submission.submission_id)}
					{@const systemColor = getSystemColor(submission.system_id)}
					{@const sparkline = generateSparklinePath(runs, cardChartType)}
					<a
						href="/benchmarks/gtc/report?submission={submission.submission_id}"
						class="group relative flex min-w-[340px] shrink-0 overflow-hidden rounded-lg border border-slate-200 transition-shadow hover:shadow-lg dark:border-slate-700"
					>
						<!-- Mini chart background -->
						<div class="absolute inset-0">
							<svg viewBox="0 0 100 100" preserveAspectRatio="none" class="h-full w-full">
								<!-- Gradient fill under the line -->
								<defs>
									<linearGradient id="cardGradient-{submission.submission_id}" x1="0%" y1="0%" x2="0%" y2="100%">
										<stop offset="0%" style="stop-color: {systemColor}; stop-opacity: 0.15" />
										<stop offset="100%" style="stop-color: {systemColor}; stop-opacity: 0.02" />
									</linearGradient>
								</defs>
								{#if sparkline.path}
									<!-- Area fill -->
									<path
										d="{sparkline.path} L 100 100 L 0 100 Z"
										fill="url(#cardGradient-{submission.submission_id})"
										style="transition: d 500ms ease-out"
									/>
									<!-- Line -->
									<path
										d={sparkline.path}
										fill="none"
										stroke={systemColor}
										stroke-width="2"
										stroke-linecap="round"
										stroke-linejoin="round"
										vector-effect="non-scaling-stroke"
										style="transition: d 500ms ease-out"
									/>
								{/if}
							</svg>
						</div>

						<!-- Content overlay -->
						<div class="relative z-10 flex flex-col justify-between bg-linear-to-r from-white/80 via-white/50 to-transparent p-4 dark:from-slate-800/80 dark:via-slate-800/50">
							<div class="flex flex-col gap-0.5">
								<span class="text-xs font-medium text-slate-500 dark:text-slate-400">Submitter</span>
								<span class="font-semibold text-slate-800 dark:text-white">{submission.submitter_org_names}</span>
							</div>

							<div class="mt-3 flex flex-col gap-0.5">
								<span class="text-xs font-medium text-slate-500 dark:text-slate-400">Submission Date</span>
								<span class="text-sm text-slate-700 dark:text-slate-300">{formatDate(submission.submission_date)}</span>
							</div>

							<div class="mt-3 flex flex-col gap-0.5">
								<span class="text-xs font-medium text-slate-500 dark:text-slate-400">Model</span>
								<span class="text-sm text-slate-700 dark:text-slate-300">{submission.model_name}</span>
							</div>
						</div>

						<!-- Color accent bar -->
						<div
							class="absolute bottom-0 left-0 h-1 w-full"
							style="background-color: {systemColor}"
						></div>
					</a>
				{/each}
			</div>
		</div>
	</section>
</div>
