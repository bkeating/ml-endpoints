<script>
	/**
	 * NeoCloudView - View optimized for Neo-Cloud & Cloud Service Providers
	 * Focus on: Infrastructure scalability, multi-tenancy, utilization rates, cost efficiency at scale
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

	// Infrastructure scalability metrics
	const scalabilityMetrics = [
		{ label: 'Max Cluster Size', value: '16K', sublabel: 'GPUs per deployment' },
		{ label: 'Multi-tenant Density', value: '94%', sublabel: 'Resource utilization' },
		{ label: 'Scale-out Latency', value: '< 30s', sublabel: 'Node provisioning' },
		{ label: 'Geo-regions', value: '12', sublabel: 'Availability zones' }
	];

	// Infrastructure comparison data
	const infraComparison = [
		{
			platform: 'NVIDIA DGX SuperPOD',
			maxNodes: 32,
			interconnect: '400Gb InfiniBand',
			utilization: 96,
			multiTenant: true,
			isolation: 'Hardware',
			costPerGpu: 2.85
		},
		{
			platform: 'AMD Instinct MI300X',
			maxNodes: 64,
			interconnect: '400Gb Ethernet',
			utilization: 92,
			multiTenant: true,
			isolation: 'MIG-like',
			costPerGpu: 2.15
		},
		{
			platform: 'Google TPU v5 Pod',
			maxNodes: 256,
			interconnect: 'ICI Custom',
			utilization: 98,
			multiTenant: true,
			isolation: 'Software',
			costPerGpu: 1.95
		},
		{
			platform: 'Intel Gaudi 3 Cluster',
			maxNodes: 128,
			interconnect: '400Gb RoCE',
			utilization: 89,
			multiTenant: false,
			isolation: 'Dedicated',
			costPerGpu: 1.45
		}
	];

	// Workload distribution data
	const workloadTypes = [
		{ type: 'LLM Inference', percentage: 45, color: 'bg-emerald-500' },
		{ type: 'Training', percentage: 25, color: 'bg-blue-500' },
		{ type: 'Fine-tuning', percentage: 18, color: 'bg-purple-500' },
		{ type: 'Batch Processing', percentage: 12, color: 'bg-amber-500' }
	];
</script>

<div class="flex flex-col gap-6 lg:flex-row">
	<!-- Left Column: Infrastructure Overview -->
	<div class="w-full space-y-6 lg:w-1/2">
		<!-- Scalability Metrics -->
		<div
			class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800"
			in:scale={{ duration: 300, delay: 50, start: 0.95, easing: cubicOut }}
		>
			<div
				class="border-b border-slate-200 bg-linear-to-r from-violet-900/90 to-violet-800 px-6 py-4 dark:border-slate-700"
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
								d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
							/>
						</svg>
					</div>
					<div>
						<h2 class="text-lg font-semibold text-white">Infrastructure Scalability</h2>
						<p class="text-xs text-violet-200">Cloud-scale AI deployment metrics</p>
					</div>
				</div>
			</div>

			<div class="grid grid-cols-2 gap-4 p-6 md:grid-cols-4">
				{#each scalabilityMetrics as metric, i (metric.label)}
					<div
						class="text-center"
						in:fly={{ y: 20, duration: 300, delay: 100 + i * 50, easing: cubicOut }}
					>
						<p class="text-2xl font-bold text-violet-600 dark:text-violet-400">{metric.value}</p>
						<p class="text-sm font-medium text-slate-700 dark:text-slate-300">{metric.label}</p>
						<p class="text-xs text-slate-500 dark:text-slate-400">{metric.sublabel}</p>
					</div>
				{/each}
			</div>
		</div>

		<!-- Infrastructure Comparison Table -->
		<div
			class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800"
			in:scale={{ duration: 300, delay: 150, start: 0.95, easing: cubicOut }}
		>
			<div class="border-b border-slate-200 bg-slate-900/80 px-6 py-4 dark:border-slate-700">
				<h3 class="font-semibold text-white">Platform Comparison for CSPs</h3>
				<p class="text-xs text-slate-300">Multi-tenant infrastructure capabilities</p>
			</div>

			<div class="overflow-x-auto">
				<table class="w-full text-sm">
					<thead class="bg-slate-50 dark:bg-slate-800/50">
						<tr>
							<th
								class="px-4 py-3 text-left text-xs font-medium tracking-wider text-slate-500 uppercase dark:text-slate-400"
								>Platform</th
							>
							<th
								class="px-4 py-3 text-center text-xs font-medium tracking-wider text-slate-500 uppercase dark:text-slate-400"
								>Scale</th
							>
							<th
								class="px-4 py-3 text-center text-xs font-medium tracking-wider text-slate-500 uppercase dark:text-slate-400"
								>Utilization</th
							>
							<th
								class="px-4 py-3 text-center text-xs font-medium tracking-wider text-slate-500 uppercase dark:text-slate-400"
								>Multi-tenant</th
							>
							<th
								class="px-4 py-3 text-right text-xs font-medium tracking-wider text-slate-500 uppercase dark:text-slate-400"
								>$/GPU/hr</th
							>
						</tr>
					</thead>
					<tbody class="divide-y divide-slate-100 dark:divide-slate-700">
						{#each infraComparison as item, i (item.platform)}
							<tr
								class="hover:bg-slate-50 dark:hover:bg-slate-800/50"
								in:fly={{ x: -20, duration: 300, delay: 200 + i * 50, easing: cubicOut }}
							>
								<td class="px-4 py-3">
									<p class="font-medium text-slate-800 dark:text-slate-200">{item.platform}</p>
									<p class="text-xs text-slate-500 dark:text-slate-400">{item.interconnect}</p>
								</td>
								<td class="px-4 py-3 text-center">
									<span class="dm-mono font-medium text-slate-700 dark:text-slate-300"
										>{item.maxNodes} nodes</span
									>
								</td>
								<td class="px-4 py-3">
									<div class="flex items-center justify-center gap-2">
										<div class="h-2 w-16 rounded-full bg-slate-200 dark:bg-slate-700">
											<div
												class="h-full rounded-full bg-violet-500"
												style="width: {item.utilization}%"
											></div>
										</div>
										<span class="w-8 text-right text-xs text-slate-700 dark:text-slate-300"
											>{item.utilization}%</span
										>
									</div>
								</td>
								<td class="px-4 py-3 text-center">
									{#if item.multiTenant}
										<span
											class="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300"
										>
											<svg class="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
												<path
													fill-rule="evenodd"
													d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
													clip-rule="evenodd"
												/>
											</svg>
											{item.isolation}
										</span>
									{:else}
										<span
											class="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-400"
										>
											{item.isolation}
										</span>
									{/if}
								</td>
								<td class="px-4 py-3 text-right">
									<span class="dm-mono font-bold text-slate-800 dark:text-slate-200"
										>${item.costPerGpu.toFixed(2)}</span
									>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>

		<!-- Workload Distribution -->
		<div
			class="overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800"
			in:fade={{ duration: 300, delay: 350 }}
		>
			<h3 class="mb-4 font-semibold text-slate-800 dark:text-slate-200">
				Typical Workload Distribution
			</h3>
			<div class="space-y-3">
				{#each workloadTypes as workload (workload.type)}
					<div class="flex items-center gap-3">
						<span class="w-28 text-sm text-slate-600 dark:text-slate-400">{workload.type}</span>
						<div class="h-3 flex-1 rounded-full bg-slate-200 dark:bg-slate-700">
							<div
								class="h-full rounded-full {workload.color}"
								style="width: {workload.percentage}%"
							></div>
						</div>
						<span class="w-10 text-right text-sm font-medium text-slate-700 dark:text-slate-300"
							>{workload.percentage}%</span
						>
					</div>
				{/each}
			</div>
		</div>
	</div>

	<!-- Right Column: Performance Analysis & Cost Optimization -->
	<div class="w-full space-y-6 lg:w-1/2">
		<!-- Performance Chart -->
		<section
			class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800"
			in:scale={{ duration: 300, delay: 100, start: 0.95, easing: cubicOut }}
		>
			<div class="mb-4">
				<h2 class="text-xl font-semibold text-slate-800 dark:text-slate-200">
					Performance at Scale
				</h2>
				<p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
					Throughput and latency metrics for cloud-scale deployments
				</p>
			</div>

			<!-- Axis Selectors -->
			<div class="mb-4 flex flex-wrap gap-4">
				<div class="flex min-w-[180px] flex-col gap-1">
					<label
						for="x-axis-select-neocloud"
						class="dm-mono text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400"
					>
						X-Axis
					</label>
					<select
						id="x-axis-select-neocloud"
						value={selectedXAxis}
						onchange={onXAxisChange}
						class="dm-mono h-9 rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
					>
						{#each axisOptions as option (option.id)}
							<option value={option.id}>{option.label}</option>
						{/each}
					</select>
				</div>

				<div class="flex min-w-[180px] flex-col gap-1">
					<label
						for="y-axis-select-neocloud"
						class="dm-mono text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400"
					>
						Y-Axis
					</label>
					<select
						id="y-axis-select-neocloud"
						value={selectedYAxis}
						onchange={onYAxisChange}
						class="dm-mono h-9 rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
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
								class="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-violet-600 dark:border-slate-700 dark:border-t-violet-500"
							></div>
							<p class="mt-2 text-sm text-slate-500 dark:text-slate-400">Loading data...</p>
						</div>
					</div>
				{:else if systemsData.length > 0 && chartContainerWidth > 0}
					<FlexibleChart
						data={axisChartData}
						color="#8b5cf6"
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

		<!-- Cost Efficiency Cards -->
		<div
			class="grid grid-cols-2 gap-4"
			in:fly={{ y: 20, duration: 300, delay: 250, easing: cubicOut }}
		>
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
								d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
							/>
						</svg>
					</div>
					<div>
						<p class="text-xs text-slate-500 dark:text-slate-400">Best Utilization</p>
						<p class="font-semibold text-slate-800 dark:text-slate-200">Google TPU v5</p>
						<p class="text-xs text-emerald-600 dark:text-emerald-400">98% avg. utilization</p>
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
								d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
					</div>
					<div>
						<p class="text-xs text-slate-500 dark:text-slate-400">Lowest Cost</p>
						<p class="font-semibold text-slate-800 dark:text-slate-200">Intel Gaudi 3</p>
						<p class="text-xs text-blue-600 dark:text-blue-400">$1.45/GPU/hr</p>
					</div>
				</div>
			</div>

			<div
				class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800"
			>
				<div class="flex items-center gap-3">
					<div class="rounded-lg bg-violet-100 p-2 dark:bg-violet-900/30">
						<svg
							class="h-5 w-5 text-violet-600 dark:text-violet-400"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
							/>
						</svg>
					</div>
					<div>
						<p class="text-xs text-slate-500 dark:text-slate-400">Best Isolation</p>
						<p class="font-semibold text-slate-800 dark:text-slate-200">NVIDIA DGX</p>
						<p class="text-xs text-violet-600 dark:text-violet-400">Hardware MIG</p>
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
								d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
					</div>
					<div>
						<p class="text-xs text-slate-500 dark:text-slate-400">Best Scale</p>
						<p class="font-semibold text-slate-800 dark:text-slate-200">TPU v5 Pod</p>
						<p class="text-xs text-amber-600 dark:text-amber-400">256 node clusters</p>
					</div>
				</div>
			</div>
		</div>

		<!-- CSP Insight Card -->
		<div
			class="rounded-xl border border-violet-200 bg-violet-50 p-4 dark:border-violet-900/50 dark:bg-violet-900/20"
			in:fade={{ duration: 300, delay: 400 }}
		>
			<div class="flex gap-3">
				<div class="shrink-0">
					<svg
						class="h-5 w-5 text-violet-600 dark:text-violet-400"
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
					<h4 class="text-sm font-medium text-violet-800 dark:text-violet-300">
						Cloud Provider Insight
					</h4>
					<p class="mt-1 text-sm text-violet-700 dark:text-violet-400">
						Multi-tenant isolation with hardware MIG achieves 23% better noisy-neighbor protection
						vs software isolation, critical for enterprise SLAs. Consider hybrid approaches for
						burst workloads.
					</p>
				</div>
			</div>
		</div>
	</div>
</div>
