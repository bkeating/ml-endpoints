<script>
	/**
	 * HardwareManufacturerView - View optimized for Hardware Manufacturers
	 * Focus on: Competitive positioning, performance per watt, market validation, benchmark rankings
	 */
	import FlexibleChart from '$lib/components/FlexibleChart.svelte';
	import { fade, fly, scale } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';

	/**
	 * @typedef {Object} Props
	 * @property {number} [axisChartWidth] - Width for axis chart
	 * @property {number} [axisChartHeight] - Height for axis chart
	 * @property {boolean} [axisSelectorLoading] - Loading state
	 * @property {Array} [systemsData] - Systems data
	 * @property {Array} [axisChartData] - Chart data
	 * @property {string} [chartTitle] - Chart title
	 * @property {Object|null} [xAxisOption] - X-axis option
	 * @property {Object|null} [yAxisOption] - Y-axis option
	 * @property {boolean} [logScaleX] - Use log scale X
	 * @property {boolean} [logScaleY] - Use log scale Y
	 * @property {Function} [onXAxisChange] - X-axis change handler
	 * @property {Function} [onYAxisChange] - Y-axis change handler
	 * @property {string} [selectedXAxis] - Selected X-axis
	 * @property {string} [selectedYAxis] - Selected Y-axis
	 * @property {Array} [axisOptions] - Axis options
	 */

	/** @type {Props} */
	let {
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

	// Bind container width for responsive chart
	let chartContainerWidth = $state(0);

	// Competitive landscape metrics
	const competitiveMetrics = [
		{ label: 'Your Ranking', value: '#2', sublabel: 'Overall performance', trend: 'up' },
		{ label: 'Market Share', value: '24%', sublabel: 'AI accelerator market', trend: 'up' },
		{ label: 'Perf/Watt Lead', value: '+18%', sublabel: 'vs. nearest competitor', trend: 'up' },
		{ label: 'Design Wins', value: '47', sublabel: 'Q4 2025 YTD', trend: 'same' }
	];

	// Competitive benchmark data
	const competitorBenchmarks = [
		{
			vendor: 'NVIDIA',
			product: 'H100 SXM5',
			throughput: 18500,
			ttft: 42,
			perfPerWatt: 26.4,
			tdp: 700,
			rank: 1,
			trend: 'stable'
		},
		{
			vendor: 'AMD',
			product: 'MI300X',
			throughput: 16200,
			ttft: 48,
			perfPerWatt: 24.5,
			tdp: 750,
			rank: 2,
			trend: 'up'
		},
		{
			vendor: 'Intel',
			product: 'Gaudi 3',
			throughput: 12800,
			ttft: 56,
			perfPerWatt: 22.8,
			tdp: 600,
			rank: 3,
			trend: 'up'
		},
		{
			vendor: 'Google',
			product: 'TPU v5e',
			throughput: 24000,
			ttft: 38,
			perfPerWatt: 30.0,
			tdp: 200,
			rank: 1,
			trend: 'stable'
		}
	];

	// Benchmark categories
	const benchmarkCategories = [
		{ category: 'LLM Inference', yourRank: 2, totalEntries: 47, improvement: '+15%' },
		{ category: 'Image Generation', yourRank: 3, totalEntries: 32, improvement: '+8%' },
		{ category: 'Training (MLPerf)', yourRank: 2, totalEntries: 28, improvement: '+22%' },
		{ category: 'Power Efficiency', yourRank: 1, totalEntries: 47, improvement: '+31%' }
	];

	// Generation comparison
	const generationComparison = [
		{ gen: 'Current Gen', perf: 100, power: 100, efficiency: 100 },
		{ gen: 'Previous Gen', perf: 65, power: 95, efficiency: 68 },
		{ gen: 'Competitor A', perf: 92, power: 105, efficiency: 88 },
		{ gen: 'Competitor B', perf: 78, power: 90, efficiency: 87 }
	];
</script>

<div class="flex flex-col gap-6 lg:flex-row">
	<!-- Left Column: Competitive Analysis -->
	<div class="w-full space-y-6 lg:w-1/2">
		<!-- Competitive Position Overview -->
		<div
			class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800"
			in:scale={{ duration: 300, delay: 50, start: 0.95, easing: cubicOut }}
		>
			<div
				class="border-b border-slate-200 bg-linear-to-r from-rose-900/90 to-rose-800 px-6 py-4 dark:border-slate-700"
			>
				<div class="flex items-center gap-3">
					<div
						class="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-lg font-bold text-white"
					>
						<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
							/>
						</svg>
					</div>
					<div>
						<h2 class="text-lg font-semibold text-white">Competitive Position</h2>
						<p class="text-xs text-rose-200">MLPerf Inference v4.1 Results</p>
					</div>
				</div>
			</div>

			<div class="grid grid-cols-2 gap-4 p-6 md:grid-cols-4">
				{#each competitiveMetrics as metric, i (metric.label)}
					<div
						class="rounded-lg bg-slate-50 p-4 dark:bg-slate-900/50"
						in:fly={{ y: 20, duration: 300, delay: 100 + i * 50, easing: cubicOut }}
					>
						<div class="mb-1 flex items-center justify-between">
							<span class="text-xs font-medium text-slate-500 dark:text-slate-400"
								>{metric.label}</span
							>
							{#if metric.trend === 'up'}
								<svg class="h-4 w-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
									<path
										fill-rule="evenodd"
										d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
										clip-rule="evenodd"
									/>
								</svg>
							{/if}
						</div>
						<p class="text-2xl font-bold text-rose-600 dark:text-rose-400">{metric.value}</p>
						<p class="text-xs text-slate-500 dark:text-slate-400">{metric.sublabel}</p>
					</div>
				{/each}
			</div>
		</div>

		<!-- Competitor Benchmark Table -->
		<div
			class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800"
			in:scale={{ duration: 300, delay: 150, start: 0.95, easing: cubicOut }}
		>
			<div class="border-b border-slate-200 bg-slate-900/80 px-6 py-4 dark:border-slate-700">
				<h3 class="font-semibold text-white">Competitive Benchmark Analysis</h3>
				<p class="text-xs text-slate-300">Llama 3.1 70B inference performance</p>
			</div>

			<div class="overflow-x-auto">
				<table class="w-full text-sm">
					<thead class="bg-slate-50 dark:bg-slate-800/50">
						<tr>
							<th
								class="px-4 py-3 text-left text-xs font-medium tracking-wider text-slate-500 uppercase dark:text-slate-400"
								>Vendor</th
							>
							<th
								class="px-4 py-3 text-center text-xs font-medium tracking-wider text-slate-500 uppercase dark:text-slate-400"
								>Throughput</th
							>
							<th
								class="px-4 py-3 text-center text-xs font-medium tracking-wider text-slate-500 uppercase dark:text-slate-400"
								>TTFT</th
							>
							<th
								class="px-4 py-3 text-center text-xs font-medium tracking-wider text-slate-500 uppercase dark:text-slate-400"
								>Perf/Watt</th
							>
							<th
								class="px-4 py-3 text-center text-xs font-medium tracking-wider text-slate-500 uppercase dark:text-slate-400"
								>Rank</th
							>
						</tr>
					</thead>
					<tbody class="divide-y divide-slate-100 dark:divide-slate-700">
						{#each competitorBenchmarks as comp, i (comp.product)}
							<tr
								class="hover:bg-slate-50 dark:hover:bg-slate-800/50 {comp.vendor === 'AMD'
									? 'bg-rose-50/50 dark:bg-rose-900/10'
									: ''}"
								in:fly={{ x: -20, duration: 300, delay: 200 + i * 50, easing: cubicOut }}
							>
								<td class="px-4 py-3">
									<div class="flex items-center gap-2">
										{#if comp.vendor === 'AMD'}
											<span
												class="inline-flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-xs font-bold text-white"
											>
												Y
											</span>
										{/if}
										<div>
											<p class="font-medium text-slate-800 dark:text-slate-200">{comp.vendor}</p>
											<p class="text-xs text-slate-500 dark:text-slate-400">{comp.product}</p>
										</div>
									</div>
								</td>
								<td class="px-4 py-3 text-center">
									<span class="dm-mono font-medium text-slate-700 dark:text-slate-300"
										>{comp.throughput.toLocaleString()}/s</span
									>
								</td>
								<td class="px-4 py-3 text-center">
									<span class="dm-mono font-medium text-slate-700 dark:text-slate-300"
										>{comp.ttft}ms</span
									>
								</td>
								<td class="px-4 py-3 text-center">
									<span class="dm-mono font-medium text-slate-700 dark:text-slate-300"
										>{comp.perfPerWatt}</span
									>
								</td>
								<td class="px-4 py-3 text-center">
									<span
										class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium {comp.rank ===
										1
											? 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300'
											: comp.rank === 2
												? 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
												: 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300'}"
									>
										#{comp.rank}
										{#if comp.trend === 'up'}
											<svg class="h-3 w-3 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
												<path
													fill-rule="evenodd"
													d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
													clip-rule="evenodd"
												/>
											</svg>
										{/if}
									</span>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>

		<!-- Benchmark Category Rankings -->
		<div
			class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800"
			in:fade={{ duration: 300, delay: 350 }}
		>
			<div class="border-b border-slate-200 bg-slate-900/80 px-4 py-3 dark:border-slate-700">
				<h3 class="font-semibold text-white">Category Rankings</h3>
			</div>
			<div class="divide-y divide-slate-100 p-4 dark:divide-slate-700">
				{#each benchmarkCategories as cat (cat.category)}
					<div class="flex items-center justify-between py-3 first:pt-0 last:pb-0">
						<div>
							<p class="font-medium text-slate-800 dark:text-slate-200">{cat.category}</p>
							<p class="text-xs text-slate-500 dark:text-slate-400">
								{cat.totalEntries} submissions
							</p>
						</div>
						<div class="flex items-center gap-3">
							<span
								class="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-sm font-medium text-slate-700 dark:bg-slate-700 dark:text-slate-300"
							>
								Rank #{cat.yourRank}
							</span>
							<span class="text-xs font-medium text-emerald-600 dark:text-emerald-400">
								{cat.improvement}
							</span>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>

	<!-- Right Column: Performance Charts & Insights -->
	<div class="w-full space-y-6 lg:w-1/2">
		<!-- Performance Analysis Chart -->
		<section
			class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800"
			in:scale={{ duration: 300, delay: 100, start: 0.95, easing: cubicOut }}
		>
			<div class="mb-4">
				<h2 class="text-xl font-semibold text-slate-800 dark:text-slate-200">
					Performance Landscape
				</h2>
				<p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
					Position your products against the competitive landscape
				</p>
			</div>

			<!-- Axis Selectors -->
			<div class="mb-4 flex flex-wrap gap-4">
				<div class="flex min-w-[180px] flex-col gap-1">
					<label
						for="x-axis-select-hwmfg"
						class="dm-mono text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400"
					>
						X-Axis
					</label>
					<select
						id="x-axis-select-hwmfg"
						value={selectedXAxis}
						onchange={onXAxisChange}
						class="dm-mono h-9 rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
					>
						{#each axisOptions as option (option.id)}
							<option value={option.id}>{option.label}</option>
						{/each}
					</select>
				</div>

				<div class="flex min-w-[180px] flex-col gap-1">
					<label
						for="y-axis-select-hwmfg"
						class="dm-mono text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400"
					>
						Y-Axis
					</label>
					<select
						id="y-axis-select-hwmfg"
						value={selectedYAxis}
						onchange={onYAxisChange}
						class="dm-mono h-9 rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
					>
						{#each axisOptions as option (option.id)}
							<option value={option.id}>{option.label}</option>
						{/each}
					</select>
				</div>
			</div>

			<!-- Chart Container -->
			<div
				class="chart-wrapper rounded-lg bg-slate-50 p-3 dark:bg-slate-900/50"
				bind:clientWidth={chartContainerWidth}
			>
				{#if axisSelectorLoading}
					<div class="flex items-center justify-center py-16">
						<div class="text-center">
							<div
								class="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-rose-600 dark:border-slate-700 dark:border-t-rose-500"
							></div>
							<p class="mt-2 text-sm text-slate-500 dark:text-slate-400">Loading data...</p>
						</div>
					</div>
				{:else if systemsData.length > 0 && chartContainerWidth > 0}
					<FlexibleChart
						data={axisChartData}
						color="#e11d48"
						width={chartContainerWidth - 24}
						height={axisChartHeight}
						title={chartTitle}
						xLabel={xAxisOption?.label ?? 'X-Axis'}
						yLabel={yAxisOption?.label ?? 'Y-Axis'}
						useLogScaleX={logScaleX}
						useLogScaleY={logScaleY}
					/>
				{:else}
					<div class="py-12 text-center">
						<p class="text-slate-500 dark:text-slate-400">No chart data available</p>
					</div>
				{/if}
			</div>
		</section>

		<!-- Generation Comparison -->
		<div
			class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800"
			in:fly={{ y: 20, duration: 300, delay: 250, easing: cubicOut }}
		>
			<h3 class="mb-4 font-semibold text-slate-800 dark:text-slate-200">Generation Comparison</h3>
			<div class="space-y-3">
				{#each generationComparison as gen (gen.gen)}
					<div class="rounded-lg bg-slate-50 p-3 dark:bg-slate-900/50">
						<div class="mb-2 flex items-center justify-between">
							<span
								class="text-sm font-medium {gen.gen === 'Current Gen'
									? 'text-rose-600 dark:text-rose-400'
									: 'text-slate-700 dark:text-slate-300'}"
							>
								{gen.gen}
							</span>
							{#if gen.gen === 'Current Gen'}
								<span
									class="inline-flex items-center rounded-full bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-700 dark:bg-rose-900/50 dark:text-rose-300"
								>
									Baseline
								</span>
							{/if}
						</div>
						<div class="grid grid-cols-3 gap-2 text-xs">
							<div>
								<span class="text-slate-500 dark:text-slate-400">Performance</span>
								<div class="mt-1 flex items-center gap-1">
									<div class="h-1.5 flex-1 rounded-full bg-slate-200 dark:bg-slate-700">
										<div
											class="h-full rounded-full bg-emerald-500"
											style="width: {gen.perf}%"
										></div>
									</div>
									<span class="w-8 text-right text-slate-700 dark:text-slate-300">{gen.perf}%</span>
								</div>
							</div>
							<div>
								<span class="text-slate-500 dark:text-slate-400">Power</span>
								<div class="mt-1 flex items-center gap-1">
									<div class="h-1.5 flex-1 rounded-full bg-slate-200 dark:bg-slate-700">
										<div
											class="h-full rounded-full bg-amber-500"
											style="width: {Math.min(gen.power, 100)}%"
										></div>
									</div>
									<span class="w-8 text-right text-slate-700 dark:text-slate-300">{gen.power}%</span>
								</div>
							</div>
							<div>
								<span class="text-slate-500 dark:text-slate-400">Efficiency</span>
								<div class="mt-1 flex items-center gap-1">
									<div class="h-1.5 flex-1 rounded-full bg-slate-200 dark:bg-slate-700">
										<div class="h-full rounded-full bg-blue-500" style="width: {gen.efficiency}%"
										></div>
									</div>
									<span class="w-8 text-right text-slate-700 dark:text-slate-300"
										>{gen.efficiency}%</span
									>
								</div>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>

		<!-- Manufacturer Insight -->
		<div
			class="rounded-xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-900/50 dark:bg-rose-900/20"
			in:fade={{ duration: 300, delay: 400 }}
		>
			<div class="flex gap-3">
				<div class="shrink-0">
					<svg
						class="h-5 w-5 text-rose-600 dark:text-rose-400"
						fill="currentColor"
						viewBox="0 0 20 20"
					>
						<path
							fill-rule="evenodd"
							d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
							clip-rule="evenodd"
						/>
					</svg>
				</div>
				<div>
					<h4 class="text-sm font-medium text-rose-800 dark:text-rose-300">Competitive Insight</h4>
					<p class="mt-1 text-sm text-rose-700 dark:text-rose-400">
						Your current generation shows +18% perf/watt improvement vs. competitors. Focus
						marketing on power efficiency for data center customers where electricity costs dominate
						TCO.
					</p>
				</div>
			</div>
		</div>
	</div>
</div>
