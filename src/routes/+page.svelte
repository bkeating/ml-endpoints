<script>
	/**
	 * Main page for the LLM Inference Benchmark dashboard.
	 *
	 * This page demonstrates:
	 * - Reactive data fetching with $derived() that auto-refetches when filters change
	 * - Async/await pattern with {#await} blocks for loading states
	 * - Component composition for maintainable, skinny page files
	 */
	import { onMount } from 'svelte';
	import Hero from '$lib/components/Hero.svelte';
	import ChartFilters from '$lib/components/ChartFilters.svelte';
	import ChartSection from '$lib/components/ChartSection.svelte';
	import ChartSettingsSidebar from '$lib/components/ChartSettingsSidebar.svelte';
	import ErrorBanner from '$lib/components/ErrorBanner.svelte';
	import SparklineTable from '$lib/components/SparklineTable.svelte';
	import { getChartData } from '$lib/remotes/chartData.js';
	import { getFilters } from '$lib/stores/chartFilters.svelte.js';
	import { gpuInferenceBenchmarks, gpuBenchmarkColumns } from '$lib/data/placeholders.js';

	// Axis selector store
	import {
		axisOptions,
		getSelectedXAxis,
		getSelectedYAxis,
		setSelectedXAxis,
		setSelectedYAxis,
		getSystemsData,
		setSystemsData,
		getLoading,
		setLoading,
		getChartData as getAxisChartData,
		getChartTitle,
		getXAxisOption,
		getYAxisOption,
		useLogScaleX,
		useLogScaleY
	} from '$lib/stores/axisSelector.svelte.js';

	// Data transform for loading
	import { parseSystemData } from './pareto-charts/_components/dataTransform.js';

	// Route-local components
	import ChartLoadingState from './_components/ChartLoadingState.svelte';
	import ParetoChartSection from './_components/ParetoChartSection.svelte';
	import GpuReliabilitySection from './_components/GpuReliabilitySection.svelte';
	import SubmissionRequirements from './_components/SubmissionRequirements.svelte';
	import RoleBasedViewport from './_components/RoleBasedViewport.svelte';
	import SystemBladesSection from './_components/SystemBladesSection.svelte';

	// $derived() creates a reactive value that automatically updates when getFilters() changes
	let filters = $derived(getFilters());

	// This promise automatically re-runs whenever filters change, triggering a new API call
	let chartDataQuery = $derived(
		getChartData({
			model: filters.model,
			islOsl: filters.islOsl,
			precision: filters.precision,
			yAxisMetric: filters.yAxisMetric
		})
	);

	// ============================================================================
	// AXIS SELECTOR CHART - Using Store
	// ============================================================================

	// Container width for responsive chart
	let axisChartWidth = $state(0);

	// Reactive getters from store
	let selectedXAxis = $derived(getSelectedXAxis());
	let selectedYAxis = $derived(getSelectedYAxis());
	let axisSelectorLoading = $derived(getLoading());
	let systemsData = $derived(getSystemsData());

	// Derived chart data from store
	let axisChartData = $derived(getAxisChartData());
	let chartTitle = $derived(getChartTitle());
	let xAxisOption = $derived(getXAxisOption());
	let yAxisOption = $derived(getYAxisOption());
	let logScaleX = $derived(useLogScaleX());
	let logScaleY = $derived(useLogScaleY());

	// Chart dimensions
	let axisChartHeight = $derived(Math.max(280, (axisChartWidth || 400) * 0.65));

	// ============================================================================
	// USER ROLE SELECTOR
	// ============================================================================

	const userRoleOptions = [
		{ id: 'endpoints-user', label: 'Endpoints User' },
		{ id: 'enterprise-buyer', label: 'Enterprise & Institutional Buyers' },
		{ id: 'neo-cloud', label: 'Neo-Cloud & Cloud Service Providers' },
		{ id: 'infra-engineer', label: 'Infra Engineer' },
		{ id: 'it-buyer', label: 'IT Buyer' },
		{ id: 'hardware-mfg', label: 'Hardware Manufacturer' },
		{ id: 'model-developer', label: 'Model Developer' },
		{ id: 'baas-user', label: 'BaaS User' },
		{ id: 'investor', label: 'Investor' },
		{ id: 'journalist', label: 'Journalist' }
	];

	let selectedUserRole = $state('endpoints-user');

	// Load system data on mount
	onMount(async () => {
		try {
			const response = await fetch('/db.json');
			if (response.ok) {
				const rawData = await response.json();
				const parsedData = parseSystemData(rawData);
				setSystemsData(parsedData);
			}
		} catch (err) {
			console.error('Error loading axis selector data:', err);
		} finally {
			setLoading(false);
		}
	});

	/**
	 * Handle X-axis selection change
	 * @param {Event} e
	 */
	function handleXAxisChange(e) {
		const target = /** @type {HTMLSelectElement} */ (e.target);
		setSelectedXAxis(/** @type {any} */ (target.value));
	}

	/**
	 * Handle Y-axis selection change
	 * @param {Event} e
	 */
	function handleYAxisChange(e) {
		const target = /** @type {HTMLSelectElement} */ (e.target);
		setSelectedYAxis(/** @type {any} */ (target.value));
	}
</script>

<Hero />

{#await chartDataQuery}
	<ChartLoadingState />
{:then chartData}
	<!-- Charts rendered from API data -->
	<ChartFilters />

	<div class="bg-pattern-container relative w-full md:pt-6 pb-12">
		<div class="relative z-10 mx-auto flex max-w-7xl flex-col gap-6 px-3">
			<ChartSection chart={chartData.latencyChart} layout="side-by-side" useTimelineRange={true} />
		</div>
	</div>

	<div class="bg-slate-950">
		<ParetoChartSection />
	</div>

	<!-- Role-Based Benchmark Section -->
	<div class="w-full bg-slate-50 py-8 sm:py-12 dark:bg-slate-900/50">
		<div class="mx-auto max-w-7xl px-3">
			<!-- User Role Selector -->
			<div class="flex items-center gap-3 mx-auto w-full text-center justify-center mb-12">
				<label
					for="user-role-select"
					class="font-medium text-slate-700 dark:text-slate-300 text-xl"
				>
					From the viewpoint of:
				</label>
				<select
					id="user-role-select"
					bind:value={selectedUserRole}
					class="h-9 max-w-xs flex-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
				>
					{#each userRoleOptions as option (option.id)}
						<option value={option.id}>{option.label}</option>
					{/each}
				</select>
			</div>

			<!-- Dynamic Role-Based Content -->
			<RoleBasedViewport
				selectedRole={selectedUserRole}
				roleOptions={userRoleOptions}
				{axisChartWidth}
				{axisChartHeight}
				{axisSelectorLoading}
				{systemsData}
				{axisChartData}
				{chartTitle}
				{xAxisOption}
				{yAxisOption}
				{logScaleX}
				{logScaleY}
				onXAxisChange={handleXAxisChange}
				onYAxisChange={handleYAxisChange}
				{selectedXAxis}
				{selectedYAxis}
				{axisOptions}
			/>
		</div>
	</div>

	<!-- <GpuReliabilitySection chart={chartData.gpuReliabilityChart} /> -->

	<div class="mx-auto max-w-7xl px-3 pt-12">
		<SubmissionRequirements />

		<!-- Interactivity Chart with Settings Sidebar -->
		<div class="flex flex-col gap-6 lg:flex-row">
			<div class="min-w-0 flex-1">
				<ChartSection chart={chartData.interactivityChart} useTimelineRange={true} />
			</div>

			<!-- Quick Settings Sidebar (hidden on mobile) -->
			<div class="sticky top-4 hidden w-56 shrink-0 lg:block">
				<ChartSettingsSidebar />
			</div>
		</div>

		<!-- System Blades Grid -->
		<div class="mt-12 pb-12">
			<SystemBladesSection />
		</div>

		<!-- GPU Inference Benchmark Table with Sparklines -->
		<SparklineTable
			title="GPU Inference Performance"
			rows={gpuInferenceBenchmarks}
			columns={gpuBenchmarkColumns}
			class="px-3 mt-12 pb-12"
		/>
	</div>
{:catch error}
	<ErrorBanner message={error?.message} />
{/await}
