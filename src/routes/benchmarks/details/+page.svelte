<script>
	import { getFilteredResults } from '$lib/stores/benchmarkFilters.svelte.js';
	import { getOrgColor } from '$lib/constants/colors.js';

	let filteredResults = $derived(getFilteredResults());

	/**
	 * Format performance number with commas
	 * @param {number} value
	 * @returns {string}
	 */
	function formatPerformance(value) {
		return value.toLocaleString('en-US', { maximumFractionDigits: 2 });
	}
</script>

<div
	class="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden"
>
	<div class="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
		<p class="text-sm text-slate-600 dark:text-slate-400">
			<strong>Tip:</strong> Click on column headers to sort. Showing {filteredResults.length} results.
		</p>
	</div>
	<div class="overflow-x-auto">
		<table class="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
			<thead class="bg-slate-50 dark:bg-slate-800/50">
				<tr>
					<th
						scope="col"
						class="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider"
					>
						System
					</th>
					<th
						scope="col"
						class="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider"
					>
						Organization
					</th>
					<th
						scope="col"
						class="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider"
					>
						Scenario
					</th>
					<th
						scope="col"
						class="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider"
					>
						Accelerator
					</th>
					<th
						scope="col"
						class="px-4 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider"
					>
						Count
					</th>
					<th
						scope="col"
						class="px-4 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider"
					>
						Performance
					</th>
				</tr>
			</thead>
			<tbody class="divide-y divide-slate-200 dark:divide-slate-700">
				{#each filteredResults as result (result.id)}
					<tr class="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
						<td class="px-4 py-3 text-sm text-slate-900 dark:text-white max-w-xs truncate" title={result.systemName}>
							{result.systemName}
						</td>
						<td class="px-4 py-3 text-sm">
							<span
								class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-white"
								style="background-color: {getOrgColor(result.organization)};"
							>
								{result.organization}
							</span>
						</td>
						<td class="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
							{result.scenario}
						</td>
						<td class="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
							{result.accelerator}
						</td>
						<td class="px-4 py-3 text-sm text-slate-600 dark:text-slate-400 text-right font-mono">
							{result.acceleratorCount}
						</td>
						<td class="px-4 py-3 text-sm font-medium text-slate-900 dark:text-white text-right font-mono">
							{formatPerformance(result.performance)}
						</td>
					</tr>
				{:else}
					<tr>
						<td colspan="6" class="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
							No results match your current filters
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
