<script>
	/**
	 * GTC Chart Filters Sidebar - Sidebar component for chart filtering.
	 *
	 * This component provides:
	 * - Model, Processor, Accelerator, Organization filters (selects)
	 * - Systems selection with inline accordion details
	 * - Smooth slide transitions for expand/collapse
	 * - Sticky positioning for easy access during scroll
	 */
	import { slide } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { SvelteSet } from 'svelte/reactivity';
	import Icon from '$lib/components/Icon.svelte';
	import {
		isSystemVisible,
		toggleSystem,
		getSelectedBenchmarkModelId,
		setSelectedBenchmarkModelId
	} from '$lib/stores/chartSettings.svelte.js';
	import endpointsData from '../endpoints-benchmark-data.json';

	// ============================================================================
	// FILTER OPTIONS
	// ============================================================================

	// Model filter options from JSON data (benchmark models like "Llama 2 70B", "GPT-J 6B")
	const modelOptions = [
		{ id: 'all', label: 'All Models' },
		...endpointsData.models.map((model) => ({
			id: model.model_id,
			label: model.model_name
		}))
	];

	// Processor filter options
	const processorOptions = [
		{ id: 'all', label: 'All Processors' },
		{ id: 'amd-epyc-9534', label: 'AMD EPYC 9534' },
		{ id: 'amd-epyc-9655', label: 'AMD EPYC 9655' },
		{ id: 'amd-epyc-9755', label: 'AMD EPYC 9755' },
		{ id: 'intel-xeon-platinum-84', label: 'Intel(R) Xeon(R) Platinum 84' },
		{ id: 'intel-xeon-platinum-85', label: 'Intel(R) Xeon(R) Platinum 85' },
		{ id: 'intel-xeon-6787p', label: 'Intel(R) Xeon(R) 6787P' },
		{ id: 'nvidia-grace-cpu', label: 'Nvidia Grace CPU' }
	];

	// Accelerator filter options
	const acceleratorOptions = [
		{ id: 'all', label: 'All Accelerators' },
		{ id: 'amd-mi300x-192gb', label: 'AMD Instinct MI300X 192GB' },
		{ id: 'amd-mi325x-256gb', label: 'AMD Instinct MI325X 256GB' },
		{ id: 'nvidia-b200-sxm-180gb', label: 'NVIDIA B200-SXM-180GB' },
		{ id: 'nvidia-gb200', label: 'NVIDIA GB200' },
		{ id: 'nvidia-h200-nvl-141gb', label: 'NVIDIA H200-NVL-141GB' },
		{ id: 'nvidia-h200-sxm-141gb', label: 'NVIDIA H200-SXM-141GB' }
	];

	// Organization filter options
	const organizationOptions = [
		{ id: 'all', label: 'All Organizations' },
		{ id: 'mangoboost', label: 'MangoBoost' },
		{ id: 'mitac', label: 'MiTAC' },
		{ id: 'nvidia', label: 'NVIDIA' },
		{ id: 'nebius', label: 'Nebius' },
		{ id: 'oracle', label: 'Oracle' },
		{ id: 'quanta-cloud', label: 'Quanta_Cloud' }
	];

	// ============================================================================
	// FILTER STATE
	// ============================================================================

	// Model selection is managed by the store for cross-component reactivity
	let selectedModel = $derived(getSelectedBenchmarkModelId());

	let selectedProcessor = $state('all');
	let selectedAccelerator = $state('all');
	let selectedOrganization = $state('all');

	// Track which systems have been manually collapsed (expanded by default when visible)
	let collapsedSystems = new SvelteSet();

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

	// Build hardware systems list directly from endpoints data
	let hardwareSystems = $derived(
		endpointsData.systems.map((system) => ({
			id: system.id,
			name: system.system_name,
			color: system.color,
			system
		}))
	);
</script>

<aside
	class="sticky top-24 hidden h-fit max-h-[calc(100vh-7rem)] w-80 shrink-0 overflow-y-auto rounded-lg border border-slate-700 bg-slate-800/90 p-4 shadow-lg backdrop-blur-sm lg:block"
	aria-label="Chart filters sidebar"
>
	<div class="flex flex-col gap-5">
		<!-- Model Select -->
		<div class="flex flex-col gap-1.5">
			<label
				for="model-select"
				class="dm-mono text-xs font-medium tracking-wide text-slate-400 uppercase"
			>
				Model
			</label>
			<select
				id="model-select"
				value={selectedModel}
				onchange={(e) => setSelectedBenchmarkModelId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
				class="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-200 transition-colors focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
				aria-label="Select benchmark model"
			>
				{#each modelOptions as option (option.id)}
					<option value={option.id}>{option.label}</option>
				{/each}
			</select>
		</div>

		<!-- Processor Select -->
		<div class="flex flex-col gap-1.5">
			<label
				for="processor-select"
				class="dm-mono text-xs font-medium tracking-wide text-slate-400 uppercase"
			>
				Processor
			</label>
			<select
				id="processor-select"
				bind:value={selectedProcessor}
				class="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-200 transition-colors focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
				aria-label="Select processor"
			>
				{#each processorOptions as option (option.id)}
					<option value={option.id}>{option.label}</option>
				{/each}
			</select>
		</div>

		<!-- Accelerator Select -->
		<div class="flex flex-col gap-1.5">
			<label
				for="accelerator-select"
				class="dm-mono text-xs font-medium tracking-wide text-slate-400 uppercase"
			>
				Accelerator
			</label>
			<select
				id="accelerator-select"
				bind:value={selectedAccelerator}
				class="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-200 transition-colors focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
				aria-label="Select accelerator"
			>
				{#each acceleratorOptions as option (option.id)}
					<option value={option.id}>{option.label}</option>
				{/each}
			</select>
		</div>

		<!-- Organization Select -->
		<div class="flex flex-col gap-1.5">
			<label
				for="organization-select"
				class="dm-mono text-xs font-medium tracking-wide text-slate-400 uppercase"
			>
				Organization
			</label>
			<select
				id="organization-select"
				bind:value={selectedOrganization}
				class="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-200 transition-colors focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
				aria-label="Select organization"
			>
				{#each organizationOptions as option (option.id)}
					<option value={option.id}>{option.label}</option>
				{/each}
			</select>
		</div>

		<!-- Systems Selection Section with Inline Accordion -->
		<div>
		<h4
			class="mb-2 text-[10px] font-bold tracking-widest text-slate-400 uppercase"
		>
			Systems
		</h4>
			<div class="flex flex-col gap-0.5">
				{#each hardwareSystems as hw (hw.id)}
					{@const visible = isSystemVisible(hw.id)}
					{@const expanded = isExpanded(hw.id, visible)}
					<div
						class="rounded-lg transition-all duration-200 {expanded ? 'border' : ''}"
						style="background-color: {expanded ? hw.color + '08' : 'transparent'}; border-color: {expanded ? hw.color + '40' : 'transparent'};"
					>
						<!-- Legend Row with Toggle and Expand Controls -->
						<div class="flex w-full items-center gap-1 rounded-lg transition-all duration-200 {expanded ? '' : 'hover:bg-slate-700'}">
							<!-- Visibility Toggle Button -->
							<button
								type="button"
								onclick={() => toggleSystem(hw.id)}
								class="group flex flex-1 cursor-pointer items-center gap-3 px-3 py-2 text-left"
								aria-pressed={visible}
								aria-label="Toggle {hw.name} visibility"
							>
								<span
									class="h-3 w-3 rounded-full transition-opacity duration-200"
									style="background-color: {hw.color}; opacity: {visible ? 1 : 0.3};"
								></span>
								<span
									class="flex-1 text-sm font-medium transition-opacity duration-200 {visible
										? 'text-slate-200'
										: 'text-slate-500 line-through'}"
								>
									{hw.name}
								</span>
							</button>
							<!-- Expand/Collapse Chevron (only shown when visible and system data exists) -->
							{#if visible && hw.system}
								<button
									type="button"
									onclick={() => toggleCollapsed(hw.id)}
									class="mr-2 p-1 rounded transition-colors hover:bg-slate-700"
									aria-expanded={expanded}
									aria-label="{expanded ? 'Collapse' : 'Expand'} {hw.name} details"
								>
									<Icon
										name="ChevronDown"
										class="h-4 w-4 text-slate-400 transition-transform duration-200 {expanded ? 'rotate-180' : ''}"
									/>
								</button>
							{/if}
						</div>

						<!-- Accordion Details Panel -->
						{#if expanded && hw.system}
							<div
								transition:slide={{ duration: 200, easing: cubicOut }}
								class="px-3 pb-3 text-xs"
							>
								<!-- System Header -->
								<div class="mb-2">
									<p class="font-semibold text-slate-200 leading-tight text-[11px]">
										{hw.system.system_name}
									</p>
									<p class="text-slate-400 text-[10px]">
										{hw.system.submitter_org_names} / {hw.system.division}
									</p>
								</div>

								<!-- Config Details -->
								<dl class="space-y-1.5 text-[11px]">
									<!-- Framework -->
									<div>
										<dt class="font-medium text-slate-400">Framework</dt>
										<dd class="text-slate-200">{hw.system.framework}</dd>
									</div>

									<!-- Accelerator -->
									<div>
										<dt class="font-medium text-slate-400">Accelerator</dt>
										<dd class="text-slate-200">
											{hw.system.accelerators_per_node}x {hw.system.accelerator_model_name}
										</dd>
										<dd class="text-slate-400 text-[10px]">
											{hw.system.accelerator_memory_capacity} {hw.system.accelerator_memory_type}
										</dd>
									</div>

									<!-- Host -->
									<div>
										<dt class="font-medium text-slate-400">Host</dt>
										<dd class="text-slate-200">
											{hw.system.host_processors_per_node}x {hw.system.host_processor_model_name}
										</dd>
									</div>

									<!-- Category & Status -->
									<div>
										<dt class="font-medium text-slate-400">Category</dt>
										<dd class="text-slate-200">
											{hw.system.system_category}
											<span class="ml-1 text-slate-400">({hw.system.system_availability_status})</span>
										</dd>
									</div>
								</dl>

								<!-- View Report Button -->
								<button
									type="button"
									class="mt-3 w-full rounded-md px-3 py-1.5 text-[11px] font-medium text-white transition-colors hover:opacity-90"
									style="background-color: {hw.color};"
									aria-label="View benchmark report for {hw.system.system_name}"
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
