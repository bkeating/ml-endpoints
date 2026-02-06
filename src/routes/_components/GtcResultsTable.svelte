<script>
	/**
	 * GTC Results Table - Displays benchmark run results in a tabular format.
	 *
	 * Shows key metrics for each system's benchmark runs including:
	 * - System throughput (tok/s)
	 * - Time to First Token (TTFT) latencies
	 * - Time Per Output Token (TPOT) latencies
	 * - Concurrency levels tested
	 * - Reports timeline with interactive data points
	 */
	import { goto } from '$app/navigation';
	import { SvelteMap } from 'svelte/reactivity';
	import { isSystemVisible } from '$lib/stores/chartSettings.svelte.js';
	import endpointsData from '../endpoints-benchmark-data.json';

	// Tooltip state for reports timeline
	let tooltipData = $state(null);
	let tooltipPosition = $state({ x: 0, y: 0 });

	/**
	 * Build table rows from the benchmark data.
	 * Groups submissions by system, with separate model entries for each system.
	 * Shows all models regardless of selected model filter (table shows complete data).
	 */
	let tableData = $derived.by(() => {
		// Group submissions by system (show all models, not filtered by selection)
		const systemGroups = new SvelteMap();

		endpointsData.submissions
			.filter((submission) => isSystemVisible(submission.system_id))
			.forEach((submission) => {
				const system = endpointsData.systems.find((s) => s.id === submission.system_id);
				const model = endpointsData.models.find((m) => m.model_id === submission.model_id);
				const runs = endpointsData.runs
					.filter((r) => r.submission_id === submission.submission_id)
					.sort((a, b) => a.concurrency - b.concurrency);

				// Calculate aggregate metrics
				const maxThroughput = Math.max(...runs.map((r) => r.system_tps));
				const minTtft = Math.min(...runs.map((r) => r.ttft));
				const maxConcurrency = Math.max(...runs.map((r) => r.concurrency));

				// Get best run (highest throughput)
				const bestRun = runs.reduce((best, run) => (run.system_tps > best.system_tps ? run : best), runs[0]);

				// Get low-latency run (lowest TTFT, typically at concurrency=1)
				const lowLatencyRun = runs.reduce((best, run) => (run.ttft < best.ttft ? run : best), runs[0]);

				const modelEntry = {
					id: submission.submission_id,
					modelId: model?.model_id,
					modelName: model?.model_name ?? 'Unknown Model',
					division: submission.division,
					runCount: runs.length,
					maxConcurrency,
					peakThroughput: maxThroughput,
					peakThroughputRun: bestRun,
					minTtft,
					lowLatencyRun,
					runs
				};

				if (!systemGroups.has(submission.system_id)) {
					systemGroups.set(submission.system_id, {
						systemId: submission.system_id,
						systemName: system?.system_name ?? 'Unknown System',
						systemColor: system?.color ?? '#535869',
						organization: system?.submitter_org_names ?? 'Unknown',
						accelerator: system?.accelerator_model_name ?? 'Unknown',
						acceleratorCount: system?.accelerators_per_node ?? 0,
						models: []
					});
				}

				systemGroups.get(submission.system_id).models.push(modelEntry);
			});

		return Array.from(systemGroups.values());
	});

	/**
	 * Calculate global concurrency range across all visible runs for consistent timeline positioning.
	 */
	let globalConcurrencyRange = $derived.by(() => {
		const allRuns = tableData.flatMap((system) =>
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
	 * This matches the X-axis representation on the charts which use concurrency.
	 * @param {Object} run - Current run
	 * @param {{min: number, max: number}} range - Global concurrency range
	 * @returns {number} - Percentage position (0-100)
	 */
	function getTimelinePosition(run, range) {
		const { min, max } = range;
		if (min === max) return 50;

		// Use log scale to match chart X-axis (most charts use log scale for concurrency)
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
	 * Navigate to report page for specific run
	 * @param {Object} run - Run data with submission_id and run_id
	 */
	function handleDotClick(run) {
		const params = new URLSearchParams({
			submission: run.submission_id,
			run: run.run_id
		});
		goto(`/report?${params.toString()}`);
	}
</script>

<!-- Results Table -->
<div
	class="relative overflow-hidden rounded-xl border border-slate-700 bg-slate-800 shadow-lg"
>
	<div class="border-b border-slate-600 bg-slate-900 px-4 py-3">
		<h2 class="font-semibold text-white">Benchmark Results</h2>
		<p class="text-xs text-slate-400 mt-0.5">
			Performance metrics for selected systems
		</p>
	</div>

	{#if tableData.length === 0}
		<div class="flex items-center justify-center py-12 text-slate-400">
			<p>Select systems from the sidebar to view results</p>
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
						<th
							colspan="3"
							class="px-3 py-2 text-center font-semibold text-blue-400"
						>
							Low Latency
						</th>
					</tr>
					<tr class="border-b border-slate-600 bg-slate-800 text-xs">
						<!-- Peak Throughput columns -->
						<th
							class="border-r border-slate-600 px-2 py-1.5 text-center text-slate-400"
						>Concurrency</th>
						<th
							class="border-r border-slate-600 px-2 py-1.5 text-center text-slate-400"
						>Throughput</th>
						<th
							class="border-r border-slate-600 px-2 py-1.5 text-center text-slate-400"
						>TTFT P99</th>
						<!-- Low Latency columns -->
						<th
							class="border-r border-slate-600 px-2 py-1.5 text-center text-slate-400"
						>Concurrency</th>
						<th
							class="border-r border-slate-600 px-2 py-1.5 text-center text-slate-400"
						>Throughput</th>
						<th
							class="px-2 py-1.5 text-center text-slate-400"
						>TTFT P99</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-700">
					{#each tableData as systemRow (systemRow.systemId)}
						{#each systemRow.models as modelEntry, modelIndex (modelEntry.id)}
							<!-- System/Model metrics row -->
							<tr class="hover:bg-slate-700/50 transition-colors">
								<!-- System Info (only show full info on first model row) -->
								<td class="border-r border-slate-600 px-3 py-2.5">
									{#if modelIndex === 0}
										<div class="flex items-center gap-2">
											<span
												class="h-2.5 w-2.5 rounded-full shrink-0"
												style="background-color: {systemRow.systemColor};"
											></span>
											<div class="min-w-0">
												<p class="font-medium text-slate-200 truncate text-xs">
													{systemRow.systemName}
												</p>
												<p class="text-[10px] text-slate-400 truncate">
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
								<td
									class="border-r border-slate-600 px-2 py-2 text-center text-slate-300"
								>{modelEntry.peakThroughputRun?.concurrency ?? '-'}</td>
								<td
									class="border-r border-slate-600 px-2 py-2 text-center font-semibold text-emerald-400"
								>{formatNumber(modelEntry.peakThroughput)} tok/s</td>
								<td
									class="border-r border-slate-600 px-2 py-2 text-center text-slate-300"
								>{formatLatency(modelEntry.peakThroughputRun?.ttft ?? 0)}</td>
								<!-- Low Latency -->
								<td
									class="border-r border-slate-600 px-2 py-2 text-center text-slate-300"
								>{modelEntry.lowLatencyRun?.concurrency ?? '-'}</td>
								<td
									class="border-r border-slate-600 px-2 py-2 text-center text-slate-300"
								>{formatNumber(modelEntry.lowLatencyRun?.system_tps ?? 0)} tok/s</td>
								<td
									class="px-2 py-2 text-center font-semibold text-blue-400"
								>{formatLatency(modelEntry.minTtft)}</td>
							</tr>
							<!-- Reports timeline row -->
							<tr class="bg-slate-800/30">
								<td class="border-r border-slate-600 px-3 py-2 text-right">
									{#if modelIndex === 0}
										<div class="flex items-center justify-end gap-2">
											<span class="text-xs text-slate-400">Reports</span>
											<button
												type="button"
												class="flex items-center justify-center h-4 w-4 text-slate-500 hover:text-slate-300 hover:bg-slate-700 rounded transition-colors"
												aria-label="Add new report for {systemRow.systemName}"
												title="Add Report"
											>
												<svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
													<path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
												</svg>
											</button>
										</div>
									{/if}
								</td>
								<td colspan="6" class="px-4 py-2">
									<div class="flex items-center gap-3">
										<!-- Model name label -->
										<span class="text-[10px] text-slate-500 w-20 truncate shrink-0" title={modelEntry.modelName}>
											{modelEntry.modelName}
										</span>
										<!-- Timeline with dots -->
										<div class="relative flex-1 h-4">
											<!-- Timeline line -->
											<div
												class="absolute top-1/2 left-0 right-0 h-0.5 -translate-y-1/2 rounded-full"
												style="background: linear-gradient(90deg, {systemRow.systemColor}40 0%, {systemRow.systemColor}20 100%);"
											></div>
											<!-- Dots for each run (positioned by concurrency to match chart X-axis) -->
											{#each modelEntry.runs as run (run.run_id)}
												<button
													type="button"
													class="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-3 w-3 rounded-full cursor-pointer transition-all duration-150 hover:scale-125 hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-slate-800"
													style="left: {getTimelinePosition(run, globalConcurrencyRange)}%; background-color: {systemRow.systemColor}; box-shadow: 0 0 0 2px {systemRow.systemColor}40;"
													aria-label="View report for {systemRow.systemName} ({modelEntry.modelName}) - Concurrency {run.concurrency}"
													onmouseenter={(e) => handleDotHover(e, run, { ...systemRow, modelName: modelEntry.modelName })}
													onmouseleave={handleDotLeave}
													onclick={() => handleDotClick(run)}
												></button>
											{/each}
										</div>
									</div>
								</td>
							</tr>
						{/each}
					{/each}
				</tbody>
			</table>
		</div>

		<!-- Summary Footer -->
		<div class="border-t border-slate-600 bg-slate-900/50 px-4 py-2.5">
			<div class="flex items-center justify-between text-xs text-slate-400">
				<span>
					{tableData.length} system{tableData.length !== 1 ? 's' : ''} selected
					{#if tableData.reduce((sum, s) => sum + s.models.length, 0) > tableData.length}
						<span class="text-slate-500">
							({tableData.reduce((sum, s) => sum + s.models.length, 0)} model submissions)
						</span>
					{/if}
				</span>
				<span class="text-slate-500">
					Showing all models
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
						<span class="text-slate-500">Date:</span> {formatDate(tooltipData.run.run_date)}
					</div>
					<div class="grid grid-cols-2 gap-x-4 gap-y-0.5 pt-1 border-t border-slate-700">
						<div class="text-slate-400">
							<span class="text-slate-500">Concurrency:</span> {tooltipData.run.concurrency}
						</div>
						<div class="text-slate-400">
							<span class="text-slate-500">Throughput:</span>
							<span class="text-emerald-400 font-medium">{formatNumber(tooltipData.run.system_tps)} tok/s</span>
						</div>
						<div class="text-slate-400">
							<span class="text-slate-500">TTFT P99:</span>
							<span class="text-blue-400 font-medium">{formatLatency(tooltipData.run.ttft)}</span>
						</div>
						<div class="text-slate-400">
							<span class="text-slate-500">Interactivity:</span> {formatNumber(tooltipData.run.tps_per_user)} tok/s/user
						</div>
					</div>
					<div class="pt-1 text-[10px] text-slate-500 text-center">Click to view full report</div>
				</div>
				<!-- Tooltip arrow -->
				<div
					class="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-full w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-slate-600"
				></div>
			</div>
		{/if}
	{/if}
</div>
