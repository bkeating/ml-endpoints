<script>
	/**
	 * MLPerf Inference Benchmarks Dashboard
	 *
	 * Displays MLPerf benchmark results with reactive filtering.
	 * Inspired by the MLPerf Dashboard design with cascading filters,
	 * KPI cards, and performance comparison charts.
	 */
	import { page } from '$app/state';
	import FilterSelect from '$lib/components/FilterSelect.svelte';
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
		clearFilters,
		getAllData
	} from '$lib/stores/benchmarkFilters.svelte.js';

	// Tabs configuration
	const tabs = [
		{ id: 'comparisons', label: 'Model Comparisons' },
		{ id: 'normalized', label: 'Normalized Results' },
		{ id: 'offline-server', label: 'Offline vs Server' },
		{ id: 'details', label: 'Detailed Results' },
		{ id: 'cross-version', label: 'Compare Versions' }
	];

	/** Get active tab from URL params, default to 'comparisons' */
	let activeTab = $derived(page.url?.searchParams?.get('tab') || 'comparisons');

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

	// Normalization mode for normalized tab
	let normalizationMode = $state('perAccelerator');

	// Group results by scenario for the comparisons tab
	let resultsByScenario = $derived.by(() => {
		/** @type {Record<string, typeof filteredResults>} */
		const grouped = {};
		for (const result of filteredResults) {
			if (!grouped[result.scenario]) {
				grouped[result.scenario] = [];
			}
			grouped[result.scenario].push(result);
		}
		// Sort each group by performance descending
		for (const scenario of Object.keys(grouped)) {
			grouped[scenario].sort((a, b) => b.performance - a.performance);
		}
		return grouped;
	});

	// Calculate max performance for bar scaling
	let maxPerformance = $derived(
		filteredResults.length > 0 ? Math.max(...filteredResults.map((r) => r.performance)) : 1
	);

	// Normalized results (per accelerator)
	let normalizedResults = $derived.by(() => {
		return filteredResults.map((r) => ({
			...r,
			normalizedPerformance: r.performance / r.acceleratorCount,
			performanceBenefit: 0 // Will be calculated below
		}));
	});

	// Calculate performance benefit percentage relative to lowest performer
	let normalizedWithBenefit = $derived.by(() => {
		if (normalizedResults.length === 0) return [];
		const minPerf = Math.min(...normalizedResults.map((r) => r.normalizedPerformance));
		return normalizedResults.map((r) => ({
			...r,
			performanceBenefit: minPerf > 0 ? ((r.normalizedPerformance - minPerf) / minPerf) * 100 : 0
		}));
	});

	// Group normalized results by scenario
	let normalizedByScenario = $derived.by(() => {
		/** @type {Record<string, typeof normalizedWithBenefit>} */
		const grouped = {};
		for (const result of normalizedWithBenefit) {
			if (!grouped[result.scenario]) {
				grouped[result.scenario] = [];
			}
			grouped[result.scenario].push(result);
		}
		for (const scenario of Object.keys(grouped)) {
			grouped[scenario].sort((a, b) => b.normalizedPerformance - a.normalizedPerformance);
		}
		return grouped;
	});

	// Max normalized performance for bar scaling
	let maxNormalizedPerformance = $derived(
		normalizedWithBenefit.length > 0
			? Math.max(...normalizedWithBenefit.map((r) => r.normalizedPerformance))
			: 1
	);

	// Offline vs Server comparison data
	let offlineServerComparison = $derived.by(() => {
		// Group by system name to find systems with both Offline and Server results
		/** @type {Map<string, { offline?: typeof filteredResults[0], server?: typeof filteredResults[0] }>} */
		const systemMap = new Map();

		for (const result of filteredResults) {
			const key = `${result.systemName}-${result.organization}`;
			if (!systemMap.has(key)) {
				systemMap.set(key, {});
			}
			const entry = systemMap.get(key);
			if (entry) {
				if (result.scenario === 'Offline') {
					entry.offline = result;
				} else if (result.scenario === 'Server') {
					entry.server = result;
				}
			}
		}

		// Filter to only systems with both scenarios
		const comparisons = [];
		for (const [key, data] of systemMap) {
			if (data.offline && data.server) {
				const degradation =
					((data.offline.performance - data.server.performance) / data.offline.performance) * 100;
				comparisons.push({
					systemName: data.offline.systemName,
					organization: data.offline.organization,
					accelerator: data.offline.accelerator,
					acceleratorCount: data.offline.acceleratorCount,
					offlinePerformance: data.offline.performance,
					serverPerformance: data.server.performance,
					degradation,
					serverOfflineRatio: (data.server.performance / data.offline.performance) * 100
				});
			}
		}

		return comparisons.sort((a, b) => a.degradation - b.degradation);
	});

	// Degradation stats
	let degradationStats = $derived.by(() => {
		if (offlineServerComparison.length === 0) {
			return { avg: 0, min: 0, max: 0 };
		}
		const degradations = offlineServerComparison.map((c) => c.degradation);
		return {
			avg: degradations.reduce((a, b) => a + b, 0) / degradations.length,
			min: Math.min(...degradations),
			max: Math.max(...degradations)
		};
	});

	// Cross-version comparison data
	let crossVersionData = $derived.by(() => {
		const allData = getAllData();
		// Find all versions that have the current model
		const versionsWithModel = [...new Set(allData.filter((d) => d.model === currentModel).map((d) => d.version))];
		
		if (versionsWithModel.length < 2) {
			return { available: false, versions: versionsWithModel, data: [] };
		}

		// Group by system+accelerator across versions
		/** @type {Map<string, { systemName: string, organization: string, accelerator: string, results: Record<string, number> }>} */
		const systemMap = new Map();

		for (const result of allData.filter((d) => d.model === currentModel)) {
			const key = `${result.systemName}-${result.accelerator}-${result.scenario}`;
			if (!systemMap.has(key)) {
				systemMap.set(key, {
					systemName: result.systemName,
					organization: result.organization,
					accelerator: result.accelerator,
					results: {}
				});
			}
			const entry = systemMap.get(key);
			if (entry) {
				entry.results[result.version] = result.performance;
			}
		}

		// Filter to systems with multiple versions
		const multiVersionSystems = [...systemMap.values()].filter(
			(s) => Object.keys(s.results).length > 1
		);

		return {
			available: versionsWithModel.length >= 2,
			versions: versionsWithModel.sort(),
			data: multiVersionSystems
		};
	});

	/**
	 * Format performance number with commas
	 * @param {number} value
	 * @returns {string}
	 */
	function formatPerformance(value) {
		return value.toLocaleString('en-US', { maximumFractionDigits: 2 });
	}

	/**
	 * Format percentage
	 * @param {number} value
	 * @returns {string}
	 */
	function formatPercent(value) {
		return value.toFixed(1) + '%';
	}

	/**
	 * Get color for organization
	 * @param {string} org
	 * @returns {string}
	 */
	function getOrgColor(org) {
		const colors = {
			RedHat: '#e61949',
			NVIDIA: '#76b900',
			Intel: '#0071c5',
			Dell: '#007db8',
			Qualcomm: '#3253dc'
		};
		return colors[org] || '#64748b';
	}

	/**
	 * Get color for degradation percentage (green = low, red = high)
	 * @param {number} degradation
	 * @returns {string}
	 */
	function getDegradationColor(degradation) {
		if (degradation < 10) return '#22c55e'; // green
		if (degradation < 20) return '#eab308'; // yellow
		if (degradation < 30) return '#f97316'; // orange
		return '#ef4444'; // red
	}
</script>

<svelte:head>
	<title>MLPerf Benchmarks | ML Commons Endpoints</title>
	<meta
		name="description"
		content="Explore MLPerf Inference benchmark results with interactive filtering and performance comparisons."
	/>
</svelte:head>

<!-- Tab Navigation -->
<div
	class="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 sticky top-[80px] z-30"
>
	<div class="max-w-7xl mx-auto px-4">
		<nav class="flex gap-1 overflow-x-auto scrollbar-hide -mb-px" aria-label="Benchmark navigation">
			{#each tabs as tab (tab.id)}
				<a
					href="/benchmarks?tab={tab.id}"
					class="flex items-center gap-2 px-4 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors duration-200
						{activeTab === tab.id
						? 'border-[#CCEBD4] dark:border-emerald-500 text-slate-900 dark:text-white'
						: 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'}"
					aria-current={activeTab === tab.id ? 'page' : undefined}
				>
					<span>{tab.label}</span>
				</a>
			{/each}
		</nav>
	</div>
</div>

<!-- Content Area -->
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
			<div
				class="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 border-l-4 border-l-emerald-500"
			>
				<div class="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
					Total Submissions
				</div>
				<div class="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
					{stats.totalSubmissions}
				</div>
				<div class="text-xs text-slate-500 dark:text-slate-400 mt-1">matching filters</div>
			</div>

			<div
				class="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 border-l-4 border-l-sky-500"
			>
				<div class="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
					Organizations
				</div>
				<div class="mt-1 text-2xl font-bold text-sky-600 dark:text-sky-400">
					{stats.uniqueOrgs}
				</div>
				<div class="text-xs text-slate-500 dark:text-slate-400 mt-1">unique submitters</div>
			</div>

			<div
				class="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 border-l-4 border-l-violet-500"
			>
				<div class="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
					Accelerators
				</div>
				<div class="mt-1 text-2xl font-bold text-violet-600 dark:text-violet-400">
					{stats.uniqueAccelerators}
				</div>
				<div class="text-xs text-slate-500 dark:text-slate-400 mt-1">hardware types</div>
			</div>

			<div
				class="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 border-l-4 border-l-amber-500"
			>
				<div class="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
					Peak Performance
				</div>
				<div class="mt-1 text-2xl font-bold text-amber-600 dark:text-amber-400">
					{formatPerformance(stats.maxPerformance)}
				</div>
				<div class="text-xs text-slate-500 dark:text-slate-400 mt-1">tokens/s</div>
			</div>
		</div>

		<!-- Results Count -->
		<div class="mb-6">
			<p class="text-sm font-medium text-slate-700 dark:text-slate-300">
				<span class="text-emerald-600 dark:text-emerald-400">{filteredResults.length}</span>
				submissions match your filters
			</p>
		</div>

		<!-- Tab Content -->
		{#if activeTab === 'comparisons'}
			<!-- Model Comparisons Tab -->
			<div class="space-y-6">
				{#if filteredResults.length === 0}
					<div
						class="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6 text-center"
					>
						<p class="text-amber-800 dark:text-amber-200 font-medium">No results match your filters</p>
						<p class="text-amber-600 dark:text-amber-400 text-sm mt-1">
							Try adjusting your filter selections to see benchmark data
						</p>
					</div>
				{:else}
					{#each Object.entries(resultsByScenario) as [scenario, results] (scenario)}
						<div
							class="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden"
						>
							<!-- Scenario Header -->
							<div class="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
								<h3 class="text-lg font-semibold text-slate-900 dark:text-white font-instrument-sans-600">
									{currentModel} - {scenario}
								</h3>
								<p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
									Performance (Tokens/s) - Higher is Better
								</p>
							</div>

							<!-- Horizontal Bar Chart -->
							<div class="p-4">
								<div class="space-y-3">
									{#each results as result (result.id)}
										{@const barWidth = (result.performance / maxPerformance) * 100}
										<div class="group">
											<!-- System Name -->
											<div class="flex items-center justify-between mb-1">
												<span
													class="text-sm text-slate-700 dark:text-slate-300 truncate max-w-md"
													title={result.systemName}
												>
													{result.systemName}
													<span class="text-slate-400 dark:text-slate-500">({result.organization})</span>
												</span>
												<span class="text-sm font-mono font-medium text-slate-900 dark:text-white">
													{formatPerformance(result.performance)}
												</span>
											</div>
											<!-- Bar -->
											<div class="h-8 bg-slate-100 dark:bg-slate-700 rounded overflow-hidden">
												<div
													class="h-full rounded transition-all duration-300 ease-out flex items-center px-2"
													style="width: {barWidth}%; background-color: {getOrgColor(result.organization)};"
												>
													{#if barWidth > 15}
														<span class="text-xs font-medium text-white truncate">
															{result.accelerator} × {result.acceleratorCount}
														</span>
													{/if}
												</div>
											</div>
											{#if barWidth <= 15}
												<span class="text-xs text-slate-500 dark:text-slate-400 mt-0.5 block">
													{result.accelerator} × {result.acceleratorCount}
												</span>
											{/if}
										</div>
									{/each}
								</div>
							</div>
						</div>
					{/each}
				{/if}
			</div>

		{:else if activeTab === 'normalized'}
			<!-- Normalized Results Tab -->
			<div class="space-y-6">
				<!-- Info Banner -->
				<div class="bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800 rounded-lg p-4">
					<p class="text-sm text-sky-800 dark:text-sky-200">
						<strong>Note:</strong> These calculations assume linear scaling, which is an approximation.
						When upscaling (e.g., 1 → 8 accelerators), results tend to over-estimate actual performance.
						When downscaling (e.g., 16 → 8 accelerators), results tend to under-estimate.
					</p>
				</div>

				<!-- Normalization Mode -->
				<div class="flex items-center gap-4">
					<span class="text-sm font-medium text-slate-700 dark:text-slate-300">Normalize by:</span>
					<label class="inline-flex items-center gap-2 cursor-pointer">
						<input
							type="radio"
							name="normalization"
							value="perAccelerator"
							checked={normalizationMode === 'perAccelerator'}
							onchange={() => (normalizationMode = 'perAccelerator')}
							class="w-4 h-4 text-emerald-600 border-slate-300 focus:ring-emerald-500"
						/>
						<span class="text-sm text-slate-600 dark:text-slate-400">Per Accelerator (÷ Total Accelerators)</span>
					</label>
				</div>

				{#if normalizedWithBenefit.length === 0}
					<div
						class="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6 text-center"
					>
						<p class="text-amber-800 dark:text-amber-200 font-medium">No results match your filters</p>
					</div>
				{:else}
					{#each Object.entries(normalizedByScenario) as [scenario, results] (scenario)}
						{@const minPerf = Math.min(...results.map((r) => r.normalizedPerformance))}
						{@const baselineSystem = results.find((r) => r.normalizedPerformance === minPerf)}
						<div
							class="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden"
						>
							<div class="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
								<h3 class="text-lg font-semibold text-slate-900 dark:text-white font-instrument-sans-600">
									{currentModel} - {scenario} (Normalized per Accelerator)
								</h3>
								<p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
									Performance per Accelerator (Tokens/s/Accelerator) - Higher is Better
								</p>
								{#if baselineSystem}
									<p class="text-xs text-slate-400 dark:text-slate-500 mt-1">
										Baseline: {baselineSystem.systemName} ({formatPerformance(minPerf)} tokens/s/acc)
									</p>
								{/if}
							</div>

							<div class="p-4">
								<div class="space-y-3">
									{#each results as result (result.id)}
										{@const barWidth = (result.normalizedPerformance / maxNormalizedPerformance) * 100}
										<div class="group">
											<div class="flex items-center justify-between mb-1">
												<span
													class="text-sm text-slate-700 dark:text-slate-300 truncate max-w-md"
													title={result.systemName}
												>
													{result.systemName}
													<span class="text-slate-400 dark:text-slate-500">({result.organization})</span>
													<span class="text-amber-600 dark:text-amber-400 text-xs ml-1">†</span>
												</span>
												<div class="flex items-center gap-3">
													<span class="text-xs text-emerald-600 dark:text-emerald-400">
														+{formatPercent(result.performanceBenefit)}
													</span>
													<span class="text-sm font-mono font-medium text-slate-900 dark:text-white">
														{formatPerformance(result.normalizedPerformance)}
													</span>
												</div>
											</div>
											<div class="h-8 bg-slate-100 dark:bg-slate-700 rounded overflow-hidden">
												<div
													class="h-full rounded transition-all duration-300 ease-out flex items-center px-2"
													style="width: {barWidth}%; background-color: {getOrgColor(result.organization)};"
												>
													{#if barWidth > 20}
														<span class="text-xs font-medium text-white truncate">
															{result.accelerator} (÷{result.acceleratorCount})
														</span>
													{/if}
												</div>
											</div>
										</div>
									{/each}
								</div>
							</div>
						</div>
					{/each}

					<p class="text-xs text-slate-500 dark:text-slate-400 italic">
						† Result not verified by MLCommons Association. Normalized scores are derived calculations.
					</p>
				{/if}
			</div>

		{:else if activeTab === 'offline-server'}
			<!-- Offline vs Server Comparison Tab -->
			<div class="space-y-6">
				<div class="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
					<h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-2">
						Offline vs Server Performance Comparison
					</h3>
					<p class="text-sm text-slate-600 dark:text-slate-400">
						Compare performance degradation from Offline (batch) to Server (online) scenarios for systems
						that have data in both scenarios.
					</p>
				</div>

				{#if offlineServerComparison.length === 0}
					<div
						class="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6 text-center"
					>
						<p class="text-amber-800 dark:text-amber-200 font-medium">
							No systems found with both Offline and Server results
						</p>
						<p class="text-amber-600 dark:text-amber-400 text-sm mt-1">
							Select both Offline and Server scenarios to see comparison data
						</p>
					</div>
				{:else}
					<!-- Stats Cards -->
					<div class="grid grid-cols-3 gap-4">
						<div class="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
							<div class="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
								Average Degradation
							</div>
							<div class="mt-1 text-2xl font-bold text-amber-600 dark:text-amber-400">
								{formatPercent(degradationStats.avg)}
							</div>
						</div>
						<div class="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
							<div class="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
								Minimum Degradation
							</div>
							<div class="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
								{formatPercent(degradationStats.min)}
							</div>
						</div>
						<div class="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
							<div class="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
								Maximum Degradation
							</div>
							<div class="mt-1 text-2xl font-bold text-red-600 dark:text-red-400">
								{formatPercent(degradationStats.max)}
							</div>
						</div>
					</div>

					<!-- Comparison Chart -->
					<div class="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
						<div class="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
							<h3 class="text-lg font-semibold text-slate-900 dark:text-white">
								Performance Degradation: Offline → Server
							</h3>
							<p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
								Higher degradation = more performance loss in Server mode
							</p>
						</div>

						<div class="p-4 space-y-4">
							{#each offlineServerComparison as comparison (comparison.systemName)}
								{@const maxDegradation = Math.max(...offlineServerComparison.map((c) => c.degradation), 1)}
								{@const barWidth = (comparison.degradation / maxDegradation) * 100}
								<div>
									<div class="flex items-center justify-between mb-1">
										<span class="text-sm text-slate-700 dark:text-slate-300 truncate max-w-md">
											{comparison.systemName}
											<span class="text-slate-400 dark:text-slate-500">({comparison.organization})</span>
										</span>
										<span
											class="text-sm font-mono font-medium"
											style="color: {getDegradationColor(comparison.degradation)};"
										>
											{formatPercent(comparison.degradation)}
										</span>
									</div>
									<div class="h-6 bg-slate-100 dark:bg-slate-700 rounded overflow-hidden">
										<div
											class="h-full rounded transition-all duration-300 ease-out"
											style="width: {barWidth}%; background-color: {getDegradationColor(comparison.degradation)};"
										></div>
									</div>
									<div class="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-1">
										<span>Offline: {formatPerformance(comparison.offlinePerformance)}</span>
										<span>Server: {formatPerformance(comparison.serverPerformance)}</span>
									</div>
								</div>
							{/each}
						</div>
					</div>

					<!-- Detailed Table -->
					<details class="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
						<summary class="px-4 py-3 cursor-pointer text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50">
							Detailed Comparison Table
						</summary>
						<div class="overflow-x-auto border-t border-slate-200 dark:border-slate-700">
							<table class="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
								<thead class="bg-slate-50 dark:bg-slate-800/50">
									<tr>
										<th class="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">System</th>
										<th class="px-4 py-2 text-right text-xs font-medium text-slate-500 uppercase">Offline</th>
										<th class="px-4 py-2 text-right text-xs font-medium text-slate-500 uppercase">Server</th>
										<th class="px-4 py-2 text-right text-xs font-medium text-slate-500 uppercase">Degradation</th>
										<th class="px-4 py-2 text-right text-xs font-medium text-slate-500 uppercase">Server/Offline</th>
									</tr>
								</thead>
								<tbody class="divide-y divide-slate-200 dark:divide-slate-700">
									{#each offlineServerComparison as comparison (comparison.systemName)}
										<tr class="hover:bg-slate-50 dark:hover:bg-slate-700/50">
											<td class="px-4 py-2 text-sm text-slate-900 dark:text-white">{comparison.systemName}</td>
											<td class="px-4 py-2 text-sm text-right font-mono">{formatPerformance(comparison.offlinePerformance)}</td>
											<td class="px-4 py-2 text-sm text-right font-mono">{formatPerformance(comparison.serverPerformance)}</td>
											<td class="px-4 py-2 text-sm text-right font-mono" style="color: {getDegradationColor(comparison.degradation)};">
												{formatPercent(comparison.degradation)}
											</td>
											<td class="px-4 py-2 text-sm text-right font-mono text-slate-600 dark:text-slate-400">
												{formatPercent(comparison.serverOfflineRatio)}
											</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					</details>
				{/if}
			</div>

		{:else if activeTab === 'details'}
			<!-- Detailed Results Tab -->
			<div
				class="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden"
			>
				<div class="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
					<p class="text-sm text-slate-600 dark:text-slate-400">
						<strong>Tip:</strong> Click on column headers to sort. Showing {filteredResults.length} results.
					</p>
				</div>
				<div class="overflow-x-auto">
					<table class="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
						<thead class="bg-slate-50 dark:bg-slate-800/50">
							<tr>
								<th
									scope="col"
									class="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider"
								>
									System
								</th>
								<th
									scope="col"
									class="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider"
								>
									Organization
								</th>
								<th
									scope="col"
									class="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider"
								>
									Scenario
								</th>
								<th
									scope="col"
									class="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider"
								>
									Accelerator
								</th>
								<th
									scope="col"
									class="px-4 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider"
								>
									Count
								</th>
								<th
									scope="col"
									class="px-4 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider"
								>
									Performance
								</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-slate-200 dark:divide-slate-700">
							{#each filteredResults as result (result.id)}
								<tr class="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
									<td class="px-4 py-3 text-sm text-slate-900 dark:text-white max-w-xs truncate" title={result.systemName}>
										{result.systemName}
									</td>
									<td class="px-4 py-3 text-sm">
										<span
											class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-white"
											style="background-color: {getOrgColor(result.organization)};"
										>
											{result.organization}
										</span>
									</td>
									<td class="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
										{result.scenario}
									</td>
									<td class="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
										{result.accelerator}
									</td>
									<td class="px-4 py-3 text-sm text-slate-600 dark:text-slate-400 text-right font-mono">
										{result.acceleratorCount}
									</td>
									<td class="px-4 py-3 text-sm font-medium text-slate-900 dark:text-white text-right font-mono">
										{formatPerformance(result.performance)}
									</td>
								</tr>
							{:else}
								<tr>
									<td colspan="6" class="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
										No results match your current filters
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>

		{:else if activeTab === 'cross-version'}
			<!-- Cross-Version Comparison Tab -->
			<div class="space-y-6">
				<div class="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
					<h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-2">
						Compare Performance Across Versions
					</h3>
					<p class="text-sm text-slate-600 dark:text-slate-400">
						Compare how systems perform across different MLPerf versions. This helps track performance
						improvements and identify optimization opportunities.
					</p>
				</div>

				<div class="bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
					<h4 class="text-md font-medium text-slate-900 dark:text-white mb-1">
						Comparing <strong>{currentModel}</strong> across versions
					</h4>
				</div>

				{#if !crossVersionData.available}
					<div
						class="bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800 rounded-lg p-6 text-center"
					>
						<p class="text-sky-800 dark:text-sky-200 font-medium">
							{currentModel} is only available in {crossVersionData.versions.length} version(s).
						</p>
						<p class="text-sky-600 dark:text-sky-400 text-sm mt-1">
							Cross-version comparison requires the model to be present in at least 2 versions.
						</p>
						{#if crossVersionData.versions.length > 0}
							<p class="text-sky-600 dark:text-sky-400 text-sm mt-2">
								Available in: {crossVersionData.versions.join(', ')}
							</p>
						{/if}
					</div>
				{:else if crossVersionData.data.length === 0}
					<div
						class="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6 text-center"
					>
						<p class="text-amber-800 dark:text-amber-200 font-medium">
							No systems found with results across multiple versions
						</p>
						<p class="text-amber-600 dark:text-amber-400 text-sm mt-1">
							This model exists in versions {crossVersionData.versions.join(', ')}, but no identical
							system configurations were found across versions.
						</p>
					</div>
				{:else}
					<div class="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
						<div class="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
							<p class="text-sm text-slate-600 dark:text-slate-400">
								Found {crossVersionData.data.length} system(s) with results across multiple versions
							</p>
						</div>
						<div class="overflow-x-auto">
							<table class="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
								<thead class="bg-slate-50 dark:bg-slate-800/50">
									<tr>
										<th class="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">System</th>
										<th class="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Organization</th>
										<th class="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Accelerator</th>
										{#each crossVersionData.versions as version (version)}
											<th class="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">{version}</th>
										{/each}
									</tr>
								</thead>
								<tbody class="divide-y divide-slate-200 dark:divide-slate-700">
									{#each crossVersionData.data as system (system.systemName + system.accelerator)}
										<tr class="hover:bg-slate-50 dark:hover:bg-slate-700/50">
											<td class="px-4 py-3 text-sm text-slate-900 dark:text-white">{system.systemName}</td>
											<td class="px-4 py-3 text-sm">
												<span
													class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-white"
													style="background-color: {getOrgColor(system.organization)};"
												>
													{system.organization}
												</span>
											</td>
											<td class="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{system.accelerator}</td>
											{#each crossVersionData.versions as version (version)}
												<td class="px-4 py-3 text-sm text-right font-mono">
													{#if system.results[version]}
														{formatPerformance(system.results[version])}
													{:else}
														<span class="text-slate-400">—</span>
													{/if}
												</td>
											{/each}
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					</div>
				{/if}
			</div>
		{/if}

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
