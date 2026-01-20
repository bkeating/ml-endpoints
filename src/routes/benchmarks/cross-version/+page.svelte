<script>
	import {
		getSelectedModel,
		getAllData
	} from '$lib/stores/benchmarkFilters.svelte.js';
	import { getOrgColor } from '$lib/constants/colors.js';

	let currentModel = $derived(getSelectedModel());

	// Cross-version comparison data
	let crossVersionData = $derived.by(() => {
		const allData = getAllData();
		// Find all versions that have the current model
		const versionsWithModel = [...new Set(allData.filter((d) => d.model === currentModel).map((d) => d.version))];
		
		if (versionsWithModel.length < 2) {
			return { available: false, versions: versionsWithModel, data: [] };
		}

		// Group by system+accelerator across versions
		/** @type {Map<string, { systemName: string, organization: string, accelerator: string, results: Record<string, number> }>} */
		const systemMap = new Map();

		for (const result of allData.filter((d) => d.model === currentModel)) {
			const key = `${result.systemName}-${result.accelerator}-${result.scenario}`;
			if (!systemMap.has(key)) {
				systemMap.set(key, {
					systemName: result.systemName,
					organization: result.organization,
					accelerator: result.accelerator,
					results: {}
				});
			}
			const entry = systemMap.get(key);
			if (entry) {
				entry.results[result.version] = result.performance;
			}
		}

		// Filter to systems with multiple versions
		const multiVersionSystems = [...systemMap.values()].filter(
			(s) => Object.keys(s.results).length > 1
		);

		return {
			available: versionsWithModel.length >= 2,
			versions: versionsWithModel.sort(),
			data: multiVersionSystems
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
</script>

<div class="space-y-6">
	<div class="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
		<h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-2">
			Compare Performance Across Versions
		</h3>
		<p class="text-sm text-slate-600 dark:text-slate-400">
			Compare how systems perform across different MLPerf versions. This helps track performance
			improvements and identify optimization opportunities.
		</p>
	</div>

	<div class="bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
		<h4 class="text-md font-medium text-slate-900 dark:text-white mb-1">
			Comparing <strong>{currentModel}</strong> across versions
		</h4>
	</div>

	{#if !crossVersionData.available}
		<div
			class="bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800 rounded-lg p-6 text-center"
		>
			<p class="text-sky-800 dark:text-sky-200 font-medium">
				{currentModel} is only available in {crossVersionData.versions.length} version(s).
			</p>
			<p class="text-sky-600 dark:text-sky-400 text-sm mt-1">
				Cross-version comparison requires the model to be present in at least 2 versions.
			</p>
			{#if crossVersionData.versions.length > 0}
				<p class="text-sky-600 dark:text-sky-400 text-sm mt-2">
					Available in: {crossVersionData.versions.join(', ')}
				</p>
			{/if}
		</div>
	{:else if crossVersionData.data.length === 0}
		<div
			class="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6 text-center"
		>
			<p class="text-amber-800 dark:text-amber-200 font-medium">
				No systems found with results across multiple versions
			</p>
			<p class="text-amber-600 dark:text-amber-400 text-sm mt-1">
				This model exists in versions {crossVersionData.versions.join(', ')}, but no identical
				system configurations were found across versions.
			</p>
		</div>
	{:else}
		<div class="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
			<div class="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
				<p class="text-sm text-slate-600 dark:text-slate-400">
					Found {crossVersionData.data.length} system(s) with results across multiple versions
				</p>
			</div>
			<div class="overflow-x-auto">
				<table class="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
					<thead class="bg-slate-50 dark:bg-slate-800/50">
						<tr>
							<th class="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">System</th>
							<th class="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Organization</th>
							<th class="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Accelerator</th>
							{#each crossVersionData.versions as version (version)}
								<th class="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">{version}</th>
							{/each}
						</tr>
					</thead>
					<tbody class="divide-y divide-slate-200 dark:divide-slate-700">
						{#each crossVersionData.data as system (system.systemName + system.accelerator)}
							<tr class="hover:bg-slate-50 dark:hover:bg-slate-700/50">
								<td class="px-4 py-3 text-sm text-slate-900 dark:text-white">{system.systemName}</td>
								<td class="px-4 py-3 text-sm">
									<span
										class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-white"
										style="background-color: {getOrgColor(system.organization)};"
									>
										{system.organization}
									</span>
								</td>
								<td class="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{system.accelerator}</td>
								{#each crossVersionData.versions as version (version)}
									<td class="px-4 py-3 text-sm text-right font-mono">
										{#if system.results[version]}
											{formatPerformance(system.results[version])}
										{:else}
											<span class="text-slate-400">—</span>
										{/if}
									</td>
								{/each}
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	{/if}
</div>
