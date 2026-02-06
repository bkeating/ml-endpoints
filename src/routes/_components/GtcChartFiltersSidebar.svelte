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
		setSelectedBenchmarkModelId,
		getSelectedAccelerator,
		setSelectedAccelerator,
		isSystemDisabledByAccelerator
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

	// Build accelerator filter options dynamically from data
	// Extract unique accelerator model names from systems
	const uniqueAccelerators = [...new Set(endpointsData.systems.map((s) => s.accelerator_model_name))];
	const acceleratorOptions = [
		{ id: 'all', label: 'All Accelerators' },
		...uniqueAccelerators.map((name) => ({
			id: name,
			label: name
		}))
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

	// Model and accelerator selection is managed by the store for cross-component reactivity
	let selectedModel = $derived(getSelectedBenchmarkModelId());
	let selectedAccelerator = $derived(getSelectedAccelerator());

	let selectedProcessor = $state('all');
	let selectedOrganization = $state('all');

	// Track which systems have been manually expanded (collapsed by default)
	let expandedSystems = new SvelteSet();

	// Track which system is currently in edit/config mode (null = none)
	let editingSystemId = $state(null);

	// Track whether advanced filters are shown (hidden by default to save space)
	let showAdvancedFilters = $state(false);

	// Track panel heights for FLIP-style height animation
	let panelHeights = $state({});

	/**
	 * Svelte action to measure and track element height
	 * @param {HTMLElement} node - The element to measure
	 * @param {{ systemId: string, panel: 'read' | 'edit' }} params
	 */
	function measureHeight(node, { systemId, panel }) {
		const updateHeight = () => {
			const height = node.offsetHeight;
			if (!panelHeights[systemId]) {
				panelHeights[systemId] = { read: 0, edit: 0 };
			}
			if (panelHeights[systemId][panel] !== height) {
				panelHeights[systemId][panel] = height;
			}
		};

		// Initial measurement
		updateHeight();

		// Set up ResizeObserver for dynamic content
		const observer = new ResizeObserver(updateHeight);
		observer.observe(node);

		return {
			update({ systemId: newId, panel: newPanel }) {
				// Update params if they change
				systemId = newId;
				panel = newPanel;
				updateHeight();
			},
			destroy() {
				observer.disconnect();
			}
		};
	}

	/**
	 * Get the current height for a system's active panel
	 * @param {string} systemId - System ID
	 * @param {boolean} editing - Whether in edit mode
	 * @returns {number | string} - The height to use
	 */
	function getActiveHeight(systemId, editing) {
		const heights = panelHeights[systemId];
		if (!heights) return 'auto';
		const height = editing ? heights.edit : heights.read;
		return height > 0 ? height : 'auto';
	}

	/**
	 * Toggle the expanded state for a system's details
	 * @param {string} id - System ID to toggle
	 */
	function toggleExpanded(id) {
		if (expandedSystems.has(id)) {
			expandedSystems.delete(id);
			// Reset edit mode when collapsing
			if (editingSystemId === id) {
				editingSystemId = null;
			}
		} else {
			expandedSystems.add(id);
		}
	}

	/**
	 * Handle expand button click - if system is inactive, enable and expand it.
	 * If already active, just toggle expand state.
	 * @param {string} id - System ID
	 */
	function handleExpandClick(id) {
		const visible = isSystemVisible(id);
		if (!visible) {
			// Enable the system and expand it
			toggleSystem(id);
			expandedSystems.add(id);
		} else {
			// Just toggle expand state
			toggleExpanded(id);
		}
	}

	/**
	 * Check if a system's details should be expanded
	 * @param {string} id - System ID to check
	 * @param {boolean} visible - Whether the system is visible
	 * @returns {boolean} - True if expanded
	 */
	function isExpanded(id, visible) {
		return visible && expandedSystems.has(id);
	}

	/**
	 * Toggle edit mode for a system
	 * @param {string} id - System ID to toggle edit mode
	 */
	function toggleEditMode(id) {
		editingSystemId = editingSystemId === id ? null : id;
	}

	/**
	 * Check if a system is in edit mode
	 * @param {string} id - System ID to check
	 * @returns {boolean} - True if in edit mode
	 */
	function isEditing(id) {
		return editingSystemId === id;
	}

	/**
	 * Parse system name to extract main name and parenthetical details
	 * @param {string} systemName - Full system name e.g. "NVIDIA DGX B200 (8x B200-SXM-180GB, TensorRT)"
	 * @returns {{ main: string, subline: string|null }} - Main name and optional subline
	 */
	function parseSystemName(systemName) {
		const match = systemName.match(/^(.+?)\s*\((.+)\)\s*$/);
		if (match) {
			return { main: match[1].trim(), subline: match[2].trim() };
		}
		return { main: systemName, subline: null };
	}

	// Build hardware systems list directly from endpoints data
	let hardwareSystems = $derived(
		endpointsData.systems.map((system) => {
			const { main, subline } = parseSystemName(system.system_name);
			return {
				id: system.id,
				name: main,
				subline,
				color: system.color,
				system,
				disabledByFilter: isSystemDisabledByAccelerator(system.accelerator_model_name)
			};
		})
	);
</script>

<aside
	class="sticky top-24 hidden h-fit max-h-[calc(100vh-7rem)] w-80 shrink-0 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50/90 p-4 shadow-sm backdrop-blur-sm dark:border-slate-700 dark:bg-slate-800/90 lg:block"
	aria-label="Chart filters sidebar"
>
	<div class="flex flex-col gap-5">
		<!-- Model Select -->
		<div class="flex flex-col gap-1.5">
			<label
				for="model-select"
				class="dm-mono text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400"
			>
				Model
			</label>
			<select
				id="model-select"
				value={selectedModel}
				onchange={(e) => setSelectedBenchmarkModelId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
				class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 transition-colors focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
				aria-label="Select benchmark model"
			>
				{#each modelOptions as option (option.id)}
					<option value={option.id}>{option.label}</option>
				{/each}
			</select>
		</div>

		<!-- Systems Selection Section with Inline Accordion -->
		<div>
			<!-- Systems Header with Settings Cog -->
			<div class="mb-2 flex items-center justify-between">
				<h4
					class="text-[10px] font-bold tracking-widest text-slate-500 uppercase dark:text-slate-400"
				>
					Systems
				</h4>
				<button
					type="button"
					onclick={() => (showAdvancedFilters = !showAdvancedFilters)}
					class="flex items-center gap-1.5 rounded px-2 py-1 transition-colors hover:bg-slate-200 dark:hover:bg-slate-600"
					aria-expanded={showAdvancedFilters}
					aria-label="{showAdvancedFilters ? 'Hide' : 'Show'} Configure Systems"
				>
					<Icon
						name="Settings"
						class="h-4 w-4 text-slate-500 transition-transform duration-200 dark:text-slate-400 {showAdvancedFilters ? 'rotate-90' : ''}"
					/>
					<span class="text-[10px] font-medium text-slate-500 uppercase tracking-widest dark:text-slate-400">Configure</span>
				</button>
			</div>

			<!-- Advanced Filters (slide in when cog is clicked) -->
			{#if showAdvancedFilters}
				<div
					transition:slide={{ duration: 200, easing: cubicOut }}
					class="mb-3 flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-600 dark:bg-slate-800"
				>
					<!-- Accelerator Select -->
					<div class="flex flex-col gap-1">
						<label
							for="accelerator-filter"
							class="text-[10px] font-medium text-slate-500 uppercase dark:text-slate-400"
						>
							Accelerator
						</label>
						<p class="text-[10px] text-slate-400 dark:text-slate-500">GPU or AI chip (e.g., H100)</p>
						<select
							id="accelerator-filter"
							value={selectedAccelerator}
							onchange={(e) => setSelectedAccelerator(e.target.value)}
							class="w-full rounded border border-slate-300 bg-slate-50 px-2 py-1.5 text-xs text-slate-800 transition-colors focus:border-emerald-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
							aria-label="Filter by accelerator"
						>
							{#each acceleratorOptions as option (option.id)}
								<option value={option.id}>{option.label}</option>
							{/each}
						</select>
					</div>

					<!-- Processor Select -->
					<div class="flex flex-col gap-1">
						<label
							for="processor-filter"
							class="text-[10px] font-medium text-slate-500 uppercase dark:text-slate-400"
						>
							Processor
						</label>
						<p class="text-[10px] text-slate-400 dark:text-slate-500">Host CPU paired with accelerator</p>
						<select
							id="processor-filter"
							bind:value={selectedProcessor}
							class="w-full rounded border border-slate-300 bg-slate-50 px-2 py-1.5 text-xs text-slate-800 transition-colors focus:border-emerald-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
							aria-label="Filter by processor"
						>
							{#each processorOptions as option (option.id)}
								<option value={option.id}>{option.label}</option>
							{/each}
						</select>
					</div>

					<!-- Organization Select -->
					<div class="flex flex-col gap-1">
						<label
							for="organization-filter"
							class="text-[10px] font-medium text-slate-500 uppercase dark:text-slate-400"
						>
							Organization
						</label>
						<p class="text-[10px] text-slate-400 dark:text-slate-500">Submitting company/institution</p>
						<select
							id="organization-filter"
							bind:value={selectedOrganization}
							class="w-full rounded border border-slate-300 bg-slate-50 px-2 py-1.5 text-xs text-slate-800 transition-colors focus:border-emerald-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
							aria-label="Filter by organization"
						>
							{#each organizationOptions as option (option.id)}
								<option value={option.id}>{option.label}</option>
							{/each}
						</select>
					</div>
				</div>
			{/if}
			<div class="flex flex-col gap-0.5">
			{#each hardwareSystems.slice(0, 9) as hw (hw.id)}
				{@const visible = isSystemVisible(hw.id)}
				{@const disabled = hw.disabledByFilter}
				{@const expanded = isExpanded(hw.id, visible) && !disabled}
				<div
					class="rounded-lg transition-all duration-200 {expanded ? 'border border-slate-300 dark:border-slate-600' : ''} {disabled ? 'opacity-40' : ''}"
				>
					<!-- Legend Row with Toggle and Expand Controls -->
					<div class="flex w-full items-center rounded-lg transition-all duration-200 {expanded ? '' : disabled ? '' : 'hover:bg-slate-100 dark:hover:bg-slate-700'}">
						<!-- Expand/Collapse Button (left of colored circle) - always visible unless disabled -->
						{#if hw.system}
							<button
								type="button"
								onclick={() => !disabled && handleExpandClick(hw.id)}
								class="ml-1 p-1 rounded transition-colors {disabled ? 'cursor-not-allowed opacity-50' : 'hover:bg-slate-200 dark:hover:bg-slate-600'}"
								aria-expanded={expanded}
								aria-label="{expanded ? 'Collapse' : 'Expand'} {hw.subline ? `${hw.name} (${hw.subline})` : hw.name} details{disabled ? ' (disabled by accelerator filter)' : ''}"
								aria-disabled={disabled}
							>
								<Icon
									name={expanded ? 'Minus' : 'Plus'}
									class="h-3.5 w-3.5 text-slate-500 dark:text-slate-400"
								/>
							</button>
						{:else}
							<!-- Spacer to maintain alignment when no system data -->
							<span class="ml-1 w-[22px]"></span>
						{/if}
						<!-- Visibility Toggle Button -->
						<button
							type="button"
							onclick={() => !disabled && toggleSystem(hw.id)}
							class="group flex flex-1 items-center gap-3 px-2 py-2 text-left {disabled ? 'cursor-not-allowed' : 'cursor-pointer'}"
							aria-pressed={visible}
							aria-label="Toggle {hw.subline ? `${hw.name} (${hw.subline})` : hw.name} visibility{disabled ? ' (disabled by accelerator filter)' : ''}"
							aria-disabled={disabled}
							{disabled}
						>
							<span
								class="h-3 w-3 shrink-0 rounded-full transition-opacity duration-200"
								style="background-color: {hw.color}; opacity: {visible && !disabled ? 1 : 0.3};"
							></span>
							<span
								class="flex flex-1 flex-col gap-0.5 text-left"
							>
								<span
									class="text-sm font-medium transition-opacity duration-200 {visible && !disabled
										? 'text-slate-800 dark:text-slate-200'
										: 'text-slate-500 dark:text-slate-500 line-through'}"
								>
									{hw.name}
								</span>
								{#if hw.subline}
									<span
										class="text-[10px] font-normal transition-opacity duration-200 {visible && !disabled
											? 'text-slate-500 dark:text-slate-400'
											: 'text-slate-400 dark:text-slate-500'}"
									>
										{hw.subline}
									</span>
								{/if}
							</span>
						</button>
					</div>

						<!-- Accordion Details Panel -->
						{#if expanded && hw.system}
							{@const editing = isEditing(hw.id)}
							{@const activeHeight = getActiveHeight(hw.id, editing)}
							<div
								transition:slide={{ duration: 200, easing: cubicOut }}
								class="relative overflow-hidden text-xs transition-[height] duration-250 ease-[cubic-bezier(0.33,1,0.68,1)]"
								style="height: {typeof activeHeight === 'number' ? `${activeHeight}px` : 'auto'};"
							>
								<!-- Sliding Panel Container - slides horizontally on X-axis -->
								<div
									class="flex w-[200%] transition-transform duration-250 ease-[cubic-bezier(0.33,1,0.68,1)]"
									style="transform: translateX({editing ? '-50%' : '0%'});"
								>
									<!-- Read View Panel -->
									<div class="w-1/2 shrink-0">
										<div
											class="px-3 pb-3"
											use:measureHeight={{ systemId: hw.id, panel: 'read' }}
										>
											<!-- System Header -->
											<div class="mb-2">
												<p class="font-semibold text-slate-800 dark:text-slate-200 leading-tight text-[11px]">
													{hw.system.system_name}
												</p>
												<p class="text-slate-500 dark:text-slate-400 text-[10px]">
													{hw.system.submitter_org_names} / {hw.system.division}
												</p>
											</div>

											<!-- Config Details -->
											<dl class="space-y-1.5 text-[11px]">
												<!-- Framework -->
												<div>
													<dt class="font-medium text-slate-500 dark:text-slate-400">Framework</dt>
													<dd class="text-slate-800 dark:text-slate-200">{hw.system.framework}</dd>
												</div>

												<!-- Accelerator -->
												<div>
													<dt class="font-medium text-slate-500 dark:text-slate-400">Accelerator</dt>
													<dd class="text-slate-800 dark:text-slate-200">
														{hw.system.accelerators_per_node}x {hw.system.accelerator_model_name}
													</dd>
													<dd class="text-slate-500 dark:text-slate-400 text-[10px]">
														{hw.system.accelerator_memory_capacity} {hw.system.accelerator_memory_type}
													</dd>
												</div>

												<!-- Host -->
												<div>
													<dt class="font-medium text-slate-500 dark:text-slate-400">Host</dt>
													<dd class="text-slate-800 dark:text-slate-200">
														{hw.system.host_processors_per_node}x {hw.system.host_processor_model_name}
													</dd>
												</div>

												<!-- Category & Status -->
												<div>
													<dt class="font-medium text-slate-500 dark:text-slate-400">Category</dt>
													<dd class="text-slate-800 dark:text-slate-200">
														{hw.system.system_category}
														<span class="ml-1 text-slate-500 dark:text-slate-400">({hw.system.system_availability_status})</span>
													</dd>
												</div>
											</dl>

											<!-- Configure System Settings Button -->
											<button
												type="button"
												onclick={() => toggleEditMode(hw.id)}
												class="mt-3 w-full rounded-md px-3 py-1.5 text-[11px] font-medium text-white transition-colors hover:opacity-90"
												style="background-color: {hw.color};"
												aria-label="Configure system settings for {hw.system.system_name}"
											>
												Configure System Settings
											</button>
										</div>
									</div>

									<!-- Edit View Panel -->
									<div class="w-1/2 shrink-0">
										<div
											class="px-3 pb-3"
											use:measureHeight={{ systemId: hw.id, panel: 'edit' }}
										>
											<!-- Edit Header -->
											<div class="mb-3 flex items-center justify-between">
												<p class="font-semibold text-slate-800 dark:text-slate-200 text-[11px]">
													System Configuration
												</p>
												<button
													type="button"
													onclick={() => toggleEditMode(hw.id)}
													class="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
													aria-label="Close configuration"
												>
													<Icon name="Close" class="h-4 w-4" />
												</button>
											</div>

											<!-- Configuration Form -->
											<form class="space-y-3" onsubmit={(e) => e.preventDefault()}>
												<!-- System Name -->
												<div class="flex flex-col gap-1">
													<label for="system-name-{hw.id}" class="text-[10px] font-medium text-slate-500 dark:text-slate-400">
														System Name
													</label>
													<input
														id="system-name-{hw.id}"
														type="text"
														value={hw.system.system_name}
														class="w-full rounded border border-slate-300 bg-slate-50 px-2 py-1.5 text-[11px] text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:placeholder-slate-500"
														aria-label="System name"
													/>
												</div>

												<!-- Accelerator Config -->
												<fieldset class="space-y-2 rounded border border-slate-200 p-2 dark:border-slate-700">
													<legend class="px-1 text-[10px] font-medium text-slate-500 dark:text-slate-400">Accelerator</legend>

													<div class="flex gap-2">
														<div class="flex flex-col gap-1 flex-1">
															<label for="accel-count-{hw.id}" class="text-[10px] text-slate-600 dark:text-slate-500">Count</label>
															<input
																id="accel-count-{hw.id}"
																type="number"
																min="1"
																max="64"
																value={hw.system.accelerators_per_node}
																class="w-full rounded border border-slate-300 bg-slate-50 px-2 py-1 text-[11px] text-slate-800 focus:border-emerald-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
																aria-label="Accelerators per node"
															/>
														</div>
														<div class="flex flex-col gap-1 flex-2">
															<label for="accel-model-{hw.id}" class="text-[10px] text-slate-600 dark:text-slate-500">Model</label>
															<input
																id="accel-model-{hw.id}"
																type="text"
																value={hw.system.accelerator_model_name}
																class="w-full rounded border border-slate-300 bg-slate-50 px-2 py-1 text-[11px] text-slate-800 focus:border-emerald-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
																aria-label="Accelerator model"
															/>
														</div>
													</div>

													<div class="flex gap-2">
														<div class="flex flex-col gap-1 flex-1">
															<label for="accel-mem-{hw.id}" class="text-[10px] text-slate-600 dark:text-slate-500">Memory</label>
															<input
																id="accel-mem-{hw.id}"
																type="text"
																value={hw.system.accelerator_memory_capacity}
																class="w-full rounded border border-slate-300 bg-slate-50 px-2 py-1 text-[11px] text-slate-800 focus:border-emerald-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
																aria-label="Accelerator memory"
															/>
														</div>
														<div class="flex flex-col gap-1 flex-1">
															<label for="accel-mem-type-{hw.id}" class="text-[10px] text-slate-600 dark:text-slate-500">Type</label>
															<select
																id="accel-mem-type-{hw.id}"
																class="w-full rounded border border-slate-300 bg-slate-50 px-2 py-1 text-[11px] text-slate-800 focus:border-emerald-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
																aria-label="Memory type"
															>
																<option value="HBM3e" selected={hw.system.accelerator_memory_configuration === 'HBM3e'}>HBM3e</option>
																<option value="HBM3" selected={hw.system.accelerator_memory_configuration === 'HBM3'}>HBM3</option>
																<option value="HBM2e" selected={hw.system.accelerator_memory_configuration === 'HBM2e'}>HBM2e</option>
																<option value="GDDR6X" selected={hw.system.accelerator_memory_configuration === 'GDDR6X'}>GDDR6X</option>
															</select>
														</div>
													</div>
												</fieldset>

												<!-- Host Config -->
												<fieldset class="space-y-2 rounded border border-slate-200 p-2 dark:border-slate-700">
													<legend class="px-1 text-[10px] font-medium text-slate-500 dark:text-slate-400">Host</legend>

													<div class="flex gap-2">
														<div class="flex flex-col gap-1 flex-1">
															<label for="host-count-{hw.id}" class="text-[10px] text-slate-600 dark:text-slate-500">CPUs</label>
															<input
																id="host-count-{hw.id}"
																type="number"
																min="1"
																max="8"
																value={hw.system.host_processors_per_node}
																class="w-full rounded border border-slate-300 bg-slate-50 px-2 py-1 text-[11px] text-slate-800 focus:border-emerald-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
																aria-label="Host processors per node"
															/>
														</div>
														<div class="flex flex-col gap-1 flex-2">
															<label for="host-model-{hw.id}" class="text-[10px] text-slate-600 dark:text-slate-500">Processor</label>
															<input
																id="host-model-{hw.id}"
																type="text"
																value={hw.system.host_processor_model_name}
																class="w-full rounded border border-slate-300 bg-slate-50 px-2 py-1 text-[11px] text-slate-800 focus:border-emerald-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
																aria-label="Host processor model"
															/>
														</div>
													</div>

													<div class="flex flex-col gap-1">
														<label for="host-mem-{hw.id}" class="text-[10px] text-slate-600 dark:text-slate-500">Memory Capacity</label>
														<input
															id="host-mem-{hw.id}"
															type="text"
															value={hw.system.host_memory_capacity ?? ''}
															placeholder="e.g., 2 TB"
															class="w-full rounded border border-slate-300 bg-slate-50 px-2 py-1 text-[11px] text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:placeholder-slate-500"
															aria-label="Host memory capacity"
														/>
													</div>
												</fieldset>

												<!-- Software Stack -->
												<div class="flex flex-col gap-1">
													<label for="framework-{hw.id}" class="text-[10px] font-medium text-slate-500 dark:text-slate-400">
														Framework / Software
													</label>
													<input
														id="framework-{hw.id}"
														type="text"
														value={hw.system.framework}
														class="w-full rounded border border-slate-300 bg-slate-50 px-2 py-1.5 text-[11px] text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
														aria-label="Framework"
													/>
												</div>

												<!-- Cooling & Status -->
												<div class="flex gap-2">
													<div class="flex flex-col gap-1 flex-1">
														<label for="cooling-{hw.id}" class="text-[10px] font-medium text-slate-500 dark:text-slate-400">Cooling</label>
														<select
															id="cooling-{hw.id}"
															class="w-full rounded border border-slate-300 bg-slate-50 px-2 py-1.5 text-[11px] text-slate-800 focus:border-emerald-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
															aria-label="Cooling type"
														>
															<option value="Air-cooled">Air-cooled</option>
															<option value="Liquid-cooled">Liquid-cooled</option>
															<option value="Hybrid">Hybrid</option>
														</select>
													</div>
													<div class="flex flex-col gap-1 flex-1">
														<label for="status-{hw.id}" class="text-[10px] font-medium text-slate-500 dark:text-slate-400">Status</label>
														<select
															id="status-{hw.id}"
															class="w-full rounded border border-slate-300 bg-slate-50 px-2 py-1.5 text-[11px] text-slate-800 focus:border-emerald-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
															aria-label="Availability status"
														>
															<option value="available" selected={hw.system.system_availability_status === 'available'}>Available</option>
															<option value="preview" selected={hw.system.system_availability_status === 'preview'}>Preview</option>
															<option value="discontinued" selected={hw.system.system_availability_status === 'discontinued'}>Discontinued</option>
														</select>
													</div>
												</div>

												<!-- Action Buttons -->
												<div class="flex gap-2 pt-2">
													<button
														type="button"
														onclick={() => toggleEditMode(hw.id)}
														class="flex-1 rounded-md border border-slate-300 px-3 py-1.5 text-[11px] font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
													>
														Cancel
													</button>
													<button
														type="submit"
														class="flex-1 rounded-md px-3 py-1.5 text-[11px] font-medium text-white transition-colors hover:opacity-90"
														style="background-color: {hw.color};"
													>
														Apply
													</button>
												</div>
											</form>
										</div>
									</div>
								</div>
							</div>
						{/if}
					</div>
				{/each}
			</div>
		</div>

		<!-- Download (placeholder) -->
		<button
			type="button"
			class="mt-auto flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
			aria-label="Download chart data"
		>
			<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
				<path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
			</svg>
			Download
		</button>
	</div>
</aside>
