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
		isSystemDisabledByAccelerator,
		getVisibleSystemIds
	} from '$lib/stores/chartSettings.svelte.js';
	import { getTheme } from '$lib/stores/theme.svelte.js';
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

	/** True when at least one system is visible (for Download button enable/disable) */
	let hasSelectedSystems = $derived(getVisibleSystemIds().length > 0);

	let selectedProcessor = $state('all');
	let selectedOrganization = $state('all');

	// Track which systems have been manually expanded (collapsed by default)
	let expandedSystems = new SvelteSet();

	// Track whether advanced filters are shown (hidden by default to save space)
	let showAdvancedFilters = $state(false);

	// Add stronger shadow when sidebar grows due to expansions
	let isSidebarExpanded = $derived(showAdvancedFilters || expandedSystems.size > 0);

	/**
	 * Toggle the expanded state for a system's details
	 * @param {string} id - System ID to toggle
	 */
	function toggleExpanded(id) {
		if (expandedSystems.has(id)) {
			expandedSystems.delete(id);
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

	/** Known vendor prefixes to strip from display (longest first for correct matching). */
	const COMPANY_PREFIXES = [
		'Microsoft',
		'SambaNova',
		'Qualcomm',
		'Cerebras',
		'NVIDIA',
		'Google',
		'Intel',
		'AMD',
		'AWS'
	];

	/**
	 * Strip leading company/vendor name from hardware name for display (logo shows company).
	 * @param {string} name - Main system name e.g. "NVIDIA DGX B200"
	 * @returns {string} - Display name e.g. "DGX B200"
	 */
	function stripCompanyPrefix(name) {
		const n = name.trim();
		for (const prefix of COMPANY_PREFIXES) {
			if (n.toLowerCase().startsWith(prefix.toLowerCase())) {
				const rest = n.slice(prefix.length).trim();
				return rest || n;
			}
		}
		return n;
	}

	/**
	 * Map a system to its vendor logo.
	 * @param {import('../endpoints-benchmark-data.json').systems[number]} system
	 * @returns {{ src: string, alt: string } | null}
	 */
	function getSystemLogo(system) {
		const name = `${system.system_name} ${system.accelerator_model_name} ${system.host_processor_model_name}`.toLowerCase();
		const isDarkTheme = getTheme() === 'dark';
		if (name.includes('nvidia')) {
			return { src: isDarkTheme ? '/logo-nvidia-dark.svg' : '/logo-nvidia.svg', alt: 'NVIDIA' };
		}
		if (name.includes('microsoft')) {
			return {
				src: isDarkTheme ? '/logo-microsoft-dark.svg' : '/logo-microsoft.svg',
				alt: 'Microsoft'
			};
		}
		if (name.includes('google')) {
			return { src: isDarkTheme ? '/logo-google-dark.svg' : '/logo-google.svg', alt: 'Google' };
		}
		if (name.includes('aws') || name.includes('amazon')) {
			return { src: isDarkTheme ? '/logo-aws-dark.svg' : '/logo-aws.svg', alt: 'AWS' };
		}
		if (name.includes('cerebras')) {
			return { src: isDarkTheme ? '/logo-cerebras-dark.svg' : '/logo-cerebras.svg', alt: 'Cerebras' };
		}
		if (name.includes('intel') || name.includes('xeon')) {
			return { src: '/logo-intel.svg', alt: 'Intel' };
		}
		if (name.includes('amd') || name.includes('epyc')) {
			return { src: isDarkTheme ? '/logo-amd-dark.svg' : '/logo-amd.svg', alt: 'AMD' };
		}
		return null;
	}

	// Build hardware systems list directly from endpoints data
	let hardwareSystems = $derived(
		endpointsData.systems.map((system) => {
			const { main, subline } = parseSystemName(system.system_name);
			return {
				id: system.id,
				name: stripCompanyPrefix(main),
				subline,
				color: system.color,
				system,
				logo: getSystemLogo(system),
				disabledByFilter: isSystemDisabledByAccelerator(system.accelerator_model_name)
			};
		})
	);
</script>

<aside
	class="sticky top-24 hidden h-fit max-h-[calc(100vh-7rem)] w-96 shrink-0 overflow-y-auto rounded-lg py-2 backdrop-blur-sm dark:border dark:border-slate-700 dark:bg-slate-800/90 lg:block {isSidebarExpanded ? 'dark:shadow-xl' : 'dark:shadow-xs'} transition-all duration-300"
	aria-label="Chart filters sidebar"
>
	<div class="flex flex-col gap-5">
		<!-- Model Select -->
		<div class="flex flex-col gap-1.5 px-3">
			<label
				for="model-select"
				class="text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400"
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
			<!-- Systems Header with Filter Icon -->
			<div class="mb-2 flex items-center justify-between px-3">
				<h4
					class="text-xs font-bold tracking-widest text-slate-500 uppercase dark:text-slate-400"
				>
					Systems
				</h4>
				<button
					type="button"
					onclick={() => (showAdvancedFilters = !showAdvancedFilters)}
					class="flex items-center gap-1.5 rounded px-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-600 cursor-pointer"
					aria-expanded={showAdvancedFilters}
					aria-label="{showAdvancedFilters ? 'Hide' : 'Show'} system filters"
				>
					<Icon
						name="AdjustmentsCog"
						class="h-4 w-4 text-slate-500 dark:text-slate-400"
					/>
					<span class="text-xs font-medium text-slate-500 tracking-widest dark:text-slate-400">Filter Systems</span>
				</button>
			</div>

			<!-- Advanced Filters (slide in when cog is clicked) -->
			{#if showAdvancedFilters}
				<div
					transition:slide={{ duration: 200, easing: cubicOut }}
					class="mb-3 mx-3 flex flex-col gap-3 rounded-lg"
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
			{#each hardwareSystems.slice(0, 8) as hw (hw.id)}
				{@const visible = isSystemVisible(hw.id)}
				{@const disabled = hw.disabledByFilter}
				{@const expanded = isExpanded(hw.id, visible) && !disabled}
				<div
					class="rounded-none transition-all duration-200 {disabled ? 'opacity-40' : ''}"
				>
					<!-- Legend Row: Chevron (expand) | Checkbox (select) | Color + Name -->
					<div
						class="group flex w-full items-center gap-2 rounded-none px-3 py-1.5 transition-all duration-200 {visible && !disabled
							? 'bg-[#F0F9F3] dark:bg-[#323945]'
							: ''}"
					>
						<!-- Persistent chevron: expand/collapse details (right when collapsed, down when expanded) -->
						{#if hw.system}
							<button
								type="button"
								onclick={() => !disabled && handleExpandClick(hw.id)}
								class="flex shrink-0 items-center justify-center rounded p-0.5 transition-opacity {disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:opacity-80'} {visible && !disabled ? 'text-slate-700 dark:text-slate-200' : 'text-slate-500 dark:text-slate-400'}"
								aria-expanded={expanded}
								aria-label="{expanded ? 'Hide' : 'Show'} {hw.subline ? `${hw.name} (${hw.subline})` : hw.name} details{disabled ? ' (disabled by accelerator filter)' : ''}"
								aria-disabled={disabled}
								disabled={disabled}
							>
								<Icon
									name="ChevronRight"
									class="h-4 w-4 transition-transform duration-200 {expanded ? 'rotate-90' : ''}"
								/>
							</button>
						{/if}
						<!-- Checkbox: Toggle system visibility on chart -->
						<input
							type="checkbox"
							checked={visible}
							onchange={() => !disabled && toggleSystem(hw.id)}
							class="h-4 w-4 shrink-0 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 dark:border-slate-600 dark:bg-slate-700 dark:checked:bg-emerald-600 {disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}"
							aria-label="Select {hw.subline ? `${hw.name} (${hw.subline})` : hw.name} for chart{disabled ? ' (disabled by accelerator filter)' : ''}"
							aria-disabled={disabled}
							disabled={disabled}
						/>
						<!-- System name (clickable to toggle visibility) -->
						<button
							type="button"
							onclick={() => !disabled && toggleSystem(hw.id)}
							class="group flex flex-1 items-center gap-3 py-1.5 text-left {disabled ? 'cursor-not-allowed' : 'cursor-pointer'}"
							aria-pressed={visible}
							aria-label="Toggle {hw.subline ? `${hw.name} (${hw.subline})` : hw.name} visibility{disabled ? ' (disabled by accelerator filter)' : ''}"
							aria-disabled={disabled}
							disabled={disabled}
						>
							<span class="flex flex-1 flex-col gap-0.5 text-left min-w-0">
								<span
									class="font-medium transition-opacity duration-200 {visible && !disabled
										? 'text-slate-900 dark:text-white'
										: 'text-slate-500 dark:text-slate-500'}"
								>
									{hw.name}
								</span>
								{#if hw.subline}
									<span
										class="text-xs font-normal transition-opacity duration-200 {visible && !disabled
											? 'text-slate-700 dark:text-slate-200'
											: 'text-slate-400 dark:text-slate-500'}"
									>
										{hw.subline}
									</span>
								{/if}
							</span>
							<!-- Fixed-size logo slot, justified to end -->
							<span
								class="ml-auto flex h-6 w-14 shrink-0 items-center justify-end"
								aria-hidden="true"
							>
								{#if hw.logo}
									<img
										src={hw.logo.src}
										alt=""
										class="max-h-6 max-w-14 w-auto h-auto object-contain object-center transition-opacity duration-200"
										style="opacity: {visible && !disabled ? 1 : 0.4};"
									/>
								{/if}
							</span>
							<span
								class="h-3 w-3 shrink-0 rounded-full transition-opacity duration-200"
								style="background-color: {hw.color}; opacity: {visible && !disabled ? 1 : 0.3};"
							></span>
						</button>
					</div>

						<!-- Accordion Details Panel - Read-only System Specifications -->
						{#if expanded && hw.system}
							<div
								transition:slide={{ duration: 200, easing: cubicOut }}
								class="px-1 pt-1 pb-1 pl-4 pr-3 mt-1 text-[12px] border-l-4 {visible && !disabled ? 'dark:bg-[#333945]' : ''}"
								style:border-left-color={hw.color}
							>

              <button type="button" class="text-sm rounded-md px-2 py-1 text-white float-right" onclick={() => goto(`/report?submission=${hw.system.submission_id}`)} style:background-color={hw.color}>View Report</button>
								<!-- System Specifications Header -->
								<div class="mb-2">
									<p class="text-slate-500 dark:text-slate-400 text-[10px]">
										{hw.system.submitter_org_names} / {hw.system.division}
									</p>
								</div>

								<!-- Hardware & Software Details -->
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

									<!-- Host Processor -->
									<div>
										<dt class="font-medium text-slate-500 dark:text-slate-400">Host Processor</dt>
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
							</div>
						{/if}
					</div>
				{/each}
			</div>
		</div>

		<!-- Download (placeholder) -->
		<!--
		<button
			type="button"
			disabled={!hasSelectedSystems}
			class="mx-3 mt-auto flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors {hasSelectedSystems
				? 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
				: 'cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400 opacity-60 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-500'}"
			aria-label="Download chart data"
			aria-disabled={!hasSelectedSystems}
		>
			<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
				<path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
			</svg>
			Download
		</button>
		-->
	</div>
</aside>
