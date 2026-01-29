<script>
	/**
	 * GTC Chart Filters Sidebar - Sidebar component for chart filtering.
	 *
	 * This component provides:
	 * - Model filter (at top)
	 * - Systems selection with inline accordion details
	 * - Smooth slide transitions for expand/collapse
	 * - Sticky positioning for easy access during scroll
	 */
	import { slide } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import FilterSelect from '$lib/components/FilterSelect.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import GridIcon from '$lib/components/icons/Grid.svelte';
	import GraphIcon from '$lib/components/icons/Graph.svelte';
	import { modelOptions, getModel, setModel } from '$lib/stores/chartFilters.svelte.js';
	import { isModelVisible, toggleModel } from '$lib/stores/chartSettings.svelte.js';
	import { allGpuConfigs, gpuNames, gpuColors } from '$lib/data/placeholders.js';
	import gtcData from '../data.json';

	// Reactive getters - these automatically update when store values change
	let currentModel = $derived(getModel());

	// Benchmark category state and options
	let benchmarkCategory = $state('performance');
	const benchmarkCategoryOptions = [
		{ id: 'performance', label: 'Performance (MLPerf)' },
		{ id: 'risk', label: 'Risk & Reliability (AIRR)' }
	];

	// Benchmark type state and options
	let benchmarkType = $state('all');
	const benchmarkTypeOptions = [
		{ id: 'all', label: 'All' },
		{ id: 'benchmark1', label: 'Benchmark 1' },
		{ id: 'benchmark2', label: 'Benchmark 2' }
	];

	// Data display mode state (grid or graph)
	let dataDisplay = $state('graph');

	// Track which systems have been manually collapsed (expanded by default when visible)
	let collapsedSystems = $state(/** @type {Set<string>} */ (new Set()));

	/**
	 * Toggle the collapsed state for a system's details
	 * @param {string} id - System ID to toggle
	 */
	function toggleCollapsed(id) {
		if (collapsedSystems.has(id)) {
			collapsedSystems.delete(id);
		} else {
			collapsedSystems.add(id);
		}
		// Trigger reactivity by reassigning
		collapsedSystems = new Set(collapsedSystems);
	}

	/**
	 * Check if a system's details should be expanded
	 * @param {string} id - System ID to check
	 * @param {boolean} visible - Whether the system is visible
	 * @returns {boolean} - True if expanded
	 */
	function isExpanded(id, visible) {
		return visible && !collapsedSystems.has(id);
	}

	// Build hardware models list from GPU configs with system data
	let hardwareModels = $derived(
		allGpuConfigs.map((id) => {
			const systemData = gtcData.systems[id];
			return {
				id,
				name: gpuNames[id] ?? id,
				color: gpuColors[id] ?? '#64748b',
				system: systemData ?? null
			};
		})
	);
</script>

<aside
	class="sticky top-24 hidden h-fit max-h-[calc(100vh-7rem)] w-80 shrink-0 overflow-y-auto rounded-lg border border-slate-700 bg-slate-800/90 p-4 shadow-lg backdrop-blur-sm lg:block"
	aria-label="Chart filters sidebar"
>
	<div class="flex flex-col gap-6">
		<!-- Benchmark Category -->
		<fieldset class="flex flex-col gap-1">
			<legend class="dm-mono text-xs font-medium tracking-wide text-slate-400 uppercase mb-1">
				Benchmark Category
			</legend>
			<div class="mt-1 flex flex-col rounded-lg border border-slate-600 bg-slate-800 overflow-hidden" role="radiogroup">
				{#each benchmarkCategoryOptions as option, i (option.id)}
					<label class=" flex cursor-pointer items-center gap-2 px-3 py-2 transition-colors hover:bg-slate-700 {benchmarkCategory === option.id ? 'bg-slate-700' : ''} {i > 0 ? 'border-t border-slate-600' : ''}">
						<input
							type="radio"
							name="benchmarkCategory"
							value={option.id}
							checked={benchmarkCategory === option.id}
							onchange={() => (benchmarkCategory = option.id)}
							class="h-4 w-4 border-slate-600 text-emerald-600 focus:ring-emerald-500"
						/>
						<span class="text-sm text-slate-300">{option.label}</span>
					</label>
				{/each}
			</div>
		</fieldset>

		<!-- Benchmark Type -->
		<fieldset class="flex flex-col gap-1">
			<legend class="dm-mono text-xs font-medium tracking-wide text-slate-400 uppercase mb-1">
				Benchmark Type
			</legend>
			<div class="mt-1 flex flex-col rounded-lg border border-slate-600 bg-slate-800 overflow-hidden" role="radiogroup">
				{#each benchmarkTypeOptions as option, i (option.id)}
					<label class=" flex cursor-pointer items-center gap-2 px-3 py-2 transition-colors hover:bg-slate-700 {benchmarkType === option.id ? 'bg-slate-700' : ''} {i > 0 ? 'border-t border-slate-600' : ''}">
						<input
							type="radio"
							name="benchmarkType"
							value={option.id}
							checked={benchmarkType === option.id}
							onchange={() => (benchmarkType = option.id)}
							class="h-4 w-4 border-slate-600 text-emerald-600 focus:ring-emerald-500"
						/>
						<span class="text-sm text-slate-300">{option.label}</span>
					</label>
				{/each}
			</div>
		</fieldset>

		<!-- Data Display Toggle -->
		<fieldset class="flex flex-col gap-1">
			<legend class="dm-mono text-xs tracking-wide text-slate-400 uppercase mb-1">
				Data Display
			</legend>
			<div class="mt-1 flex rounded-lg border border-slate-600 bg-slate-800 overflow-hidden" role="radiogroup">
				<button
					type="button"
					onclick={() => (dataDisplay = 'grid')}
					class="flex flex-1 cursor-pointer items-center justify-center gap-2 px-3 py-2 transition-colors {dataDisplay === 'grid' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-slate-700 hover:text-slate-200'}"
					aria-pressed={dataDisplay === 'grid'}
					aria-label="Grid view"
				>
					<GridIcon class="h-4 w-4" />
					<span class="text-sm">Grid</span>
				</button>
				<button
					type="button"
					onclick={() => (dataDisplay = 'graph')}
					class="flex flex-1 cursor-pointer items-center justify-center gap-2 border-l border-slate-600 px-3 py-2 transition-colors {dataDisplay === 'graph' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-slate-700 hover:text-slate-200'}"
					aria-pressed={dataDisplay === 'graph'}
					aria-label="Graph view"
				>
					<GraphIcon class="h-4 w-4" />
					<span class="text-sm">Graph</span>
				</button>
			</div>
		</fieldset>

		<!-- Model Select -->
		<!-- <div class="w-full">
			<FilterSelect
				id="gtc-model-select"
				label="Model"
				value={currentModel}
				options={modelOptions}
				onchange={(v) => setModel(/** @type {any} */ (v))}
				minWidth="w-full"
				maxWidth=""
			/>
		</div> -->

		<!-- Systems Selection Section with Inline Accordion -->
		<div>
		<h4
			class="mb-2 text-[10px] font-bold tracking-widest text-slate-400 uppercase"
		>
			Systems
		</h4>
			<div class="flex flex-col gap-0.5">
				{#each hardwareModels as model (model.id)}
					{@const visible = isModelVisible(model.id)}
					{@const expanded = isExpanded(model.id, visible)}
					<div
						class="rounded-lg transition-all duration-200 {expanded ? 'border' : ''}"
						style="background-color: {expanded ? model.color + '08' : 'transparent'}; border-color: {expanded ? model.color + '40' : 'transparent'};"
					>
						<!-- Legend Row with Toggle and Expand Controls -->
						<div class="flex w-full items-center gap-1 rounded-lg transition-all duration-200 {expanded ? '' : 'hover:bg-slate-700'}">
							<!-- Visibility Toggle Button -->
							<button
								type="button"
								onclick={() => toggleModel(model.id)}
								class="group flex flex-1 cursor-pointer items-center gap-3 px-3 py-2 text-left"
								aria-pressed={visible}
								aria-label="Toggle {model.name} visibility"
							>
								<span
									class="h-3 w-3 rounded-full transition-opacity duration-200"
									style="background-color: {model.color}; opacity: {visible ? 1 : 0.3};"
								></span>
								<span
									class="flex-1 text-sm font-medium transition-opacity duration-200 {visible
										? 'text-slate-200'
										: 'text-slate-500 line-through'}"
								>
									{model.name}
								</span>
							</button>
							<!-- Expand/Collapse Chevron (only shown when visible and system data exists) -->
							{#if visible && model.system}
								<button
									type="button"
									onclick={() => toggleCollapsed(model.id)}
									class="mr-2 p-1 rounded transition-colors hover:bg-slate-700"
									aria-expanded={expanded}
									aria-label="{expanded ? 'Collapse' : 'Expand'} {model.name} details"
								>
									<Icon
										name="ChevronDown"
										class="h-4 w-4 text-slate-400 transition-transform duration-200 {expanded ? 'rotate-180' : ''}"
									/>
								</button>
							{/if}
						</div>

						<!-- Accordion Details Panel -->
						{#if expanded && model.system}
							<div
								transition:slide={{ duration: 200, easing: cubicOut }}
								class="px-3 pb-3 text-xs"
							>
								<!-- System Header -->
								<div class="mb-2">
									<p class="font-semibold text-slate-200 leading-tight text-[11px]">
										{model.system.system_name}
									</p>
									<p class="text-slate-400 text-[10px]">
										{model.system.submitter} / {model.system.division}
									</p>
								</div>

								<!-- Config Details -->
								<dl class="space-y-1.5 text-[11px]">
									<!-- Inference Framework -->
									<div>
										<dt class="font-medium text-slate-400">Framework</dt>
										<dd class="text-slate-200">{model.system.inference_framework}</dd>
									</div>

									<!-- Accelerator -->
									<div>
										<dt class="font-medium text-slate-400">Accelerator</dt>
										<dd class="text-slate-200">
											{model.system.accelerator.count}x {model.system.accelerator.model_name}
										</dd>
										<dd class="text-slate-400 text-[10px]">
											{model.system.accelerator.memory_capacity} {model.system.accelerator.memory_configuration} | {model.system.accelerator.memory_bandwidth}
										</dd>
									</div>

									<!-- Host -->
									<div>
										<dt class="font-medium text-slate-400">Host</dt>
										<dd class="text-slate-200">
											{model.system.host.processors_per_node}x {model.system.host.processor_model_name}
										</dd>
										<dd class="text-slate-400 text-[10px]">
											{model.system.host.memory_capacity} RAM
										</dd>
									</div>

									<!-- Software -->
									<div>
										<dt class="font-medium text-slate-400">Software</dt>
										<dd class="text-slate-400 text-[10px] wrap-break-word">
											{model.system.software.framework}
										</dd>
									</div>
								</dl>

								<!-- View Report Button -->
								<button
									type="button"
									class="mt-3 w-full rounded-md px-3 py-1.5 text-[11px] font-medium text-white transition-colors hover:opacity-90"
									style="background-color: {model.color};"
									aria-label="View benchmark report for {model.system.system_name}"
								>
									View Benchmark Report
								</button>
							</div>
						{/if}
					</div>
				{/each}
			</div>
		</div>
	</div>
</aside>
