<script>
	/**
	 * BenchmarkResultsTable - Displays benchmark run results in a tabular format.
	 *
	 * A reusable component that shows key metrics for each system's benchmark runs including:
	 * - System throughput (tok/s)
	 * - Time to First Token (TTFT) latencies
	 * - Concurrency levels tested
	 * - Reports timeline with interactive data points
	 *
	 * @prop {Array} systems - Array of system data with models and runs
	 * @prop {string} [title] - Optional custom title for the table
	 * @prop {string} [subtitle] - Optional custom subtitle
	 * @prop {boolean} [showReportsTimeline] - Whether to show the reports timeline row (default: true)
	 * @prop {Function} [onDotClick] - Optional callback when a timeline dot is clicked
	 */

	/** @type {{ systems: Array<Object>, title?: string, subtitle?: string, showReportsTimeline?: boolean, onDotClick?: Function }} */
	let {
		systems = [],
		title = 'Benchmark Results',
		subtitle = 'Performance metrics for selected systems',
		showReportsTimeline = true,
		onDotClick = null
	} = $props();

	// Tooltip state for reports timeline
	let tooltipData = $state(null);
	let tooltipPosition = $state({ x: 0, y: 0 });

	/**
	 * Calculate global concurrency range across all visible runs for consistent timeline positioning.
	 */
	let globalConcurrencyRange = $derived.by(() => {
		const allRuns = systems.flatMap((system) =>
			system.models.flatMap((model) => model.runs)
		);
		if (allRuns.length === 0) return { min: 1, max: 100 };

		const concurrencies = allRuns.map((r) => r.concurrency);
		return {
			min: Math.min(...concurrencies),
			max: Math.max(...concurrencies)
		};
	});

	/**
	 * Format large numbers with K/M suffixes
	 * @param {number} num
	 * @returns {string}
	 */
	function formatNumber(num) {
		if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
		if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
		return num.toFixed(1);
	}

	/**
	 * Format latency in milliseconds
	 * @param {number} seconds
	 * @returns {string}
	 */
	function formatLatency(seconds) {
		return (seconds * 1000).toFixed(1) + ' ms';
	}

	/**
	 * Format date for tooltip display
	 * @param {string} dateStr - ISO date string
	 * @returns {string}
	 */
	function formatDate(dateStr) {
		const date = new Date(dateStr);
		return date.toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	/**
	 * Calculate dot position as percentage along timeline based on concurrency (log scale).
	 * @param {Object} run - Current run
	 * @param {{min: number, max: number}} range - Global concurrency range
	 * @returns {number} - Percentage position (0-100)
	 */
	function getTimelinePosition(run, range) {
		const { min, max } = range;
		if (min === max) return 50;

		const logMin = Math.log10(min);
		const logMax = Math.log10(max);
		const logValue = Math.log10(run.concurrency);

		return ((logValue - logMin) / (logMax - logMin)) * 100;
	}

	/**
	 * Handle dot hover - show tooltip
	 * @param {MouseEvent} event
	 * @param {Object} run - Run data
	 * @param {Object} row - Row data with system info
	 */
	function handleDotHover(event, run, row) {
		const rect = event.currentTarget.getBoundingClientRect();
		const tableRect = event.currentTarget.closest('.overflow-hidden')?.getBoundingClientRect();
		if (!tableRect) return;

		tooltipData = { run, row };
		tooltipPosition = {
			x: rect.left - tableRect.left + rect.width / 2,
			y: rect.top - tableRect.top - 10
		};
	}

	/**
	 * Handle dot leave - hide tooltip
	 */
	function handleDotLeave() {
		tooltipData = null;
	}

	/**
	 * Handle dot click - call optional callback
	 * @param {Object} run - Run data with submission_id and run_id
	 */
	function handleDotClick(run) {
		if (onDotClick) {
			onDotClick(run);
		}
	}
</script>

<!-- Results Table -->
<div class="relative overflow-hidden rounded-xl border border-slate-700 bg-slate-800 shadow-lg">
	<div class="border-b border-slate-600 bg-slate-900 px-4 py-3">
		<h2 class="font-semibold text-white">{title}</h2>
		<p class="mt-0.5 text-xs text-slate-400">{subtitle}</p>
	</div>

	{#if systems.length === 0}
		<div class="flex items-center justify-center py-12 text-slate-400">
			<p>No systems to display</p>
		</div>
	{:else}
		<div class="overflow-x-auto">
			<table class="w-full text-sm">
				<thead>
					<tr class="border-b border-slate-600 bg-slate-700/50">
						<th
							rowspan="2"
							class="border-r border-slate-600 px-3 py-2 text-left font-semibold text-slate-200"
						>
							System
						</th>
						<th
							colspan="3"
							class="border-r border-slate-600 px-3 py-2 text-center font-semibold text-emerald-400"
						>
							Peak Throughput
						</th>
						<th colspan="3" class="px-3 py-2 text-center font-semibold text-blue-400">
							Low Latency
						</th>
					</tr>
					<tr class="border-b border-slate-600 bg-slate-800 text-xs">
						<!-- Peak Throughput columns -->
						<th class="border-r border-slate-600 px-2 py-1.5 text-center text-slate-400"
							>Concurrency</th
						>
						<th class="border-r border-slate-600 px-2 py-1.5 text-center text-slate-400"
							>Throughput</th
						>
						<th class="border-r border-slate-600 px-2 py-1.5 text-center text-slate-400">TTFT P99</th
						>
						<!-- Low Latency columns -->
						<th class="border-r border-slate-600 px-2 py-1.5 text-center text-slate-400"
							>Concurrency</th
						>
						<th class="border-r border-slate-600 px-2 py-1.5 text-center text-slate-400"
							>Throughput</th
						>
						<th class="px-2 py-1.5 text-center text-slate-400">TTFT P99</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-700">
					{#each systems as systemRow (systemRow.systemId)}
						{#each systemRow.models as modelEntry, modelIndex (modelEntry.id)}
							<!-- System/Model metrics row -->
							<tr class="transition-colors hover:bg-slate-700/50">
								<!-- System Info (only show full info on first model row) -->
								<td class="border-r border-slate-600 px-3 py-2.5">
									{#if modelIndex === 0}
										<div class="flex items-center gap-2">
											<span
												class="h-2.5 w-2.5 shrink-0 rounded-full"
												style="background-color: {systemRow.systemColor};"
											></span>
											<div class="min-w-0">
												<p class="truncate text-xs font-medium text-slate-200">
													{systemRow.systemName}
												</p>
												<p class="truncate text-[10px] text-slate-400">
													{systemRow.acceleratorCount}x {systemRow.accelerator}
												</p>
											</div>
										</div>
									{:else}
										<div class="flex items-center gap-2 pl-4">
											<span class="text-[10px] text-slate-500"></span>
										</div>
									{/if}
								</td>
								<!-- Peak Throughput -->
								<td class="border-r border-slate-600 px-2 py-2 text-center text-slate-300"
									>{modelEntry.peakThroughputRun?.concurrency ?? '-'}</td
								>
								<td
									class="border-r border-slate-600 px-2 py-2 text-center font-semibold text-emerald-400"
									>{formatNumber(modelEntry.peakThroughput)} tok/s</td
								>
								<td class="border-r border-slate-600 px-2 py-2 text-center text-slate-300"
									>{formatLatency(modelEntry.peakThroughputRun?.ttft ?? 0)}</td
								>
								<!-- Low Latency -->
								<td class="border-r border-slate-600 px-2 py-2 text-center text-slate-300"
									>{modelEntry.lowLatencyRun?.concurrency ?? '-'}</td
								>
								<td class="border-r border-slate-600 px-2 py-2 text-center text-slate-300"
									>{formatNumber(modelEntry.lowLatencyRun?.system_tps ?? 0)} tok/s</td
								>
								<td class="px-2 py-2 text-center font-semibold text-blue-400"
									>{formatLatency(modelEntry.minTtft)}</td
								>
							</tr>
							<!-- Reports timeline row -->
							{#if showReportsTimeline}
								<tr class="bg-slate-800/30">
									<td class="border-r border-slate-600 px-3 py-2 text-right">
										{#if modelIndex === 0}
											<div class="flex items-center justify-end gap-2">
												<span class="text-xs text-slate-400">Reports</span>
											</div>
										{/if}
									</td>
									<td colspan="6" class="px-4 py-2">
										<div class="flex items-center gap-3">
											<!-- Model name label -->
											<span
												class="w-20 shrink-0 truncate text-[10px] text-slate-500"
												title={modelEntry.modelName}
											>
												{modelEntry.modelName}
											</span>
											<!-- Timeline with dots -->
											<div class="relative h-4 flex-1">
												<!-- Timeline line -->
												<div
													class="absolute left-0 right-0 top-1/2 h-0.5 -translate-y-1/2 rounded-full"
													style="background: linear-gradient(90deg, {systemRow.systemColor}40 0%, {systemRow.systemColor}20 100%);"
												></div>
												<!-- Dots for each run (positioned by concurrency to match chart X-axis) -->
												{#each modelEntry.runs as run (run.run_id)}
													<button
														type="button"
														class="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full transition-all duration-150 hover:scale-125 hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-slate-800"
														style="left: {getTimelinePosition(run, globalConcurrencyRange)}%; background-color: {systemRow.systemColor}; box-shadow: 0 0 0 2px {systemRow.systemColor}40;"
														aria-label="View report for {systemRow.systemName} ({modelEntry.modelName}) - Concurrency {run.concurrency}"
														onmouseenter={(e) =>
															handleDotHover(e, run, { ...systemRow, modelName: modelEntry.modelName })}
														onmouseleave={handleDotLeave}
														onclick={() => handleDotClick(run)}
													></button>
												{/each}
											</div>
										</div>
									</td>
								</tr>
							{/if}
						{/each}
					{/each}
				</tbody>
			</table>
		</div>

		<!-- Summary Footer -->
		<div class="border-t border-slate-600 bg-slate-900/50 px-4 py-2.5">
			<div class="flex items-center justify-between text-xs text-slate-400">
				<span>
					{systems.length} system{systems.length !== 1 ? 's' : ''} shown
					{#if systems.reduce((sum, s) => sum + s.models.length, 0) > systems.length}
						<span class="text-slate-500">
							({systems.reduce((sum, s) => sum + s.models.length, 0)} model submissions)
						</span>
					{/if}
				</span>
			</div>
		</div>

		<!-- Timeline Tooltip -->
		{#if tooltipData}
			<div
				class="pointer-events-none absolute z-50 min-w-52 whitespace-nowrap rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 shadow-xl"
				style="left: {tooltipPosition.x}px; top: {tooltipPosition.y}px; transform: translate(-50%, -100%);"
			>
				<div class="space-y-1 text-xs">
					<div class="font-semibold text-slate-200">{tooltipData.row.systemName}</div>
					<div class="text-slate-400">
						<span class="text-slate-500">Date:</span>
						{formatDate(tooltipData.run.run_date)}
					</div>
					<div class="grid grid-cols-2 gap-x-4 gap-y-0.5 border-t border-slate-700 pt-1">
						<div class="text-slate-400">
							<span class="text-slate-500">Concurrency:</span>
							{tooltipData.run.concurrency}
						</div>
						<div class="text-slate-400">
							<span class="text-slate-500">Throughput:</span>
							<span class="font-medium text-emerald-400"
								>{formatNumber(tooltipData.run.system_tps)} tok/s</span
							>
						</div>
						<div class="text-slate-400">
							<span class="text-slate-500">TTFT P99:</span>
							<span class="font-medium text-blue-400">{formatLatency(tooltipData.run.ttft)}</span>
						</div>
						<div class="text-slate-400">
							<span class="text-slate-500">Interactivity:</span>
							{formatNumber(tooltipData.run.tps_per_user)} tok/s/user
						</div>
					</div>
					<div class="pt-1 text-center text-[10px] text-slate-500">Click to view full report</div>
				</div>
				<!-- Tooltip arrow -->
				<div
					class="absolute bottom-0 left-1/2 h-0 w-0 -translate-x-1/2 translate-y-full border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-slate-600"
				></div>
			</div>
		{/if}
	{/if}
</div>
