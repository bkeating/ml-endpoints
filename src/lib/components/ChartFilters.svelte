<script>
	/**
	 * Chart filters panel with model selection, display options, and API explorer.
	 *
	 * This component demonstrates Svelte 5's reactive patterns:
	 * - $derived() for computed values that auto-update when dependencies change
	 * - $state() for local component state
	 * - Store functions (getX/setX) for global state management
	 *
	 * Mobile behavior:
	 * - On mobile, filters are hidden behind an AdjustmentsCog button in the header
	 * - When toggled, they appear as a slide-in sidebar panel
	 */
	import { onMount } from 'svelte';
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
	import {
		getMobileFiltersOpen,
		closeMobileFilters
	} from '$lib/stores/pageSettings.svelte.js';
	import { allGpuConfigs, gpuNames, gpuColors } from '$lib/data/placeholders.js';

	// Reactive getters - these automatically update when store values change
	let currentModel = $derived(getModel());
	let currentIslOsl = $derived(getIslOsl());
	let currentPrecision = $derived(getPrecision());
	let currentYAxisMetric = $derived(getYAxisMetric());
	let hideNonOptimal = $derived(getHideNonOptimal());
	let hideLabels = $derived(getHideLabels());

	// Mobile filters panel state
	let mobileFiltersOpen = $derived(getMobileFiltersOpen());

	// Settings panel collapsed state (collapsed by default)
	let settingsOpen = $state(false);

	// API Explorer collapsed state (nested within settings)
	let apiExplorerOpen = $state(false);

	// Sticky detection state
	let isSticky = $state(false);
	let sentinelEl = $state(null);

	// Build hardware models list from GPU configs
	let hardwareModels = $derived(
		allGpuConfigs.map((id) => ({
			id,
			name: gpuNames[id] ?? id,
			color: gpuColors[id] ?? '#64748b'
		}))
	);

	// Observe sentinel to detect sticky state
	onMount(() => {
		if (!sentinelEl) return;

		const observer = new IntersectionObserver(
			([entry]) => {
				// When sentinel is not intersecting (scrolled past), we're sticky
				isSticky = !entry.isIntersecting;
			},
			{ threshold: 0, rootMargin: '-41px 0px 0px 0px' }
		);

		observer.observe(sentinelEl);
		return () => observer.disconnect();
	});
</script>

<!-- Mobile Filters Overlay -->
{#if mobileFiltersOpen}
	<div
		class="fixed inset-0 bg-black/50 z-[44] md:hidden"
		onclick={closeMobileFilters}
		onkeydown={(e) => e.key === 'Escape' && closeMobileFilters()}
		role="button"
		tabindex="-1"
		aria-label="Close filters"
	></div>
{/if}

<!-- Mobile Filters Sidebar -->
<div
	class="fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-white dark:bg-[#1a1d23] z-[45] transform transition-transform duration-300 ease-out md:hidden shadow-2xl overflow-y-auto {mobileFiltersOpen ? 'translate-x-0' : '-translate-x-full'}"
>
	<!-- Sidebar Header -->
	<div class="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10 bg-white dark:bg-[#1a1d23]">
		<span class="font-semibold text-slate-900 dark:text-white">Chart Filters</span>
		<button
			onclick={closeMobileFilters}
			class="h-10 w-10 flex items-center justify-center rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200"
			aria-label="Close filters"
		>
			<Icon name="Close" class="h-6 w-6" />
		</button>
	</div>

	<!-- Sidebar Content -->
	<div class="p-4 flex flex-col gap-6">
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
			label="ISL/OSL"
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

		<!-- Y-Axis Metric Select -->
		<FilterSelect
			id="mobile-y-axis-select"
			label="Y-Axis Metric"
			value={currentYAxisMetric}
			options={yAxisMetricOptions}
			onchange={(v) => setYAxisMetric(/** @type {any} */ (v))}
			minWidth=""
		/>

		<!-- Divider -->
		<hr class="border-slate-200 dark:border-slate-700" />

		<!-- Display Options -->
		<div class="flex flex-col gap-3">
			<span class="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
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
			<TimelineRange
				height={60}
				label="Interactivity Range (s)"
				minBound={0}
				maxBound={350}
			/>
		</div>

		<!-- API Explorer Collapsible -->
		<div class="border-t border-slate-200 dark:border-slate-700 pt-4">
			<button
				type="button"
				onclick={() => (apiExplorerOpen = !apiExplorerOpen)}
				class="flex w-full items-center justify-between py-2 text-left"
				aria-expanded={apiExplorerOpen}
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
				<div transition:slide={{ duration: 200 }} class="pt-3">
					<ApiExplorer />
				</div>
			{/if}
		</div>
	</div>
</div>

<!-- Desktop: Sentinel element for sticky detection -->
<div bind:this={sentinelEl} class="h-0 w-full hidden md:block" aria-hidden="true"></div>

<!-- Desktop: Outer wrapper for full-width sticky background when stuck -->
<div
	class="hidden md:block sticky top-[80px] z-50 mt-6 mb-12 transition-all duration-300 ease-out {isSticky
		? 'bg-slate-800/90 dark:bg-slate-800/95 shadow-lg shadow-slate-900/10 dark:shadow-slate-900/50 border-b border-slate-200 dark:border-slate-700 backdrop-blur-md'
		: ''}"
>
	<!-- Inner container that maintains max-width and styling -->
	<div
		class="transition-colors duration-300 ease-out {isSticky
			? 'max-w-none mx-0 rounded-none border-x-0 bg-transparent'
			: 'max-w-7xl mx-auto rounded-lg border border-slate-200 bg-slate-800/90 dark:border-slate-700 dark:bg-slate-800/75 shadow-xl backdrop-blur'}"
		role="group"
		aria-label="Chart filters and settings"
	>
	<!-- Filters Row - All on one line -->
	<div class="{isSticky ? 'max-w-7xl mx-auto' : ''} p-4">
		<div class="flex items-start gap-3">
			<div class="flex flex-1 flex-wrap items-start gap-3">
				<HardwareMultiSelect
					options={hardwareModels}
					isSelected={isModelVisible}
					onToggle={toggleModel}
					label="Hardware"
				/>

				<FilterSelect
					id="model-select"
					label="Model"
					value={currentModel}
					options={modelOptions}
					onchange={(v) => setModel(/** @type {any} */ (v))}
					minWidth=""
				/>

				<FilterSelect
					id="isl-osl-select"
					label="ISL/OSL"
					value={currentIslOsl}
					options={islOslOptions}
					onchange={(v) => setIslOsl(/** @type {any} */ (v))}
					minWidth=""
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
					minWidth=""
				/>
			</div>

			<div class="shrink-0 flex flex-col gap-1">
				<span class="text-xs font-medium uppercase tracking-wide text-slate-300 dark:text-slate-400 dm-mono">
					Advanced
				</span>
				<button
					type="button"
					onclick={() => (settingsOpen = !settingsOpen)}
					class="flex h-9 w-9 items-center justify-center rounded-md border transition-colors {settingsOpen ? 'border-yellow-500 bg-yellow-500 hover:bg-yellow-600 dark:border-yellow-500 dark:bg-yellow-500 dark:hover:bg-yellow-600' : 'border-slate-300 bg-white hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-700 dark:hover:bg-slate-600'}"
					aria-expanded={settingsOpen}
					aria-controls="settings-panel"
					aria-label="Toggle advanced chart settings"
					title="Advanced Settings"
				>
					<Icon
						name="AdjustmentsCog"
						class="h-5 w-5 transition-colors {settingsOpen ? 'text-white' : 'text-slate-600 dark:text-slate-300'}"
					/>
				</button>
			</div>
		</div>
	</div>

	<!-- Collapsible Settings Panel -->
	{#if settingsOpen}
		<div
			id="settings-panel"
			transition:slide={{ duration: 250 }}
			class="border-t border-slate-200 dark:border-slate-700"
		>
			<div class={isSticky ? 'max-w-7xl mx-auto' : ''}>
				<!-- Display Options & Timeline Range Row -->
				<div class="flex flex-wrap items-start gap-6 p-4 border-b border-slate-200 dark:border-slate-700">
					<!-- Checkboxes -->
					<div class="flex flex-wrap items-center gap-4">
						<label class="flex cursor-pointer items-center gap-2">
							<input
								type="checkbox"
								checked={hideNonOptimal}
								onchange={toggleNonOptimal}
								class="h-4 w-4 rounded border-slate-300 text-yellow-600 focus:ring-yellow-500 dark:border-slate-600 dark:bg-slate-800"
							/>
							<span class="text-sm text-slate-700 dark:text-slate-300">Hide Non-Optimal</span>
						</label>
						<label class="flex cursor-pointer items-center gap-2">
							<input
								type="checkbox"
								checked={hideLabels}
								onchange={toggleLabels}
								class="h-4 w-4 rounded border-slate-300 text-yellow-600 focus:ring-yellow-500 dark:border-slate-600 dark:bg-slate-800"
							/>
							<span class="text-sm text-slate-700 dark:text-slate-300">Hide Labels</span>
						</label>
					</div>

					<!-- Timeline Range Slider -->
					<div class="flex-1 min-w-64">
						<TimelineRange
							height={60}
							label="Interactivity Range (s)"
							minBound={0}
							maxBound={350}
						/>
					</div>
				</div>

				<!-- API Explorer Collapsible Section (nested) -->
				<div>
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
	</div>
{/if}
	</div>
</div>
