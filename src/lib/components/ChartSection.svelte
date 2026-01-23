<script>
	import BenchmarkChart from '$lib/components/BenchmarkChart.svelte';
	import BarChart from '$lib/components/BarChart.svelte';

	/**
	 * Reusable chart section wrapper that handles title, subtitle, and responsive sizing.
	 * Supports different chart types and layouts.
	 *
	 * @typedef {Object} Props
	 * @property {object} chart - Chart data object with title, subtitle, xLabel, yLabel, and models/data
	 * @property {'default' | 'side-by-side'} [layout] - Layout variant
	 * @property {'line' | 'bar'} [chartType] - Type of chart to render
	 * @property {boolean} [useTimelineRange] - Whether to use timeline range store for x-axis
	 * @property {[number, number]} [xDomain] - Custom x-axis domain
	 */

	/** @type {Props} */
	let {
		chart,
		layout = 'default',
		chartType = 'line',
		useTimelineRange = false,
		xDomain = [0, 350]
	} = $props();

	// Reactive container width for fluid chart sizing
	let containerWidth = $state(0);
</script>

{#if layout === 'side-by-side'}
	<!-- Side-by-side layout: stacks on mobile (copy top, chart bottom), side-by-side on md+ -->
	<section
		class="mb-6 flex w-full flex-col items-start gap-6 md:flex-row md:items-center md:gap-8 md:px-3"
	>
		<div class="flex w-full shrink-0 items-center justify-center md:w-1/3">
			<div class="flex flex-col">
				<h2
					class="font-instrument-sans-100 mt-16 mb-3 text-3xl font-semibold text-pretty text-slate-800 md:mt-0 md:text-5xl dark:text-slate-200"
				>
					{chart.title}
				</h2>
				<p class="mb-4 leading-relaxed text-slate-600 dark:text-slate-500">
					{chart.subtitle}
				</p>
				<p class="leading-relaxed text-slate-500 dark:text-slate-400">
					Measures tokens processed per second on one GPU—raw efficiency for batch inference and
					training.
				</p>
			</div>
		</div>

		<div class="w-full md:w-2/3" bind:clientWidth={containerWidth}>
			{#if containerWidth > 0}
				{#if chartType === 'bar'}
					<BarChart
						data={chart.data}
						width={containerWidth}
						xAxisLabel={chart.xLabel}
						yAxisLabel={chart.yLabel}
					/>
				{:else}
					<BenchmarkChart
						data={chart.models}
						width={containerWidth}
						xAxisLabel={chart.xLabel}
						yAxisLabel={chart.yLabel}
						{useTimelineRange}
						{xDomain}
					/>
				{/if}
			{/if}
		</div>
	</section>
{:else}
	<!-- Default layout: title/subtitle above, full-width chart below -->
	<section class="mb-12 w-full px-3">
		<h2
			class="font-instrument-sans mb-1 text-2xl font-semibold text-slate-800 md:text-3xl dark:text-slate-200"
		>
			{chart.title}
		</h2>
		<p class="mb-4 text-sm text-slate-500 dark:text-slate-400">
			{chart.subtitle}
		</p>

		<div class="w-full" bind:clientWidth={containerWidth}>
			{#if containerWidth > 0}
				{#if chartType === 'bar'}
					<BarChart
						data={chart.data}
						width={containerWidth}
						xAxisLabel={chart.xLabel}
						yAxisLabel={chart.yLabel}
					/>
				{:else}
					<BenchmarkChart
						data={chart.models}
						width={containerWidth}
						xAxisLabel={chart.xLabel}
						yAxisLabel={chart.yLabel}
						{useTimelineRange}
						{xDomain}
					/>
				{/if}
			{/if}
		</div>
	</section>
{/if}
