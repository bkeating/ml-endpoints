<script>
	/**
	 * GTC Chart Filters Sidebar - Sidebar component for chart filtering.
	 * 
	 * This component provides:
	 * - Model filter (at top)
	 * - Systems selection using LegendItem components
	 * - Sticky positioning for easy access during scroll
	 */
	import LegendItem from '$lib/components/LegendItem.svelte';
	import FilterSelect from '$lib/components/FilterSelect.svelte';
	import { modelOptions, getModel, setModel } from '$lib/stores/chartFilters.svelte.js';
	import { isModelVisible, toggleModel } from '$lib/stores/chartSettings.svelte.js';
	import { allGpuConfigs, gpuNames, gpuColors } from '$lib/data/placeholders.js';

	// Reactive getters - these automatically update when store values change
	let currentModel = $derived(getModel());

	// Build hardware models list from GPU configs
	let hardwareModels = $derived(
		allGpuConfigs.map((id) => ({
			id,
			name: gpuNames[id] ?? id,
			color: gpuColors[id] ?? '#64748b'
		}))
	);
</script>

<aside
	class="sticky top-24 hidden h-fit max-h-[calc(100vh-7rem)] w-80 shrink-0 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50/80 p-4 shadow-lg backdrop-blur-sm lg:block dark:border-slate-700 dark:bg-slate-800/60"
	aria-label="Chart filters sidebar"
>
	<div class="flex flex-col gap-6">
		<!-- Model Select (at top) -->
		<div class="w-full">
			<FilterSelect
				id="gtc-model-select"
				label="Model"
				value={currentModel}
				options={modelOptions}
				onchange={(v) => setModel(/** @type {any} */ (v))}
				minWidth="w-full"
				maxWidth=""
			/>
		</div>

		<!-- Systems Selection Section -->
		<div>
			<h4
				class="mb-2 text-[10px] font-bold tracking-widest text-slate-500 uppercase dark:text-slate-400"
			>
				Systems
			</h4>
			<div class="flex flex-col gap-0.5">
				{#each hardwareModels as model (model.id)}
					<LegendItem
						name={model.name}
						color={model.color}
						visible={isModelVisible(model.id)}
						ontoggle={() => toggleModel(model.id)}
					/>
				{/each}
			</div>
		</div>
	</div>
</aside>
