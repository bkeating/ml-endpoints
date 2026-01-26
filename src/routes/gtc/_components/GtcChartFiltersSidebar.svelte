<script>
	/**
	 * GTC Chart Filters Sidebar - Sidebar component for chart filtering.
	 * 
	 * This component provides:
	 * - Hardware selection using LegendItem components (like ChartSettingsSidebar)
	 * - Model, ISL/OSL, Precision, and Y-Axis Metric filters
	 * - Display options (Hide Non-Optimal)
	 * - Sticky positioning for easy access during scroll
	 */
	import LegendItem from '$lib/components/LegendItem.svelte';
	import FilterSelect from '$lib/components/FilterSelect.svelte';
	import FilterRadioGroup from '$lib/components/FilterRadioGroup.svelte';
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
		toggleNonOptimal
	} from '$lib/stores/chartSettings.svelte.js';
	import { allGpuConfigs, gpuNames, gpuColors } from '$lib/data/placeholders.js';

	// Reactive getters - these automatically update when store values change
	let currentModel = $derived(getModel());
	let currentIslOsl = $derived(getIslOsl());
	let currentPrecision = $derived(getPrecision());
	let currentYAxisMetric = $derived(getYAxisMetric());
	let hideNonOptimal = $derived(getHideNonOptimal());

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
		<!-- Hardware Selection Section -->
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

		<!-- Model Select -->
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

		<!-- ISL/OSL Select -->
		<div class="w-full">
			<FilterSelect
				id="gtc-isl-osl-select"
				label="ISL/OSL"
				value={currentIslOsl}
				options={islOslOptions}
				onchange={(v) => setIslOsl(/** @type {any} */ (v))}
				minWidth="w-full"
				maxWidth=""
			/>
		</div>

		<!-- Precision Radio Group -->
		<div class="w-full">
			<FilterRadioGroup
				name="gtc-precision"
				legend="Precision"
				value={currentPrecision}
				options={precisionOptions}
				onchange={(v) => setPrecision(/** @type {any} */ (v))}
				ariaLabel="Floating point precision"
			/>
		</div>

		<!-- Y-Axis Metric Select -->
		<div class="w-full">
			<FilterSelect
				id="gtc-y-axis-metric-select"
				label="Y-Axis Metric"
				value={currentYAxisMetric}
				options={yAxisMetricOptions}
				onchange={(v) => setYAxisMetric(/** @type {any} */ (v))}
				minWidth="w-full"
				maxWidth=""
			/>
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
			</div>
		</div>
	</div>
</aside>
