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
	<!-- Side-by-side layout: description on left, chart on right -->
	<section class="flex gap-8 items-center mb-12">
		<div class="w-1/3 shrink-0 flex items-center justify-center">
			<div class="flex flex-col">
				<h2 class="mb-3 text-4xl font-semibold text-slate-800 dark:text-slate-200 font-instrument-sans-700">
					{chart.title}
				</h2>
				<p class="mb-4 text-slate-600 dark:text-slate-400 leading-relaxed">
					{chart.subtitle}
				</p>
				<p class="text-sm text-slate-500 dark:text-slate-500 leading-relaxed">
					In LLM benchmarking, token throughput per GPU measures raw efficiency—tokens processed per second on one GPU, optimized via dynamic batching and mixed precision (e.g., FP16) for scalable batch inference and training. It boosts high-volume workloads, cutting costs for models like GPT or Llama.
				</p>
			</div>
		</div>

		<div class="w-2/3" bind:clientWidth={containerWidth}>
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
	<section class="mb-12">
		<h2 class="mb-1 text-3xl font-semibold text-slate-800 dark:text-slate-200 font-instrument-sans">
			{chart.title}
		</h2>
		<p class="mb-4 text-sm text-slate-500 dark:text-slate-400">
			{chart.subtitle}
		</p>

		<div bind:clientWidth={containerWidth}>
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

