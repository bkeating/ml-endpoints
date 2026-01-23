<script>
	/**
	 * InfraEngineerView - View optimized for Infrastructure Engineers
	 * Focus on: Deployment configurations, performance tuning, resource utilization, monitoring
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

	// System resource metrics
	const resourceMetrics = [
		{ label: 'GPU Memory', value: '94%', sublabel: 'Peak utilization', status: 'warning' },
		{ label: 'CPU Overhead', value: '12%', sublabel: 'Host processing', status: 'good' },
		{ label: 'Network I/O', value: '340Gb/s', sublabel: 'Inter-node', status: 'good' },
		{ label: 'Power Draw', value: '6.8kW', sublabel: 'Per node avg', status: 'normal' }
	];

	// Deployment configurations
	const deployConfigs = [
		{
			name: 'vLLM + TensorRT-LLM',
			framework: 'vLLM 0.4.x',
			quantization: 'INT8 AWQ',
			batchSize: 'Dynamic (1-64)',
			concurrency: 128,
			ttft: 38,
			throughput: 18500,
			memEfficiency: 94
		},
		{
			name: 'TGI + FlashAttention',
			framework: 'TGI 2.0',
			quantization: 'FP16',
			batchSize: 'Continuous',
			concurrency: 96,
			ttft: 45,
			throughput: 15200,
			memEfficiency: 88
		},
		{
			name: 'Triton + FasterTransformer',
			framework: 'Triton 24.01',
			quantization: 'INT4 GPTQ',
			batchSize: 'Static (32)',
			concurrency: 64,
			ttft: 52,
			throughput: 21000,
			memEfficiency: 91
		},
		{
			name: 'SGLang + PagedAttention',
			framework: 'SGLang 0.2',
			quantization: 'FP8',
			batchSize: 'Dynamic (1-128)',
			concurrency: 256,
			ttft: 42,
			throughput: 19800,
			memEfficiency: 96
		}
	];

	// Optimization recommendations
	const optimizations = [
		{
			category: 'Memory',
			title: 'KV-Cache Optimization',
			impact: 'High',
			desc: 'PagedAttention reduces memory fragmentation by 45%'
		},
		{
			category: 'Compute',
			title: 'FlashAttention v2',
			impact: 'High',
			desc: '2.3x faster attention with 5-20x memory savings'
		},
		{
			category: 'Network',
			title: 'Tensor Parallelism',
			impact: 'Medium',
			desc: 'Optimal TP=4 for Llama 70B on 8xH100'
		},
		{
			category: 'Batching',
			title: 'Continuous Batching',
			impact: 'High',
			desc: '1.8x throughput vs static batching'
		}
	];
</script>

<div class="flex flex-col gap-6 lg:flex-row">
	<!-- Left Column: Resource Monitoring & Configs -->
	<div class="w-full space-y-6 lg:w-1/2">
		<!-- Resource Metrics Dashboard -->
		<div
			class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800"
			in:scale={{ duration: 300, delay: 50, start: 0.95, easing: cubicOut }}
		>
			<div
				class="border-b border-slate-200 bg-linear-to-r from-cyan-900/90 to-cyan-800 px-6 py-4 dark:border-slate-700"
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
						<h2 class="text-lg font-semibold text-white">Resource Utilization</h2>
						<p class="text-xs text-cyan-200">Real-time system metrics</p>
					</div>
				</div>
			</div>

			<div class="grid grid-cols-2 gap-4 p-6 md:grid-cols-4">
				{#each resourceMetrics as metric, i (metric.label)}
					<div
						class="rounded-lg bg-slate-50 p-4 dark:bg-slate-900/50"
						in:fly={{ y: 20, duration: 300, delay: 100 + i * 50, easing: cubicOut }}
					>
						<div class="mb-2 flex items-center justify-between">
							<span class="text-xs font-medium text-slate-500 dark:text-slate-400"
								>{metric.label}</span
							>
							<span
								class="h-2 w-2 rounded-full {metric.status === 'good'
									? 'bg-emerald-500'
									: metric.status === 'warning'
										? 'bg-amber-500'
										: 'bg-slate-400'}"
							></span>
						</div>
						<p class="dm-mono text-2xl font-bold text-slate-800 dark:text-slate-100">
							{metric.value}
						</p>
						<p class="text-xs text-slate-500 dark:text-slate-400">{metric.sublabel}</p>
					</div>
				{/each}
			</div>
		</div>

		<!-- Deployment Configurations Table -->
		<div
			class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800"
			in:scale={{ duration: 300, delay: 150, start: 0.95, easing: cubicOut }}
		>
			<div class="border-b border-slate-200 bg-slate-900/80 px-6 py-4 dark:border-slate-700">
				<h3 class="font-semibold text-white">Deployment Stack Comparison</h3>
				<p class="text-xs text-slate-300">Llama 3.1 70B on 8xH100 configurations</p>
			</div>

			<div class="overflow-x-auto">
				<table class="w-full text-sm">
					<thead class="bg-slate-50 dark:bg-slate-800/50">
						<tr>
							<th
								class="px-4 py-3 text-left text-xs font-medium tracking-wider text-slate-500 uppercase dark:text-slate-400"
								>Stack</th
							>
							<th
								class="px-4 py-3 text-center text-xs font-medium tracking-wider text-slate-500 uppercase dark:text-slate-400"
								>TTFT</th
							>
							<th
								class="px-4 py-3 text-center text-xs font-medium tracking-wider text-slate-500 uppercase dark:text-slate-400"
								>Throughput</th
							>
							<th
								class="px-4 py-3 text-center text-xs font-medium tracking-wider text-slate-500 uppercase dark:text-slate-400"
								>Mem Eff.</th
							>
						</tr>
					</thead>
					<tbody class="divide-y divide-slate-100 dark:divide-slate-700">
						{#each deployConfigs as config, i (config.name)}
							<tr
								class="hover:bg-slate-50 dark:hover:bg-slate-800/50"
								in:fly={{ x: -20, duration: 300, delay: 200 + i * 50, easing: cubicOut }}
							>
								<td class="px-4 py-3">
									<p class="font-medium text-slate-800 dark:text-slate-200">{config.name}</p>
									<p class="text-xs text-slate-500 dark:text-slate-400">
										{config.framework} · {config.quantization}
									</p>
								</td>
								<td class="px-4 py-3 text-center">
									<span class="dm-mono font-medium text-slate-700 dark:text-slate-300"
										>{config.ttft}ms</span
									>
								</td>
								<td class="px-4 py-3 text-center">
									<span class="dm-mono font-medium text-slate-700 dark:text-slate-300"
										>{config.throughput.toLocaleString()}/s</span
									>
								</td>
								<td class="px-4 py-3 text-center">
									<div class="flex items-center justify-center gap-2">
										<div class="h-2 w-12 rounded-full bg-slate-200 dark:bg-slate-700">
											<div
												class="h-full rounded-full {config.memEfficiency >= 95
													? 'bg-emerald-500'
													: config.memEfficiency >= 90
														? 'bg-cyan-500'
														: 'bg-amber-500'}"
												style="width: {config.memEfficiency}%"
											></div>
										</div>
										<span class="text-xs text-slate-600 dark:text-slate-400"
											>{config.memEfficiency}%</span
										>
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>

		<!-- Optimization Recommendations -->
		<div
			class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800"
			in:fade={{ duration: 300, delay: 350 }}
		>
			<div class="border-b border-slate-200 bg-slate-900/80 px-4 py-3 dark:border-slate-700">
				<h3 class="font-semibold text-white">Optimization Opportunities</h3>
			</div>
			<div class="divide-y divide-slate-100 dark:divide-slate-700">
				{#each optimizations as opt (opt.title)}
					<div class="flex items-start gap-3 px-4 py-3">
						<span
							class="mt-0.5 inline-flex items-center rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300"
						>
							{opt.category}
						</span>
						<div class="flex-1">
							<div class="flex items-center gap-2">
								<p class="font-medium text-slate-800 dark:text-slate-200">{opt.title}</p>
								<span
									class="inline-flex items-center rounded-full px-1.5 py-0.5 text-xs font-medium {opt.impact ===
									'High'
										? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'
										: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'}"
								>
									{opt.impact}
								</span>
							</div>
							<p class="text-xs text-slate-500 dark:text-slate-400">{opt.desc}</p>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>

	<!-- Right Column: Performance Chart & Quick Commands -->
	<div class="w-full space-y-6 lg:w-1/2">
		<!-- Performance Analysis Chart -->
		<section
			class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800"
			in:scale={{ duration: 300, delay: 100, start: 0.95, easing: cubicOut }}
		>
			<div class="mb-4">
				<h2 class="text-xl font-semibold text-slate-800 dark:text-slate-200">
					Performance Profiling
				</h2>
				<p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
					Analyze latency vs throughput trade-offs across configurations
				</p>
			</div>

			<!-- Axis Selectors -->
			<div class="mb-4 flex flex-wrap gap-4">
				<div class="flex min-w-[180px] flex-col gap-1">
					<label
						for="x-axis-select-infra"
						class="dm-mono text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400"
					>
						X-Axis
					</label>
					<select
						id="x-axis-select-infra"
						value={selectedXAxis}
						onchange={onXAxisChange}
						class="dm-mono h-9 rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
					>
						{#each axisOptions as option (option.id)}
							<option value={option.id}>{option.label}</option>
						{/each}
					</select>
				</div>

				<div class="flex min-w-[180px] flex-col gap-1">
					<label
						for="y-axis-select-infra"
						class="dm-mono text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400"
					>
						Y-Axis
					</label>
					<select
						id="y-axis-select-infra"
						value={selectedYAxis}
						onchange={onYAxisChange}
						class="dm-mono h-9 rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
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
								class="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-cyan-600 dark:border-slate-700 dark:border-t-cyan-500"
							></div>
							<p class="mt-2 text-sm text-slate-500 dark:text-slate-400">Loading data...</p>
						</div>
					</div>
				{:else if systemsData.length > 0 && chartContainerWidth > 0}
					<FlexibleChart
						data={axisChartData}
						color="#06b6d4"
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

		<!-- Quick Reference Cards -->
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
								d="M13 10V3L4 14h7v7l9-11h-7z"
							/>
						</svg>
					</div>
					<div>
						<p class="text-xs text-slate-500 dark:text-slate-400">Best Throughput</p>
						<p class="font-semibold text-slate-800 dark:text-slate-200">Triton + FT</p>
						<p class="dm-mono text-xs text-emerald-600 dark:text-emerald-400">21K tok/s</p>
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
								d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
					</div>
					<div>
						<p class="text-xs text-slate-500 dark:text-slate-400">Lowest Latency</p>
						<p class="font-semibold text-slate-800 dark:text-slate-200">vLLM + TRT</p>
						<p class="dm-mono text-xs text-blue-600 dark:text-blue-400">38ms TTFT</p>
					</div>
				</div>
			</div>

			<div
				class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800"
			>
				<div class="flex items-center gap-3">
					<div class="rounded-lg bg-cyan-100 p-2 dark:bg-cyan-900/30">
						<svg
							class="h-5 w-5 text-cyan-600 dark:text-cyan-400"
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
						<p class="text-xs text-slate-500 dark:text-slate-400">Best Memory</p>
						<p class="font-semibold text-slate-800 dark:text-slate-200">SGLang</p>
						<p class="dm-mono text-xs text-cyan-600 dark:text-cyan-400">96% efficient</p>
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
								d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
							/>
						</svg>
					</div>
					<div>
						<p class="text-xs text-slate-500 dark:text-slate-400">Max Concurrency</p>
						<p class="font-semibold text-slate-800 dark:text-slate-200">SGLang</p>
						<p class="dm-mono text-xs text-amber-600 dark:text-amber-400">256 requests</p>
					</div>
				</div>
			</div>
		</div>

		<!-- Infra Engineer Tip -->
		<div
			class="rounded-xl border border-cyan-200 bg-cyan-50 p-4 dark:border-cyan-900/50 dark:bg-cyan-900/20"
			in:fade={{ duration: 300, delay: 400 }}
		>
			<div class="flex gap-3">
				<div class="shrink-0">
					<svg
						class="h-5 w-5 text-cyan-600 dark:text-cyan-400"
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
					<h4 class="text-sm font-medium text-cyan-800 dark:text-cyan-300">Tuning Tip</h4>
					<p class="mt-1 text-sm text-cyan-700 dark:text-cyan-400">
						For Llama 70B on 8xH100: Use TP=4 with PP=2 for optimal memory bandwidth. INT8 AWQ
						quantization provides 1.6x throughput with &lt;1% accuracy loss on most benchmarks.
					</p>
				</div>
			</div>
		</div>
	</div>
</div>
