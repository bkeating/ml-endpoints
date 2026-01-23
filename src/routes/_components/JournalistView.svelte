<script>
	/**
	 * JournalistView - View optimized for Journalists and Media
	 * Focus on: Headlines, key trends, competitive landscape, quotable statistics
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

	// Key headlines / story angles
	const keyHeadlines = [
		{
			headline: 'AI Inference Costs Drop 40% Year-Over-Year',
			context: 'Competition driving efficiency gains across all vendors',
			icon: 'trend-down'
		},
		{
			headline: 'NVIDIA Maintains Lead, But Competitors Closing Gap',
			context: 'AMD and Intel show strongest performance improvements',
			icon: 'competition'
		},
		{
			headline: 'Energy Efficiency Becomes Key Differentiator',
			context: 'Data centers prioritizing performance-per-watt metrics',
			icon: 'energy'
		}
	];

	// Quotable statistics
	const quotableStats = [
		{ stat: '2.3x', label: 'Performance improvement vs. 2024', source: 'MLPerf v4.1' },
		{ stat: '$42.8B', label: 'AI accelerator market size (2025)', source: 'Industry analysis' },
		{ stat: '47', label: 'Companies submitted benchmarks', source: 'MLPerf v4.1' },
		{ stat: '18%', label: 'YoY cost reduction per token', source: 'MLPerf v4.1' }
	];

	// Market leaders summary
	const marketLeaders = [
		{
			position: 1,
			vendor: 'NVIDIA',
			highlight: 'H100 dominates high-performance segment',
			marketShare: '68%',
			trend: 'stable'
		},
		{
			position: 2,
			vendor: 'AMD',
			highlight: 'MI300X gains enterprise traction',
			marketShare: '18%',
			trend: 'up'
		},
		{
			position: 3,
			vendor: 'Intel',
			highlight: 'Gaudi 3 targets cost-conscious buyers',
			marketShare: '8%',
			trend: 'up'
		},
		{
			position: 4,
			vendor: 'Google',
			highlight: 'TPU v5 leads in efficiency metrics',
			marketShare: '6%',
			trend: 'stable'
		}
	];

	// Key trends for stories
	const keyTrends = [
		{
			trend: 'Democratization of AI',
			detail: 'Open-source models now match proprietary alternatives',
			impact: 'High'
		},
		{
			trend: 'Edge AI Growth',
			detail: 'On-device inference reducing cloud dependency',
			impact: 'Medium'
		},
		{
			trend: 'Sustainability Focus',
			detail: 'Carbon footprint metrics becoming standard',
			impact: 'High'
		},
		{
			trend: 'Specialized Hardware',
			detail: 'Purpose-built chips outpacing general GPUs',
			impact: 'Medium'
		}
	];
</script>

<div class="flex flex-col gap-6 lg:flex-row">
	<!-- Left Column: Headlines & Key Stats -->
	<div class="w-full space-y-6 lg:w-1/2">
		<!-- Key Headlines -->
		<div
			class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800"
			in:scale={{ duration: 300, delay: 50, start: 0.95, easing: cubicOut }}
		>
			<div
				class="border-b border-slate-200 bg-linear-to-r from-slate-900 to-slate-800 px-6 py-4 dark:border-slate-700"
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
								d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
							/>
						</svg>
					</div>
					<div>
						<h2 class="text-lg font-semibold text-white">Key Story Angles</h2>
						<p class="text-xs text-slate-300">MLPerf Inference v4.1 Highlights</p>
					</div>
				</div>
			</div>

			<div class="divide-y divide-slate-100 dark:divide-slate-700">
				{#each keyHeadlines as item, i (item.headline)}
					<div
						class="p-4"
						in:fly={{ x: -20, duration: 300, delay: 100 + i * 50, easing: cubicOut }}
					>
						<h3 class="text-lg font-semibold text-slate-800 dark:text-slate-200">
							{item.headline}
						</h3>
						<p class="mt-1 text-sm text-slate-600 dark:text-slate-400">{item.context}</p>
					</div>
				{/each}
			</div>
		</div>

		<!-- Quotable Statistics -->
		<div
			class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800"
			in:scale={{ duration: 300, delay: 150, start: 0.95, easing: cubicOut }}
		>
			<div class="border-b border-slate-200 bg-slate-900/80 px-6 py-4 dark:border-slate-700">
				<h3 class="font-semibold text-white">Quotable Statistics</h3>
				<p class="text-xs text-slate-300">Ready-to-cite figures</p>
			</div>

			<div class="grid grid-cols-2 gap-4 p-6">
				{#each quotableStats as stat, i (stat.label)}
					<div
						class="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/50"
						in:fly={{ y: 20, duration: 300, delay: 200 + i * 50, easing: cubicOut }}
					>
						<p class="text-3xl font-bold text-slate-800 dark:text-slate-100">{stat.stat}</p>
						<p class="mt-1 text-sm text-slate-700 dark:text-slate-300">{stat.label}</p>
						<p class="mt-2 text-xs text-slate-500 dark:text-slate-400">Source: {stat.source}</p>
					</div>
				{/each}
			</div>
		</div>

		<!-- Market Leaders -->
		<div
			class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800"
			in:fade={{ duration: 300, delay: 350 }}
		>
			<div class="border-b border-slate-200 bg-slate-900/80 px-4 py-3 dark:border-slate-700">
				<h3 class="font-semibold text-white">Market Leaders</h3>
			</div>
			<div class="divide-y divide-slate-100 dark:divide-slate-700">
				{#each marketLeaders as leader (leader.vendor)}
					<div class="flex items-center gap-4 px-4 py-3">
						<span
							class="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold {leader.position ===
							1
								? 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300'
								: leader.position === 2
									? 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
									: leader.position === 3
										? 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300'
										: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}"
						>
							{leader.position}
						</span>
						<div class="flex-1">
							<div class="flex items-center gap-2">
								<p class="font-semibold text-slate-800 dark:text-slate-200">{leader.vendor}</p>
								{#if leader.trend === 'up'}
									<svg class="h-4 w-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
										<path
											fill-rule="evenodd"
											d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
											clip-rule="evenodd"
										/>
									</svg>
								{/if}
							</div>
							<p class="text-xs text-slate-500 dark:text-slate-400">{leader.highlight}</p>
						</div>
						<span
							class="rounded-full bg-slate-100 px-2.5 py-0.5 text-sm font-medium text-slate-700 dark:bg-slate-700 dark:text-slate-300"
						>
							{leader.marketShare}
						</span>
					</div>
				{/each}
			</div>
		</div>
	</div>

	<!-- Right Column: Trends & Visualization -->
	<div class="w-full space-y-6 lg:w-1/2">
		<!-- Performance Visualization -->
		<section
			class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800"
			in:scale={{ duration: 300, delay: 100, start: 0.95, easing: cubicOut }}
		>
			<div class="mb-4">
				<h2 class="text-xl font-semibold text-slate-800 dark:text-slate-200">
					Performance Visualization
				</h2>
				<p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
					Interactive benchmark data for visual storytelling
				</p>
			</div>

			<!-- Axis Selectors -->
			<div class="mb-4 flex flex-wrap gap-4">
				<div class="flex min-w-[180px] flex-col gap-1">
					<label
						for="x-axis-select-journalist"
						class="dm-mono text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400"
					>
						X-Axis
					</label>
					<select
						id="x-axis-select-journalist"
						value={selectedXAxis}
						onchange={onXAxisChange}
						class="dm-mono h-9 rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:ring-1 focus:ring-slate-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
					>
						{#each axisOptions as option (option.id)}
							<option value={option.id}>{option.label}</option>
						{/each}
					</select>
				</div>

				<div class="flex min-w-[180px] flex-col gap-1">
					<label
						for="y-axis-select-journalist"
						class="dm-mono text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400"
					>
						Y-Axis
					</label>
					<select
						id="y-axis-select-journalist"
						value={selectedYAxis}
						onchange={onYAxisChange}
						class="dm-mono h-9 rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:ring-1 focus:ring-slate-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
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
								class="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-600 dark:border-slate-700 dark:border-t-slate-400"
							></div>
							<p class="mt-2 text-sm text-slate-500 dark:text-slate-400">Loading data...</p>
						</div>
					</div>
				{:else if systemsData.length > 0 && chartContainerWidth > 0}
					<FlexibleChart
						data={axisChartData}
						color="#475569"
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

		<!-- Key Industry Trends -->
		<div
			class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800"
			in:fly={{ y: 20, duration: 300, delay: 250, easing: cubicOut }}
		>
			<div class="border-b border-slate-200 bg-slate-900/80 px-4 py-3 dark:border-slate-700">
				<h3 class="font-semibold text-white">Key Industry Trends</h3>
			</div>
			<div class="divide-y divide-slate-100 dark:divide-slate-700">
				{#each keyTrends as trend (trend.trend)}
					<div class="flex items-start gap-3 px-4 py-3">
						<span
							class="mt-0.5 inline-flex items-center rounded px-2 py-0.5 text-xs font-medium {trend.impact ===
							'High'
								? 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300'
								: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300'}"
						>
							{trend.impact}
						</span>
						<div>
							<p class="font-medium text-slate-800 dark:text-slate-200">{trend.trend}</p>
							<p class="text-sm text-slate-500 dark:text-slate-400">{trend.detail}</p>
						</div>
					</div>
				{/each}
			</div>
		</div>

		<!-- Press Contact / Attribution -->
		<div
			class="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50"
			in:fade={{ duration: 300, delay: 400 }}
		>
			<div class="flex items-start gap-3">
				<div class="shrink-0">
					<svg
						class="h-5 w-5 text-slate-500 dark:text-slate-400"
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
					<h4 class="text-sm font-medium text-slate-700 dark:text-slate-300">Attribution</h4>
					<p class="mt-1 text-sm text-slate-600 dark:text-slate-400">
						Data source: MLPerf Inference v4.1 (Q4 2025). For press inquiries and additional data,
						contact <span class="font-medium">press@mlcommons.org</span>
					</p>
				</div>
			</div>
		</div>
	</div>
</div>
