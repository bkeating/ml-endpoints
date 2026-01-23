<script>
	import { getSelectedModel, getFilteredResults } from '$lib/stores/benchmarkFilters.svelte.js';
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
	<div
		class="rounded-lg border border-sky-200 bg-sky-50 p-4 dark:border-sky-800 dark:bg-sky-900/20"
	>
		<p class="text-sm text-sky-800 dark:text-sky-200">
			<strong>Note:</strong> These calculations assume linear scaling, which is an approximation. When
			upscaling (e.g., 1 → 8 accelerators), results tend to over-estimate actual performance. When downscaling
			(e.g., 16 → 8 accelerators), results tend to under-estimate.
		</p>
	</div>

	{#if normalizedWithBenefit.length === 0}
		<div
			class="rounded-lg border border-amber-200 bg-amber-50 p-6 text-center dark:border-amber-800 dark:bg-amber-900/20"
		>
			<p class="font-medium text-amber-800 dark:text-amber-200">No results match your filters</p>
		</div>
	{:else}
		{#each Object.entries(normalizedByScenario) as [scenario, results] (scenario)}
			{@const minPerf = Math.min(...results.map((r) => r.normalizedPerformance))}
			{@const baselineSystem = results.find((r) => r.normalizedPerformance === minPerf)}
			<div
				class="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800"
			>
				<div
					class="border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/50"
				>
					<h3 class="font-instrument-sans-600 text-lg font-semibold text-slate-900 dark:text-white">
						{currentModel} - {scenario} (Normalized per Accelerator)
					</h3>
					<p class="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
						Performance per Accelerator (Tokens/s/Accelerator) - Higher is Better
					</p>
					{#if baselineSystem}
						<p class="mt-1 text-xs text-slate-400 dark:text-slate-500">
							Baseline: {baselineSystem.systemName} ({formatPerformance(minPerf)} tokens/s/acc)
						</p>
					{/if}
				</div>

				<div class="p-4">
					<div class="space-y-3">
						{#each results as result (result.id)}
							{@const barWidth = (result.normalizedPerformance / maxNormalizedPerformance) * 100}
							<div class="group">
								<div class="mb-1 flex items-center justify-between">
									<span
										class="max-w-md truncate text-sm text-slate-700 dark:text-slate-300"
										title={result.systemName}
									>
										{result.systemName}
										<span class="text-slate-400 dark:text-slate-500">({result.organization})</span>
										<span class="ml-1 text-xs text-amber-600 dark:text-amber-400">†</span>
									</span>
									<div class="flex items-center gap-3">
										<span class="text-xs text-emerald-600 dark:text-emerald-400">
											+{formatPercent(result.performanceBenefit)}
										</span>
										<span class="font-mono text-sm font-medium text-slate-900 dark:text-white">
											{formatPerformance(result.normalizedPerformance)}
										</span>
									</div>
								</div>
								<div class="h-8 overflow-hidden rounded bg-slate-100 dark:bg-slate-700">
									<div
										class="flex h-full items-center rounded px-2 transition-all duration-300 ease-out"
										style="width: {barWidth}%; background-color: {getOrgColor(
											result.organization
										)};"
									>
										{#if barWidth > 20}
											<span class="truncate text-xs font-medium text-white">
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

		<p class="text-xs text-slate-500 italic dark:text-slate-400">
			† Result not verified by MLCommons Association. Normalized scores are derived calculations.
		</p>
	{/if}
</div>
