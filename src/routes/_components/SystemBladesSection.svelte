<script>
	/**
	 * SystemBladesSection - Three-column grid of system benchmark cards
	 * Displays system performance data with charts in a responsive grid
	 */
	import { onMount } from 'svelte';
	import SystemBlade from '../pareto-charts/_components/SystemBlade.svelte';
	import { parseSystemData, getSystemColor } from '../pareto-charts/_components/dataTransform.js';

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

<!-- Loading State -->
{#if loading}
	<div class="flex items-center justify-center py-16">
		<div class="text-center">
			<div
				class="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600 dark:border-slate-700 dark:border-t-emerald-500"
			></div>
			<p class="mt-3 text-sm text-slate-500 dark:text-slate-400">Loading benchmark data...</p>
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
				chartHeight={220}
			/>
		{/each}
	</div>
{/if}
