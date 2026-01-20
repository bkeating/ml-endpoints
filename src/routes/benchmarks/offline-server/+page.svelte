<script>
	import { getFilteredResults } from '$lib/stores/benchmarkFilters.svelte.js';

	let filteredResults = $derived(getFilteredResults());

	// Offline vs Server comparison data
	let offlineServerComparison = $derived.by(() => {
		// Group by system name to find systems with both Offline and Server results
		/** @type {Map<string, { offline?: typeof filteredResults[0], server?: typeof filteredResults[0] }>} */
		const systemMap = new Map();

		for (const result of filteredResults) {
			const key = `${result.systemName}-${result.organization}`;
			if (!systemMap.has(key)) {
				systemMap.set(key, {});
			}
			const entry = systemMap.get(key);
			if (entry) {
				if (result.scenario === 'Offline') {
					entry.offline = result;
				} else if (result.scenario === 'Server') {
					entry.server = result;
				}
			}
		}

		// Filter to only systems with both scenarios
		const comparisons = [];
		for (const [key, data] of systemMap) {
			if (data.offline && data.server) {
				const degradation =
					((data.offline.performance - data.server.performance) / data.offline.performance) * 100;
				comparisons.push({
					systemName: data.offline.systemName,
					organization: data.offline.organization,
					accelerator: data.offline.accelerator,
					acceleratorCount: data.offline.acceleratorCount,
					offlinePerformance: data.offline.performance,
					serverPerformance: data.server.performance,
					degradation,
					serverOfflineRatio: (data.server.performance / data.offline.performance) * 100
				});
			}
		}

		return comparisons.sort((a, b) => a.degradation - b.degradation);
	});

	// Degradation stats
	let degradationStats = $derived.by(() => {
		if (offlineServerComparison.length === 0) {
			return { avg: 0, min: 0, max: 0 };
		}
		const degradations = offlineServerComparison.map((c) => c.degradation);
		return {
			avg: degradations.reduce((a, b) => a + b, 0) / degradations.length,
			min: Math.min(...degradations),
			max: Math.max(...degradations)
		};
	});

	/**
	 * Format performance number with commas
	 * @param {number} value
	 * @returns {string}
	 */
	function formatPerformance(value) {
		return value.toLocaleString('en-US', { maximumFractionDigits: 2 });
	}

	/**
	 * Format percentage
	 * @param {number} value
	 * @returns {string}
	 */
	function formatPercent(value) {
		return value.toFixed(1) + '%';
	}

	/**
	 * Get color for degradation percentage (green = low, red = high)
	 * @param {number} degradation
	 * @returns {string}
	 */
	function getDegradationColor(degradation) {
		if (degradation < 10) return '#22c55e'; // green
		if (degradation < 20) return '#eab308'; // yellow
		if (degradation < 30) return '#f97316'; // orange
		return '#ef4444'; // red
	}
</script>

<div class="space-y-6">
	<div class="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
		<h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-2">
			Offline vs Server Performance Comparison
		</h3>
		<p class="text-sm text-slate-600 dark:text-slate-400">
			Compare performance degradation from Offline (batch) to Server (online) scenarios for systems
			that have data in both scenarios.
		</p>
	</div>

	{#if offlineServerComparison.length === 0}
		<div
			class="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6 text-center"
		>
			<p class="text-amber-800 dark:text-amber-200 font-medium">
				No systems found with both Offline and Server results
			</p>
			<p class="text-amber-600 dark:text-amber-400 text-sm mt-1">
				Select both Offline and Server scenarios to see comparison data
			</p>
		</div>
	{:else}
		<!-- Stats Cards -->
		<div class="grid grid-cols-3 gap-4">
			<div class="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
				<div class="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
					Average Degradation
				</div>
				<div class="mt-1 text-2xl font-bold text-amber-600 dark:text-amber-400">
					{formatPercent(degradationStats.avg)}
				</div>
			</div>
			<div class="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
				<div class="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
					Minimum Degradation
				</div>
				<div class="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
					{formatPercent(degradationStats.min)}
				</div>
			</div>
			<div class="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
				<div class="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
					Maximum Degradation
				</div>
				<div class="mt-1 text-2xl font-bold text-red-600 dark:text-red-400">
					{formatPercent(degradationStats.max)}
				</div>
			</div>
		</div>

		<!-- Comparison Chart -->
		<div class="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
			<div class="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
				<h3 class="text-lg font-semibold text-slate-900 dark:text-white">
					Performance Degradation: Offline → Server
				</h3>
				<p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
					Higher degradation = more performance loss in Server mode
				</p>
			</div>

			<div class="p-4 space-y-4">
				{#each offlineServerComparison as comparison (comparison.systemName)}
					{@const maxDegradation = Math.max(...offlineServerComparison.map((c) => c.degradation), 1)}
					{@const barWidth = (comparison.degradation / maxDegradation) * 100}
					<div>
						<div class="flex items-center justify-between mb-1">
							<span class="text-sm text-slate-700 dark:text-slate-300 truncate max-w-md">
								{comparison.systemName}
								<span class="text-slate-400 dark:text-slate-500">({comparison.organization})</span>
							</span>
							<span
								class="text-sm font-mono font-medium"
								style="color: {getDegradationColor(comparison.degradation)};"
							>
								{formatPercent(comparison.degradation)}
							</span>
						</div>
						<div class="h-6 bg-slate-100 dark:bg-slate-700 rounded overflow-hidden">
							<div
								class="h-full rounded transition-all duration-300 ease-out"
								style="width: {barWidth}%; background-color: {getDegradationColor(comparison.degradation)};"
							></div>
						</div>
						<div class="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-1">
							<span>Offline: {formatPerformance(comparison.offlinePerformance)}</span>
							<span>Server: {formatPerformance(comparison.serverPerformance)}</span>
						</div>
					</div>
				{/each}
			</div>
		</div>

		<!-- Detailed Table -->
		<details class="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
			<summary class="px-4 py-3 cursor-pointer text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50">
				Detailed Comparison Table
			</summary>
			<div class="overflow-x-auto border-t border-slate-200 dark:border-slate-700">
				<table class="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
					<thead class="bg-slate-50 dark:bg-slate-800/50">
						<tr>
							<th class="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">System</th>
							<th class="px-4 py-2 text-right text-xs font-medium text-slate-500 uppercase">Offline</th>
							<th class="px-4 py-2 text-right text-xs font-medium text-slate-500 uppercase">Server</th>
							<th class="px-4 py-2 text-right text-xs font-medium text-slate-500 uppercase">Degradation</th>
							<th class="px-4 py-2 text-right text-xs font-medium text-slate-500 uppercase">Server/Offline</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-slate-200 dark:divide-slate-700">
						{#each offlineServerComparison as comparison (comparison.systemName)}
							<tr class="hover:bg-slate-50 dark:hover:bg-slate-700/50">
								<td class="px-4 py-2 text-sm text-slate-900 dark:text-white">{comparison.systemName}</td>
								<td class="px-4 py-2 text-sm text-right font-mono">{formatPerformance(comparison.offlinePerformance)}</td>
								<td class="px-4 py-2 text-sm text-right font-mono">{formatPerformance(comparison.serverPerformance)}</td>
								<td class="px-4 py-2 text-sm text-right font-mono" style="color: {getDegradationColor(comparison.degradation)};">
									{formatPercent(comparison.degradation)}
								</td>
								<td class="px-4 py-2 text-sm text-right font-mono text-slate-600 dark:text-slate-400">
									{formatPercent(comparison.serverOfflineRatio)}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</details>
	{/if}
</div>
