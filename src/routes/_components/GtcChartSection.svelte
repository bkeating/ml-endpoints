<script>
	/**
	 * GTC Chart Section - Wrapper for GTC charts with title, subtitle, and responsive sizing
	 * Supports step and line chart types with configurable scale types
	 */
	import GtcChart from './GtcChart.svelte';
	import { getShowComparison } from '$lib/stores/chartSettings.svelte.js';

	/**
	 * @typedef {Object} ChartConfig
	 * @property {string} title - Chart title
	 * @property {string} subtitle - Chart description/subtitle
	 * @property {string} xLabel - X-axis label
	 * @property {string} yLabel - Y-axis label
	 * @property {'linear' | 'log'} [xScale='linear'] - X-axis scale type
	 * @property {'linear' | 'log'} [yScale='linear'] - Y-axis scale type
	 * @property {Array} models - Chart data models
	 */

	/**
	 * @typedef {Object} Props
	 * @property {ChartConfig} chart - Chart data object with title, subtitle, labels, scales, and models
	 * @property {'step' | 'line'} [lineType='line'] - Type of line to render
	 */
	/** @type {Props} */
	let { chart, lineType = 'line' } = $props();

	// Get comparison mode from global store
	let showComparison = $derived(getShowComparison());

	// Reactive container width for fluid chart sizing
	let containerWidth = $state(0);
</script>

<!-- Default layout: title/subtitle above, full-width chart below -->
<section class="mb-4 w-full">
	<h2
		class="font-instrument-sans mb-1 text-2xl font-semibold text-slate-800 md:text-2xl dark:text-slate-200"
	>
		{chart.title}
	</h2>
	<p class="mb-4 text-sm text-slate-400 dark:text-slate-500 leading-relaxed text-balance">
		{chart.subtitle}
	</p>

	<div class="w-full" bind:clientWidth={containerWidth}>
		{#if containerWidth > 0}
			<GtcChart
				data={chart.models}
				xAxisLabel={chart.xLabel}
				yAxisLabel={chart.yLabel}
				xScaleType={chart.xScale ?? 'linear'}
				yScaleType={chart.yScale ?? 'linear'}
				width={containerWidth}
				height={Math.max(300, containerWidth * 0.6)}
				{lineType}
				{showComparison}
			/>
		{/if}
	</div>
</section>
