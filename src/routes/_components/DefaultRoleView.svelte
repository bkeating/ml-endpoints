<script>
	/**
	 * DefaultRoleView - Default view for general users (endpoints-user and others)
	 * Shows SPEC CPU benchmark card and AI Illuminate safety ratings
	 */
	import BenchmarkRange from '$lib/components/BenchmarkRange.svelte';
	import FlexibleChart from '$lib/components/FlexibleChart.svelte';

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

	// SPEC CPU 2017 Results Table Data
	const results = [
		{
			benchmark: '503.bwaves_r',
			copies: 64,
			base: { seconds: 207, ratio: 3110, bold: { seconds: 207, ratio: 3100 } },
			peak: { copies: 64, seconds: 207, ratio: 3110, bold: { seconds: 207, ratio: 3100 } }
		},
		{
			benchmark: '507.cactuBSSN_r',
			copies: 64,
			base: { seconds: 95.2, ratio: 851, bold: { seconds: 95.3, ratio: 850 } },
			peak: { copies: 64, seconds: 95.2, ratio: 851, bold: { seconds: 95.3, ratio: 850 } }
		},
		{
			benchmark: '508.namd_r',
			copies: 64,
			base: { seconds: 152, ratio: 399, bold: { seconds: 152, ratio: 399 } },
			peak: { copies: 64, seconds: 152, ratio: 400, bold: { seconds: 152, ratio: 400 } }
		},
		{
			benchmark: '510.parest_r',
			copies: 64,
			base: { seconds: 274, ratio: 611, bold: { seconds: 275, ratio: 609 } },
			peak: { copies: 64, seconds: 274, ratio: 611, bold: { seconds: 275, ratio: 609 } }
		},
		{
			benchmark: '511.povray_r',
			copies: 64,
			base: { seconds: 262, ratio: 571, bold: { seconds: 262, ratio: 570 } },
			peak: { copies: 64, seconds: 261, ratio: 572, bold: { seconds: 261, ratio: 572 } }
		},
		{
			benchmark: '519.lbm_r',
			copies: 64,
			base: { seconds: 197, ratio: 342, bold: { seconds: 196, ratio: 343 } },
			peak: { copies: 32, seconds: 86.9, ratio: 388, bold: { seconds: 83.9, ratio: 402 } }
		},
		{
			benchmark: '521.wrf_r',
			copies: 64,
			base: { seconds: 218, ratio: 657, bold: { seconds: 218, ratio: 658 } },
			peak: { copies: 64, seconds: 218, ratio: 657, bold: { seconds: 218, ratio: 658 } }
		},
		{
			benchmark: '526.blender_r',
			copies: 64,
			base: { seconds: 163, ratio: 599, bold: { seconds: 163, ratio: 598 } },
			peak: { copies: 64, seconds: 163, ratio: 599, bold: { seconds: 162, ratio: 600 } }
		},
		{
			benchmark: '527.cam4_r',
			copies: 64,
			base: { seconds: 173, ratio: 646, bold: { seconds: 171, ratio: 655 } },
			peak: { copies: 64, seconds: 172, ratio: 650, bold: { seconds: 170, ratio: 657 } }
		},
		{
			benchmark: '538.imagick_r',
			copies: 64,
			base: { seconds: 75.2, ratio: 2120, bold: { seconds: 75.3, ratio: 2110 } },
			peak: { copies: 64, seconds: 75.2, ratio: 2120, bold: { seconds: 75.3, ratio: 2110 } }
		},
		{
			benchmark: '544.nab_r',
			copies: 64,
			base: { seconds: 122, ratio: 882, bold: { seconds: 122, ratio: 883 } },
			peak: { copies: 64, seconds: 116, ratio: 925, bold: { seconds: 116, ratio: 925 } }
		}
	];
</script>

<div class="flex flex-col gap-6 lg:flex-row">
	<!-- SPEC CPU Section (Left Half) -->
	<div class="w-full lg:w-1/2">
		<div class="space-y-6">
			<!-- Header Card -->
			<div
				class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800"
			>
				<!-- Title Banner -->
				<div
					class="flex items-center justify-between border-b border-slate-200 bg-linear-to-r from-slate-900/80 to-slate-800 px-6 py-4 dark:border-slate-700 dark:from-slate-900/80 dark:to-slate-900/60"
				>
					<div class="flex items-center gap-4">
						<div
							class="flex h-12 w-12 items-center justify-center rounded-lg bg-white/10 text-xl font-bold text-white"
						>
							SPEC
						</div>
						<div>
							<h1 class="text-lg font-semibold text-white md:text-xl">
								SPEC CPU®2017 Floating Point Rate Result
							</h1>
							<p class="text-xs text-slate-200">
								Copyright 2017-2025 Standard Performance Evaluation Corporation
							</p>
						</div>
					</div>
				</div>

				<!-- System Info & Scores -->
				<div class="grid gap-6 p-6 md:grid-cols-2">
					<!-- System Details -->
					<div>
            <img src="/logo-asus.png" alt="ASUS" class="h-10 mb-3 dark:invert" />
						<p class="text-lg font-semibold text-slate-800 dark:text-slate-100">
							ASUSTeK Computer Inc.
						</p>
						<p class="text-slate-600 dark:text-slate-300">ASUS RS520QA-E13-RS8U</p>
						<p class="text-sm text-slate-500 dark:text-slate-400">(3.55 GHz, AMD EPYC 9355)</p>
					</div>

					<!-- Scores -->
					<div class="flex flex-col gap-2 md:items-end">
						<div
							class="flex items-center gap-3 rounded-lg bg-emerald-50 px-4 py-2 dark:bg-emerald-900/30"
						>
							<span class="text-sm font-medium text-emerald-700 dark:text-emerald-300"
								>SPECrate®2017_fp_base =</span
							>
							<span class="text-2xl font-bold text-emerald-600 dark:text-emerald-400">694</span>
						</div>
						<div class="flex items-center gap-3 rounded-lg bg-blue-50 px-4 py-2 dark:bg-blue-900/30">
							<span class="text-sm font-medium text-blue-700 dark:text-blue-300"
								>SPECrate®2017_fp_peak =</span
							>
							<span class="text-2xl font-bold text-blue-600 dark:text-blue-400">706</span>
						</div>
					</div>
				</div>

				<!-- Test Info Bar -->
				<div
					class="grid grid-cols-2 gap-4 border-t border-slate-200 bg-slate-50 px-6 py-4 text-sm md:grid-cols-6 dark:border-slate-700 dark:bg-slate-800/50"
				>
					<div>
						<span class="text-xs font-medium text-slate-500 dark:text-slate-400">CPU2017 License</span
						>
						<p class="font-medium text-slate-800 dark:text-slate-200">9016</p>
					</div>
					<div>
						<span class="text-xs font-medium text-slate-500 dark:text-slate-400">Test Sponsor</span>
						<p class="font-medium text-slate-800 dark:text-slate-200">ASUSTeK Computer Inc.</p>
					</div>
					<div>
						<span class="text-xs font-medium text-slate-500 dark:text-slate-400">Tested by</span>
						<p class="font-medium text-slate-800 dark:text-slate-200">ASUSTeK Computer Inc.</p>
					</div>
					<div>
						<span class="text-xs font-medium text-slate-500 dark:text-slate-400">Test Date</span>
						<p class="font-medium text-slate-800 dark:text-slate-200">Sep-2025</p>
					</div>
					<div>
						<span class="text-xs font-medium text-slate-500 dark:text-slate-400">Hardware Avail.</span
						>
						<p class="font-medium text-slate-800 dark:text-slate-200">Jun-2025</p>
					</div>
					<div>
						<span class="text-xs font-medium text-slate-500 dark:text-slate-400">Software Avail.</span
						>
						<p class="font-medium text-slate-800 dark:text-slate-200">Oct-2024</p>
					</div>
				</div>
			</div>

			<!-- Hardware & Software Specs -->
			<div class="grid gap-6 md:grid-cols-2">
				<!-- Hardware -->
				<div
					class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800"
				>
					<div class="border-b border-slate-200 bg-slate-900/80 px-4 py-3 dark:border-slate-700">
						<h2 class="font-semibold text-white">Hardware</h2>
					</div>
					<div class="divide-y divide-slate-100 text-sm dark:divide-slate-700">
						<div class="flex gap-4 px-4 py-2">
							<span class="w-24 shrink-0 font-medium text-slate-600 dark:text-slate-400"
								>CPU Name:</span
							>

							<span class="text-slate-800 dark:text-slate-200"><img src="/logo-amd.png" alt="AMD" class="h-10 block mb-3 grayscale dark:invert" /> AMD EPYC 9355</span>
						</div>
						<div class="flex gap-4 px-4 py-2">
							<span class="w-24 shrink-0 font-medium text-slate-600 dark:text-slate-400">Max MHz:</span
							>
							<span class="text-slate-800 dark:text-slate-200">4400</span>
						</div>
						<div class="flex gap-4 px-4 py-2">
							<span class="w-24 shrink-0 font-medium text-slate-600 dark:text-slate-400">Nominal:</span
							>
							<span class="text-slate-800 dark:text-slate-200">3550</span>
						</div>
						<div class="flex gap-4 px-4 py-2">
							<span class="w-24 shrink-0 font-medium text-slate-600 dark:text-slate-400">Enabled:</span
							>
							<span class="text-slate-800 dark:text-slate-200">32 cores, 1 chip, 2 threads/core</span>
						</div>
						<div class="flex gap-4 px-4 py-2">
							<span class="w-24 shrink-0 font-medium text-slate-600 dark:text-slate-400"
								>Orderable:</span
							>
							<span class="text-slate-800 dark:text-slate-200">1 chip</span>
						</div>
						<div class="flex gap-4 px-4 py-2 pl-4">
							<span class="w-24 shrink-0 font-medium text-slate-600 dark:text-slate-400"
								>Cache L1:</span
							>
							<span class="text-slate-800 dark:text-slate-200">32 KB I + 48 KB D on chip per core</span
							>
						</div>
						<div class="flex gap-4 px-4 py-2 pl-4">
							<span class="w-24 shrink-0 font-medium text-slate-600 dark:text-slate-400">L2:</span>
							<span class="text-slate-800 dark:text-slate-200">1 MB I+D on chip per core</span>
						</div>
						<div class="flex gap-4 px-4 py-2 pl-4">
							<span class="w-24 shrink-0 font-medium text-slate-600 dark:text-slate-400">L3:</span>
							<span class="text-slate-800 dark:text-slate-200"
								>256 MB I+D on chip per chip, 32 MB shared / 4 cores</span
							>
						</div>
						<div class="flex gap-4 px-4 py-2">
							<span class="w-24 shrink-0 font-medium text-slate-600 dark:text-slate-400">Memory:</span>
							<span class="text-slate-800 dark:text-slate-200"
								>768 GB (12 x 64 GB 2Rx4 PC5-6400B-R)</span
							>
						</div>
						<div class="flex gap-4 px-4 py-2">
							<span class="w-24 shrink-0 font-medium text-slate-600 dark:text-slate-400">Storage:</span
							>
							<span class="text-slate-800 dark:text-slate-200">1 x 3.2 TB PCIe NVMe SSD</span>
						</div>
					</div>
				</div>

				<!-- Software -->
				<div
					class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800"
				>
					<div class="border-b border-slate-200 bg-slate-900/80 px-4 py-3 dark:border-slate-700">
						<h2 class="font-semibold text-white">Software</h2>
					</div>
					<div class="divide-y divide-slate-100 text-sm dark:divide-slate-700">
						<div class="flex gap-4 px-4 py-2">
							<span class="w-28 shrink-0 font-medium text-slate-600 dark:text-slate-400">OS:</span>
							<span class="text-slate-800 dark:text-slate-200"
								>
                <img src="/OpenSUSE_Logo.svg" alt="SUSE" class="h-13 mb-2" />
                SUSE Linux Enterprise Server 15 SP6 (x86_64) Kernel 6.4.0-150600.21-default</span
							>
						</div>
						<div class="flex gap-4 px-4 py-2">
							<span class="w-28 shrink-0 font-medium text-slate-600 dark:text-slate-400"
								>Compiler:</span
							>
							<span class="text-slate-800 dark:text-slate-200"
								>C/C++/Fortran: Version 5.0.0 of AOCC</span
							>
						</div>
						<div class="flex gap-4 px-4 py-2">
							<span class="w-28 shrink-0 font-medium text-slate-600 dark:text-slate-400"
								>Parallel:</span
							>
							<span class="text-slate-800 dark:text-slate-200">No</span>
						</div>
						<div class="flex gap-4 px-4 py-2">
							<span class="w-28 shrink-0 font-medium text-slate-600 dark:text-slate-400"
								>Firmware:</span
							>
							<span class="text-slate-800 dark:text-slate-200">Version 0302 released Jun-2025</span>
						</div>
						<div class="flex gap-4 px-4 py-2">
							<span class="w-28 shrink-0 font-medium text-slate-600 dark:text-slate-400"
								>File System:</span
							>
							<span class="text-slate-800 dark:text-slate-200">xfs</span>
						</div>
						<div class="flex gap-4 px-4 py-2">
							<span class="w-28 shrink-0 font-medium text-slate-600 dark:text-slate-400"
								>System State:</span
							>
							<span class="text-slate-800 dark:text-slate-200">Run level 3 (multi-user)</span>
						</div>
						<div class="flex gap-4 px-4 py-2">
							<span class="w-28 shrink-0 font-medium text-slate-600 dark:text-slate-400"
								>Base Pointers:</span
							>
							<span class="text-slate-800 dark:text-slate-200">64-bit</span>
						</div>
						<div class="flex gap-4 px-4 py-2">
							<span class="w-28 shrink-0 font-medium text-slate-600 dark:text-slate-400"
								>Peak Pointers:</span
							>
							<span class="text-slate-800 dark:text-slate-200">64-bit</span>
						</div>
						<div class="flex gap-4 px-4 py-2">
							<span class="w-28 shrink-0 font-medium text-slate-600 dark:text-slate-400"
								>Power Mgmt:</span
							>
							<span class="text-slate-800 dark:text-slate-200"
								>BIOS and OS set to prefer performance at the cost of additional power usage.</span
							>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Benchmark Range Section (Right Half) -->
	<div class="w-full lg:w-1/2">
		<section
			class="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800"
		>
			<div class="mb-6 flex justify-between gap-6">
				<div class="flex-1">
					<img src="/ai-illuminate-logo.svg" alt="AI Illuminate" class="mb-3 h-10" />
					<p class="text-slate-500 dark:text-slate-400">
						English (US) official benchmark for general purpose AI chat model (V1.0)
					</p>
				</div>
				<div class="">
					<div
						class="mt-4 flex max-w-[230px] flex-col gap-1 rounded-xl bg-green-500/50 p-4 text-white shadow-lg"
					>
						<span class="font-medium text-white/5080">Overall Safety Rating:</span>
						<span class="text-2xl font-bold text-white">Very Good</span>
					</div>
				</div>
			</div>

			<div class="space-y-8">
				<!-- Default Example with Reference -->
				<BenchmarkRange value={9.4} referenceValue={28.1} />

				<!-- Multiple Rows -->
				<div>
					<div class="space-y-6">
						<BenchmarkRange
							label="Latency"
							value={5.2}
							metricLabel="P99 Latency"
							showSegmentLabels={false}
							showDirectionIndicator={false}
						/>
						<BenchmarkRange
							label="Accuracy"
							value={42.5}
							metricLabel="Error Rate %"
							showSegmentLabels={false}
							showDirectionIndicator={false}
						/>
						<BenchmarkRange
							label="Throughput"
							value={15.8}
							referenceValue={20}
							metricLabel="Degradation %"
							showSegmentLabels={false}
							showDirectionIndicator={false}
						/>
					</div>
				</div>
			</div>
		</section>

		<!-- Axis Selector Chart Section -->
		<section
			class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800"
		>
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
							<p class="mt-2 text-sm text-slate-500 dark:text-slate-400">Loading chart...</p>
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

      			<!-- Axis Selectors -->
			<div class="mb-4 flex flex-wrap gap-4 mt-6 ">
				<div class="flex min-w-[180px] flex-col gap-1">
					<label
						for="x-axis-select-default"
						class="dm-mono text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400"
					>
						X-Axis
					</label>
					<select
						id="x-axis-select-default"
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
						for="y-axis-select-default"
						class="dm-mono text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400"
					>
						Y-Axis
					</label>
					<select
						id="y-axis-select-default"
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
		</section>
	</div>
</div>

<!-- Results Table - Full Width Below Columns -->
<div
	class="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800"
>
	<div
		class="flex items-center justify-between border-b border-slate-200 bg-linear-to-r from-slate-900/80 to-slate-800 px-6 py-4 dark:border-slate-700 dark:from-slate-900/80 dark:to-slate-900/60"
	>
		<h2 class="font-semibold text-white">Results Table</h2>
	</div>

	<div class="overflow-x-auto">
		<table class="w-full text-sm">
			<thead>
				<tr
					class="border-b border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-700"
				>
					<th
						rowspan="2"
						class="border-r border-slate-200 px-3 py-2 text-left font-semibold text-slate-700 dark:border-slate-600 dark:text-slate-200"
					>
						Benchmark
					</th>
					<th
						colspan="6"
						class="border-r border-slate-200 px-3 py-2 text-center font-semibold text-slate-700 dark:border-slate-600 dark:text-slate-200"
					>
						Base
					</th>
					<th
						colspan="6"
						class="px-3 py-2 text-center font-semibold text-slate-700 dark:text-slate-200"
					>
						Peak
					</th>
				</tr>
				<tr
					class="border-b border-slate-200 bg-slate-50 text-xs dark:border-slate-700 dark:bg-slate-800"
				>
					<!-- Base columns -->
					<th
						class="border-r border-slate-200 px-2 py-1.5 text-center text-slate-600 dark:border-slate-600 dark:text-slate-400"
						>Copies</th
					>
					<th
						class="border-r border-slate-200 px-2 py-1.5 text-center text-slate-600 dark:border-slate-600 dark:text-slate-400"
						>Seconds</th
					>
					<th
						class="border-r border-slate-200 px-2 py-1.5 text-center text-slate-600 dark:border-slate-600 dark:text-slate-400"
						>Ratio</th
					>
					<th
						class="border-r border-slate-200 px-2 py-1.5 text-center font-bold text-slate-700 dark:border-slate-600 dark:text-slate-300"
						>Seconds</th
					>
					<th
						class="border-r border-slate-200 px-2 py-1.5 text-center font-bold text-slate-700 dark:border-slate-600 dark:text-slate-300"
						>Ratio</th
					>
					<th class="border-r border-slate-200 dark:border-slate-600"></th>
					<!-- Peak columns -->
					<th
						class="border-r border-slate-200 px-2 py-1.5 text-center text-slate-600 dark:border-slate-600 dark:text-slate-400"
						>Copies</th
					>
					<th
						class="border-r border-slate-200 px-2 py-1.5 text-center text-slate-600 dark:border-slate-600 dark:text-slate-400"
						>Seconds</th
					>
					<th
						class="border-r border-slate-200 px-2 py-1.5 text-center text-slate-600 dark:border-slate-600 dark:text-slate-400"
						>Ratio</th
					>
					<th
						class="border-r border-slate-200 px-2 py-1.5 text-center font-bold text-slate-700 dark:border-slate-600 dark:text-slate-300"
						>Seconds</th
					>
					<th
						class="border-r border-slate-200 px-2 py-1.5 text-center font-bold text-slate-700 dark:border-slate-600 dark:text-slate-300"
						>Ratio</th
					>
					<th></th>
				</tr>
			</thead>
			<tbody class="divide-y divide-slate-100 dark:divide-slate-700">
				{#each results as row (row.benchmark)}
					<tr class="hover:bg-slate-50 dark:hover:bg-slate-700/50">
						<td
							class="border-r border-slate-200 px-3 py-2 font-medium text-blue-600 dark:border-slate-600 dark:text-blue-400"
						>
							<span class="cursor-pointer hover:underline">{row.benchmark}</span>
						</td>
						<!-- Base -->
						<td
							class="border-r border-slate-200 px-2 py-2 text-center text-slate-600 dark:border-slate-600 dark:text-slate-300"
							>{row.copies}</td
						>
						<td
							class="border-r border-slate-200 px-2 py-2 text-center text-slate-600 dark:border-slate-600 dark:text-slate-300"
							>{row.base.seconds}</td
						>
						<td
							class="border-r border-slate-200 px-2 py-2 text-center text-slate-600 dark:border-slate-600 dark:text-slate-300"
							>{row.base.ratio}</td
						>
						<td
							class="border-r border-slate-200 px-2 py-2 text-center font-semibold text-slate-800 underline decoration-slate-400 dark:border-slate-600 dark:text-slate-100"
							>{row.base.bold.seconds}</td
						>
						<td
							class="border-r border-slate-200 px-2 py-2 text-center font-bold text-slate-800 underline decoration-slate-400 dark:border-slate-600 dark:text-slate-100"
							>{row.base.bold.ratio}</td
						>
						<td class="w-4 border-r border-slate-200 dark:border-slate-600"></td>
						<!-- Peak -->
						<td
							class="border-r border-slate-200 px-2 py-2 text-center text-slate-600 dark:border-slate-600 dark:text-slate-300"
							>{row.peak.copies}</td
						>
						<td
							class="border-r border-slate-200 px-2 py-2 text-center text-slate-600 dark:border-slate-600 dark:text-slate-300"
							>{row.peak.seconds}</td
						>
						<td
							class="border-r border-slate-200 px-2 py-2 text-center text-slate-600 dark:border-slate-600 dark:text-slate-300"
							>{row.peak.ratio}</td
						>
						<td
							class="border-r border-slate-200 px-2 py-2 text-center font-semibold text-slate-800 underline decoration-slate-400 dark:border-slate-600 dark:text-slate-100"
							>{row.peak.bold.seconds}</td
						>
						<td
							class="border-r border-slate-200 px-2 py-2 text-center font-bold text-slate-800 underline decoration-slate-400 dark:border-slate-600 dark:text-slate-100"
							>{row.peak.bold.ratio}</td
						>
						<td class="w-4"></td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
