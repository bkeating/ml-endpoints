<script>
	/**
	 * ConcurrencyHighlightCharts - Interactive multi-chart component
	 *
	 * Displays 6 mini charts with a shared concurrency slider.
	 * Moving the slider updates a vertical red dashed line and
	 * left-side muted overlay on all charts reactively.
	 */

	/** @type {{ curves: Array<{id: string, name: string, color: string, runs: Array}> }} */
	let { curves = [] } = $props();

	// Concurrency slider state - log scale from 1 to 50
	let sliderValue = $state(10);

	// Chart definitions with their data accessors
	const chartConfigs = [
		{
			id: 'system-tps',
			title: 'System Tok/Sec',
			yAccessor: (run) => run.system_tps,
			yLabel: 'Tok/s'
		},
		{
			id: 'ttft',
			title: 'TTFT P99',
			yAccessor: (run) => run.ttft,
			yLabel: 'Seconds'
		},
		{
			id: 'tps-per-user',
			title: 'System Tok/Sec/User',
			yAccessor: (run) => run.tps_per_user,
			yLabel: 'Tok/s/user'
		},
		{
			id: 'throughput',
			title: 'Throughput (Tok/Sec)',
			yAccessor: (run) => run.system_tps,
			yLabel: 'Tok/s'
		},
		{
			id: 'latency',
			title: 'Latency (TTFT P99)',
			yAccessor: (run) => run.ttft,
			yLabel: 'Seconds'
		},
		{
			id: 'interactivity',
			title: 'Interactivity (Tok/Sec/User)',
			yAccessor: (run) => run.tps_per_user,
			yLabel: 'Tok/s/user'
		}
	];

	// Log scale tick marks for the slider
	const tickMarks = [1, 5, 10, 50];

	/**
	 * Format a metric value for display in the chart header.
	 * Uses the config's yAccessor against metricsAtConcurrency.
	 * @param {Object} config - Chart configuration with yAccessor
	 * @returns {string} - Formatted value or empty string if unavailable
	 */
	function getHeaderValue(config) {
		if (!metricsAtConcurrency) return '';
		const val = config.yAccessor(metricsAtConcurrency);
		if (val == null) return '';
		// TTFT values are small decimals (seconds), show 3 decimal places
		return val < 1 ? val.toFixed(3) : val.toLocaleString('en-US', { maximumFractionDigits: 0 });
	}

	/**
	 * Convert slider value to percentage position (log scale)
	 * @param {number} value - The concurrency value
	 * @returns {number} - Percentage position (0-100)
	 */
	function valueToPercent(value) {
		const minLog = Math.log10(1);
		const maxLog = Math.log10(50);
		const valueLog = Math.log10(Math.max(1, value));
		return ((valueLog - minLog) / (maxLog - minLog)) * 100;
	}

	/**
	 * Convert percentage to slider value (log scale)
	 * @param {number} percent - Percentage position (0-100)
	 * @returns {number} - The concurrency value
	 */
	function percentToValue(percent) {
		const minLog = Math.log10(1);
		const maxLog = Math.log10(50);
		const valueLog = minLog + (percent / 100) * (maxLog - minLog);
		return Math.pow(10, valueLog);
	}

	// Derived percentage for the slider position
	let sliderPercent = $derived(valueToPercent(sliderValue));

	/**
	 * Get metrics at the current concurrency level.
	 * Interpolates between nearest data points if exact match not found.
	 * @param {Array} runs - Array of run data sorted by concurrency
	 * @param {number} targetConcurrency - The target concurrency value
	 * @returns {Object|null} - Interpolated metrics or null
	 */
	function getMetricsAtConcurrency(runs, targetConcurrency) {
		if (!runs || runs.length === 0) return null;

		// Find exact match or nearest points for interpolation
		const sorted = [...runs].sort((a, b) => a.concurrency - b.concurrency);

		// Check for exact match
		const exact = sorted.find(r => r.concurrency === targetConcurrency);
		if (exact) return exact;

		// Find surrounding points for interpolation
		let lower = null;
		let upper = null;

		for (const run of sorted) {
			if (run.concurrency <= targetConcurrency) {
				lower = run;
			} else if (run.concurrency > targetConcurrency && !upper) {
				upper = run;
				break;
			}
		}

		// If no interpolation possible, return nearest
		if (!lower && upper) return upper;
		if (lower && !upper) return lower;
		if (!lower && !upper) return null;

		// Linear interpolation
		const ratio = (targetConcurrency - lower.concurrency) / (upper.concurrency - lower.concurrency);

		return {
			concurrency: targetConcurrency,
			system_tps: lower.system_tps + ratio * (upper.system_tps - lower.system_tps),
			tps_per_user: lower.tps_per_user + ratio * (upper.tps_per_user - lower.tps_per_user),
			ttft: lower.ttft + ratio * (upper.ttft - lower.ttft),
			utilization: lower.utilization + ratio * (upper.utilization - lower.utilization)
		};
	}

	/**
	 * Compute aggregated metrics at current slider position.
	 */
	let metricsAtConcurrency = $derived.by(() => {
		if (curves.length === 0) return null;

		// Round to whole number for snapping behavior
		const roundedConcurrency = Math.round(sliderValue);

		// Get metrics from first visible curve with data
		for (const curve of curves) {
			const metrics = getMetricsAtConcurrency(curve.runs, roundedConcurrency);
			if (metrics) return metrics;
		}
		return null;
	});

	/**
	 * Generate step-line data for a specific chart configuration.
	 * Each curve becomes a step-line showing metric values across concurrency levels.
	 * Y values are normalized independently per system to a 0-1 range.
	 * @param {Object} config - Chart configuration with yAccessor
	 * @returns {Array<{id: string, name: string, color: string, points: Array<{x: number, y: number}>}>}
	 */
	function getStepLineData(config) {
		return curves.map(curve => {
			const validRuns = curve.runs
				.filter(run => run.concurrency >= 1 && run.concurrency <= 50)
				.sort((a, b) => a.concurrency - b.concurrency);
			if (validRuns.length === 0) return null;

			const yValues = validRuns.map(r => config.yAccessor(r));
			const yMin = Math.min(...yValues);
			const yMax = Math.max(...yValues);
			const yRange = yMax - yMin || 1;

			return {
				id: curve.id,
				name: curve.name,
				color: curve.color,
				points: validRuns.map(run => ({
					x: concurrencyToPercent(run.concurrency),
					y: (config.yAccessor(run) - yMin) / yRange
				}))
			};
		}).filter(Boolean);
	}

	/**
	 * Build individual horizontal bar segments for a system within its Y-band.
	 * Each segment spans from one concurrency point to the next at that point's Y level.
	 * No vertical connectors -- just flat bars per concurrency interval.
	 * @param {Array<{x: number, y: number}>} points - Normalized points (x: 0-100%, y: 0-1)
	 * @param {number} bandTop - Top of this system's Y-band in SVG units
	 * @param {number} bandHeight - Height of this system's Y-band in SVG units
	 * @returns {Array<string>} - Array of SVG path d attributes (one per segment)
	 */
	function buildBarSegments(points, bandTop, bandHeight) {
		if (points.length === 0) return [];
		const padding = bandHeight * 0.1;
		const drawHeight = bandHeight - padding * 2;

		const toY = (/** @type {number} */ normY) => bandTop + padding + drawHeight * (1 - normY);

		const segments = [];
		for (let i = 0; i < points.length; i++) {
			const x1 = points[i].x;
			const x2 = i < points.length - 1 ? points[i + 1].x : 100;
			const y = toY(points[i].y);
			segments.push(`M ${x1} ${y} H ${x2}`);
		}
		return segments;
	}

	/**
	 * Convert a concurrency value to percentage position (log scale).
	 * @param {number} value - The concurrency value
	 * @returns {number} - Percentage position (0-100)
	 */
	function concurrencyToPercent(value) {
		const minLog = Math.log10(1);
		const maxLog = Math.log10(50);
		const valueLog = Math.log10(Math.max(1, value));
		return ((valueLog - minLog) / (maxLog - minLog)) * 100;
	}

	/**
	 * Handle slider input change.
	 * @param {Event} event - Input event
	 */
	function handleSliderInput(event) {
		const percent = parseFloat(event.target.value);
		sliderValue = percentToValue(percent);
	}
</script>

<section class="mt-6" aria-label="Concurrency highlight charts">
	<h2 class="mb-9 text-3xl font-semibold text-slate-700 dark:text-white">
		Highlight Concurrency across all charts
	</h2>

	<div class="flex flex-col gap-6 lg:flex-row">
		<!-- Left column: Slider and metrics -->
		<div class="lg:w-1/3">
			<!-- Metrics panel -->
			<div>
				<!-- Concurrency slider -->
				<div class="mb-4 rounded-lg border border-slate-200 bg-slate-50/50 px-4 pt-3 pb-5 dark:border-slate-600 dark:bg-slate-700/50">
					<div class="relative h-3 w-full">
						<!-- Track background -->
						<div class="absolute inset-0 rounded-full bg-slate-100 dark:bg-slate-700"></div>
						<!-- Filled track (left of thumb) -->
						<div
							class="absolute top-0 left-0 h-full rounded-full bg-[#CCEBD4] dark:bg-[#736628]"
							style="width: {sliderPercent}%"
						></div>
						<!-- Slider input -->
						<input
							type="range"
							min="0"
							max="100"
							step="0.1"
							value={sliderPercent}
							oninput={handleSliderInput}
							class="concurrency-slider absolute inset-0 h-full w-full cursor-pointer appearance-none bg-transparent [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#4f805b] [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-[#C41E3A] [&::-moz-range-thumb]:shadow-md"
							aria-label="Concurrency slider"
						/>
					</div>
					<!-- Tick labels -->
					<div class="relative mt-2 flex justify-between text-xs text-slate-500 dark:text-slate-400">
						{#each tickMarks as tick (tick)}
							{@const tickPercent = valueToPercent(tick)}
							<span style="position: absolute; left: {tickPercent}%; transform: translateX(-50%)">{tick}</span>
						{/each}
					</div>
				</div>

				<h3 class="mb-3 text-lg font-semibold text-slate-800 dark:text-white">
					At {Math.round(sliderValue)} Users:
				</h3>

				{#if metricsAtConcurrency}
					<ul class="space-y-1.5 text-sm text-slate-700 dark:text-slate-300">
						<li class="flex items-start gap-2">
							<span class="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400"></span>
							<span>Throughput (Tokens/Second): <span class="font-semibold text-slate-900 dark:text-white">{metricsAtConcurrency.system_tps?.toFixed(0) ?? '—'}</span></span>
						</li>
						<li class="flex items-start gap-2">
							<span class="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400"></span>
							<span>Latency (Time To First Token P99): <span class="font-semibold text-slate-900 dark:text-white">{metricsAtConcurrency.ttft?.toFixed(3) ?? '—'}</span></span>
						</li>
						<li class="flex items-start gap-2">
							<span class="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400"></span>
							<span>Interactivity (Tokens/Second per User): <span class="font-semibold text-slate-900 dark:text-white">{metricsAtConcurrency.tps_per_user?.toFixed(0) ?? '—'}</span></span>
						</li>
					</ul>
				{:else}
					<p class="text-sm text-slate-500 dark:text-slate-400">No data available</p>
				{/if}

				<!-- Analysis section -->
				<div class="mt-4 border-t border-slate-200 pt-4 dark:border-slate-700">
					<h4 class="mb-2 font-semibold text-slate-800 dark:text-white">Analysis:</h4>
					<p class="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
						{#if metricsAtConcurrency}
							At <span class="font-semibold text-slate-900 dark:text-white">{Math.round(sliderValue)}</span> concurrent users, the system achieves <span class="font-semibold text-slate-900 dark:text-white">{metricsAtConcurrency.system_tps?.toFixed(0) ?? '—'}</span> tokens/second
							with a time to first token of <span class="font-semibold text-slate-900 dark:text-white">{metricsAtConcurrency.ttft?.toFixed(3) ?? '—'}s</span>.
							Each user experiences <span class="font-semibold text-slate-900 dark:text-white">{metricsAtConcurrency.tps_per_user?.toFixed(0) ?? '—'}</span> tokens/second interactivity.
						{:else}
							Select a concurrency level to see analysis.
						{/if}
					</p>
				</div>
			</div>
		</div>

		<!-- Right column: 6 mini charts in 3x2 grid -->
		<div class="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each chartConfigs as config (config.id)}
				{@const lineData = getStepLineData(config)}
				{@const systemCount = lineData.length || 1}
				{@const bandHeight = 100 / systemCount}
				{@const headerVal = getHeaderValue(config)}
				<div class="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/50">
					<h4 class="mb-2 text-sm font-semibold text-pretty text-slate-700 dark:text-slate-300">
						{#if headerVal}<span class="mr-1.5 text-slate-900 dark:text-white">{headerVal}</span>{/if}{config.title}
					</h4>
					<div class="relative w-full" style="aspect-ratio: 4/3;">
						<!-- System name labels as HTML overlays (avoids SVG text distortion) -->
						{#each lineData as system, index (system.id)}
							<span
								class="absolute left-1 text-[10px] font-medium leading-none text-slate-500 dark:text-slate-400"
								style="top: {(index / systemCount) * 100}%"
							>
								{system.name}
							</span>
						{/each}

						<svg viewBox="0 0 100 100" preserveAspectRatio="none" class="h-full w-full">
							<!-- Left muted overlay (before slider position) -->
							<rect
								x="0"
								y="0"
								width={sliderPercent}
								height="100"
								fill="rgba(0, 0, 0, 0.08)"
								class="dark:fill-white/10"
							/>

							<!-- Horizontal bar segments for each system in its own Y-band -->
							{#each lineData as system, index (system.id)}
								{@const bandTop = index * bandHeight}
								{@const segments = buildBarSegments(system.points, bandTop, bandHeight)}
								{#each segments as segD, segIdx (segIdx)}
									<path
										d={segD}
										fill="none"
										stroke={system.color}
										stroke-width="2.5"
										stroke-linecap="round"
										vector-effect="non-scaling-stroke"
									/>
								{/each}
							{/each}

							<!-- Vertical dashed line at slider position -->
							<line
								x1={sliderPercent}
								y1="0"
								x2={sliderPercent}
								y2="100"
								stroke="currentColor"
								stroke-width="1.5"
								stroke-dasharray="4 2"
								vector-effect="non-scaling-stroke"
							/>
						</svg>

						<!-- X-axis labels -->
						<div class="absolute right-0 bottom-0 left-0 flex justify-between px-1 text-[10px] text-slate-400">
							{#each tickMarks as tick (tick)}
								<span>{tick}</span>
							{/each}
						</div>
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>

<style lang="postcss">
	@reference "@app-css";

	:global(.dark) .concurrency-slider::-webkit-slider-thumb {
		background-color: #b5a05c;
	}

	:global(.dark) .concurrency-slider::-moz-range-thumb {
		background-color: #b5a05c;
	}
</style>
