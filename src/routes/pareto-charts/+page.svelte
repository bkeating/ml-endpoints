<script>
	/**
	 * Benchmark Visualization Page
	 * Displays multiple system blades for performance comparison
	 */
	import { onMount } from 'svelte';
	import SystemBlade from './_components/SystemBlade.svelte';
	import { parseSystemData, getSystemColor } from './_components/dataTransform.js';

	let systems = $state([]);
	let loading = $state(true);
	let error = $state(null);

	onMount(async () => {
		try {
			const response = await fetch('/db.json');
			if (!response.ok) {
				throw new Error(`Failed to load benchmark data: ${response.statusText}`);
			}
			const rawData = await response.json();
			systems = parseSystemData(rawData);
			loading = false;
		} catch (err) {
			console.error('Error loading benchmark data:', err);
			error = err.message;
			loading = false;
		}
	});
</script>

<svelte:head>
	<title>Benchmark Visualization | ML Commons Endpoints</title>
	<meta
		name="description"
		content="Interactive benchmark visualization comparing system performance metrics"
	/>
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<!-- Page Header -->
	<div class="mb-8">
		<h1 class="text-3xl font-bold text-slate-900 dark:text-slate-100">
			Benchmark Performance Comparison
		</h1>
		<p class="mt-2 text-slate-600 dark:text-slate-400">
			Compare system performance across TTFT, throughput, interactivity, and normalized metrics
		</p>
	</div>

	<!-- Loading State -->
	{#if loading}
		<div class="flex items-center justify-center py-16">
			<div class="text-center">
				<div
					class="border-t-primary dark:border-t-primary mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-200 dark:border-slate-700"
				></div>
				<p class="mt-4 text-slate-600 dark:text-slate-400">Loading benchmark data...</p>
			</div>
		</div>
	{/if}

	<!-- Error State -->
	{#if error}
		<div
			class="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-900/20"
		>
			<h3 class="font-semibold text-red-800 dark:text-red-200">Error Loading Data</h3>
			<p class="mt-1 text-sm text-red-700 dark:text-red-300">{error}</p>
		</div>
	{/if}

	<!-- System Blades Grid -->
	{#if !loading && !error && systems.length > 0}
		<div class="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
			{#each systems as system, index (system.id)}
				<SystemBlade
					systemData={system}
					color={getSystemColor(index)}
					chartWidth={400}
					chartHeight={280}
				/>
			{/each}
		</div>
	{/if}

	<!-- Empty State -->
	{#if !loading && !error && systems.length === 0}
		<div class="py-16 text-center">
			<p class="text-slate-600 dark:text-slate-400">No benchmark data available</p>
		</div>
	{/if}

	<!-- Legend / Info -->
	{#if !loading && !error && systems.length > 0}
		<div
			class="mt-12 rounded-lg border border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-900/50"
		>
			<h3 class="mb-3 text-lg font-semibold text-slate-800 dark:text-slate-200">
				Understanding the Charts
			</h3>
			<div class="grid gap-4 md:grid-cols-2">
				<div>
					<h4 class="font-medium text-slate-700 dark:text-slate-300">Chart 1: TTFT vs Users</h4>
					<p class="mt-1 text-sm text-slate-600 dark:text-slate-400">
						Time-to-first-token latency as concurrent users increase. Lower is better for user
						experience.
					</p>
				</div>
				<div>
					<h4 class="font-medium text-slate-700 dark:text-slate-300">
						Chart 2: Throughput vs Interactivity
					</h4>
					<p class="mt-1 text-sm text-slate-600 dark:text-slate-400">
						Trade-off between total system throughput and per-user token rate. Shows the balance
						between capacity and responsiveness.
					</p>
				</div>
				<div>
					<h4 class="font-medium text-slate-700 dark:text-slate-300">
						Chart 3: Normalized Throughput vs Users
					</h4>
					<p class="mt-1 text-sm text-slate-600 dark:text-slate-400">
						Throughput normalized by chip count and factor, showing efficiency across different
						system scales.
					</p>
				</div>
				<div>
					<h4 class="font-medium text-slate-700 dark:text-slate-300">
						Chart 4: Normalized Throughput vs TTFT
					</h4>
					<p class="mt-1 text-sm text-slate-600 dark:text-slate-400">
						Relationship between latency and normalized performance. Reveals efficiency vs
						responsiveness trade-offs.
					</p>
				</div>
			</div>
		</div>
	{/if}
</div>

<style lang="postcss">
	@reference "@app-css";
</style>
