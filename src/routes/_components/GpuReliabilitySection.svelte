<script>
	/**
	 * GPU Reliability chart section with enhanced bar chart and toolbar.
	 * Displays GPU reliability data with sorting and overlay options.
	 *
	 * @typedef {Object} Props
	 * @property {object} chart - Chart data object with title, subtitle, xLabel, yLabel, and data
	 */
	import BarChartEnhanced from '$lib/components/BarChartEnhanced.svelte';
	import BarChartToolbar from '$lib/components/BarChartToolbar.svelte';
	import {
		getBarSortOrder,
		setBarSortOrder,
		getShowLineOverlay,
		setShowLineOverlay,
		getShowThresholds,
		setShowThresholds
	} from '$lib/stores/pageSettings.svelte.js';

	/** @type {Props} */
	let { chart } = $props();

	// Reactive container width for fluid chart sizing
	let barChartContainerWidth = $state(0);

	// Get display options from store
	let barSortOrder = $derived(getBarSortOrder());
	let showLineOverlay = $derived(getShowLineOverlay());
	let showThresholds = $derived(getShowThresholds());
</script>

<div class="w-full py-12 bg-linear-to-b from-slate-100 to-slate-500/20 dark:from-slate-100/10 dark:to-slate-500/10">
	<div class="mx-auto max-w-7xl px-3">
		<section class="mb-6">
			<h2 class="mb-1 text-2xl md:text-3xl font-semibold text-slate-800 dark:text-slate-200 font-instrument-sans">
				{chart.title}
			</h2>
			<p class="mb-4 text-sm text-slate-500 dark:text-slate-400">
				{chart.subtitle}
			</p>

			<div bind:clientWidth={barChartContainerWidth}>
				{#if barChartContainerWidth > 0}
					<BarChartEnhanced
						data={chart.data}
						width={barChartContainerWidth}
						xAxisLabel={chart.xLabel}
						yAxisLabel={chart.yLabel}
						sortOrder={barSortOrder}
						{showLineOverlay}
						{showThresholds}
					/>
				{/if}
			</div>

			<!-- Local Feature Toolbar -->
			<BarChartToolbar
				sortOrder={barSortOrder}
				{showLineOverlay}
				{showThresholds}
				onSortChange={(order) => setBarSortOrder(order)}
				onLineOverlayChange={(show) => setShowLineOverlay(show)}
				onThresholdsChange={(show) => setShowThresholds(show)}
			/>
		</section>
	</div>
</div>
