<script>
	/**
	 * GTC Mobile Filters - Mobile drawer for chart filters.
	 *
	 * On mobile devices, provides a slide-in drawer from the left
	 * with all chart filter options.
	 */
	import { slide } from 'svelte/transition';
	import Icon from '$lib/components/Icon.svelte';
	import ApiExplorer from '$lib/components/ApiExplorer.svelte';
	import FilterSelect from '$lib/components/FilterSelect.svelte';
	import FilterRadioGroup from '$lib/components/FilterRadioGroup.svelte';
	import HardwareMultiSelect from '$lib/components/HardwareMultiSelect.svelte';
	import TimelineRange from '$lib/components/TimelineRange.svelte';
	import {
		modelOptions,
		islOslOptions,
		precisionOptions,
		getModel,
		setModel,
		getIslOsl,
		setIslOsl,
		getPrecision,
		setPrecision
	} from '$lib/stores/chartFilters.svelte.js';
	import {
		isModelVisible,
		toggleModel,
		getHideNonOptimal,
		toggleNonOptimal,
		getHideLabels,
		toggleLabels
	} from '$lib/stores/chartSettings.svelte.js';
	import { getMobileFiltersOpen, closeMobileFilters } from '$lib/stores/pageSettings.svelte.js';
	import { allGpuConfigs, gpuNames, gpuColors } from '$lib/data/placeholders.js';

	// Reactive getters
	let currentModel = $derived(getModel());
	let currentIslOsl = $derived(getIslOsl());
	let currentPrecision = $derived(getPrecision());
	let hideNonOptimal = $derived(getHideNonOptimal());
	let hideLabels = $derived(getHideLabels());
	let mobileFiltersOpen = $derived(getMobileFiltersOpen());

	// API Explorer state
	let apiExplorerOpen = $state(false);

	// Build hardware models list
	let hardwareModels = $derived(
		allGpuConfigs.map((id) => ({
			id,
			name: gpuNames[id] ?? id,
			color: gpuColors[id] ?? '#535869'
		}))
	);
</script>

<!-- Mobile Filters Overlay -->
{#if mobileFiltersOpen}
	<div
		class="fixed inset-0 z-[44] bg-black/50 lg:hidden"
		onclick={closeMobileFilters}
		onkeydown={(e) => e.key === 'Escape' && closeMobileFilters()}
		role="button"
		tabindex="-1"
		aria-label="Close filters"
	></div>
{/if}

<!-- Mobile Filters Sidebar -->
<div
	class="fixed top-0 left-0 z-[45] h-full w-80 max-w-[85vw] transform overflow-y-auto bg-white shadow-2xl transition-transform duration-300 ease-out lg:hidden dark:bg-[#1a1d23] {mobileFiltersOpen
		? 'translate-x-0'
		: '-translate-x-full'}"
>
	<!-- Sidebar Header -->
	<div
		class="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-[#1a1d23]"
	>
		<span class="font-semibold text-slate-900 dark:text-white">Chart Filters</span>
		<button
			onclick={closeMobileFilters}
			class="flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 transition-colors duration-200 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
			aria-label="Close filters"
		>
			<Icon name="Close" class="h-6 w-6" />
		</button>
	</div>

	<!-- Sidebar Content -->
	<div class="flex flex-col gap-6 p-4">
		<!-- Hardware Selection -->
		<HardwareMultiSelect
			options={hardwareModels}
			isSelected={isModelVisible}
			onToggle={toggleModel}
			label="Hardware"
		/>

		<!-- Model Select -->
		<FilterSelect
			id="mobile-model-select"
			label="Model"
			value={currentModel}
			options={modelOptions}
			onchange={(v) => setModel(/** @type {any} */ (v))}
			minWidth=""
		/>

		<!-- ISL/OSL Select -->
		<FilterSelect
			id="mobile-isl-osl-select"
			label="Workload"
			value={currentIslOsl}
			options={islOslOptions}
			onchange={(v) => setIslOsl(/** @type {any} */ (v))}
			minWidth=""
		/>

		<!-- Precision Radio Group -->
		<FilterRadioGroup
			name="mobile-precision"
			legend="Precision"
			value={currentPrecision}
			options={precisionOptions}
			onchange={(v) => setPrecision(/** @type {any} */ (v))}
			ariaLabel="Floating point precision"
		/>

		<!-- Divider -->
		<hr class="border-slate-200 dark:border-slate-700" />

		<!-- Display Options -->
		<div class="flex flex-col gap-3">
			<span class="text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400">
				Display Options
			</span>
			<label class="flex cursor-pointer items-center gap-3">
				<input
					type="checkbox"
					checked={hideNonOptimal}
					onchange={toggleNonOptimal}
					class="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 dark:border-slate-600 dark:bg-slate-800"
				/>
				<span class="text-sm text-slate-700 dark:text-slate-300">Hide Non-Optimal</span>
			</label>
			<label class="flex cursor-pointer items-center gap-3">
				<input
					type="checkbox"
					checked={hideLabels}
					onchange={toggleLabels}
					class="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 dark:border-slate-600 dark:bg-slate-800"
				/>
				<span class="text-sm text-slate-700 dark:text-slate-300">Hide Labels</span>
			</label>
		</div>

		<!-- Timeline Range Slider -->
		<div>
			<TimelineRange height={60} label="Interactivity Range (s)" minBound={0} maxBound={350} />
		</div>

		<!-- API Explorer Collapsible -->
		<div class="border-t border-slate-200 pt-4 dark:border-slate-700">
			<button
				type="button"
				onclick={() => (apiExplorerOpen = !apiExplorerOpen)}
				class="flex w-full items-center justify-between py-2 text-left"
				aria-expanded={apiExplorerOpen}
			>
				<span class="text-sm font-medium text-slate-700 dark:text-slate-300">API Explorer</span>
				<Icon
					name="ChevronDown"
					class="h-5 w-5 text-slate-500 transition-transform duration-200 {apiExplorerOpen
						? 'rotate-180'
						: ''}"
				/>
			</button>

			{#if apiExplorerOpen}
				<div transition:slide={{ duration: 200 }} class="pt-3">
					<ApiExplorer />
				</div>
			{/if}
		</div>
	</div>
</div>
