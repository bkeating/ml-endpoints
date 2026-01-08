<script>
	/**
	 * Chart filters panel with model selection, display options, and API explorer.
	 *
	 * This component demonstrates Svelte 5's reactive patterns:
	 * - $derived() for computed values that auto-update when dependencies change
	 * - $state() for local component state
	 * - Store functions (getX/setX) for global state management
	 */
	import { slide } from 'svelte/transition';
	import Icon from '$lib/components/Icon.svelte';
	import LegendItem from '$lib/components/LegendItem.svelte';
	import ApiExplorer from '$lib/components/ApiExplorer.svelte';
	import FilterSelect from '$lib/components/FilterSelect.svelte';
	import FilterRadioGroup from '$lib/components/FilterRadioGroup.svelte';
	import TimelineRange from '$lib/components/TimelineRange.svelte';
	import {
		modelOptions,
		islOslOptions,
		precisionOptions,
		yAxisMetricOptions,
		getModel,
		setModel,
		getIslOsl,
		setIslOsl,
		getPrecision,
		setPrecision,
		getYAxisMetric,
		setYAxisMetric
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

	// Reactive getters - these automatically update when store values change
	let currentModel = $derived(getModel());
	let currentIslOsl = $derived(getIslOsl());
	let currentPrecision = $derived(getPrecision());
	let currentYAxisMetric = $derived(getYAxisMetric());
	let hideNonOptimal = $derived(getHideNonOptimal());
	let hideLabels = $derived(getHideLabels());

	// API Explorer collapsed state
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
	class="mt-6 mb-12 rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50 shadow-xl backdrop-blur-sm"
	role="group"
	aria-label="Chart filters and settings"
>
	<!-- Filters Row -->
	<div class="p-4 border-b border-slate-200 dark:border-slate-700">
		<div class="flex flex-wrap items-start gap-4">
			<FilterSelect
				id="model-select"
				label="Model"
				value={currentModel}
				options={modelOptions}
				onchange={(v) => setModel(/** @type {any} */ (v))}
			/>

			<FilterRadioGroup
				name="isl-osl"
				legend="ISL/OSL"
				value={currentIslOsl}
				options={islOslOptions}
				onchange={(v) => setIslOsl(/** @type {any} */ (v))}
				ariaLabel="Input/Output sequence length"
			/>

			<FilterRadioGroup
				name="precision"
				legend="Precision"
				value={currentPrecision}
				options={precisionOptions}
				onchange={(v) => setPrecision(/** @type {any} */ (v))}
				ariaLabel="Floating point precision"
			/>

			<FilterSelect
				id="y-axis-select"
				label="Y-Axis Metric"
				value={currentYAxisMetric}
				options={yAxisMetricOptions}
				onchange={(v) => setYAxisMetric(/** @type {any} */ (v))}
				minWidth="min-w-64"
			/>
		</div>
	</div>

	<!-- Legend & Display Options Row -->
	<div class="p-4 flex flex-wrap gap-8">
		<!-- Hardware Legend -->
		<div>
			<h3 class="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
				Hardware
			</h3>
			<div class="grid grid-cols-2 sm:grid-cols-4 gap-1">
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

		<!-- Display Options -->
		<div>
			<h3 class="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
				Display Options
			</h3>
			<div class="flex gap-4">
				<label class="flex cursor-pointer items-center gap-2">
					<input
						type="checkbox"
						checked={hideNonOptimal}
						onchange={toggleNonOptimal}
						class="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 dark:border-slate-600 dark:bg-slate-800"
					/>
					<span class="text-sm text-slate-700 dark:text-slate-300">Hide Non-Optimal</span>
				</label>
				<label class="flex cursor-pointer items-center gap-2">
					<input
						type="checkbox"
						checked={hideLabels}
						onchange={toggleLabels}
						class="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 dark:border-slate-600 dark:bg-slate-800"
					/>
					<span class="text-sm text-slate-700 dark:text-slate-300">Hide Labels</span>
				</label>
			</div>
		</div>
	</div>

	<!-- Timeline Range Section -->
	<div class="px-4 py-4 border-t border-slate-200 dark:border-slate-700">
		<TimelineRange
			height={60}
			label="Interactivity Range (s)"
			minBound={0}
			maxBound={350}
		/>
	</div>

	<!-- API Explorer Collapsible Section -->
	<div class="border-t border-slate-200 dark:border-slate-700">
		<button
			type="button"
			onclick={() => (apiExplorerOpen = !apiExplorerOpen)}
			class="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-slate-100 dark:hover:bg-slate-700/50"
			aria-expanded={apiExplorerOpen}
			aria-controls="api-explorer-panel"
		>
			<span class="text-sm font-medium text-slate-700 dark:text-slate-300">
				API Explorer
			</span>
			<Icon
				name="ChevronDown"
				class="h-5 w-5 text-slate-500 transition-transform duration-200 {apiExplorerOpen ? 'rotate-180' : ''}"
			/>
		</button>

		{#if apiExplorerOpen}
			<div
				id="api-explorer-panel"
				transition:slide={{ duration: 200 }}
				class="px-4 pb-4"
			>
				<ApiExplorer />
			</div>
		{/if}
	</div>
</div>
