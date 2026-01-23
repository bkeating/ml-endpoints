<script>
	/**
	 * ITBuyerView - View optimized for IT Buyers / Procurement
	 * Focus on: Vendor comparisons, support quality, warranty terms, procurement simplicity
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

	// Procurement overview metrics
	const procurementMetrics = [
		{ label: 'Avg. Lead Time', value: '6-8 wks', sublabel: 'Standard orders' },
		{ label: 'Volume Discount', value: 'Up to 25%', sublabel: 'Enterprise tier' },
		{ label: 'Warranty Period', value: '3-5 yrs', sublabel: 'Standard coverage' },
		{ label: 'Support Options', value: '24/7', sublabel: 'Premium available' }
	];

	// Vendor comparison data
	const vendorComparison = [
		{
			vendor: 'NVIDIA',
			product: 'DGX H100',
			listPrice: '$245,000',
			warranty: '3 years',
			support: '24/7 Premium',
			leadTime: '8-12 weeks',
			rating: 4.8,
			financing: true
		},
		{
			vendor: 'AMD',
			product: 'Instinct MI300X',
			listPrice: '$185,000',
			warranty: '3 years',
			support: 'Business hours',
			leadTime: '6-8 weeks',
			rating: 4.5,
			financing: true
		},
		{
			vendor: 'Intel',
			product: 'Gaudi 3 Server',
			listPrice: '$125,000',
			warranty: '3 years',
			support: '24/7 Standard',
			leadTime: '4-6 weeks',
			rating: 4.2,
			financing: true
		},
		{
			vendor: 'Dell',
			product: 'PowerEdge XE9680',
			listPrice: '$285,000',
			warranty: '5 years',
			support: '24/7 ProSupport',
			leadTime: '6-10 weeks',
			rating: 4.7,
			financing: true
		}
	];

	// Support tier comparison
	const supportTiers = [
		{ tier: 'Basic', response: '< 24hr', coverage: 'Business hours', training: 'Online', price: 'Included' },
		{ tier: 'Standard', response: '< 8hr', coverage: '24/5', training: 'Virtual', price: '+10%' },
		{ tier: 'Premium', response: '< 4hr', coverage: '24/7', training: 'On-site', price: '+20%' },
		{ tier: 'Elite', response: '< 1hr', coverage: '24/7 + TAM', training: 'Dedicated', price: '+35%' }
	];
</script>

<div class="flex flex-col gap-6 lg:flex-row">
	<!-- Left Column: Vendor Comparison -->
	<div class="w-full space-y-6 lg:w-1/2">
		<!-- Procurement Overview -->
		<div
			class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800"
			in:scale={{ duration: 300, delay: 50, start: 0.95, easing: cubicOut }}
		>
			<div
				class="border-b border-slate-200 bg-linear-to-r from-orange-900/90 to-orange-800 px-6 py-4 dark:border-slate-700"
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
								d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
							/>
						</svg>
					</div>
					<div>
						<h2 class="text-lg font-semibold text-white">Procurement Overview</h2>
						<p class="text-xs text-orange-200">AI Infrastructure Purchase Guide</p>
					</div>
				</div>
			</div>

			<div class="grid grid-cols-2 gap-4 p-6 md:grid-cols-4">
				{#each procurementMetrics as metric, i (metric.label)}
					<div
						class="text-center"
						in:fly={{ y: 20, duration: 300, delay: 100 + i * 50, easing: cubicOut }}
					>
						<p class="text-xl font-bold text-orange-600 dark:text-orange-400">{metric.value}</p>
						<p class="text-sm font-medium text-slate-700 dark:text-slate-300">{metric.label}</p>
						<p class="text-xs text-slate-500 dark:text-slate-400">{metric.sublabel}</p>
					</div>
				{/each}
			</div>
		</div>

		<!-- Vendor Comparison Table -->
		<div
			class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800"
			in:scale={{ duration: 300, delay: 150, start: 0.95, easing: cubicOut }}
		>
			<div class="border-b border-slate-200 bg-slate-900/80 px-6 py-4 dark:border-slate-700">
				<h3 class="font-semibold text-white">Vendor & Product Comparison</h3>
				<p class="text-xs text-slate-300">Enterprise AI server pricing (as of Q4 2025)</p>
			</div>

			<div class="overflow-x-auto">
				<table class="w-full text-sm">
					<thead class="bg-slate-50 dark:bg-slate-800/50">
						<tr>
							<th
								class="px-4 py-3 text-left text-xs font-medium tracking-wider text-slate-500 uppercase dark:text-slate-400"
								>Vendor / Product</th
							>
							<th
								class="px-4 py-3 text-right text-xs font-medium tracking-wider text-slate-500 uppercase dark:text-slate-400"
								>List Price</th
							>
							<th
								class="px-4 py-3 text-center text-xs font-medium tracking-wider text-slate-500 uppercase dark:text-slate-400"
								>Warranty</th
							>
							<th
								class="px-4 py-3 text-center text-xs font-medium tracking-wider text-slate-500 uppercase dark:text-slate-400"
								>Lead Time</th
							>
							<th
								class="px-4 py-3 text-center text-xs font-medium tracking-wider text-slate-500 uppercase dark:text-slate-400"
								>Rating</th
							>
						</tr>
					</thead>
					<tbody class="divide-y divide-slate-100 dark:divide-slate-700">
						{#each vendorComparison as vendor, i (vendor.product)}
							<tr
								class="hover:bg-slate-50 dark:hover:bg-slate-800/50"
								in:fly={{ x: -20, duration: 300, delay: 200 + i * 50, easing: cubicOut }}
							>
								<td class="px-4 py-3">
									<p class="font-medium text-slate-800 dark:text-slate-200">{vendor.vendor}</p>
									<p class="text-xs text-slate-500 dark:text-slate-400">{vendor.product}</p>
								</td>
								<td class="px-4 py-3 text-right">
									<span class="font-bold text-slate-800 dark:text-slate-200">{vendor.listPrice}</span>
									{#if vendor.financing}
										<p class="text-xs text-emerald-600 dark:text-emerald-400">Financing available</p>
									{/if}
								</td>
								<td class="px-4 py-3 text-center">
									<span class="text-slate-700 dark:text-slate-300">{vendor.warranty}</span>
								</td>
								<td class="px-4 py-3 text-center">
									<span class="text-slate-700 dark:text-slate-300">{vendor.leadTime}</span>
								</td>
								<td class="px-4 py-3 text-center">
									<div class="flex items-center justify-center gap-1">
										<svg class="h-4 w-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
											<path
												d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
											/>
										</svg>
										<span class="font-medium text-slate-700 dark:text-slate-300">{vendor.rating}</span>
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>

		<!-- Support Tiers -->
		<div
			class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800"
			in:fade={{ duration: 300, delay: 350 }}
		>
			<div class="border-b border-slate-200 bg-slate-900/80 px-4 py-3 dark:border-slate-700">
				<h3 class="font-semibold text-white">Support Tier Comparison</h3>
			</div>
			<div class="overflow-x-auto">
				<table class="w-full text-sm">
					<thead class="bg-slate-50 dark:bg-slate-800/50">
						<tr>
							<th
								class="px-3 py-2 text-left text-xs font-medium tracking-wider text-slate-500 uppercase dark:text-slate-400"
								>Tier</th
							>
							<th
								class="px-3 py-2 text-center text-xs font-medium tracking-wider text-slate-500 uppercase dark:text-slate-400"
								>Response</th
							>
							<th
								class="px-3 py-2 text-center text-xs font-medium tracking-wider text-slate-500 uppercase dark:text-slate-400"
								>Coverage</th
							>
							<th
								class="px-3 py-2 text-center text-xs font-medium tracking-wider text-slate-500 uppercase dark:text-slate-400"
								>Training</th
							>
							<th
								class="px-3 py-2 text-right text-xs font-medium tracking-wider text-slate-500 uppercase dark:text-slate-400"
								>Price</th
							>
						</tr>
					</thead>
					<tbody class="divide-y divide-slate-100 dark:divide-slate-700">
						{#each supportTiers as tier (tier.tier)}
							<tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50">
								<td class="px-3 py-2 font-medium text-slate-800 dark:text-slate-200">{tier.tier}</td>
								<td class="px-3 py-2 text-center text-slate-600 dark:text-slate-400">{tier.response}</td>
								<td class="px-3 py-2 text-center text-slate-600 dark:text-slate-400">{tier.coverage}</td>
								<td class="px-3 py-2 text-center text-slate-600 dark:text-slate-400">{tier.training}</td>
								<td class="px-3 py-2 text-right font-medium text-slate-700 dark:text-slate-300"
									>{tier.price}</td
								>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	</div>

	<!-- Right Column: Performance & Recommendations -->
	<div class="w-full space-y-6 lg:w-1/2">
		<!-- Performance Comparison Chart -->
		<section
			class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800"
			in:scale={{ duration: 300, delay: 100, start: 0.95, easing: cubicOut }}
		>
			<div class="mb-4">
				<h2 class="text-xl font-semibold text-slate-800 dark:text-slate-200">
					Value Comparison
				</h2>
				<p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
					Compare performance metrics to inform procurement decisions
				</p>
			</div>

			<!-- Axis Selectors -->
			<div class="mb-4 flex flex-wrap gap-4">
				<div class="flex min-w-[180px] flex-col gap-1">
					<label
						for="x-axis-select-itbuyer"
						class="dm-mono text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400"
					>
						X-Axis
					</label>
					<select
						id="x-axis-select-itbuyer"
						value={selectedXAxis}
						onchange={onXAxisChange}
						class="dm-mono h-9 rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
					>
						{#each axisOptions as option (option.id)}
							<option value={option.id}>{option.label}</option>
						{/each}
					</select>
				</div>

				<div class="flex min-w-[180px] flex-col gap-1">
					<label
						for="y-axis-select-itbuyer"
						class="dm-mono text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400"
					>
						Y-Axis
					</label>
					<select
						id="y-axis-select-itbuyer"
						value={selectedYAxis}
						onchange={onYAxisChange}
						class="dm-mono h-9 rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
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
								class="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-orange-600 dark:border-slate-700 dark:border-t-orange-500"
							></div>
							<p class="mt-2 text-sm text-slate-500 dark:text-slate-400">Loading data...</p>
						</div>
					</div>
				{:else if systemsData.length > 0 && chartContainerWidth > 0}
					<FlexibleChart
						data={axisChartData}
						color="#ea580c"
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

		<!-- Buyer Recommendations -->
		<div
			class="grid grid-cols-2 gap-4"
			in:fly={{ y: 20, duration: 300, delay: 250, easing: cubicOut }}
		>
			<div
				class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800"
			>
				<div class="flex items-start gap-3">
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
						<p class="text-xs font-medium text-slate-500 dark:text-slate-400">Best Value</p>
						<p class="font-semibold text-slate-800 dark:text-slate-200">Intel Gaudi 3</p>
						<p class="mt-1 text-xs text-slate-600 dark:text-slate-400">$125K, fastest delivery</p>
					</div>
				</div>
			</div>

			<div
				class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800"
			>
				<div class="flex items-start gap-3">
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
								d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
							/>
						</svg>
					</div>
					<div>
						<p class="text-xs font-medium text-slate-500 dark:text-slate-400">Best Support</p>
						<p class="font-semibold text-slate-800 dark:text-slate-200">Dell PowerEdge</p>
						<p class="mt-1 text-xs text-slate-600 dark:text-slate-400">5-yr warranty, ProSupport</p>
					</div>
				</div>
			</div>

			<div
				class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800"
			>
				<div class="flex items-start gap-3">
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
								d="M13 10V3L4 14h7v7l9-11h-7z"
							/>
						</svg>
					</div>
					<div>
						<p class="text-xs font-medium text-slate-500 dark:text-slate-400">Best Performance</p>
						<p class="font-semibold text-slate-800 dark:text-slate-200">NVIDIA DGX</p>
						<p class="mt-1 text-xs text-slate-600 dark:text-slate-400">Industry benchmark leader</p>
					</div>
				</div>
			</div>

			<div
				class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800"
			>
				<div class="flex items-start gap-3">
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
								d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
					</div>
					<div>
						<p class="text-xs font-medium text-slate-500 dark:text-slate-400">Fastest Delivery</p>
						<p class="font-semibold text-slate-800 dark:text-slate-200">Intel Gaudi 3</p>
						<p class="mt-1 text-xs text-slate-600 dark:text-slate-400">4-6 weeks lead time</p>
					</div>
				</div>
			</div>
		</div>

		<!-- Procurement Tip -->
		<div
			class="rounded-xl border border-orange-200 bg-orange-50 p-4 dark:border-orange-900/50 dark:bg-orange-900/20"
			in:fade={{ duration: 300, delay: 400 }}
		>
			<div class="flex gap-3">
				<div class="shrink-0">
					<svg
						class="h-5 w-5 text-orange-600 dark:text-orange-400"
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
					<h4 class="text-sm font-medium text-orange-800 dark:text-orange-300">Procurement Tip</h4>
					<p class="mt-1 text-sm text-orange-700 dark:text-orange-400">
						Volume purchases (5+ units) typically qualify for 15-25% discounts. Consider multi-year
						support agreements for additional 10% savings. All vendors offer leasing/financing options
						for CapEx optimization.
					</p>
				</div>
			</div>
		</div>
	</div>
</div>
