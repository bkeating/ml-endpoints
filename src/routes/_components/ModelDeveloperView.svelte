<script>
	/**
	 * ModelDeveloperView - View optimized for model developers (NVIDIA, working group members)
	 * Focus on: System data, Pareto curves, technical benchmarks, hardware configurations
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

	// Sample system configurations data
	const systemConfigs = [
		{
			id: 'sys-001',
			name: 'DGX-H100-8x',
			accelerator: 'H100 SXM5 80GB',
			count: 8,
			interconnect: 'NVLink 4.0',
			memory: '640 GB HBM3',
			ttft: 42,
			throughput: 18500,
			status: 'verified'
		},
		{
			id: 'sys-002',
			name: 'MI300X-8x',
			accelerator: 'MI300X 192GB',
			count: 8,
			interconnect: 'Infinity Fabric',
			memory: '1.5 TB HBM3',
			ttft: 48,
			throughput: 16200,
			status: 'verified'
		},
		{
			id: 'sys-003',
			name: 'Gaudi3-8x',
			accelerator: 'Gaudi 3 96GB',
			count: 8,
			interconnect: 'RoCE v2',
			memory: '768 GB HBM2e',
			ttft: 56,
			throughput: 12800,
			status: 'pending'
		},
		{
			id: 'sys-004',
			name: 'TPU-v5e-pod',
			accelerator: 'TPU v5e',
			count: 256,
			interconnect: 'ICI',
			memory: '16 GB HBM',
			ttft: 38,
			throughput: 24000,
			status: 'verified'
		}
	];

	// Pareto frontier summary metrics
	const paretoMetrics = [
		{ label: 'Systems on Frontier', value: '12', sublabel: 'out of 47 submissions' },
		{ label: 'Best TTFT', value: '38ms', sublabel: 'TPU v5e pod' },
		{ label: 'Best Throughput', value: '24K', sublabel: 'tokens/sec' },
		{ label: 'Avg. Efficiency', value: '89%', sublabel: 'vs theoretical max' }
	];

	// Model compatibility matrix
	const modelCompatibility = [
		{ model: 'Llama 3.1 70B', fp16: true, int8: true, int4: true },
		{ model: 'Llama 3.1 405B', fp16: true, int8: true, int4: false },
		{ model: 'Mixtral 8x22B', fp16: true, int8: true, int4: true },
		{ model: 'GPT-4 Turbo', fp16: true, int8: false, int4: false }
	];
</script>

<div class="flex flex-col gap-6 lg:flex-row">
	<!-- Left Column: System Configurations & Pareto Metrics -->
	<div class="w-full space-y-6 lg:w-1/2">
		<!-- Pareto Frontier Summary -->
		<div
			class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800"
			in:scale={{ duration: 300, delay: 50, start: 0.95, easing: cubicOut }}
		>
			<div
				class="border-b border-slate-200 bg-linear-to-r from-emerald-900/90 to-emerald-800 px-6 py-4 dark:border-slate-700"
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
								d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
							/>
						</svg>
					</div>
					<div>
						<h2 class="text-lg font-semibold text-white">Pareto Frontier Analysis</h2>
						<p class="text-xs text-emerald-200">TTFT vs Throughput optimization</p>
					</div>
				</div>
			</div>

			<div class="grid grid-cols-2 gap-4 p-6 md:grid-cols-4">
				{#each paretoMetrics as metric, i (metric.label)}
					<div
						class="text-center"
						in:fly={{ y: 20, duration: 300, delay: 100 + i * 50, easing: cubicOut }}
					>
						<p class="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{metric.value}</p>
						<p class="text-sm font-medium text-slate-700 dark:text-slate-300">{metric.label}</p>
						<p class="text-xs text-slate-500 dark:text-slate-400">{metric.sublabel}</p>
					</div>
				{/each}
			</div>

			<div
				class="border-t border-slate-200 bg-slate-50 px-6 py-3 dark:border-slate-700 dark:bg-slate-800/50"
			>
				<a
					href="/pareto-charts"
					class="inline-flex items-center gap-2 text-sm font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
				>
					<span>View Full Pareto Analysis</span>
					<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M17 8l4 4m0 0l-4 4m4-4H3"
						/>
					</svg>
				</a>
			</div>
		</div>

		<!-- System Configurations Table -->
		<div
			class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800"
			in:scale={{ duration: 300, delay: 150, start: 0.95, easing: cubicOut }}
		>
			<div class="border-b border-slate-200 bg-slate-900/80 px-6 py-4 dark:border-slate-700">
				<h3 class="font-semibold text-white">System Configurations</h3>
				<p class="text-xs text-slate-300">Hardware setups from latest MLPerf submissions</p>
			</div>

			<div class="overflow-x-auto">
				<table class="w-full text-sm">
					<thead class="bg-slate-50 dark:bg-slate-800/50">
						<tr>
							<th
								class="px-4 py-3 text-left text-xs font-medium tracking-wider text-slate-500 uppercase dark:text-slate-400"
								>System</th
							>
							<th
								class="px-4 py-3 text-center text-xs font-medium tracking-wider text-slate-500 uppercase dark:text-slate-400"
								>Accelerator</th
							>
							<th
								class="px-4 py-3 text-center text-xs font-medium tracking-wider text-slate-500 uppercase dark:text-slate-400"
								>TTFT</th
							>
							<th
								class="px-4 py-3 text-right text-xs font-medium tracking-wider text-slate-500 uppercase dark:text-slate-400"
								>Throughput</th
							>
							<th
								class="px-4 py-3 text-center text-xs font-medium tracking-wider text-slate-500 uppercase dark:text-slate-400"
								>Status</th
							>
						</tr>
					</thead>
					<tbody class="divide-y divide-slate-100 dark:divide-slate-700">
						{#each systemConfigs as config, i (config.id)}
							<tr
								class="hover:bg-slate-50 dark:hover:bg-slate-800/50"
								in:fly={{ x: -20, duration: 300, delay: 200 + i * 50, easing: cubicOut }}
							>
								<td class="px-4 py-3">
									<div>
										<p class="font-medium text-slate-800 dark:text-slate-200">{config.name}</p>
										<p class="text-xs text-slate-500 dark:text-slate-400">
											{config.count}x {config.accelerator}
										</p>
									</div>
								</td>
								<td class="px-4 py-3 text-center">
									<div>
										<p class="text-slate-700 dark:text-slate-300">{config.interconnect}</p>
										<p class="text-xs text-slate-500 dark:text-slate-400">{config.memory}</p>
									</div>
								</td>
								<td class="px-4 py-3 text-center">
									<span class="dm-mono font-medium text-slate-700 dark:text-slate-300"
										>{config.ttft}ms</span
									>
								</td>
								<td class="px-4 py-3 text-right">
									<span class="dm-mono font-medium text-slate-700 dark:text-slate-300"
										>{config.throughput.toLocaleString()}</span
									>
									<span class="text-xs text-slate-500">/s</span>
								</td>
								<td class="px-4 py-3 text-center">
									{#if config.status === 'verified'}
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
											Verified
										</span>
									{:else}
										<span
											class="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/50 dark:text-amber-300"
										>
											<svg class="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
												<path
													fill-rule="evenodd"
													d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
													clip-rule="evenodd"
												/>
											</svg>
											Pending
										</span>
									{/if}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>

		<!-- Model Compatibility Matrix -->
		<div
			class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800"
			in:fade={{ duration: 300, delay: 350 }}
		>
			<div
				class="border-b border-slate-200 bg-slate-900/80 px-4 py-3 dark:border-slate-700"
			>
				<h3 class="font-semibold text-white">Model Precision Support</h3>
			</div>
			<div class="overflow-x-auto">
				<table class="w-full text-sm">
					<thead class="bg-slate-50 dark:bg-slate-800/50">
						<tr>
							<th
								class="px-4 py-2 text-left text-xs font-medium tracking-wider text-slate-500 uppercase dark:text-slate-400"
								>Model</th
							>
							<th
								class="px-4 py-2 text-center text-xs font-medium tracking-wider text-slate-500 uppercase dark:text-slate-400"
								>FP16</th
							>
							<th
								class="px-4 py-2 text-center text-xs font-medium tracking-wider text-slate-500 uppercase dark:text-slate-400"
								>INT8</th
							>
							<th
								class="px-4 py-2 text-center text-xs font-medium tracking-wider text-slate-500 uppercase dark:text-slate-400"
								>INT4</th
							>
						</tr>
					</thead>
					<tbody class="divide-y divide-slate-100 dark:divide-slate-700">
						{#each modelCompatibility as model (model.model)}
							<tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50">
								<td class="px-4 py-2 font-medium text-slate-700 dark:text-slate-300">{model.model}</td>
								<td class="px-4 py-2 text-center">
									{#if model.fp16}
										<svg class="mx-auto h-5 w-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
											<path
												fill-rule="evenodd"
												d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
												clip-rule="evenodd"
											/>
										</svg>
									{:else}
										<svg class="mx-auto h-5 w-5 text-slate-300 dark:text-slate-600" fill="currentColor" viewBox="0 0 20 20">
											<path
												fill-rule="evenodd"
												d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
												clip-rule="evenodd"
											/>
										</svg>
									{/if}
								</td>
								<td class="px-4 py-2 text-center">
									{#if model.int8}
										<svg class="mx-auto h-5 w-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
											<path
												fill-rule="evenodd"
												d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
												clip-rule="evenodd"
											/>
										</svg>
									{:else}
										<svg class="mx-auto h-5 w-5 text-slate-300 dark:text-slate-600" fill="currentColor" viewBox="0 0 20 20">
											<path
												fill-rule="evenodd"
												d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
												clip-rule="evenodd"
											/>
										</svg>
									{/if}
								</td>
								<td class="px-4 py-2 text-center">
									{#if model.int4}
										<svg class="mx-auto h-5 w-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
											<path
												fill-rule="evenodd"
												d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
												clip-rule="evenodd"
											/>
										</svg>
									{:else}
										<svg class="mx-auto h-5 w-5 text-slate-300 dark:text-slate-600" fill="currentColor" viewBox="0 0 20 20">
											<path
												fill-rule="evenodd"
												d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
												clip-rule="evenodd"
											/>
										</svg>
									{/if}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	</div>

	<!-- Right Column: Performance Chart & Quick Actions -->
	<div class="w-full space-y-6 lg:w-1/2">
		<!-- Performance Chart Section -->
		<section
			class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800"
			in:scale={{ duration: 300, delay: 100, start: 0.95, easing: cubicOut }}
		>
			<div class="mb-4">
				<h2 class="text-xl font-semibold text-slate-800 dark:text-slate-200">
					System Performance Analysis
				</h2>
				<p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
					Explore TTFT, throughput, and interactivity metrics across system configurations
				</p>
			</div>

			<!-- Axis Selectors -->
			<div class="mb-4 flex flex-wrap gap-4">
				<div class="flex min-w-[180px] flex-col gap-1">
					<label
						for="x-axis-select-dev"
						class="dm-mono text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400"
					>
						X-Axis
					</label>
					<select
						id="x-axis-select-dev"
						value={selectedXAxis}
						onchange={onXAxisChange}
						class="dm-mono h-9 rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
					>
						{#each axisOptions as option (option.id)}
							<option value={option.id}>{option.label}</option>
						{/each}
					</select>
				</div>

				<div class="flex min-w-[180px] flex-col gap-1">
					<label
						for="y-axis-select-dev"
						class="dm-mono text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400"
					>
						Y-Axis
					</label>
					<select
						id="y-axis-select-dev"
						value={selectedYAxis}
						onchange={onYAxisChange}
						class="dm-mono h-9 rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
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
								class="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600 dark:border-slate-700 dark:border-t-emerald-500"
							></div>
							<p class="mt-2 text-sm text-slate-500 dark:text-slate-400">Loading data...</p>
						</div>
					</div>
				{:else if systemsData.length > 0 && chartContainerWidth > 0}
					<FlexibleChart
						data={axisChartData}
						color="#10b981"
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

		<!-- Quick Actions for Developers -->
		<div
			class="grid grid-cols-2 gap-4"
			in:fly={{ y: 20, duration: 300, delay: 250, easing: cubicOut }}
		>
			<a
				href="/pareto-charts"
				class="group rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-emerald-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:hover:border-emerald-600"
			>
				<div class="flex items-center gap-3">
					<div
						class="rounded-lg bg-emerald-100 p-2 transition-colors group-hover:bg-emerald-200 dark:bg-emerald-900/30 dark:group-hover:bg-emerald-900/50"
					>
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
								d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
							/>
						</svg>
					</div>
					<div>
						<p class="font-semibold text-slate-800 dark:text-slate-200">Pareto Curves</p>
						<p class="text-xs text-slate-500 dark:text-slate-400">View optimization frontier</p>
					</div>
				</div>
			</a>

			<a
				href="/systems"
				class="group rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-blue-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:hover:border-blue-600"
			>
				<div class="flex items-center gap-3">
					<div
						class="rounded-lg bg-blue-100 p-2 transition-colors group-hover:bg-blue-200 dark:bg-blue-900/30 dark:group-hover:bg-blue-900/50"
					>
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
								d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
							/>
						</svg>
					</div>
					<div>
						<p class="font-semibold text-slate-800 dark:text-slate-200">All Systems</p>
						<p class="text-xs text-slate-500 dark:text-slate-400">Browse configurations</p>
					</div>
				</div>
			</a>

			<a
				href="/submissions"
				class="group rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-purple-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:hover:border-purple-600"
			>
				<div class="flex items-center gap-3">
					<div
						class="rounded-lg bg-purple-100 p-2 transition-colors group-hover:bg-purple-200 dark:bg-purple-900/30 dark:group-hover:bg-purple-900/50"
					>
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
								d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
							/>
						</svg>
					</div>
					<div>
						<p class="font-semibold text-slate-800 dark:text-slate-200">Submissions</p>
						<p class="text-xs text-slate-500 dark:text-slate-400">View all benchmarks</p>
					</div>
				</div>
			</a>

			<a
				href="/docs/api"
				class="group rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-amber-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:hover:border-amber-600"
			>
				<div class="flex items-center gap-3">
					<div
						class="rounded-lg bg-amber-100 p-2 transition-colors group-hover:bg-amber-200 dark:bg-amber-900/30 dark:group-hover:bg-amber-900/50"
					>
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
								d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
							/>
						</svg>
					</div>
					<div>
						<p class="font-semibold text-slate-800 dark:text-slate-200">API Access</p>
						<p class="text-xs text-slate-500 dark:text-slate-400">Query benchmark data</p>
					</div>
				</div>
			</a>
		</div>

		<!-- Developer Tips Card -->
		<div
			class="rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900/50 dark:bg-emerald-900/20"
			in:fade={{ duration: 300, delay: 400 }}
		>
			<div class="flex gap-3">
				<div class="shrink-0">
					<svg
						class="h-5 w-5 text-emerald-600 dark:text-emerald-400"
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
					<h4 class="text-sm font-medium text-emerald-800 dark:text-emerald-300">
						Working Group Tip
					</h4>
					<p class="mt-1 text-sm text-emerald-700 dark:text-emerald-400">
						Systems on the Pareto frontier represent optimal trade-offs between TTFT and throughput.
						Use INT8 quantization for 1.8x throughput with minimal accuracy loss on Llama 3.1 70B.
					</p>
				</div>
			</div>
		</div>
	</div>
</div>
