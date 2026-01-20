<script>
	import {
		getSelectedModel,
		getFilteredResults
	} from '$lib/stores/benchmarkFilters.svelte.js';
	import { getOrgColor } from '$lib/constants/colors.js';

	let currentModel = $derived(getSelectedModel());
	let filteredResults = $derived(getFilteredResults());

	// Normalized results (per accelerator)
	let normalizedResults = $derived.by(() => {
		return filteredResults.map((r) => ({
			...r,
			normalizedPerformance: r.performance / r.acceleratorCount,
			performanceBenefit: 0
		}));
	});

	// Calculate performance benefit percentage relative to lowest performer
	let normalizedWithBenefit = $derived.by(() => {
		if (normalizedResults.length === 0) return [];
		const minPerf = Math.min(...normalizedResults.map((r) => r.normalizedPerformance));
		return normalizedResults.map((r) => ({
			...r,
			performanceBenefit: minPerf > 0 ? ((r.normalizedPerformance - minPerf) / minPerf) * 100 : 0
		}));
	});

	// Group normalized results by scenario
	let normalizedByScenario = $derived.by(() => {
		/** @type {Record<string, typeof normalizedWithBenefit>} */
		const grouped = {};
		for (const result of normalizedWithBenefit) {
			if (!grouped[result.scenario]) {
				grouped[result.scenario] = [];
			}
			grouped[result.scenario].push(result);
		}
		for (const scenario of Object.keys(grouped)) {
			grouped[scenario].sort((a, b) => b.normalizedPerformance - a.normalizedPerformance);
		}
		return grouped;
	});

	// Max normalized performance for bar scaling
	let maxNormalizedPerformance = $derived(
		normalizedWithBenefit.length > 0
			? Math.max(...normalizedWithBenefit.map((r) => r.normalizedPerformance))
			: 1
	);

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
</script>

<div class="space-y-6">
	<!-- Info Banner -->
	<div class="bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800 rounded-lg p-4">
		<p class="text-sm text-sky-800 dark:text-sky-200">
			<strong>Note:</strong> These calculations assume linear scaling, which is an approximation.
			When upscaling (e.g., 1 → 8 accelerators), results tend to over-estimate actual performance.
			When downscaling (e.g., 16 → 8 accelerators), results tend to under-estimate.
		</p>
	</div>

	{#if normalizedWithBenefit.length === 0}
		<div
			class="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6 text-center"
		>
			<p class="text-amber-800 dark:text-amber-200 font-medium">No results match your filters</p>
		</div>
	{:else}
		{#each Object.entries(normalizedByScenario) as [scenario, results] (scenario)}
			{@const minPerf = Math.min(...results.map((r) => r.normalizedPerformance))}
			{@const baselineSystem = results.find((r) => r.normalizedPerformance === minPerf)}
			<div
				class="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden"
			>
				<div class="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
					<h3 class="text-lg font-semibold text-slate-900 dark:text-white font-instrument-sans-600">
						{currentModel} - {scenario} (Normalized per Accelerator)
					</h3>
					<p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
						Performance per Accelerator (Tokens/s/Accelerator) - Higher is Better
					</p>
					{#if baselineSystem}
						<p class="text-xs text-slate-400 dark:text-slate-500 mt-1">
							Baseline: {baselineSystem.systemName} ({formatPerformance(minPerf)} tokens/s/acc)
						</p>
					{/if}
				</div>

				<div class="p-4">
					<div class="space-y-3">
						{#each results as result (result.id)}
							{@const barWidth = (result.normalizedPerformance / maxNormalizedPerformance) * 100}
							<div class="group">
								<div class="flex items-center justify-between mb-1">
									<span
										class="text-sm text-slate-700 dark:text-slate-300 truncate max-w-md"
										title={result.systemName}
									>
										{result.systemName}
										<span class="text-slate-400 dark:text-slate-500">({result.organization})</span>
										<span class="text-amber-600 dark:text-amber-400 text-xs ml-1">†</span>
									</span>
									<div class="flex items-center gap-3">
										<span class="text-xs text-emerald-600 dark:text-emerald-400">
											+{formatPercent(result.performanceBenefit)}
										</span>
										<span class="text-sm font-mono font-medium text-slate-900 dark:text-white">
											{formatPerformance(result.normalizedPerformance)}
										</span>
									</div>
								</div>
								<div class="h-8 bg-slate-100 dark:bg-slate-700 rounded overflow-hidden">
									<div
										class="h-full rounded transition-all duration-300 ease-out flex items-center px-2"
										style="width: {barWidth}%; background-color: {getOrgColor(result.organization)};"
									>
										{#if barWidth > 20}
											<span class="text-xs font-medium text-white truncate">
												{result.accelerator} (÷{result.acceleratorCount})
											</span>
										{/if}
									</div>
								</div>
							</div>
						{/each}
					</div>
				</div>
			</div>
		{/each}

		<p class="text-xs text-slate-500 dark:text-slate-400 italic">
			† Result not verified by MLCommons Association. Normalized scores are derived calculations.
		</p>
	{/if}
</div>
