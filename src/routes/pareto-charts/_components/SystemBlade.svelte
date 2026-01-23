<script>
	/**
	 * System Blade Component
	 * Container for a single system's 4 benchmark charts
	 * Displays system metadata and all charts in a vertical stack
	 */
	import TTFTChart from './TTFTChart.svelte';
	import ThroughputInteractivityChart from './ThroughputInteractivityChart.svelte';
	import NormalizedThroughputChart from './NormalizedThroughputChart.svelte';
	import NormalizedTTFTChart from './NormalizedTTFTChart.svelte';
	import {
		prepareTTFTChartData,
		prepareThroughputInteractivityData,
		prepareNormalizedThroughputData,
		prepareNormalizedTTFTData
	} from './dataTransform.js';

	/**
	 * @typedef {Object} Props
	 * @property {Object} systemData - System benchmark data
	 * @property {string} color - Color for this system's charts
	 * @property {number} [chartHeight] - Height for each chart
	 */

	/** @type {Props} */
	let { systemData, color, chartHeight = 280 } = $props();

	// Bind to container width for fluid charts
	let containerWidth = $state(0);

	// Calculate chart width from container (accounting for padding)
	let chartWidth = $derived(Math.max(200, containerWidth - 24));

	// Prepare data for each chart
	let ttftData = $derived(prepareTTFTChartData(systemData));
	let throughputInteractivityData = $derived(prepareThroughputInteractivityData(systemData));
	let normalizedThroughputData = $derived(prepareNormalizedThroughputData(systemData));
	let normalizedTTFTData = $derived(prepareNormalizedTTFTData(systemData));
</script>

<div
	class="system-blade rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800"
>
	<!-- System Header -->
	<div class="mb-6 border-b border-slate-200 pb-4 dark:border-slate-700">
		<h2 class="text-xl font-bold text-slate-800 dark:text-slate-100">
			{systemData.name}
		</h2>
		<div class="mt-2 flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-400">
			<div>
				<span class="font-medium">Chips:</span>
				<span class="ml-1">{systemData.chips}</span>
			</div>
			<div>
				<span class="font-medium">Normalizing Factor:</span>
				<span class="ml-1">{systemData.normalizingFactor}</span>
			</div>
		</div>
	</div>

	<!-- Charts Grid -->
	<div class="space-y-6">
		<!-- Chart 1: TTFT vs Concurrent Users -->
		<div class="chart-wrapper" bind:clientWidth={containerWidth}>
			{#if containerWidth > 0}
				<TTFTChart
					data={ttftData}
					{color}
					width={chartWidth}
					height={chartHeight}
					title="Chart 1: TTFT vs # Concurrent Users"
				/>
			{/if}
		</div>

		<!-- Chart 2: System Throughput vs Interactivity -->
		<div class="chart-wrapper">
			{#if containerWidth > 0}
				<ThroughputInteractivityChart
					data={throughputInteractivityData}
					{color}
					width={chartWidth}
					height={chartHeight}
					title="Chart 2: System Throughput vs Interactivity"
				/>
			{/if}
		</div>

		<!-- Chart 3: Normalized Throughput vs Concurrent Users -->
		<div class="chart-wrapper">
			{#if containerWidth > 0}
				<NormalizedThroughputChart
					data={normalizedThroughputData}
					{color}
					width={chartWidth}
					height={chartHeight}
					title="Chart 3: Normalized Throughput vs # Concurrent Users"
				/>
			{/if}
		</div>

		<!-- Chart 4: Normalized Throughput vs TTFT -->
		<div class="chart-wrapper">
			{#if containerWidth > 0}
				<NormalizedTTFTChart
					data={normalizedTTFTData}
					{color}
					width={chartWidth}
					height={chartHeight}
					title="Chart 4: Normalized Throughput vs TTFT"
				/>
			{/if}
		</div>
	</div>
</div>

<style lang="postcss">
	@reference "@app-css";

	.system-blade {
		/* Ensure blades have consistent styling */
		min-width: 0; /* Allow flex shrinking */
	}

	.chart-wrapper {
		@apply rounded-lg bg-slate-50 p-3 dark:bg-slate-900/50;
	}
</style>
