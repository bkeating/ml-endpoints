<script>
	/**
	 * GTC-specific ChartFilters for sidebar layout.
	 *
	 * Vertical layout optimized for the sidebar. Reuses the same stores
	 * and filter components as the main ChartFilters but with a stacked layout.
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
	import { allGpuConfigs, gpuNames, gpuColors } from '$lib/data/placeholders.js';

	// Reactive getters
	let currentModel = $derived(getModel());
	let currentIslOsl = $derived(getIslOsl());
	let currentPrecision = $derived(getPrecision());
	let hideNonOptimal = $derived(getHideNonOptimal());
	let hideLabels = $derived(getHideLabels());

	// Collapsible sections state
	let advancedOpen = $state(false);
	let apiExplorerOpen = $state(false);

	// Build hardware models list from GPU configs
	let hardwareModels = $derived(
		allGpuConfigs.map((id) => ({
			id,
			name: gpuNames[id] ?? id,
			color: gpuColors[id] ?? '#64748b'
		}))
	);
</script>

<div
	class="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800/90"
	role="group"
	aria-label="Chart filters"
>
	<!-- Header -->
	<div class="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-700">
		<h3 class="text-sm font-semibold text-slate-900 dark:text-white">Chart Filters</h3>
	</div>

	<!-- Hardware Selection -->
	<HardwareMultiSelect
		options={hardwareModels}
		isSelected={isModelVisible}
		onToggle={toggleModel}
		label="Hardware"
	/>

	<!-- Model Select -->
	<FilterSelect
		id="gtc-model-select"
		label="Model"
		value={currentModel}
		options={modelOptions}
		onchange={(v) => setModel(/** @type {any} */ (v))}
		minWidth=""
	/>

	<!-- Workload Select -->
	<FilterSelect
		id="gtc-isl-osl-select"
		label="Workload"
		value={currentIslOsl}
		options={islOslOptions}
		onchange={(v) => setIslOsl(/** @type {any} */ (v))}
		minWidth=""
	/>

	<!-- Precision Radio Group -->
	<FilterRadioGroup
		name="gtc-precision"
		legend="Precision"
		value={currentPrecision}
		options={precisionOptions}
		onchange={(v) => setPrecision(/** @type {any} */ (v))}
		ariaLabel="Floating point precision"
	/>

	<!-- Advanced Settings Toggle -->
	<div class="border-t border-slate-200 pt-3 dark:border-slate-700">
		<button
			type="button"
			onclick={() => (advancedOpen = !advancedOpen)}
			class="flex w-full items-center justify-between py-2 text-left"
			aria-expanded={advancedOpen}
			aria-controls="gtc-advanced-panel"
		>
			<span class="text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400">
				Advanced Settings
			</span>
			<Icon
				name="ChevronDown"
				class="h-4 w-4 text-slate-500 transition-transform duration-200 {advancedOpen ? 'rotate-180' : ''}"
			/>
		</button>

		{#if advancedOpen}
			<div id="gtc-advanced-panel" transition:slide={{ duration: 200 }} class="flex flex-col gap-4 pt-2">
				<!-- Display Options -->
				<div class="flex flex-col gap-3">
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
				<div class="border-t border-slate-200 pt-3 dark:border-slate-700">
					<button
						type="button"
						onclick={() => (apiExplorerOpen = !apiExplorerOpen)}
						class="flex w-full items-center justify-between py-2 text-left"
						aria-expanded={apiExplorerOpen}
						aria-controls="gtc-api-explorer-panel"
					>
						<span class="text-sm font-medium text-slate-700 dark:text-slate-300">API Explorer</span>
						<Icon
							name="ChevronDown"
							class="h-4 w-4 text-slate-500 transition-transform duration-200 {apiExplorerOpen ? 'rotate-180' : ''}"
						/>
					</button>

					{#if apiExplorerOpen}
						<div id="gtc-api-explorer-panel" transition:slide={{ duration: 200 }} class="pt-3">
							<ApiExplorer />
						</div>
					{/if}
				</div>
			</div>
		{/if}
	</div>
</div>
