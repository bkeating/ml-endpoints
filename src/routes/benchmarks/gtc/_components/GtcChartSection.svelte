<script>
	/**
	 * GTC Chart Section - Wrapper for GTC charts with title, subtitle, and responsive sizing
	 * Supports step and line chart types
	 */
	import GtcChart from './GtcChart.svelte';

	/**
	 * @typedef {Object} Props
	 * @property {object} chart - Chart data object with title, subtitle, xLabel, yLabel, and models
	 * @property {'step' | 'line'} [lineType='line'] - Type of line to render
	 */
	/** @type {Props} */
	let { chart, lineType = 'line' } = $props();

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
				width={containerWidth}
				height={Math.max(300, containerWidth * 0.6)}
				{lineType}
			/>
		{/if}
	</div>
</section>
