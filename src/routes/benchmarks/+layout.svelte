<script>
	import { page } from '$app/stores';
	import TabNavigation from '$lib/components/TabNavigation.svelte';
	import FilterSelect from '$lib/components/FilterSelect.svelte';
	import StatCard from '$lib/components/StatCard.svelte';
	import {
		versionOptions,
		getSelectedVersion,
		setVersion,
		getSelectedModel,
		setModel,
		getAvailableModels,
		getSelectedScenarios,
		toggleScenario,
		getAvailableScenarios,
		getSelectedOrganizations,
		toggleOrganization,
		selectAllOrganizations,
		getAvailableOrganizations,
		getSelectedAccelerators,
		toggleAccelerator,
		getAvailableAccelerators,
		getSelectedAcceleratorCounts,
		toggleAcceleratorCount,
		getAvailableAcceleratorCounts,
		getFilteredResults,
		getFilteredStats,
		resetFilters,
		clearFilters
	} from '$lib/stores/benchmarkFilters.svelte.js';
	import { getOrgColor } from '$lib/constants/colors.js';

	/** Tab configuration */
	const tabs = [
		{ id: 'comparisons', label: 'Model Comparisons' },
		{ id: 'normalized', label: 'Normalized Results' },
		{ id: 'offline-server', label: 'Offline vs Server' },
		{ id: 'details', label: 'Detailed Results' },
		{ id: 'cross-version', label: 'Compare Versions' }
	];

	let currentPath = $derived($page.url.pathname);

	// Reactive getters
	let currentVersion = $derived(getSelectedVersion());
	let currentModel = $derived(getSelectedModel());
	let availableModels = $derived(getAvailableModels());
	let selectedScenarios = $derived(getSelectedScenarios());
	let availableScenarios = $derived(getAvailableScenarios());
	let selectedOrganizations = $derived(getSelectedOrganizations());
	let availableOrganizations = $derived(getAvailableOrganizations());
	let selectedAccelerators = $derived(getSelectedAccelerators());
	let availableAccelerators = $derived(getAvailableAccelerators());
	let selectedAcceleratorCounts = $derived(getSelectedAcceleratorCounts());
	let availableAcceleratorCounts = $derived(getAvailableAcceleratorCounts());
	let filteredResults = $derived(getFilteredResults());
	let stats = $derived(getFilteredStats());

	/**
	 * Format performance number with commas
	 * @param {number} value
	 * @returns {string}
	 */
	function formatPerformance(value) {
		return value.toLocaleString('en-US', { maximumFractionDigits: 2 });
	}
</script>

<svelte:head>
	<title>MLPerf Benchmarks | ML Commons Endpoints</title>
	<meta
		name="description"
		content="Explore MLPerf Inference benchmark results with interactive filtering and performance comparisons."
	/>
</svelte:head>

<TabNavigation {tabs} basePath="/benchmarks" {currentPath} ariaLabel="Benchmark navigation" />

<div class="bg-slate-50 dark:bg-slate-900 min-h-[60vh]">
	<div class="max-w-7xl mx-auto px-4 py-8 md:py-12">
		<!-- Section Header -->
		<div class="mb-6">
			<h2 class="text-2xl font-bold text-slate-900 dark:text-white">
				MLPerf Inference - Datacenter
			</h2>
			<p class="text-slate-600 dark:text-slate-400 mt-1">
				MLPerf Inference Datacenter benchmark measures how fast systems can process inputs and
				produce results using trained models.
			</p>
		</div>

		<!-- Filter Panel - Compact Style -->
		<div
			class="rounded-lg border border-slate-200 bg-slate-800/90 dark:border-slate-700 dark:bg-slate-800/75 shadow-lg backdrop-blur mb-6"
			role="group"
			aria-label="Benchmark filters"
		>
			<div class="p-3">
				<div class="flex flex-wrap items-start gap-3">
					<!-- Version & Model Selects -->
					<FilterSelect
						id="version-select"
						label="Version"
						value={currentVersion}
						options={versionOptions}
						onchange={(v) => setVersion(v)}
						minWidth=""
					/>

					<FilterSelect
						id="model-select"
						label="Model"
						value={currentModel}
						options={availableModels}
						onchange={(v) => setModel(v)}
						minWidth=""
					/>

					<!-- Scenarios -->
					<div>
						<span class="text-xs font-medium uppercase tracking-wide text-slate-300 dark:text-slate-400 dm-mono block mb-1">
							Scenario
						</span>
						<div class="flex flex-wrap gap-1">
							{#each availableScenarios as scenario (scenario.id)}
								{@const isSelected = selectedScenarios.includes(scenario.id)}
								<button
									type="button"
									onclick={() => toggleScenario(scenario.id)}
									class="px-2 py-1 text-xs font-medium rounded border transition-colors {isSelected
										? 'bg-emerald-600 border-emerald-600 text-white'
										: 'border-slate-500 text-slate-300 hover:bg-slate-700'}"
								>
									{scenario.label}
								</button>
							{/each}
						</div>
					</div>

					<!-- Organizations -->
					<div>
						<span class="text-xs font-medium uppercase tracking-wide text-slate-300 dark:text-slate-400 dm-mono block mb-1">
							Organization
						</span>
						<div class="flex flex-wrap gap-1">
							{#each availableOrganizations as org (org.id)}
								{@const isSelected = selectedOrganizations.includes(org.id)}
								<button
									type="button"
									onclick={() => toggleOrganization(org.id)}
									class="px-2 py-1 text-xs font-medium rounded border transition-colors {isSelected
										? 'text-white'
										: 'border-slate-500 text-slate-300 hover:bg-slate-700'}"
									style={isSelected ? `background-color: ${getOrgColor(org.id)}; border-color: ${getOrgColor(org.id)};` : ''}
								>
									{org.label}
								</button>
							{/each}
						</div>
					</div>

					<!-- Accelerators -->
					<div>
						<span class="text-xs font-medium uppercase tracking-wide text-slate-300 dark:text-slate-400 dm-mono block mb-1">
							Accelerator
						</span>
						<div class="flex flex-wrap gap-1">
							{#each availableAccelerators as acc (acc.id)}
								{@const isSelected = selectedAccelerators.includes(acc.id)}
								<button
									type="button"
									onclick={() => toggleAccelerator(acc.id)}
									class="px-2 py-1 text-xs font-medium rounded border transition-colors {isSelected
										? 'bg-sky-600 border-sky-600 text-white'
										: 'border-slate-500 text-slate-300 hover:bg-slate-700'}"
								>
									{acc.label}
								</button>
							{/each}
						</div>
					</div>

					<!-- Accelerator Count -->
					<div>
						<span class="text-xs font-medium uppercase tracking-wide text-slate-300 dark:text-slate-400 dm-mono block mb-1">
							# Accel
						</span>
						<div class="flex flex-wrap gap-1">
							{#each availableAcceleratorCounts as count (count.id)}
								{@const isSelected = selectedAcceleratorCounts.includes(count.id)}
								<button
									type="button"
									onclick={() => toggleAcceleratorCount(count.id)}
									class="px-2 py-1 text-xs font-medium rounded border transition-colors {isSelected
										? 'bg-violet-600 border-violet-600 text-white'
										: 'border-slate-500 text-slate-300 hover:bg-slate-700'}"
								>
									{count.label}
								</button>
							{/each}
						</div>
					</div>

					<!-- Action Buttons -->
					<div class="ml-auto flex items-end gap-1">
						<button
							type="button"
							onclick={selectAllOrganizations}
							class="px-2 py-1 text-xs font-medium rounded border border-slate-500 text-slate-300 hover:bg-slate-700 transition-colors"
							title="Select all organizations"
						>
							All Orgs
						</button>
						<button
							type="button"
							onclick={resetFilters}
							class="px-2 py-1 text-xs font-medium rounded border border-slate-500 text-slate-300 hover:bg-slate-700 transition-colors"
							title="Reset to defaults"
						>
							Reset
						</button>
						<button
							type="button"
							onclick={clearFilters}
							class="px-2 py-1 text-xs font-medium rounded border border-slate-500 text-slate-300 hover:bg-slate-700 transition-colors"
							title="Clear all filters"
						>
							Clear
						</button>
					</div>
				</div>
			</div>
		</div>

		<!-- KPI Cards -->
		<div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
			<StatCard 
				value={stats.totalSubmissions}
				label="Total Submissions"
				subtitle="matching filters"
				valueColor="text-emerald-600 dark:text-emerald-400"
				borderColor="border-l-emerald-500"
			/>
			<StatCard 
				value={stats.uniqueOrgs}
				label="Organizations"
				subtitle="unique submitters"
				valueColor="text-sky-600 dark:text-sky-400"
				borderColor="border-l-sky-500"
			/>
			<StatCard 
				value={stats.uniqueAccelerators}
				label="Accelerators"
				subtitle="hardware types"
				valueColor="text-violet-600 dark:text-violet-400"
				borderColor="border-l-violet-500"
			/>
			<StatCard 
				value={formatPerformance(stats.maxPerformance)}
				label="Peak Performance"
				subtitle="tokens/s"
				valueColor="text-amber-600 dark:text-amber-400"
				borderColor="border-l-amber-500"
			/>
		</div>

		<!-- Results Count -->
		<div class="mb-6">
			<p class="text-sm font-medium text-slate-700 dark:text-slate-300">
				<span class="text-emerald-600 dark:text-emerald-400">{filteredResults.length}</span>
				submissions match your filters
			</p>
		</div>

		<!-- Tab Content Slot -->
		<slot />

		<!-- Footer Note -->
		<div class="mt-12 text-center text-xs text-slate-500 dark:text-slate-400">
			<p>
				Data source: MLPerf Inference Benchmark Results.
				<a
					href="https://mlcommons.org/benchmarks/inference-datacenter/"
					target="_blank"
					rel="noopener noreferrer"
					class="text-emerald-600 dark:text-emerald-400 hover:underline"
				>
					Learn more about MLPerf
				</a>
			</p>
		</div>
	</div>
</div>
