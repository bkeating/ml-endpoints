<script>
	import { getSelectedModel, getFilteredResults } from '$lib/stores/benchmarkFilters.svelte.js';
	import { getOrgColor } from '$lib/constants/colors.js';

	let currentModel = $derived(getSelectedModel());
	let filteredResults = $derived(getFilteredResults());

	// Group results by scenario for the comparisons tab
	let resultsByScenario = $derived.by(() => {
		/** @type {Record<string, typeof filteredResults>} */
		const grouped = {};
		for (const result of filteredResults) {
			if (!grouped[result.scenario]) {
				grouped[result.scenario] = [];
			}
			grouped[result.scenario].push(result);
		}
		// Sort each group by performance descending
		for (const scenario of Object.keys(grouped)) {
			grouped[scenario].sort((a, b) => b.performance - a.performance);
		}
		return grouped;
	});

	// Calculate max performance for bar scaling
	let maxPerformance = $derived(
		filteredResults.length > 0 ? Math.max(...filteredResults.map((r) => r.performance)) : 1
	);

	/**
	 * Format performance number with commas
	 * @param {number} value
	 * @returns {string}
	 */
	function formatPerformance(value) {
		return value.toLocaleString('en-US', { maximumFractionDigits: 2 });
	}
</script>

<div class="space-y-6">
	{#if filteredResults.length === 0}
		<div
			class="rounded-lg border border-amber-200 bg-amber-50 p-6 text-center dark:border-amber-800 dark:bg-amber-900/20"
		>
			<p class="font-medium text-amber-800 dark:text-amber-200">No results match your filters</p>
			<p class="mt-1 text-sm text-amber-600 dark:text-amber-400">
				Try adjusting your filter selections to see benchmark data
			</p>
		</div>
	{:else}
		{#each Object.entries(resultsByScenario) as [scenario, results] (scenario)}
			<div
				class="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800"
			>
				<!-- Scenario Header -->
				<div
					class="border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/50"
				>
					<h3 class="font-instrument-sans-600 text-lg font-semibold text-slate-900 dark:text-white">
						{currentModel} - {scenario}
					</h3>
					<p class="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
						Performance (Tokens/s) - Higher is Better
					</p>
				</div>

				<!-- Horizontal Bar Chart -->
				<div class="p-4">
					<div class="space-y-3">
						{#each results as result (result.id)}
							{@const barWidth = (result.performance / maxPerformance) * 100}
							<div class="group">
								<!-- System Name -->
								<div class="mb-1 flex items-center justify-between">
									<span
										class="max-w-md truncate text-sm text-slate-700 dark:text-slate-300"
										title={result.systemName}
									>
										{result.systemName}
										<span class="text-slate-400 dark:text-slate-500">({result.organization})</span>
									</span>
									<span class="font-mono text-sm font-medium text-slate-900 dark:text-white">
										{formatPerformance(result.performance)}
									</span>
								</div>
								<!-- Bar -->
								<div class="h-8 overflow-hidden rounded bg-slate-100 dark:bg-slate-700">
									<div
										class="flex h-full items-center rounded px-2 transition-all duration-300 ease-out"
										style="width: {barWidth}%; background-color: {getOrgColor(
											result.organization
										)};"
									>
										{#if barWidth > 15}
											<span class="truncate text-xs font-medium text-white">
												{result.accelerator} × {result.acceleratorCount}
											</span>
										{/if}
									</div>
								</div>
								{#if barWidth <= 15}
									<span class="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">
										{result.accelerator} × {result.acceleratorCount}
									</span>
								{/if}
							</div>
						{/each}
					</div>
				</div>
			</div>
		{/each}
	{/if}
</div>
