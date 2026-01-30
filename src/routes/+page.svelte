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
	import BenchmarkResultsTable from '$lib/components/BenchmarkResultsTable.svelte';
	import { getChartData } from '$lib/remotes/chartData.js';
	import { getFilters } from '$lib/stores/chartFilters.svelte.js';

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

	// ============================================================================
	// DEMO BENCHMARK RESULTS DATA
	// ============================================================================

	/**
	 * Demo data for the BenchmarkResultsTable component.
	 * Shows 4 representative systems with realistic benchmark metrics.
	 */
	const demoBenchmarkSystems = [
		{
			systemId: 'demo-nvidia-b200',
			systemName: 'NVIDIA DGX B200',
			systemColor: '#76B900',
			organization: 'NVIDIA',
			accelerator: 'B200-SXM-180GB',
			acceleratorCount: 8,
			models: [
				{
					id: 'demo-nvidia-b200-llama',
					modelId: 1,
					modelName: 'Llama 2 70B',
					division: 'Closed',
					runCount: 5,
					maxConcurrency: 64,
					peakThroughput: 28500,
					peakThroughputRun: { concurrency: 64, ttft: 0.045 },
					minTtft: 0.012,
					lowLatencyRun: { concurrency: 1, system_tps: 4200 },
					runs: [
						{ run_id: 'r1', concurrency: 1, system_tps: 4200, ttft: 0.012, tps_per_user: 4200, run_date: '2026-01-15T10:00:00Z' },
						{ run_id: 'r2', concurrency: 8, system_tps: 15800, ttft: 0.018, tps_per_user: 1975, run_date: '2026-01-15T11:00:00Z' },
						{ run_id: 'r3', concurrency: 32, system_tps: 24200, ttft: 0.032, tps_per_user: 756, run_date: '2026-01-15T12:00:00Z' },
						{ run_id: 'r4', concurrency: 64, system_tps: 28500, ttft: 0.045, tps_per_user: 445, run_date: '2026-01-15T13:00:00Z' }
					]
				}
			]
		},
		{
			systemId: 'demo-nvidia-h100',
			systemName: 'NVIDIA DGX H100',
			systemColor: '#76B900',
			organization: 'NVIDIA',
			accelerator: 'H100-SXM-80GB',
			acceleratorCount: 8,
			models: [
				{
					id: 'demo-nvidia-h100-llama',
					modelId: 1,
					modelName: 'Llama 2 70B',
					division: 'Closed',
					runCount: 5,
					maxConcurrency: 64,
					peakThroughput: 18200,
					peakThroughputRun: { concurrency: 64, ttft: 0.058 },
					minTtft: 0.015,
					lowLatencyRun: { concurrency: 1, system_tps: 3100 },
					runs: [
						{ run_id: 'r5', concurrency: 1, system_tps: 3100, ttft: 0.015, tps_per_user: 3100, run_date: '2026-01-14T10:00:00Z' },
						{ run_id: 'r6', concurrency: 8, system_tps: 11200, ttft: 0.022, tps_per_user: 1400, run_date: '2026-01-14T11:00:00Z' },
						{ run_id: 'r7', concurrency: 32, system_tps: 16800, ttft: 0.042, tps_per_user: 525, run_date: '2026-01-14T12:00:00Z' },
						{ run_id: 'r8', concurrency: 64, system_tps: 18200, ttft: 0.058, tps_per_user: 284, run_date: '2026-01-14T13:00:00Z' }
					]
				}
			]
		},
		{
			systemId: 'demo-amd-mi300x',
			systemName: 'AMD Instinct MI300X',
			systemColor: '#ED1C24',
			organization: 'AMD',
			accelerator: 'MI300X',
			acceleratorCount: 8,
			models: [
				{
					id: 'demo-amd-mi300x-llama',
					modelId: 1,
					modelName: 'Llama 2 70B',
					division: 'Closed',
					runCount: 4,
					maxConcurrency: 64,
					peakThroughput: 16800,
					peakThroughputRun: { concurrency: 64, ttft: 0.065 },
					minTtft: 0.018,
					lowLatencyRun: { concurrency: 1, system_tps: 2800 },
					runs: [
						{ run_id: 'r9', concurrency: 1, system_tps: 2800, ttft: 0.018, tps_per_user: 2800, run_date: '2026-01-13T10:00:00Z' },
						{ run_id: 'r10', concurrency: 8, system_tps: 9800, ttft: 0.028, tps_per_user: 1225, run_date: '2026-01-13T11:00:00Z' },
						{ run_id: 'r11', concurrency: 32, system_tps: 14500, ttft: 0.048, tps_per_user: 453, run_date: '2026-01-13T12:00:00Z' },
						{ run_id: 'r12', concurrency: 64, system_tps: 16800, ttft: 0.065, tps_per_user: 262, run_date: '2026-01-13T13:00:00Z' }
					]
				}
			]
		},
		{
			systemId: 'demo-google-tpu',
			systemName: 'Google TPU v5p',
			systemColor: '#4285F4',
			organization: 'Google',
			accelerator: 'TPU v5p',
			acceleratorCount: 8,
			models: [
				{
					id: 'demo-google-tpu-llama',
					modelId: 1,
					modelName: 'Llama 2 70B',
					division: 'Closed',
					runCount: 4,
					maxConcurrency: 64,
					peakThroughput: 14200,
					peakThroughputRun: { concurrency: 64, ttft: 0.072 },
					minTtft: 0.022,
					lowLatencyRun: { concurrency: 1, system_tps: 2400 },
					runs: [
						{ run_id: 'r13', concurrency: 1, system_tps: 2400, ttft: 0.022, tps_per_user: 2400, run_date: '2026-01-12T10:00:00Z' },
						{ run_id: 'r14', concurrency: 8, system_tps: 8200, ttft: 0.035, tps_per_user: 1025, run_date: '2026-01-12T11:00:00Z' },
						{ run_id: 'r15', concurrency: 32, system_tps: 12100, ttft: 0.055, tps_per_user: 378, run_date: '2026-01-12T12:00:00Z' },
						{ run_id: 'r16', concurrency: 64, system_tps: 14200, ttft: 0.072, tps_per_user: 221, run_date: '2026-01-12T13:00:00Z' }
					]
				}
			]
		}
	];
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

		<!-- Demo Benchmark Results Table -->
		<section class="pb-12">
			<BenchmarkResultsTable
				systems={demoBenchmarkSystems}
				title="Featured Benchmark Results"
				subtitle="Performance comparison across leading AI accelerator platforms"
			/>
		</section>
	</div>
{:catch error}
	<ErrorBanner message={error?.message} />
{/await}
