<script>
	/**
	 * BaaSUserView - View optimized for Backend-as-a-Service Users
	 * Focus on: API pricing, model availability, rate limits, latency SLAs
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

	// API service overview
	const serviceMetrics = [
		{ label: 'Avg. Latency', value: '45ms', sublabel: 'P95 response time' },
		{ label: 'Uptime SLA', value: '99.95%', sublabel: 'Monthly guarantee' },
		{ label: 'Rate Limit', value: '10K', sublabel: 'Requests/minute' },
		{ label: 'Avg. Cost', value: '$0.002', sublabel: 'Per 1K tokens' }
	];

	// API provider comparison
	const apiProviders = [
		{
			provider: 'OpenAI',
			model: 'GPT-4 Turbo',
			inputCost: 0.01,
			outputCost: 0.03,
			latency: 52,
			rateLimit: '10K RPM',
			context: '128K',
			uptime: '99.9%'
		},
		{
			provider: 'Anthropic',
			model: 'Claude 3 Opus',
			inputCost: 0.015,
			outputCost: 0.075,
			latency: 48,
			rateLimit: '4K RPM',
			context: '200K',
			uptime: '99.9%'
		},
		{
			provider: 'Google',
			model: 'Gemini 1.5 Pro',
			inputCost: 0.00125,
			outputCost: 0.005,
			latency: 38,
			rateLimit: '60 RPM',
			context: '1M',
			uptime: '99.95%'
		},
		{
			provider: 'Together AI',
			model: 'Llama 3.1 70B',
			inputCost: 0.0009,
			outputCost: 0.0009,
			latency: 45,
			rateLimit: '100 RPM',
			context: '128K',
			uptime: '99.5%'
		},
		{
			provider: 'Groq',
			model: 'Llama 3.1 70B',
			inputCost: 0.00059,
			outputCost: 0.00079,
			latency: 28,
			rateLimit: '30 RPM',
			context: '128K',
			uptime: '99.0%'
		}
	];

	// Use case cost estimates
	const useCaseCosts = [
		{ useCase: 'Chatbot (1M msgs/mo)', low: '$250', mid: '$800', high: '$2,400' },
		{ useCase: 'RAG Pipeline (100K queries)', low: '$45', mid: '$180', high: '$450' },
		{ useCase: 'Code Assistant (10K sessions)', low: '$120', mid: '$400', high: '$1,200' },
		{ useCase: 'Content Generation (50K articles)', low: '$500', mid: '$1,500', high: '$4,500' }
	];
</script>

<div class="flex flex-col gap-6 lg:flex-row">
	<!-- Left Column: API Pricing & Comparison -->
	<div class="w-full space-y-6 lg:w-1/2">
		<!-- Service Overview -->
		<div
			class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800"
			in:scale={{ duration: 300, delay: 50, start: 0.95, easing: cubicOut }}
		>
			<div
				class="border-b border-slate-200 bg-linear-to-r from-teal-900/90 to-teal-800 px-6 py-4 dark:border-slate-700"
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
								d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
							/>
						</svg>
					</div>
					<div>
						<h2 class="text-lg font-semibold text-white">API Service Overview</h2>
						<p class="text-xs text-teal-200">LLM Inference API Comparison</p>
					</div>
				</div>
			</div>

			<div class="grid grid-cols-2 gap-4 p-6 md:grid-cols-4">
				{#each serviceMetrics as metric, i (metric.label)}
					<div
						class="text-center"
						in:fly={{ y: 20, duration: 300, delay: 100 + i * 50, easing: cubicOut }}
					>
						<p class="text-2xl font-bold text-teal-600 dark:text-teal-400">{metric.value}</p>
						<p class="text-sm font-medium text-slate-700 dark:text-slate-300">{metric.label}</p>
						<p class="text-xs text-slate-500 dark:text-slate-400">{metric.sublabel}</p>
					</div>
				{/each}
			</div>
		</div>

		<!-- API Provider Comparison Table -->
		<div
			class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800"
			in:scale={{ duration: 300, delay: 150, start: 0.95, easing: cubicOut }}
		>
			<div class="border-b border-slate-200 bg-slate-900/80 px-6 py-4 dark:border-slate-700">
				<h3 class="font-semibold text-white">API Provider Pricing</h3>
				<p class="text-xs text-slate-300">Per 1K tokens (as of Q4 2025)</p>
			</div>

			<div class="overflow-x-auto">
				<table class="w-full text-sm">
					<thead class="bg-slate-50 dark:bg-slate-800/50">
						<tr>
							<th
								class="px-4 py-3 text-left text-xs font-medium tracking-wider text-slate-500 uppercase dark:text-slate-400"
								>Provider</th
							>
							<th
								class="px-4 py-3 text-right text-xs font-medium tracking-wider text-slate-500 uppercase dark:text-slate-400"
								>Input</th
							>
							<th
								class="px-4 py-3 text-right text-xs font-medium tracking-wider text-slate-500 uppercase dark:text-slate-400"
								>Output</th
							>
							<th
								class="px-4 py-3 text-center text-xs font-medium tracking-wider text-slate-500 uppercase dark:text-slate-400"
								>Latency</th
							>
							<th
								class="px-4 py-3 text-center text-xs font-medium tracking-wider text-slate-500 uppercase dark:text-slate-400"
								>Context</th
							>
						</tr>
					</thead>
					<tbody class="divide-y divide-slate-100 dark:divide-slate-700">
						{#each apiProviders as api, i (api.provider + api.model)}
							<tr
								class="hover:bg-slate-50 dark:hover:bg-slate-800/50"
								in:fly={{ x: -20, duration: 300, delay: 200 + i * 50, easing: cubicOut }}
							>
								<td class="px-4 py-3">
									<p class="font-medium text-slate-800 dark:text-slate-200">{api.provider}</p>
									<p class="text-xs text-slate-500 dark:text-slate-400">{api.model}</p>
								</td>
								<td class="px-4 py-3 text-right">
									<span class="dm-mono font-medium text-slate-700 dark:text-slate-300"
										>${api.inputCost.toFixed(4)}</span
									>
								</td>
								<td class="px-4 py-3 text-right">
									<span class="dm-mono font-medium text-slate-700 dark:text-slate-300"
										>${api.outputCost.toFixed(4)}</span
									>
								</td>
								<td class="px-4 py-3 text-center">
									<span
										class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium {api.latency <=
										40
											? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'
											: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'}"
									>
										{api.latency}ms
									</span>
								</td>
								<td class="px-4 py-3 text-center">
									<span class="text-slate-700 dark:text-slate-300">{api.context}</span>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>

		<!-- Use Case Cost Estimates -->
		<div
			class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800"
			in:fade={{ duration: 300, delay: 350 }}
		>
			<div class="border-b border-slate-200 bg-slate-900/80 px-4 py-3 dark:border-slate-700">
				<h3 class="font-semibold text-white">Monthly Cost Estimates</h3>
			</div>
			<div class="overflow-x-auto">
				<table class="w-full text-sm">
					<thead class="bg-slate-50 dark:bg-slate-800/50">
						<tr>
							<th
								class="px-4 py-2 text-left text-xs font-medium tracking-wider text-slate-500 uppercase dark:text-slate-400"
								>Use Case</th
							>
							<th
								class="px-4 py-2 text-right text-xs font-medium tracking-wider text-emerald-600 uppercase dark:text-emerald-400"
								>Low</th
							>
							<th
								class="px-4 py-2 text-right text-xs font-medium tracking-wider text-amber-600 uppercase dark:text-amber-400"
								>Mid</th
							>
							<th
								class="px-4 py-2 text-right text-xs font-medium tracking-wider text-rose-600 uppercase dark:text-rose-400"
								>High</th
							>
						</tr>
					</thead>
					<tbody class="divide-y divide-slate-100 dark:divide-slate-700">
						{#each useCaseCosts as cost (cost.useCase)}
							<tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50">
								<td class="px-4 py-2 text-sm text-slate-700 dark:text-slate-300">{cost.useCase}</td>
								<td class="px-4 py-2 text-right font-medium text-emerald-600 dark:text-emerald-400"
									>{cost.low}</td
								>
								<td class="px-4 py-2 text-right font-medium text-amber-600 dark:text-amber-400"
									>{cost.mid}</td
								>
								<td class="px-4 py-2 text-right font-medium text-rose-600 dark:text-rose-400"
									>{cost.high}</td
								>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
			<div class="border-t border-slate-100 bg-slate-50 px-4 py-2 dark:border-slate-700 dark:bg-slate-800/50">
				<p class="text-xs text-slate-500 dark:text-slate-400">
					Low = budget providers, Mid = mainstream, High = premium providers
				</p>
			</div>
		</div>
	</div>

	<!-- Right Column: Performance Analysis & Recommendations -->
	<div class="w-full space-y-6 lg:w-1/2">
		<!-- Performance Comparison Chart -->
		<section
			class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800"
			in:scale={{ duration: 300, delay: 100, start: 0.95, easing: cubicOut }}
		>
			<div class="mb-4">
				<h2 class="text-xl font-semibold text-slate-800 dark:text-slate-200">
					Performance vs Cost
				</h2>
				<p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
					Compare API performance metrics to find the best value for your use case
				</p>
			</div>

			<!-- Axis Selectors -->
			<div class="mb-4 flex flex-wrap gap-4">
				<div class="flex min-w-[180px] flex-col gap-1">
					<label
						for="x-axis-select-baas"
						class="dm-mono text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400"
					>
						X-Axis
					</label>
					<select
						id="x-axis-select-baas"
						value={selectedXAxis}
						onchange={onXAxisChange}
						class="dm-mono h-9 rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
					>
						{#each axisOptions as option (option.id)}
							<option value={option.id}>{option.label}</option>
						{/each}
					</select>
				</div>

				<div class="flex min-w-[180px] flex-col gap-1">
					<label
						for="y-axis-select-baas"
						class="dm-mono text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400"
					>
						Y-Axis
					</label>
					<select
						id="y-axis-select-baas"
						value={selectedYAxis}
						onchange={onYAxisChange}
						class="dm-mono h-9 rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
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
								class="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-teal-600 dark:border-slate-700 dark:border-t-teal-500"
							></div>
							<p class="mt-2 text-sm text-slate-500 dark:text-slate-400">Loading data...</p>
						</div>
					</div>
				{:else if systemsData.length > 0 && chartContainerWidth > 0}
					<FlexibleChart
						data={axisChartData}
						color="#14b8a6"
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

		<!-- Provider Recommendations -->
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
								d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
					</div>
					<div>
						<p class="text-xs text-slate-500 dark:text-slate-400">Best Value</p>
						<p class="font-semibold text-slate-800 dark:text-slate-200">Groq</p>
						<p class="text-xs text-emerald-600 dark:text-emerald-400">$0.0006/1K tokens</p>
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
						<p class="text-xs text-slate-500 dark:text-slate-400">Fastest</p>
						<p class="font-semibold text-slate-800 dark:text-slate-200">Groq</p>
						<p class="text-xs text-blue-600 dark:text-blue-400">28ms latency</p>
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
								d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
							/>
						</svg>
					</div>
					<div>
						<p class="text-xs text-slate-500 dark:text-slate-400">Largest Context</p>
						<p class="font-semibold text-slate-800 dark:text-slate-200">Gemini 1.5 Pro</p>
						<p class="text-xs text-purple-600 dark:text-purple-400">1M tokens</p>
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
								d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
							/>
						</svg>
					</div>
					<div>
						<p class="text-xs text-slate-500 dark:text-slate-400">Best Uptime</p>
						<p class="font-semibold text-slate-800 dark:text-slate-200">Google Cloud</p>
						<p class="text-xs text-amber-600 dark:text-amber-400">99.95% SLA</p>
					</div>
				</div>
			</div>
		</div>

		<!-- BaaS User Tip -->
		<div
			class="rounded-xl border border-teal-200 bg-teal-50 p-4 dark:border-teal-900/50 dark:bg-teal-900/20"
			in:fade={{ duration: 300, delay: 400 }}
		>
			<div class="flex gap-3">
				<div class="shrink-0">
					<svg
						class="h-5 w-5 text-teal-600 dark:text-teal-400"
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
					<h4 class="text-sm font-medium text-teal-800 dark:text-teal-300">Developer Tip</h4>
					<p class="mt-1 text-sm text-teal-700 dark:text-teal-400">
						For cost optimization, use a multi-provider strategy: route simple queries to budget
						providers (Groq, Together AI) and complex reasoning to premium models (GPT-4, Claude 3).
						This can reduce costs by 40-60%.
					</p>
				</div>
			</div>
		</div>
	</div>
</div>
