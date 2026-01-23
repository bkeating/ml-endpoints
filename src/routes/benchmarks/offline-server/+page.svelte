<script>
	import { getFilteredResults } from '$lib/stores/benchmarkFilters.svelte.js';
	import { SvelteMap } from 'svelte/reactivity';

	let filteredResults = $derived(getFilteredResults());

	// Offline vs Server comparison data
	let offlineServerComparison = $derived.by(() => {
		// Group by system name to find systems with both Offline and Server results
		/** @type {SvelteMap<string, { offline?: typeof filteredResults[0], server?: typeof filteredResults[0] }>} */
		const systemMap = new SvelteMap();

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
		for (const [, data] of systemMap) {
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
	<div
		class="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800"
	>
		<h3 class="mb-2 text-lg font-semibold text-slate-900 dark:text-white">
			Offline vs Server Performance Comparison
		</h3>
		<p class="text-sm text-slate-600 dark:text-slate-400">
			Compare performance degradation from Offline (batch) to Server (online) scenarios for systems
			that have data in both scenarios.
		</p>
	</div>

	{#if offlineServerComparison.length === 0}
		<div
			class="rounded-lg border border-amber-200 bg-amber-50 p-6 text-center dark:border-amber-800 dark:bg-amber-900/20"
		>
			<p class="font-medium text-amber-800 dark:text-amber-200">
				No systems found with both Offline and Server results
			</p>
			<p class="mt-1 text-sm text-amber-600 dark:text-amber-400">
				Select both Offline and Server scenarios to see comparison data
			</p>
		</div>
	{:else}
		<!-- Stats Cards -->
		<div class="grid grid-cols-3 gap-4">
			<div
				class="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800"
			>
				<div class="text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400">
					Average Degradation
				</div>
				<div class="mt-1 text-2xl font-bold text-amber-600 dark:text-amber-400">
					{formatPercent(degradationStats.avg)}
				</div>
			</div>
			<div
				class="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800"
			>
				<div class="text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400">
					Minimum Degradation
				</div>
				<div class="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
					{formatPercent(degradationStats.min)}
				</div>
			</div>
			<div
				class="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800"
			>
				<div class="text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400">
					Maximum Degradation
				</div>
				<div class="mt-1 text-2xl font-bold text-red-600 dark:text-red-400">
					{formatPercent(degradationStats.max)}
				</div>
			</div>
		</div>

		<!-- Comparison Chart -->
		<div
			class="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800"
		>
			<div
				class="border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/50"
			>
				<h3 class="text-lg font-semibold text-slate-900 dark:text-white">
					Performance Degradation: Offline → Server
				</h3>
				<p class="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
					Higher degradation = more performance loss in Server mode
				</p>
			</div>

			<div class="space-y-4 p-4">
				{#each offlineServerComparison as comparison (comparison.systemName)}
					{@const maxDegradation = Math.max(
						...offlineServerComparison.map((c) => c.degradation),
						1
					)}
					{@const barWidth = (comparison.degradation / maxDegradation) * 100}
					<div>
						<div class="mb-1 flex items-center justify-between">
							<span class="max-w-md truncate text-sm text-slate-700 dark:text-slate-300">
								{comparison.systemName}
								<span class="text-slate-400 dark:text-slate-500">({comparison.organization})</span>
							</span>
							<span
								class="font-mono text-sm font-medium"
								style="color: {getDegradationColor(comparison.degradation)};"
							>
								{formatPercent(comparison.degradation)}
							</span>
						</div>
						<div class="h-6 overflow-hidden rounded bg-slate-100 dark:bg-slate-700">
							<div
								class="h-full rounded transition-all duration-300 ease-out"
								style="width: {barWidth}%; background-color: {getDegradationColor(
									comparison.degradation
								)};"
							></div>
						</div>
						<div class="mt-1 flex justify-between text-xs text-slate-500 dark:text-slate-400">
							<span>Offline: {formatPerformance(comparison.offlinePerformance)}</span>
							<span>Server: {formatPerformance(comparison.serverPerformance)}</span>
						</div>
					</div>
				{/each}
			</div>
		</div>

		<!-- Detailed Table -->
		<details
			class="rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800"
		>
			<summary
				class="cursor-pointer px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700/50"
			>
				Detailed Comparison Table
			</summary>
			<div class="overflow-x-auto border-t border-slate-200 dark:border-slate-700">
				<table class="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
					<thead class="bg-slate-50 dark:bg-slate-800/50">
						<tr>
							<th class="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase"
								>System</th
							>
							<th class="px-4 py-2 text-right text-xs font-medium text-slate-500 uppercase"
								>Offline</th
							>
							<th class="px-4 py-2 text-right text-xs font-medium text-slate-500 uppercase"
								>Server</th
							>
							<th class="px-4 py-2 text-right text-xs font-medium text-slate-500 uppercase"
								>Degradation</th
							>
							<th class="px-4 py-2 text-right text-xs font-medium text-slate-500 uppercase"
								>Server/Offline</th
							>
						</tr>
					</thead>
					<tbody class="divide-y divide-slate-200 dark:divide-slate-700">
						{#each offlineServerComparison as comparison (comparison.systemName)}
							<tr class="hover:bg-slate-50 dark:hover:bg-slate-700/50">
								<td class="px-4 py-2 text-sm text-slate-900 dark:text-white"
									>{comparison.systemName}</td
								>
								<td class="px-4 py-2 text-right font-mono text-sm"
									>{formatPerformance(comparison.offlinePerformance)}</td
								>
								<td class="px-4 py-2 text-right font-mono text-sm"
									>{formatPerformance(comparison.serverPerformance)}</td
								>
								<td
									class="px-4 py-2 text-right font-mono text-sm"
									style="color: {getDegradationColor(comparison.degradation)};"
								>
									{formatPercent(comparison.degradation)}
								</td>
								<td
									class="px-4 py-2 text-right font-mono text-sm text-slate-600 dark:text-slate-400"
								>
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
