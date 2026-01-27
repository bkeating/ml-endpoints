<script>
	/**
	 * GTC Chart Filters Sidebar - Sidebar component for chart filtering.
	 *
	 * This component provides:
	 * - Model filter (at top)
	 * - Systems selection using LegendItem components
	 * - System configuration details for enabled systems
	 * - Sticky positioning for easy access during scroll
	 */
	import LegendItem from '$lib/components/LegendItem.svelte';
	import FilterSelect from '$lib/components/FilterSelect.svelte';
	import { modelOptions, getModel, setModel } from '$lib/stores/chartFilters.svelte.js';
	import { isModelVisible, toggleModel, getVisibleModelIds } from '$lib/stores/chartSettings.svelte.js';
	import { allGpuConfigs, gpuNames, gpuColors } from '$lib/data/placeholders.js';
	import gtcData from '../data.json';

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

	// Get visible system configs with full details from data.json
	let visibleSystemConfigs = $derived(
		getVisibleModelIds()
			.map((id) => {
				const systemData = gtcData.systems[id];
				if (!systemData) return null;
				return {
					id,
					color: gpuColors[id] ?? '#64748b',
					...systemData
				};
			})
			.filter(Boolean)
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

		<!-- Enabled System Configurations -->
		{#if visibleSystemConfigs.length > 0}
			<div class="flex flex-col gap-3">
				<h4
					class="text-[10px] font-bold tracking-widest text-slate-500 uppercase dark:text-slate-400"
				>
					System Details
				</h4>
				{#each visibleSystemConfigs as config (config.id)}
					<div
						class="rounded-lg border p-3 text-xs"
						style="border-color: {config.color}40; background-color: {config.color}08;"
					>
						<!-- System Header -->
						<div class="mb-2 flex items-start gap-2">
							<span
								class="mt-1 h-2 w-2 shrink-0 rounded-full"
								style="background-color: {config.color};"
							></span>
							<div class="min-w-0">
								<p class="font-semibold text-slate-800 dark:text-slate-200 leading-tight">
									{config.system_name}
								</p>
								<p class="text-slate-500 dark:text-slate-400 text-[10px]">
									{config.submitter} / {config.division}
								</p>
							</div>
						</div>

						<!-- Config Details -->
						<dl class="space-y-1.5 text-[11px]">
							<!-- Inference Framework -->
							<div>
								<dt class="font-medium text-slate-600 dark:text-slate-400">Framework</dt>
								<dd class="text-slate-800 dark:text-slate-200">{config.inference_framework}</dd>
							</div>

							<!-- Accelerator -->
							<div>
								<dt class="font-medium text-slate-600 dark:text-slate-400">Accelerator</dt>
								<dd class="text-slate-800 dark:text-slate-200">
									{config.accelerator.count}x {config.accelerator.model_name}
								</dd>
								<dd class="text-slate-500 dark:text-slate-400 text-[10px]">
									{config.accelerator.memory_capacity} {config.accelerator.memory_configuration} | {config.accelerator.memory_bandwidth}
								</dd>
							</div>

							<!-- Host -->
							<div>
								<dt class="font-medium text-slate-600 dark:text-slate-400">Host</dt>
								<dd class="text-slate-800 dark:text-slate-200">
									{config.host.processors_per_node}x {config.host.processor_model_name}
								</dd>
								<dd class="text-slate-500 dark:text-slate-400 text-[10px]">
									{config.host.memory_capacity} RAM
								</dd>
							</div>

							<!-- Software -->
							<div>
								<dt class="font-medium text-slate-600 dark:text-slate-400">Software</dt>
								<dd class="text-slate-500 dark:text-slate-400 text-[10px] wrap-break-word">
									{config.software.framework}
								</dd>
							</div>
						</dl>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</aside>
