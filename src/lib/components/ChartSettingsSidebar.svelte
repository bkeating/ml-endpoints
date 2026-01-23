<script>
	/**
	 * Compact sidebar for chart settings (hardware toggles + display options).
	 * Provides quick access to common chart controls without scrolling to main filters.
	 *
	 * Uses the same global stores as ChartFilters for consistent state management.
	 */
	import LegendItem from '$lib/components/LegendItem.svelte';
	import {
		isModelVisible,
		toggleModel,
		getHideNonOptimal,
		toggleNonOptimal,
		getHideLabels,
		toggleLabels
	} from '$lib/stores/chartSettings.svelte.js';
	import { allGpuConfigs, gpuNames, gpuColors } from '$lib/data/placeholders.js';

	// Reactive getters - these automatically update when store values change
	let hideNonOptimal = $derived(getHideNonOptimal());
	let hideLabels = $derived(getHideLabels());

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
	class="flex flex-col gap-4 rounded-lg border border-slate-200 bg-slate-50/80 p-3 shadow-lg backdrop-blur-sm dark:border-slate-700 dark:bg-slate-800/60"
	aria-label="Chart quick settings"
>
	<!-- Hardware Legend Section -->
	<div>
		<h4
			class="mb-2 text-[10px] font-bold tracking-widest text-slate-500 uppercase dark:text-slate-400"
		>
			Hardware
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

	<!-- Divider -->
	<div class="h-px bg-slate-200 dark:bg-slate-700"></div>

	<!-- Display Options Section -->
	<div>
		<h4
			class="mb-2 text-[10px] font-bold tracking-widest text-slate-500 uppercase dark:text-slate-400"
		>
			Display
		</h4>
		<div class="flex flex-col gap-2">
			<label
				class="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-slate-100 dark:hover:bg-slate-700/50"
			>
				<input
					type="checkbox"
					checked={hideNonOptimal}
					onchange={toggleNonOptimal}
					class="h-3.5 w-3.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 focus:ring-offset-0 dark:border-slate-600 dark:bg-slate-800"
				/>
				<span class="text-xs font-medium text-slate-700 dark:text-slate-300">Hide Non-Optimal</span>
			</label>
			<label
				class="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-slate-100 dark:hover:bg-slate-700/50"
			>
				<input
					type="checkbox"
					checked={hideLabels}
					onchange={toggleLabels}
					class="h-3.5 w-3.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 focus:ring-offset-0 dark:border-slate-600 dark:bg-slate-800"
				/>
				<span class="text-xs font-medium text-slate-700 dark:text-slate-300">Hide Labels</span>
			</label>
		</div>
	</div>
</aside>
