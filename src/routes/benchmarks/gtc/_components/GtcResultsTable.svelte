<script>
	/**
	 * GTC Results Table - Displays benchmark run results in a tabular format.
	 *
	 * Shows key metrics for each system's benchmark runs including:
	 * - System throughput (tok/s)
	 * - Time to First Token (TTFT) latencies
	 * - Time Per Output Token (TPOT) latencies
	 * - Concurrency levels tested
	 */
	import { isSystemVisible, getSelectedBenchmarkModelId } from '$lib/stores/chartSettings.svelte.js';
	import endpointsData from '../endpoints-benchmark-data.json';

	/**
	 * Build table rows from the benchmark data.
	 * Groups runs by system and shows aggregated metrics.
	 */
	let tableData = $derived.by(() => {
		const selectedModelId = getSelectedBenchmarkModelId();

		// Filter submissions by selected model
		const filteredSubmissions =
			selectedModelId === 'all'
				? endpointsData.submissions
				: endpointsData.submissions.filter((s) => s.model_id === selectedModelId);

		// Build rows for visible systems
		return filteredSubmissions
			.filter((submission) => isSystemVisible(submission.system_id))
			.map((submission) => {
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

				return {
					id: submission.submission_id,
					systemId: submission.system_id,
					systemName: system?.system_name ?? 'Unknown System',
					systemColor: system?.color ?? '#64748b',
					organization: system?.submitter_org_names ?? 'Unknown',
					accelerator: system?.accelerator_model_name ?? 'Unknown',
					acceleratorCount: system?.accelerators_per_node ?? 0,
					modelName: model?.model_name ?? 'Unknown Model',
					division: submission.division,
					runCount: runs.length,
					maxConcurrency,
					// Peak throughput metrics
					peakThroughput: maxThroughput,
					peakThroughputRun: bestRun,
					// Low latency metrics
					minTtft,
					lowLatencyRun,
					// All runs for detail expansion
					runs
				};
			});
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
</script>

<!-- Results Table -->
<div
	class="overflow-hidden rounded-xl border border-slate-700 bg-slate-800 shadow-lg"
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
					{#each tableData as row (row.id)}
						<tr class="hover:bg-slate-700/50 transition-colors">
							<!-- System Info -->
							<td class="border-r border-slate-600 px-3 py-2.5">
								<div class="flex items-center gap-2">
									<span
										class="h-2.5 w-2.5 rounded-full shrink-0"
										style="background-color: {row.systemColor};"
									></span>
									<div class="min-w-0">
										<p class="font-medium text-slate-200 truncate text-xs">
											{row.systemName}
										</p>
										<p class="text-[10px] text-slate-400 truncate">
											{row.acceleratorCount}x {row.accelerator}
										</p>
									</div>
								</div>
							</td>
							<!-- Peak Throughput -->
							<td
								class="border-r border-slate-600 px-2 py-2 text-center text-slate-300"
							>{row.peakThroughputRun?.concurrency ?? '-'}</td>
							<td
								class="border-r border-slate-600 px-2 py-2 text-center font-semibold text-emerald-400"
							>{formatNumber(row.peakThroughput)} tok/s</td>
							<td
								class="border-r border-slate-600 px-2 py-2 text-center text-slate-300"
							>{formatLatency(row.peakThroughputRun?.ttft ?? 0)}</td>
							<!-- Low Latency -->
							<td
								class="border-r border-slate-600 px-2 py-2 text-center text-slate-300"
							>{row.lowLatencyRun?.concurrency ?? '-'}</td>
							<td
								class="border-r border-slate-600 px-2 py-2 text-center text-slate-300"
							>{formatNumber(row.lowLatencyRun?.system_tps ?? 0)} tok/s</td>
							<td
								class="px-2 py-2 text-center font-semibold text-blue-400"
							>{formatLatency(row.minTtft)}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<!-- Summary Footer -->
		<div class="border-t border-slate-600 bg-slate-900/50 px-4 py-2.5">
			<div class="flex items-center justify-between text-xs text-slate-400">
				<span>{tableData.length} system{tableData.length !== 1 ? 's' : ''} selected</span>
				<span class="text-slate-500">
					Model: {endpointsData.models.find((m) => m.model_id === getSelectedBenchmarkModelId())?.model_name ?? 'All Models'}
				</span>
			</div>
		</div>
	{/if}
</div>
