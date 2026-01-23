<script>
	/**
	 * RoleBasedViewport - Container component that switches views based on user role selection
	 * Uses crossfade transitions for smooth FLIP-style animations between views
	 */
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import DefaultRoleView from './DefaultRoleView.svelte';
	import InvestorView from './InvestorView.svelte';
	import ModelDeveloperView from './ModelDeveloperView.svelte';
	import EnterpriseBuyerView from './EnterpriseBuyerView.svelte';
	import NeoCloudView from './NeoCloudView.svelte';
	import InfraEngineerView from './InfraEngineerView.svelte';
	import ITBuyerView from './ITBuyerView.svelte';
	import HardwareManufacturerView from './HardwareManufacturerView.svelte';
	import BaaSUserView from './BaaSUserView.svelte';
	import JournalistView from './JournalistView.svelte';

	/**
	 * @typedef {Object} Props
	 * @property {string} selectedRole - Currently selected user role ID
	 * @property {Array<{id: string, label: string}>} roleOptions - Available role options
	 * @property {number} [axisChartWidth] - Width for axis chart
	 * @property {number} [axisChartHeight] - Height for axis chart
	 * @property {boolean} [axisSelectorLoading] - Loading state for axis chart
	 * @property {Array} [systemsData] - Systems data for charts
	 * @property {Array} [axisChartData] - Axis chart data
	 * @property {string} [chartTitle] - Chart title
	 * @property {Object|null} [xAxisOption] - X-axis option
	 * @property {Object|null} [yAxisOption] - Y-axis option
	 * @property {boolean} [logScaleX] - Use log scale X
	 * @property {boolean} [logScaleY] - Use log scale Y
	 * @property {Function} [onXAxisChange] - X-axis change handler
	 * @property {Function} [onYAxisChange] - Y-axis change handler
	 * @property {string} [selectedXAxis] - Selected X-axis
	 * @property {string} [selectedYAxis] - Selected Y-axis
	 * @property {Array} [axisOptions] - Available axis options
	 */

	/** @type {Props} */
	let {
		selectedRole = 'endpoints-user',
		roleOptions = [],
		axisChartWidth = 0,
		axisChartHeight = 280,
		axisSelectorLoading = false,
		systemsData = [],
		axisChartData = [],
		chartTitle = '',
		xAxisOption = null,
		yAxisOption = null,
		logScaleX = false,
		logScaleY = false,
		onXAxisChange = () => {},
		onYAxisChange = () => {},
		selectedXAxis = '',
		selectedYAxis = '',
		axisOptions = []
	} = $props();

	// Track previous role for animation direction
	let previousRole = $state('endpoints-user');
	let animationDirection = $state(1);

	// Update previous role and calculate direction when selectedRole changes
	$effect.pre(() => {
		const roleOrder = roleOptions.map((r) => r.id);
		const prevIndex = roleOrder.indexOf(previousRole);
		const currentIndex = roleOrder.indexOf(selectedRole);
		animationDirection = currentIndex >= prevIndex ? 1 : -1;
	});

	// Update previousRole after the current one is processed
	$effect(() => {
		previousRole = selectedRole;
	});

	// Determine which view component to render
	let currentView = $derived.by(() => {
		switch (selectedRole) {
			case 'investor':
				return 'investor';
			case 'model-developer':
				return 'model-developer';
			case 'enterprise-buyer':
				return 'enterprise-buyer';
			case 'neo-cloud':
				return 'neo-cloud';
			case 'infra-engineer':
				return 'infra-engineer';
			case 'it-buyer':
				return 'it-buyer';
			case 'hardware-mfg':
				return 'hardware-mfg';
			case 'baas-user':
				return 'baas-user';
			case 'journalist':
				return 'journalist';
			default:
				return 'default';
		}
	});

</script>

<div class="role-based-viewport relative min-h-[700px] overflow-hidden">
	<!-- View Container with transitions -->
	{#key currentView}
		<div
			class="view-container"
			in:fly={{ y: animationDirection * 30, duration: 350, delay: 100, easing: cubicOut }}
			out:fly={{ y: animationDirection * -30, duration: 250, easing: cubicOut }}
		>
			{#if currentView === 'investor'}
				<InvestorView
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
					{onXAxisChange}
					{onYAxisChange}
					{selectedXAxis}
					{selectedYAxis}
					{axisOptions}
				/>
			{:else if currentView === 'model-developer'}
				<ModelDeveloperView
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
					{onXAxisChange}
					{onYAxisChange}
					{selectedXAxis}
					{selectedYAxis}
					{axisOptions}
				/>
			{:else if currentView === 'enterprise-buyer'}
				<EnterpriseBuyerView
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
					{onXAxisChange}
					{onYAxisChange}
					{selectedXAxis}
					{selectedYAxis}
					{axisOptions}
				/>
			{:else if currentView === 'neo-cloud'}
				<NeoCloudView
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
					{onXAxisChange}
					{onYAxisChange}
					{selectedXAxis}
					{selectedYAxis}
					{axisOptions}
				/>
			{:else if currentView === 'infra-engineer'}
				<InfraEngineerView
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
					{onXAxisChange}
					{onYAxisChange}
					{selectedXAxis}
					{selectedYAxis}
					{axisOptions}
				/>
			{:else if currentView === 'it-buyer'}
				<ITBuyerView
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
					{onXAxisChange}
					{onYAxisChange}
					{selectedXAxis}
					{selectedYAxis}
					{axisOptions}
				/>
			{:else if currentView === 'hardware-mfg'}
				<HardwareManufacturerView
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
					{onXAxisChange}
					{onYAxisChange}
					{selectedXAxis}
					{selectedYAxis}
					{axisOptions}
				/>
			{:else if currentView === 'baas-user'}
				<BaaSUserView
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
					{onXAxisChange}
					{onYAxisChange}
					{selectedXAxis}
					{selectedYAxis}
					{axisOptions}
				/>
			{:else if currentView === 'journalist'}
				<JournalistView
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
					{onXAxisChange}
					{onYAxisChange}
					{selectedXAxis}
					{selectedYAxis}
					{axisOptions}
				/>
			{:else}
				<DefaultRoleView
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
					{onXAxisChange}
					{onYAxisChange}
					{selectedXAxis}
					{selectedYAxis}
					{axisOptions}
				/>
			{/if}
		</div>
	{/key}
</div>

<style lang="postcss">
	@reference "@app-css";

	.role-based-viewport {
		position: relative;
	}

	.view-container {
		@apply w-full;
	}
</style>
