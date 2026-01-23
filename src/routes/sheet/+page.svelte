<script>
	/**
	 * SPEC CPU 2017 Floating Point Rate Result Page
	 *
	 * Static benchmark result display page inspired by SPEC's official format.
	 * Features hardware specs, software configuration, detailed results table,
	 * and a visualization sidebar with interactive charts.
	 */
	import { onMount } from 'svelte';
	import ParetoChart from '$lib/components/ParetoChart.svelte';
	import BenchmarkRange from '$lib/components/BenchmarkRange.svelte';
	import {
		initializeParetoData,
		transformForView,
		normalizeToGlobalMax
	} from '$lib/data/paretoData.js';

	// ============================================================================
	// PARETO CHART STATE
	// ============================================================================

	/** @type {import('$lib/data/paretoData.js').ParetoSeries[]} */
	let paretoSeries = $state([]);

	/** @type {Record<string, any>} */
	let viewModes = $state({});

	let paretoLoading = $state(true);

	/** @type {string[]} */
	let selectedSeries = $state([]);

	// Sidebar container width for responsive chart
	let sidebarWidth = $state(0);

	// Load Pareto data on mount
	onMount(async () => {
		try {
			const result = await initializeParetoData();
			paretoSeries = result.series;
			viewModes = result.viewModes;
			selectedSeries = result.series.slice(0, 3).map((s) => s.id); // Select first 3 by default
			paretoLoading = false;
		} catch (err) {
			console.error('Error loading pareto data:', err);
			paretoLoading = false;
		}
	});

	// Filter to selected series
	let filteredSeries = $derived(paretoSeries.filter((s) => selectedSeries.includes(s.id)));

	// Normalize utilization to global max when comparing multiple series
	let normalizedSeries = $derived(normalizeToGlobalMax(filteredSeries));

	// Transform data for throughput view
	let chartData = $derived(transformForView(filteredSeries, 'throughput'));

	// Calculate chart dimensions based on sidebar width (now half screen)
	let chartWidth = $derived(Math.max(400, sidebarWidth - 48));
	let chartHeight = $derived(Math.max(300, chartWidth * 0.55));

	// ============================================================================
	// STATIC BENCHMARK DATA
	// ============================================================================

	const benchmarkInfo = {
		title: 'SPEC CPU®2017 Floating Point Rate Result',
		copyright: 'Copyright 2017-2025 Standard Performance Evaluation Corporation',
		company: 'ASUSTeK Computer Inc.',
		system: 'ASUS RS520QA-E13-RS8U',
		cpu: '3.55 GHz, AMD EPYC 9355',
		baseScore: 694,
		peakScore: 706
	};

	const testInfo = {
		license: '9016',
		sponsor: 'ASUSTeK Computer Inc.',
		testedBy: 'ASUSTeK Computer Inc.',
		testDate: 'Sep-2025',
		hardwareAvailability: 'Jun-2025',
		softwareAvailability: 'Oct-2024'
	};

	const hardware = {
		cpuName: 'AMD EPYC 9355',
		maxMHz: '4400',
		nominalMHz: '3550',
		enabled: '32 cores, 1 chip, 2 threads/core',
		orderable: '1 chip',
		cacheL1: '32 KB I + 48 KB D on chip per core',
		cacheL2: '1 MB I+D on chip per core',
		cacheL3: '256 MB I+D on chip per chip, 32 MB shared / 4 cores',
		other: 'None',
		memory: '768 GB (12 x 64 GB 2Rx4 PC5-6400B-R)',
		storage: '1 x 3.2 TB PCIe NVMe SSD',
		otherHw: 'CPU Cooling: Air'
	};

	const software = {
		os: 'SUSE Linux Enterprise Server 15 SP6 (x86_64) Kernel 6.4.0-150600.21-default',
		compiler: 'C/C++/Fortran: Version 5.0.0 of AOCC',
		parallel: 'No',
		firmware: 'Version 0302 released Jun-2025',
		fileSystem: 'xfs',
		systemState: 'Run level 3 (multi-user)',
		basePointers: '64-bit',
		peakPointers: '64-bit',
		otherSw: 'None',
		powerManagement: 'BIOS and OS set to prefer performance at the cost of additional power usage.'
	};

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

<svelte:head>
	<title>SPEC CPU 2017 Result | ML Commons Endpoints</title>
</svelte:head>

<div class="min-h-screen bg-slate-50 dark:bg-slate-900">
	<div class="flex">
		<!-- Main Content (Left Column) -->
		<div class="min-w-0 flex-1 py-8 px-6">
			<div>
				<!-- Header Card -->
				<div
					class="mb-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800"
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
									{benchmarkInfo.title}
								</h1>
								<p class="text-xs text-slate-200">{benchmarkInfo.copyright}</p>
							</div>
						</div>
					</div>

					<!-- System Info & Scores -->
					<div class="grid gap-6 p-6 md:grid-cols-2">
						<!-- System Details -->
						<div>
							<p class="text-lg font-semibold text-slate-800 dark:text-slate-100">
								{benchmarkInfo.company}
							</p>
							<p class="text-slate-600 dark:text-slate-300">{benchmarkInfo.system}</p>
							<p class="text-sm text-slate-500 dark:text-slate-400">({benchmarkInfo.cpu})</p>
						</div>

						<!-- Scores -->
						<div class="flex flex-col gap-2 md:items-end">
							<div
								class="flex items-center gap-3 rounded-lg bg-emerald-50 px-4 py-2 dark:bg-emerald-900/30"
							>
								<span class="text-sm font-medium text-emerald-700 dark:text-emerald-300"
									>SPECrate®2017_fp_base =</span
								>
								<span class="text-2xl font-bold text-emerald-600 dark:text-emerald-400"
									>{benchmarkInfo.baseScore}</span
								>
							</div>
							<div
								class="flex items-center gap-3 rounded-lg bg-blue-50 px-4 py-2 dark:bg-blue-900/30"
							>
								<span class="text-sm font-medium text-blue-700 dark:text-blue-300"
									>SPECrate®2017_fp_peak =</span
								>
								<span class="text-2xl font-bold text-blue-600 dark:text-blue-400"
									>{benchmarkInfo.peakScore}</span
								>
							</div>
						</div>
					</div>

					<!-- Test Info Bar -->
					<div
						class="grid grid-cols-2 gap-4 border-t border-slate-200 bg-slate-50 px-6 py-4 text-sm md:grid-cols-6 dark:border-slate-700 dark:bg-slate-800/50"
					>
						<div>
							<span class="text-xs font-medium text-slate-500 dark:text-slate-400"
								>CPU2017 License</span
							>
							<p class="font-medium text-slate-800 dark:text-slate-200">{testInfo.license}</p>
						</div>
						<div>
							<span class="text-xs font-medium text-slate-500 dark:text-slate-400">Test Sponsor</span
							>
							<p class="font-medium text-slate-800 dark:text-slate-200">{testInfo.sponsor}</p>
						</div>
						<div>
							<span class="text-xs font-medium text-slate-500 dark:text-slate-400">Tested by</span>
							<p class="font-medium text-slate-800 dark:text-slate-200">{testInfo.testedBy}</p>
						</div>
						<div>
							<span class="text-xs font-medium text-slate-500 dark:text-slate-400">Test Date</span>
							<p class="font-medium text-slate-800 dark:text-slate-200">{testInfo.testDate}</p>
						</div>
						<div>
							<span class="text-xs font-medium text-slate-500 dark:text-slate-400"
								>Hardware Avail.</span
							>
							<p class="font-medium text-slate-800 dark:text-slate-200">
								{testInfo.hardwareAvailability}
							</p>
						</div>
						<div>
							<span class="text-xs font-medium text-slate-500 dark:text-slate-400"
								>Software Avail.</span
							>
							<p class="font-medium text-slate-800 dark:text-slate-200">
								{testInfo.softwareAvailability}
							</p>
						</div>
					</div>
				</div>

				<!-- Hardware & Software Specs -->
				<div class="mb-6 grid gap-6 md:grid-cols-2">
					<!-- Hardware -->
					<div
						class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800"
					>
						<div class="border-b border-slate-200 bg-slate-900/80 px-4 py-3 dark:border-slate-700">
							<h2 class="font-semibold text-white">Hardware</h2>
						</div>
						<div class="divide-y divide-slate-100 text-sm dark:divide-slate-700">
							{#each Object.entries({
								'CPU Name': hardware.cpuName,
								'Max MHz': hardware.maxMHz,
								Nominal: hardware.nominalMHz,
								Enabled: hardware.enabled,
								Orderable: hardware.orderable,
								'Cache L1': hardware.cacheL1,
								L2: hardware.cacheL2,
								L3: hardware.cacheL3,
								Other: hardware.other,
								Memory: hardware.memory,
								Storage: hardware.storage,
								'Other:': hardware.otherHw
							}) as [label, value] (label)}
								<div class="flex gap-4 px-4 py-2">
									<span
										class="w-24 shrink-0 font-medium text-slate-600 dark:text-slate-400"
										class:pl-4={['L2', 'L3'].includes(label)}
									>
										{label}:
									</span>
									<span class="text-slate-800 dark:text-slate-200">{value}</span>
								</div>
							{/each}
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
							{#each Object.entries({
								OS: software.os,
								Compiler: software.compiler,
								Parallel: software.parallel,
								Firmware: software.firmware,
								'File System': software.fileSystem,
								'System State': software.systemState,
								'Base Pointers': software.basePointers,
								'Peak Pointers': software.peakPointers,
								Other: software.otherSw,
								'Power Mgmt': software.powerManagement
							}) as [label, value] (label)}
								<div class="flex gap-4 px-4 py-2">
									<span class="w-28 shrink-0 font-medium text-slate-600 dark:text-slate-400">
										{label}:
									</span>
									<span class="text-slate-800 dark:text-slate-200">{value}</span>
								</div>
							{/each}
						</div>
					</div>
				</div>

				<!-- Results Table -->
				<div
					class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800"
				>
					<div class="border-b border-slate-200 bg-indigo-900 px-4 py-3 dark:border-slate-700">
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

				<!-- Footer Note -->
				<p class="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
					Benchmark result graphs are available in the
					<span class="cursor-pointer text-blue-600 hover:underline dark:text-blue-400"
						>PDF report</span
					>.
				</p>
			</div>
		</div>

		<!-- Charts Sidebar (Right Column) - Hidden on mobile -->
		<aside
			class="sticky top-0 hidden h-screen w-1/2 shrink-0 overflow-y-auto  py-6 px-6 xl:block"
			bind:clientWidth={sidebarWidth}
		>
			<div class="space-y-6">
				<!-- Sidebar Header -->
				<div>
					<h2 class="text-lg font-semibold text-slate-800 dark:text-slate-200">
						Performance Visualizations
					</h2>
					<p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
						Related benchmark charts and metrics
					</p>
				</div>

				<!-- Mini Stats Cards (moved to top) -->
				<div class="grid grid-cols-4 gap-3">
					<div
						class="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900/50"
					>
						<div class="text-xs font-medium text-slate-500 dark:text-slate-400">Peak Score</div>
						<div class="mt-1 text-xl font-bold text-emerald-600 dark:text-emerald-400">706</div>
						<div class="mt-0.5 text-xs text-slate-400 dark:text-slate-500">+1.7% vs base</div>
					</div>
					<div
						class="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900/50"
					>
						<div class="text-xs font-medium text-slate-500 dark:text-slate-400">Efficiency</div>
						<div class="mt-1 text-xl font-bold text-blue-600 dark:text-blue-400">21.7</div>
						<div class="mt-0.5 text-xs text-slate-400 dark:text-slate-500">score/core</div>
					</div>
					<div
						class="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900/50"
					>
						<div class="text-xs font-medium text-slate-500 dark:text-slate-400">Max Ratio</div>
						<div class="mt-1 text-xl font-bold text-indigo-600 dark:text-indigo-400">3100</div>
						<div class="mt-0.5 text-xs text-slate-400 dark:text-slate-500">503.bwaves_r</div>
					</div>
					<div
						class="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900/50"
					>
						<div class="text-xs font-medium text-slate-500 dark:text-slate-400">Benchmarks</div>
						<div class="mt-1 text-xl font-bold text-purple-600 dark:text-purple-400">11</div>
						<div class="mt-0.5 text-xs text-slate-400 dark:text-slate-500">FP Rate tests</div>
					</div>
				</div>

				<!-- Benchmark Range Section -->
				<div
					class="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/50"
				>
					<h3 class="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
						Quality Metrics
					</h3>
					<div class="space-y-6">
						<BenchmarkRange
							label="Overall"
							value={9.4}
							referenceValue={28.1}
							showSegmentLabels={false}
							showDirectionIndicator={false}
						/>
						<BenchmarkRange
							label="Latency"
							value={5.2}
							metricLabel="P99 Latency %"
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
					</div>
				</div>

				<!-- Pareto Chart Section -->
				<div
					class="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/50"
				>
					<div class="mb-3 flex items-center justify-between">
						<h3 class="text-sm font-semibold text-slate-700 dark:text-slate-300">
							Throughput vs Concurrent Clients
						</h3>
						<!-- Hardware Configs inline toggle -->
						{#if paretoSeries.length > 0}
							<div class="flex items-center gap-2">
								{#each paretoSeries.slice(0, 5) as series (series.id)}
									{@const isSelected = selectedSeries.includes(series.id)}
									<button
										type="button"
										onclick={() => {
											if (isSelected && selectedSeries.length > 1) {
												selectedSeries = selectedSeries.filter((id) => id !== series.id);
											} else if (!isSelected) {
												selectedSeries = [...selectedSeries, series.id];
											}
										}}
										class="h-3 w-3 shrink-0 cursor-pointer rounded-full transition-opacity hover:scale-110"
										style="background-color: {series.color}; opacity: {isSelected ? 1 : 0.25};"
										title={series.label}
										aria-label="Toggle {series.label}"
									></button>
								{/each}
							</div>
						{/if}
					</div>

					{#if paretoLoading}
						<div class="flex h-64 items-center justify-center">
							<div
								class="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-600 dark:border-slate-700 dark:border-t-emerald-500"
							></div>
						</div>
					{:else if chartData.length > 0 && sidebarWidth > 0}
						<ParetoChart
							data={chartData}
							width={chartWidth}
							height={chartHeight}
							xAxisLabel="Concurrent Clients"
							yAxisLabel="Throughput (Tok/s)"
							useLogScale={true}
							showInterpolation={false}
						/>
					{:else}
						<div class="flex h-64 items-center justify-center text-sm text-slate-500">
							No chart data available
						</div>
					{/if}
				</div>

				<!-- Quick Links -->
				<div class="border-t border-slate-200 pt-4 dark:border-slate-700">
					<h3 class="mb-3 text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
						Related Resources
					</h3>
					<div class="flex gap-4 text-sm">
						<a
							href="/pareto-charts"
							class="text-blue-600 hover:underline dark:text-blue-400"
						>
							View All Pareto Charts
						</a>
						<a href="/test" class="text-blue-600 hover:underline dark:text-blue-400">
							Benchmark Test Page
						</a>
						<a href="/" class="text-blue-600 hover:underline dark:text-blue-400">
							LLM Inference Dashboard
						</a>
					</div>
				</div>
			</div>
		</aside>
	</div>
</div>

<style lang="postcss">
	@reference "@app-css";
</style>
