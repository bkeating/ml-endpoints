<script>
	/**
	 * Report Runs Table - Displays all benchmark runs for a specific submission.
	 *
	 * Shows detailed metrics for each concurrency level tested:
	 * - Concurrency level
	 * - System throughput (tok/s)
	 * - Per-user throughput (tok/s/user)
	 * - TTFT latencies (P50, P90, P99)
	 * - TPOT latencies (P50, P90, P99)
	 * - Utilization
	 */

	/** @type {{ run_id: string, concurrency: number, system_tps: number, tps_per_user: number, ttft: number, utilization: number, measured_latency_ttft_p50: number, measured_latency_ttft_p90: number, measured_latency_ttft_p99: number, measured_latency_tpot_p50: number, measured_latency_tpot_p90: number, measured_latency_tpot_p99: number, config_detail: string }[]} */
	let { runs = [], currentRunId = '', systemColor = '#64748b' } = $props();

	// Sort runs by concurrency
	let sortedRuns = $derived([...runs].sort((a, b) => a.concurrency - b.concurrency));

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
		return (seconds * 1000).toFixed(1);
	}

	/**
	 * Format percentage
	 * @param {number} value - Value between 0 and 1
	 * @returns {string}
	 */
	function formatPercent(value) {
		return (value * 100).toFixed(1) + '%';
	}
</script>

<!-- Runs Table -->
<div class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
	<div class="border-b border-slate-200 bg-slate-600 px-4 py-3 dark:border-slate-600">
		<h2 class="font-semibold text-white">Benchmark Runs</h2>
		<p class="text-xs text-slate-200 mt-0.5">
			Performance metrics across {runs.length} concurrency levels
		</p>
	</div>

	{#if sortedRuns.length === 0}
		<div class="flex items-center justify-center py-12 text-slate-400 dark:text-slate-500">
			<p>No run data available</p>
		</div>
	{:else}
		<div class="overflow-x-auto">
			<table class="w-full text-sm">
				<thead>
					<tr class="border-b border-slate-200 bg-slate-100 dark:border-slate-600 dark:bg-slate-700">
						<th
							rowspan="2"
							class="border-r border-slate-200 px-3 py-2 text-left font-semibold text-slate-700 dark:border-slate-600 dark:text-slate-200"
						>
							Concurrency
						</th>
						<th
							colspan="2"
							class="border-r border-slate-200 px-3 py-2 text-center font-semibold text-emerald-700 dark:border-slate-600 dark:text-emerald-400"
						>
							Throughput
						</th>
						<th
							colspan="3"
							class="border-r border-slate-200 px-3 py-2 text-center font-semibold text-blue-700 dark:border-slate-600 dark:text-blue-400"
						>
							TTFT Latency (ms)
						</th>
						<th
							colspan="3"
							class="border-r border-slate-200 px-3 py-2 text-center font-semibold text-purple-700 dark:border-slate-600 dark:text-purple-400"
						>
							TPOT Latency (ms)
						</th>
						<th
							rowspan="2"
							class="px-3 py-2 text-center font-semibold text-slate-700 dark:text-slate-200"
						>
							Utilization
						</th>
					</tr>
					<tr class="border-b border-slate-200 bg-slate-50 text-xs dark:border-slate-600 dark:bg-slate-800">
						<!-- Throughput columns -->
						<th class="border-r border-slate-200 px-2 py-1.5 text-center text-slate-600 dark:border-slate-600 dark:text-slate-400">
							System
						</th>
						<th class="border-r border-slate-200 px-2 py-1.5 text-center text-slate-600 dark:border-slate-600 dark:text-slate-400">
							Per User
						</th>
						<!-- TTFT columns -->
						<th class="border-r border-slate-200 px-2 py-1.5 text-center text-slate-600 dark:border-slate-600 dark:text-slate-400">
							P50
						</th>
						<th class="border-r border-slate-200 px-2 py-1.5 text-center text-slate-600 dark:border-slate-600 dark:text-slate-400">
							P90
						</th>
						<th class="border-r border-slate-200 px-2 py-1.5 text-center text-slate-600 dark:border-slate-600 dark:text-slate-400">
							P99
						</th>
						<!-- TPOT columns -->
						<th class="border-r border-slate-200 px-2 py-1.5 text-center text-slate-600 dark:border-slate-600 dark:text-slate-400">
							P50
						</th>
						<th class="border-r border-slate-200 px-2 py-1.5 text-center text-slate-600 dark:border-slate-600 dark:text-slate-400">
							P90
						</th>
						<th class="border-r border-slate-200 px-2 py-1.5 text-center text-slate-600 dark:border-slate-600 dark:text-slate-400">
							P99
						</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-100 dark:divide-slate-700">
					{#each sortedRuns as run (run.run_id)}
						{@const isCurrentRun = run.run_id === currentRunId}
						<tr
							class="transition-colors {isCurrentRun
								? 'bg-emerald-50 dark:bg-emerald-900/20'
								: 'hover:bg-slate-50 dark:hover:bg-slate-700/50'}"
						>
							<!-- Concurrency -->
							<td class="border-r border-slate-200 px-3 py-2.5 dark:border-slate-600">
								<div class="flex items-center gap-2">
									{#if isCurrentRun}
										<span
											class="h-2 w-2 rounded-full"
											style="background-color: {systemColor};"
										></span>
									{/if}
									<span
										class="font-medium {isCurrentRun
											? 'text-emerald-700 dark:text-emerald-400'
											: 'text-slate-800 dark:text-slate-200'}"
									>
										{run.concurrency}
									</span>
								</div>
							</td>
							<!-- Throughput: System -->
							<td class="border-r border-slate-200 px-2 py-2 text-center dark:border-slate-600">
								<span class="font-semibold text-emerald-600 dark:text-emerald-400">
									{formatNumber(run.system_tps)}
								</span>
							</td>
							<!-- Throughput: Per User -->
							<td class="border-r border-slate-200 px-2 py-2 text-center text-slate-600 dark:border-slate-600 dark:text-slate-300">
								{formatNumber(run.tps_per_user)}
							</td>
							<!-- TTFT: P50 -->
							<td class="border-r border-slate-200 px-2 py-2 text-center text-slate-600 dark:border-slate-600 dark:text-slate-300">
								{formatLatency(run.measured_latency_ttft_p50)}
							</td>
							<!-- TTFT: P90 -->
							<td class="border-r border-slate-200 px-2 py-2 text-center text-slate-600 dark:border-slate-600 dark:text-slate-300">
								{formatLatency(run.measured_latency_ttft_p90)}
							</td>
							<!-- TTFT: P99 -->
							<td class="border-r border-slate-200 px-2 py-2 text-center dark:border-slate-600">
								<span class="font-semibold text-blue-600 dark:text-blue-400">
									{formatLatency(run.measured_latency_ttft_p99)}
								</span>
							</td>
							<!-- TPOT: P50 -->
							<td class="border-r border-slate-200 px-2 py-2 text-center text-slate-600 dark:border-slate-600 dark:text-slate-300">
								{formatLatency(run.measured_latency_tpot_p50)}
							</td>
							<!-- TPOT: P90 -->
							<td class="border-r border-slate-200 px-2 py-2 text-center text-slate-600 dark:border-slate-600 dark:text-slate-300">
								{formatLatency(run.measured_latency_tpot_p90)}
							</td>
							<!-- TPOT: P99 -->
							<td class="border-r border-slate-200 px-2 py-2 text-center dark:border-slate-600">
								<span class="font-semibold text-purple-600 dark:text-purple-400">
									{formatLatency(run.measured_latency_tpot_p99)}
								</span>
							</td>
							<!-- Utilization -->
							<td class="px-2 py-2 text-center text-slate-600 dark:text-slate-300">
								{formatPercent(run.utilization)}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<!-- Summary Footer -->
		<div class="border-t border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-600 dark:bg-slate-800/50">
			<div class="grid grid-cols-2 gap-4 text-xs sm:grid-cols-4">
				<div>
					<span class="text-slate-500 dark:text-slate-400">Peak Throughput</span>
					<p class="font-semibold text-emerald-600 dark:text-emerald-400">
						{formatNumber(Math.max(...sortedRuns.map((r) => r.system_tps)))} tok/s
					</p>
				</div>
				<div>
					<span class="text-slate-500 dark:text-slate-400">Min TTFT P99</span>
					<p class="font-semibold text-blue-600 dark:text-blue-400">
						{formatLatency(Math.min(...sortedRuns.map((r) => r.ttft)))} ms
					</p>
				</div>
				<div>
					<span class="text-slate-500 dark:text-slate-400">Max Concurrency</span>
					<p class="font-semibold text-slate-700 dark:text-slate-200">
						{Math.max(...sortedRuns.map((r) => r.concurrency))} users
					</p>
				</div>
				<div>
					<span class="text-slate-500 dark:text-slate-400">Max Utilization</span>
					<p class="font-semibold text-slate-700 dark:text-slate-200">
						{formatPercent(Math.max(...sortedRuns.map((r) => r.utilization)))}
					</p>
				</div>
			</div>
		</div>
	{/if}
</div>
