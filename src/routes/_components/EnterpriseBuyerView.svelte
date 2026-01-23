<script>
	/**
	 * EnterpriseBuyerView - View optimized for enterprise and institutional buyers
	 * Focus on: TCO, SLAs, compliance certifications, vendor reliability, support quality
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

	// TCO Comparison Data
	const tcoComparison = [
		{
			vendor: 'NVIDIA DGX Cloud',
			hardware: '$2.4M',
			operations: '$480K/yr',
			support: '$240K/yr',
			tco3yr: '$4.6M',
			slaUptime: '99.95%',
			compliance: ['SOC 2', 'HIPAA', 'ISO 27001']
		},
		{
			vendor: 'AMD MI300X Cluster',
			hardware: '$1.8M',
			operations: '$360K/yr',
			support: '$180K/yr',
			tco3yr: '$3.4M',
			slaUptime: '99.9%',
			compliance: ['SOC 2', 'ISO 27001']
		},
		{
			vendor: 'Google Cloud TPU',
			hardware: 'Pay-as-you-go',
			operations: '$520K/yr',
			support: 'Included',
			tco3yr: '$1.6M',
			slaUptime: '99.99%',
			compliance: ['SOC 2', 'HIPAA', 'FedRAMP', 'ISO 27001']
		},
		{
			vendor: 'Intel Gaudi On-Prem',
			hardware: '$1.2M',
			operations: '$280K/yr',
			support: '$140K/yr',
			tco3yr: '$2.5M',
			slaUptime: '99.5%',
			compliance: ['SOC 2', 'ISO 27001']
		}
	];

	// Key enterprise metrics
	const enterpriseMetrics = [
		{ label: 'Avg. SLA Uptime', value: '99.84%', sublabel: 'Across all vendors' },
		{ label: 'Compliance Coverage', value: '94%', sublabel: 'SOC 2 Type II certified' },
		{ label: 'Support Response', value: '< 4hr', sublabel: 'Critical issue avg.' },
		{ label: 'Contract Flexibility', value: '1-5 yr', sublabel: 'Term options' }
	];

	// Compliance certifications
	const complianceCerts = [
		{ name: 'SOC 2 Type II', vendors: 4, icon: 'shield' },
		{ name: 'ISO 27001', vendors: 4, icon: 'globe' },
		{ name: 'HIPAA', vendors: 2, icon: 'medical' },
		{ name: 'FedRAMP', vendors: 1, icon: 'government' },
		{ name: 'GDPR Ready', vendors: 4, icon: 'eu' }
	];
</script>

<div class="flex flex-col gap-6 lg:flex-row">
	<!-- Left Column: TCO Analysis & Compliance -->
	<div class="w-full space-y-6 lg:w-1/2">
		<!-- Enterprise Metrics Overview -->
		<div
			class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800"
			in:scale={{ duration: 300, delay: 50, start: 0.95, easing: cubicOut }}
		>
			<div
				class="border-b border-slate-200 bg-linear-to-r from-blue-900/90 to-blue-800 px-6 py-4 dark:border-slate-700"
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
								d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
							/>
						</svg>
					</div>
					<div>
						<h2 class="text-lg font-semibold text-white">Enterprise Readiness Overview</h2>
						<p class="text-xs text-blue-200">MLPerf Inference Benchmark Analysis</p>
					</div>
				</div>
			</div>

			<div class="grid grid-cols-2 gap-4 p-6 md:grid-cols-4">
				{#each enterpriseMetrics as metric, i (metric.label)}
					<div
						class="text-center"
						in:fly={{ y: 20, duration: 300, delay: 100 + i * 50, easing: cubicOut }}
					>
						<p class="text-2xl font-bold text-blue-600 dark:text-blue-400">{metric.value}</p>
						<p class="text-sm font-medium text-slate-700 dark:text-slate-300">{metric.label}</p>
						<p class="text-xs text-slate-500 dark:text-slate-400">{metric.sublabel}</p>
					</div>
				{/each}
			</div>
		</div>

		<!-- TCO Comparison Table -->
		<div
			class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800"
			in:scale={{ duration: 300, delay: 150, start: 0.95, easing: cubicOut }}
		>
			<div class="border-b border-slate-200 bg-slate-900/80 px-6 py-4 dark:border-slate-700">
				<h3 class="font-semibold text-white">Total Cost of Ownership (3-Year)</h3>
				<p class="text-xs text-slate-300">Enterprise deployment scenarios</p>
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
								class="px-4 py-3 text-right text-xs font-medium tracking-wider text-slate-500 uppercase dark:text-slate-400"
								>3-Yr TCO</th
							>
							<th
								class="px-4 py-3 text-center text-xs font-medium tracking-wider text-slate-500 uppercase dark:text-slate-400"
								>SLA</th
							>
							<th
								class="px-4 py-3 text-left text-xs font-medium tracking-wider text-slate-500 uppercase dark:text-slate-400"
								>Compliance</th
							>
						</tr>
					</thead>
					<tbody class="divide-y divide-slate-100 dark:divide-slate-700">
						{#each tcoComparison as item, i (item.vendor)}
							<tr
								class="hover:bg-slate-50 dark:hover:bg-slate-800/50"
								in:fly={{ x: -20, duration: 300, delay: 200 + i * 50, easing: cubicOut }}
							>
								<td class="px-4 py-3">
									<p class="font-medium text-slate-800 dark:text-slate-200">{item.vendor}</p>
									<p class="text-xs text-slate-500 dark:text-slate-400">
										Hardware: {item.hardware}
									</p>
								</td>
								<td class="px-4 py-3 text-right">
									<span class="text-lg font-bold text-slate-800 dark:text-slate-200"
										>{item.tco3yr}</span
									>
								</td>
								<td class="px-4 py-3 text-center">
									<span
										class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {parseFloat(
											item.slaUptime
										) >= 99.9
											? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'
											: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300'}"
									>
										{item.slaUptime}
									</span>
								</td>
								<td class="px-4 py-3">
									<div class="flex flex-wrap gap-1">
										{#each item.compliance.slice(0, 2) as cert (cert)}
											<span
												class="inline-flex items-center rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600 dark:bg-slate-700 dark:text-slate-300"
											>
												{cert}
											</span>
										{/each}
										{#if item.compliance.length > 2}
											<span
												class="inline-flex items-center rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600 dark:bg-slate-700 dark:text-slate-300"
											>
												+{item.compliance.length - 2}
											</span>
										{/if}
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>

		<!-- Compliance Certifications Grid -->
		<div
			class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800"
			in:fade={{ duration: 300, delay: 350 }}
		>
			<div class="border-b border-slate-200 bg-slate-900/80 px-4 py-3 dark:border-slate-700">
				<h3 class="font-semibold text-white">Compliance Coverage</h3>
			</div>
			<div class="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 md:grid-cols-5">
				{#each complianceCerts as cert (cert.name)}
					<div
						class="flex flex-col items-center rounded-lg bg-slate-50 p-3 text-center dark:bg-slate-900/50"
					>
						<div class="mb-2 rounded-full bg-blue-100 p-2 dark:bg-blue-900/30">
							<svg
								class="h-4 w-4 text-blue-600 dark:text-blue-400"
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
						<p class="text-xs font-medium text-slate-700 dark:text-slate-300">{cert.name}</p>
						<p class="text-xs text-slate-500 dark:text-slate-400">{cert.vendors}/4 vendors</p>
					</div>
				{/each}
			</div>
		</div>
	</div>

	<!-- Right Column: Performance Chart & Recommendations -->
	<div class="w-full space-y-6 lg:w-1/2">
		<!-- Performance vs Reliability Chart -->
		<section
			class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800"
			in:scale={{ duration: 300, delay: 100, start: 0.95, easing: cubicOut }}
		>
			<div class="mb-4">
				<h2 class="text-xl font-semibold text-slate-800 dark:text-slate-200">
					Performance Analysis
				</h2>
				<p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
					Compare solutions by performance metrics relevant to enterprise SLAs
				</p>
			</div>

			<!-- Axis Selectors -->
			<div class="mb-4 flex flex-wrap gap-4">
				<div class="flex min-w-[180px] flex-col gap-1">
					<label
						for="x-axis-select-enterprise"
						class="dm-mono text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400"
					>
						X-Axis
					</label>
					<select
						id="x-axis-select-enterprise"
						value={selectedXAxis}
						onchange={onXAxisChange}
						class="dm-mono h-9 rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
					>
						{#each axisOptions as option (option.id)}
							<option value={option.id}>{option.label}</option>
						{/each}
					</select>
				</div>

				<div class="flex min-w-[180px] flex-col gap-1">
					<label
						for="y-axis-select-enterprise"
						class="dm-mono text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400"
					>
						Y-Axis
					</label>
					<select
						id="y-axis-select-enterprise"
						value={selectedYAxis}
						onchange={onYAxisChange}
						class="dm-mono h-9 rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
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
								class="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600 dark:border-slate-700 dark:border-t-blue-500"
							></div>
							<p class="mt-2 text-sm text-slate-500 dark:text-slate-400">Loading data...</p>
						</div>
					</div>
				{:else if systemsData.length > 0 && chartContainerWidth > 0}
					<FlexibleChart
						data={axisChartData}
						color="#2563eb"
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

		<!-- Vendor Recommendations -->
		<div
			class="grid grid-cols-1 gap-4 sm:grid-cols-2"
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
								d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
							/>
						</svg>
					</div>
					<div>
						<p class="text-xs font-medium text-slate-500 dark:text-slate-400">Best for Compliance</p>
						<p class="font-semibold text-slate-800 dark:text-slate-200">Google Cloud TPU</p>
						<p class="mt-1 text-xs text-slate-600 dark:text-slate-400">
							FedRAMP, HIPAA, SOC 2, ISO 27001
						</p>
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
								d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
					</div>
					<div>
						<p class="text-xs font-medium text-slate-500 dark:text-slate-400">Best TCO</p>
						<p class="font-semibold text-slate-800 dark:text-slate-200">Google Cloud TPU</p>
						<p class="mt-1 text-xs text-slate-600 dark:text-slate-400">$1.6M over 3 years</p>
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
						<p class="font-semibold text-slate-800 dark:text-slate-200">NVIDIA DGX Cloud</p>
						<p class="mt-1 text-xs text-slate-600 dark:text-slate-400">99.95% SLA uptime</p>
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
								d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
							/>
						</svg>
					</div>
					<div>
						<p class="text-xs font-medium text-slate-500 dark:text-slate-400">Best On-Prem</p>
						<p class="font-semibold text-slate-800 dark:text-slate-200">Intel Gaudi</p>
						<p class="mt-1 text-xs text-slate-600 dark:text-slate-400">Full data sovereignty</p>
					</div>
				</div>
			</div>
		</div>

		<!-- Enterprise Insight Card -->
		<div
			class="rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/50 dark:bg-blue-900/20"
			in:fade={{ duration: 300, delay: 400 }}
		>
			<div class="flex gap-3">
				<div class="shrink-0">
					<svg
						class="h-5 w-5 text-blue-600 dark:text-blue-400"
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
					<h4 class="text-sm font-medium text-blue-800 dark:text-blue-300">
						Enterprise Procurement Insight
					</h4>
					<p class="mt-1 text-sm text-blue-700 dark:text-blue-400">
						Cloud-based solutions offer 65% lower upfront costs but 23% higher 5-year TCO compared
						to on-prem. Consider hybrid deployments for optimal flexibility and cost control.
					</p>
				</div>
			</div>
		</div>
	</div>
</div>
