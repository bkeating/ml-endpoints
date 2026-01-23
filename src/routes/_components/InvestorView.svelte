<script>
	/**
	 * InvestorView - View optimized for investors
	 * Focus on: Understanding how different solutions perform, ROI metrics, market comparisons
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

	// Sample comparison data for investors
	const solutionComparisons = [
		{
			name: 'NVIDIA H100',
			vendor: 'NVIDIA',
			performance: 92,
			efficiency: 88,
			costPerToken: 0.0012,
			marketShare: 68
		},
		{
			name: 'AMD MI300X',
			vendor: 'AMD',
			performance: 85,
			efficiency: 91,
			costPerToken: 0.001,
			marketShare: 18
		},
		{
			name: 'Intel Gaudi 3',
			vendor: 'Intel',
			performance: 78,
			efficiency: 85,
			costPerToken: 0.0008,
			marketShare: 8
		},
		{
			name: 'Google TPU v5',
			vendor: 'Google',
			performance: 89,
			efficiency: 94,
			costPerToken: 0.0009,
			marketShare: 6
		}
	];

	// Key market metrics
	const marketMetrics = [
		{ label: 'Total Market Size', value: '$42.8B', change: '+24%', positive: true },
		{ label: 'YoY Growth Rate', value: '31.2%', change: '+5.2%', positive: true },
		{ label: 'Avg. Inference Cost', value: '$0.0011', change: '-18%', positive: true },
		{ label: 'Energy Efficiency', value: '2.4x', change: '+0.6x', positive: true }
	];
</script>

<div class="flex flex-col gap-6 lg:flex-row">
	<!-- Left Column: Market Overview & Solution Comparison -->
	<div class="w-full space-y-6 lg:w-1/2">
		<!-- Market Metrics Overview -->
		<div
			class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800"
			in:scale={{ duration: 300, delay: 50, start: 0.95, easing: cubicOut }}
		>
			<div
				class="border-b border-slate-200 bg-linear-to-r from-indigo-900/90 to-indigo-800 px-6 py-4 dark:border-slate-700"
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
								d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
							/>
						</svg>
					</div>
					<div>
						<h2 class="text-lg font-semibold text-white">AI Inference Market Overview</h2>
						<p class="text-xs text-indigo-200">Q4 2025 MLPerf Benchmark Analysis</p>
					</div>
				</div>
			</div>

			<div class="grid grid-cols-2 gap-4 p-6 md:grid-cols-4">
				{#each marketMetrics as metric, i (metric.label)}
					<div
						class="rounded-lg bg-slate-50 p-4 dark:bg-slate-900/50"
						in:fly={{ y: 20, duration: 300, delay: 100 + i * 50, easing: cubicOut }}
					>
						<p class="text-xs font-medium text-slate-500 dark:text-slate-400">{metric.label}</p>
						<p class="mt-1 text-2xl font-bold text-slate-800 dark:text-slate-100">{metric.value}</p>
						<span
							class="mt-1 inline-flex items-center text-xs font-medium {metric.positive
								? 'text-emerald-600 dark:text-emerald-400'
								: 'text-red-600 dark:text-red-400'}"
						>
							{#if metric.positive}
								<svg class="mr-1 h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
									<path
										fill-rule="evenodd"
										d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
										clip-rule="evenodd"
									/>
								</svg>
							{:else}
								<svg class="mr-1 h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
									<path
										fill-rule="evenodd"
										d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"
										clip-rule="evenodd"
									/>
								</svg>
							{/if}
							{metric.change}
						</span>
					</div>
				{/each}
			</div>
		</div>

		<!-- Solution Comparison Table -->
		<div
			class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800"
			in:scale={{ duration: 300, delay: 150, start: 0.95, easing: cubicOut }}
		>
			<div class="border-b border-slate-200 bg-slate-900/80 px-6 py-4 dark:border-slate-700">
				<h3 class="font-semibold text-white">Solution Performance Comparison</h3>
				<p class="text-xs text-slate-300">Normalized scores based on MLPerf benchmarks</p>
			</div>

			<div class="overflow-x-auto">
				<table class="w-full text-sm">
					<thead class="bg-slate-50 dark:bg-slate-800/50">
						<tr>
							<th
								class="px-4 py-3 text-left text-xs font-medium tracking-wider text-slate-500 uppercase dark:text-slate-400"
								>Solution</th
							>
							<th
								class="px-4 py-3 text-center text-xs font-medium tracking-wider text-slate-500 uppercase dark:text-slate-400"
								>Performance</th
							>
							<th
								class="px-4 py-3 text-center text-xs font-medium tracking-wider text-slate-500 uppercase dark:text-slate-400"
								>Efficiency</th
							>
							<th
								class="px-4 py-3 text-right text-xs font-medium tracking-wider text-slate-500 uppercase dark:text-slate-400"
								>$/Token</th
							>
							<th
								class="px-4 py-3 text-right text-xs font-medium tracking-wider text-slate-500 uppercase dark:text-slate-400"
								>Market %</th
							>
						</tr>
					</thead>
					<tbody class="divide-y divide-slate-100 dark:divide-slate-700">
						{#each solutionComparisons as solution, i (solution.name)}
							<tr
								class="hover:bg-slate-50 dark:hover:bg-slate-800/50"
								in:fly={{ x: -20, duration: 300, delay: 200 + i * 50, easing: cubicOut }}
							>
								<td class="px-4 py-3">
									<div>
										<p class="font-medium text-slate-800 dark:text-slate-200">{solution.name}</p>
										<p class="text-xs text-slate-500 dark:text-slate-400">{solution.vendor}</p>
									</div>
								</td>
								<td class="px-4 py-3">
									<div class="flex items-center justify-center gap-2">
										<div class="h-2 w-16 rounded-full bg-slate-200 dark:bg-slate-700">
											<div
												class="h-full rounded-full bg-emerald-500"
												style="width: {solution.performance}%"
											></div>
										</div>
										<span class="w-8 text-right text-slate-700 dark:text-slate-300"
											>{solution.performance}</span
										>
									</div>
								</td>
								<td class="px-4 py-3">
									<div class="flex items-center justify-center gap-2">
										<div class="h-2 w-16 rounded-full bg-slate-200 dark:bg-slate-700">
											<div
												class="h-full rounded-full bg-blue-500"
												style="width: {solution.efficiency}%"
											></div>
										</div>
										<span class="w-8 text-right text-slate-700 dark:text-slate-300"
											>{solution.efficiency}</span
										>
									</div>
								</td>
								<td class="px-4 py-3 text-right text-slate-700 dark:text-slate-300">
									${solution.costPerToken.toFixed(4)}
								</td>
								<td class="px-4 py-3 text-right">
									<span
										class="inline-flex items-center rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300"
									>
										{solution.marketShare}%
									</span>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>

		<!-- Investment Insight Card -->
		<div
			class="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-900/20"
			in:fade={{ duration: 300, delay: 400 }}
		>
			<div class="flex gap-3">
				<div class="shrink-0">
					<svg
						class="h-5 w-5 text-amber-600 dark:text-amber-400"
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
					<h4 class="text-sm font-medium text-amber-800 dark:text-amber-300">Key Investment Insight</h4>
					<p class="mt-1 text-sm text-amber-700 dark:text-amber-400">
						Energy efficiency improvements are driving 18% YoY cost reductions. Companies with
						optimized inference pipelines show 2.3x better margins.
					</p>
				</div>
			</div>
		</div>
	</div>

	<!-- Right Column: Performance Charts -->
	<div class="w-full space-y-6 lg:w-1/2">
		<!-- Performance Trend Chart -->
		<section
			class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800"
			in:scale={{ duration: 300, delay: 100, start: 0.95, easing: cubicOut }}
		>
			<div class="mb-4">
				<h2 class="text-xl font-semibold text-slate-800 dark:text-slate-200">
					Performance Trends
				</h2>
				<p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
					Compare solutions across key performance metrics to identify market leaders
				</p>
			</div>

			<!-- Axis Selectors -->
			<div class="mb-4 flex flex-wrap gap-4">
				<div class="flex min-w-[180px] flex-col gap-1">
					<label
						for="x-axis-select-investor"
						class="dm-mono text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400"
					>
						X-Axis
					</label>
					<select
						id="x-axis-select-investor"
						value={selectedXAxis}
						onchange={onXAxisChange}
						class="dm-mono h-9 rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
					>
						{#each axisOptions as option (option.id)}
							<option value={option.id}>{option.label}</option>
						{/each}
					</select>
				</div>

				<div class="flex min-w-[180px] flex-col gap-1">
					<label
						for="y-axis-select-investor"
						class="dm-mono text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400"
					>
						Y-Axis
					</label>
					<select
						id="y-axis-select-investor"
						value={selectedYAxis}
						onchange={onYAxisChange}
						class="dm-mono h-9 rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
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
								class="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600 dark:border-slate-700 dark:border-t-indigo-500"
							></div>
							<p class="mt-2 text-sm text-slate-500 dark:text-slate-400">Loading data...</p>
						</div>
					</div>
				{:else if systemsData.length > 0 && chartContainerWidth > 0}
					<FlexibleChart
						data={axisChartData}
						color="#6366f1"
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

		<!-- Quick Stats Cards -->
		<div class="grid grid-cols-2 gap-4" in:fly={{ y: 20, duration: 300, delay: 250, easing: cubicOut }}>
			<div
				class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800"
			>
				<div class="flex items-center gap-3">
					<div class="rounded-lg bg-emerald-100 p-2 dark:bg-emerald-900/30">
						<svg
							class="h-5 w-5 text-emerald-600 dark:text-emerald-400"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
					</div>
					<div>
						<p class="text-xs text-slate-500 dark:text-slate-400">Best Value</p>
						<p class="font-semibold text-slate-800 dark:text-slate-200">Intel Gaudi 3</p>
						<p class="text-xs text-emerald-600 dark:text-emerald-400">$0.0008/token</p>
					</div>
				</div>
			</div>

			<div
				class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800"
			>
				<div class="flex items-center gap-3">
					<div class="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
						<svg
							class="h-5 w-5 text-blue-600 dark:text-blue-400"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M13 10V3L4 14h7v7l9-11h-7z"
							/>
						</svg>
					</div>
					<div>
						<p class="text-xs text-slate-500 dark:text-slate-400">Top Performance</p>
						<p class="font-semibold text-slate-800 dark:text-slate-200">NVIDIA H100</p>
						<p class="text-xs text-blue-600 dark:text-blue-400">Score: 92</p>
					</div>
				</div>
			</div>

			<div
				class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800"
			>
				<div class="flex items-center gap-3">
					<div class="rounded-lg bg-purple-100 p-2 dark:bg-purple-900/30">
						<svg
							class="h-5 w-5 text-purple-600 dark:text-purple-400"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
							/>
						</svg>
					</div>
					<div>
						<p class="text-xs text-slate-500 dark:text-slate-400">Most Efficient</p>
						<p class="font-semibold text-slate-800 dark:text-slate-200">Google TPU v5</p>
						<p class="text-xs text-purple-600 dark:text-purple-400">94% efficiency</p>
					</div>
				</div>
			</div>

			<div
				class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800"
			>
				<div class="flex items-center gap-3">
					<div class="rounded-lg bg-amber-100 p-2 dark:bg-amber-900/30">
						<svg
							class="h-5 w-5 text-amber-600 dark:text-amber-400"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
							/>
						</svg>
					</div>
					<div>
						<p class="text-xs text-slate-500 dark:text-slate-400">Fastest Growing</p>
						<p class="font-semibold text-slate-800 dark:text-slate-200">AMD MI300X</p>
						<p class="text-xs text-amber-600 dark:text-amber-400">+12% market share</p>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
