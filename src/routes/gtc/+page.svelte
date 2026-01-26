<script>
	/**
	 * GTC Page - LLM Inference Benchmark dashboard with sidebar layout.
	 *
	 * This page demonstrates:
	 * - Two-column layout with sticky sidebar for chart filters
	 * - Reactive data fetching with $derived() that auto-refetches when filters change
	 * - Async/await pattern with {#await} blocks for loading states
	 * - Component composition for maintainable, skinny page files
	 */
	import { onMount } from 'svelte';
	import ChartSection from '$lib/components/ChartSection.svelte';
	import ErrorBanner from '$lib/components/ErrorBanner.svelte';
	import GtcChartSection from './_components/GtcChartSection.svelte';
	import GtcChartFiltersSidebar from './_components/GtcChartFiltersSidebar.svelte';
	import { getChartData } from '$lib/remotes/chartData.js';
	import { getFilters } from '$lib/stores/chartFilters.svelte.js';
	import { isModelVisible } from '$lib/stores/chartSettings.svelte.js';

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
	import { parseSystemData } from '../pareto-charts/_components/dataTransform.js';

	// Route-local components
	import ChartLoadingState from '../_components/ChartLoadingState.svelte';
	import ParetoChartSection from '../_components/ParetoChartSection.svelte';
	import GpuReliabilitySection from '../_components/GpuReliabilitySection.svelte';
	import SubmissionRequirements from '../_components/SubmissionRequirements.svelte';
	import RoleBasedViewport from '../_components/RoleBasedViewport.svelte';
	import SystemBladesSection from '../_components/SystemBladesSection.svelte';


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

{#await chartDataQuery}
	<ChartLoadingState />
{:then chartData}
	{@const filteredTTFTChart = {
		...chartData.ttftVsUsersChart,
		models: chartData.ttftVsUsersChart.models.filter((m) => isModelVisible(m.id))
	}}
	{@const filteredThroughputChart = {
		...chartData.throughputVsInteractivityChart,
		models: chartData.throughputVsInteractivityChart.models.filter((m) => isModelVisible(m.id))
	}}
	{@const filteredNormalizedUsersChart = {
		...chartData.normalizedThroughputVsUsersChart,
		models: chartData.normalizedThroughputVsUsersChart.models.filter((m) => isModelVisible(m.id))
	}}
	{@const filteredNormalizedTTFTChart = {
		...chartData.normalizedThroughputVsTTFTChart,
		models: chartData.normalizedThroughputVsTTFTChart.models.filter((m) => isModelVisible(m.id))
	}}


	<!-- Side-by-side layout with filters sidebar and charts -->
	<div class="mx-auto max-w-7xl px-3 pb-3 pt-9">
		<div class="flex flex-col gap-6 lg:flex-row">
			<!-- Charts area -->
			<div class="min-w-0 flex-1">
				<!-- Main content area - custom layout: 1 full, 2&3 side-by-side, 4 full -->
				<div class="grid grid-cols-1 gap-3 md:grid-cols-2">
					<!-- Chart 1: TTFT vs #Users (Step Chart) - Full width -->
					<div class="md:col-span-2">
						<GtcChartSection chart={filteredTTFTChart} lineType="step" />
					</div>

					<!-- Chart 2: System throughput vs Interactivity (Line Chart) -->
					<GtcChartSection chart={filteredThroughputChart} lineType="line" />

					<!-- Chart 3: Normalized throughput vs #Users (Step Chart) -->
					<GtcChartSection chart={filteredNormalizedUsersChart} lineType="step" />

					<!-- Chart 4: Normalized throughput vs TTFT (Line Chart) - Full width -->
					<div class="md:col-span-2">
						<GtcChartSection chart={filteredNormalizedTTFTChart} lineType="line" />
					</div>
				</div>
			</div>

			<!-- Chart Filters Sidebar (hidden on mobile) -->
			<GtcChartFiltersSidebar />
		</div>
	</div>
{:catch error}
	<ErrorBanner message={error?.message} />
{/await}
