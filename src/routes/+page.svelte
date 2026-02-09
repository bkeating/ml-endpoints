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
	import ConcurrencyHighlightCharts from './_components/ConcurrencyHighlightCharts.svelte';
	import SubmissionMiniChart from './_components/SubmissionMiniChart.svelte';
	import {
		isSystemVisible,
		getSelectedBenchmarkModelId,
		isSystemDisabledByAccelerator
	} from '$lib/stores/chartSettings.svelte.js';
	import { getTheme } from '$lib/stores/theme.svelte.js';

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
				color: system?.color ?? '#535869',
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

	/**
	 * Get the logo URL for a submission based on its model.
	 * @param {Object} submission - The submission object
	 * @returns {string} - Logo URL path
	 */
	function getModelLogoUrl(submission) {
		const model = endpointsData.models.find((m) => m.model_id === submission.model_id);
		return model?.logo_url ?? null;
	}

	/**
	 * Get the hardware logo URL for a submission based on its submitter organization.
	 * @param {Object} submission - The submission object
	 * @returns {string|null} - Logo URL path or null if not found
	 */
	function getHardwareLogoUrl(submission) {
		const orgName = submission.submitter_org_names?.toLowerCase() ?? '';
		const isDarkTheme = getTheme() === 'dark';
		if (orgName.includes('nvidia')) {
			return isDarkTheme ? '/logo-nvidia-dark.svg' : '/logo-nvidia.svg';
		}
		if (orgName.includes('amd')) {
			return isDarkTheme ? '/logo-amd-dark.svg' : '/logo-amd.svg';
		}
		if (orgName.includes('intel')) {
			// Assuming there's an Intel logo, otherwise return null
			return null;
		}
		return null;
	}

	// Get recent submissions for the carousel
	const recentSubmissions = getRecentSubmissions(endpointsData);

	// ============================================================================
	// SUBMISSION CARD CHART DATA
	// ============================================================================

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
		return system?.color ?? '#535869';
	}

	/**
	 * Get colors for both chart types and axis labels based on current theme (ML Commons palette).
	 * @returns {{ ttft: string, throughput: string, sysTps: string }} - Colors for light or dark theme
	 */
	let chartColors = $derived({
		ttft: getTheme() === 'dark' ? '#B3CEBA' : '#62826C',
		throughput: getTheme() === 'dark' ? '#A0B5DD' : '#37548A',
		sysTps: getTheme() === 'dark' ? '#BED3FB' : '#535869'
	});

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

		// Find min/max for normalization (each chart normalized independently)
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
	 * Generate sparkline paths for both TTFT and Throughput vs Interactivity charts.
	 * Each chart is normalized independently to preserve its original shape.
	 * @param {Array} runs - Array of run data
	 * @returns {{ ttft: { path: string, points: Array }, throughput: { path: string, points: Array } }}
	 */
	function generateDualSparklinePaths(runs) {
		return {
			ttft: generateSparklinePath(runs, 'ttft'),
			throughput: generateSparklinePath(runs, 'throughput')
		};
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

	// ============================================================================
	// MINI CHART VISIBILITY TOGGLES
	// ============================================================================

	/** Toggle visibility of TTFT data source on mini charts */
	let showTtft = $state(true);

	/** Toggle visibility of Throughput vs Interactivity data source on mini charts */
	let showThroughput = $state(true);

	// ============================================================================
	// CAROUSEL STATE
	// ============================================================================

	/** Number of cards to display at once */
	const CARDS_PER_PAGE = 4;

	/** Current carousel page index */
	let carouselPage = $state(0);

	/** Total number of carousel pages */
	let totalPages = $derived(Math.ceil(recentSubmissions.length / CARDS_PER_PAGE));

	/** Calculate the translate X percentage for the carousel */
	let carouselTranslateX = $derived(-(carouselPage * 100));

	/** Navigate to previous carousel page */
	function prevPage() {
		if (carouselPage > 0) carouselPage--;
	}

	/** Navigate to next carousel page */
	function nextPage() {
		if (carouselPage < totalPages - 1) carouselPage++;
	}

	/** Check if previous button should be disabled */
	let isPrevDisabled = $derived(carouselPage === 0);

	/** Check if next button should be disabled */
	let isNextDisabled = $derived(carouselPage >= totalPages - 1);
</script>

<!-- Side-by-side layout with filters sidebar and charts -->
<div class="mx-auto max-w-7xl px-3 pb-3 md:pt-9 bg-white dark:bg-slate-900 transition-colors duration-200">
	<div class="relative flex flex-col gap-6 lg:flex-row">
		<!-- Chart Filters Sidebar (hidden on mobile) -->
		<GtcChartFiltersSidebar />

		<!-- Charts area -->
		<div class="min-w-0 flex-1">
			<!-- Small page hero -->
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
					MLPerf Endpoints turns complex AI benchmark data into clear, interactive visualizations
					that reveal performance trade-offs at a glance. Compare systems, understand what you're
					acquiring, and make confident infrastructure decisions.
				</p>
			</header>

			<!-- Chart 1: System Throughput vs Interactivity - Full width -->
			<GtcChartSection chart={throughputVsInteractivityChart} lineType="step" />

			<!-- Remaining 3 charts with 2-up layout on md+ -->
			<div class="mt-6 flex flex-col gap-6">
				<div class="grid gap-6 md:grid-cols-2">
					<!-- Chart 2: Throughput vs Concurrency -->
					<GtcChartSection chart={throughputVsConcurrencyChart} lineType="step" />
					<!-- Chart 3: Capacity Utilization -->
					<GtcChartSection chart={capacityUtilizationChart} lineType="step" />
				</div>
				<!-- Chart 4: Per-User Performance -->
				<GtcChartSection chart={perUserPerformanceChart} lineType="step" />
			</div>
		</div>
	</div>

  <ConcurrencyHighlightCharts curves={filteredParetoCurves.filter((curve) => isSystemDisplayed(curve))} />


	<!-- Most Recent Submissions -->
	<section class="mt-12 pt-8" aria-label="Most recent submissions">
		<div class="flex flex-col gap-6">
			<!-- Top: Heading and inline legend -->
			<div class="flex items-center justify-between">
				<h2 class="text-2xl font-semibold text-slate-700 dark:text-white">Most Recent Submissions</h2>
				<!-- Inline legend, axis toggle, and carousel navigation -->
				<div class="flex items-center gap-4" role="group" aria-label="Chart legend">
					<button
						type="button"
						class="flex items-center gap-2 transition-opacity {showTtft ? 'opacity-100' : 'opacity-40'}"
						onclick={() => showTtft = !showTtft}
						aria-pressed={showTtft}
						aria-label="Toggle TTFT data"
					>
						<div
							class="h-3 w-3 rounded-full"
							style="background-color: {chartColors.ttft}"
						></div>
						<span class="text-sm font-medium text-slate-700 dark:text-slate-300">TTFT</span>
					</button>
					<button
						type="button"
						class="flex items-center gap-2 transition-opacity {showThroughput ? 'opacity-100' : 'opacity-40'}"
						onclick={() => showThroughput = !showThroughput}
						aria-pressed={showThroughput}
						aria-label="Toggle Throughput vs Interactivity data"
					>
						<div
							class="h-3 w-3 rounded-full"
							style="background-color: {chartColors.throughput}"
						></div>
						<span class="text-sm font-medium text-slate-700 dark:text-slate-300">Thru vs Int</span>
					</button>
					<!-- Carousel navigation -->
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
							class="flex h-7 w-7 items-center justify-center rounded-md border  cursor-pointer {isNextDisabled ? 'border-slate-200 bg-slate-50 text-slate-300 cursor-not-allowed dark:border-slate-700 dark:bg-slate-800 dark:text-slate-600' : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'}"
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

			<!-- Bottom: Four-column carousel of cards -->
			<div class="relative overflow-hidden">
				<div
					class="flex transition-transform duration-300 ease-out"
					style="transform: translateX({carouselTranslateX}%)"
				>
					{#each { length: totalPages } as _, pageIndex (pageIndex)}
						<div class="grid w-full shrink-0 grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
							{#each recentSubmissions.slice(pageIndex * CARDS_PER_PAGE, (pageIndex + 1) * CARDS_PER_PAGE) as submission (submission.submission_id)}
								{@const runs = getRunsForSubmission(submission.submission_id)}
								{@const modelLogoUrl = getModelLogoUrl(submission)}
								{@const hardwareLogoUrl = getHardwareLogoUrl(submission)}
								<a
									href="/report?submission={submission.submission_id}"
									class="group relative flex flex-col overflow-hidden rounded-lg border border-slate-200 transition-shadow hover:shadow-lg dark:border-slate-700"
								>
									<!-- Interactive mini chart with crosshair and tooltip -->
									<SubmissionMiniChart
										{runs}
										submissionId={submission.submission_id}
										{showTtft}
										{showThroughput}
										{chartColors}
									/>

									<!-- Footer bar -->
									<div class="relative z-10 bg-white/95 backdrop-blur-sm border-t border-slate-200/50 px-3 py-3 dark:bg-slate-800/95 dark:border-slate-700/50">
										<!-- Model Name (left) | Hardware Logo | Model Logo (right) -->
										<div class="flex items-center justify-between">
											<span class="text-sm font-medium dm-mono-medium shadow-xs dark:text-[#c9b856] bg-[#CCEBD460] text-[#343b36] border-[#9ebba5] dark:bg-[#736628]/20 border dark:border-[#736628] px-2 rounded">{submission.model_name}</span>
											<div class="flex items-center gap-2 opacity-75">
												{#if hardwareLogoUrl}
													<img src={hardwareLogoUrl} alt="Hardware Logo" class="max-w-14 max-h-5 grayscale dark:invert" />
												{/if}
												{#if modelLogoUrl}
													<img src={modelLogoUrl} alt="Model Logo" class="max-w-16 max-h-5 dark:invert grayscale" />
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

	<!-- Concurrency Highlight Charts -->
</div>
