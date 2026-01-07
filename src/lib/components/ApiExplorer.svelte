<script>
	import Icon from '$lib/components/Icon.svelte';
	import { getFilters } from '$lib/stores/chartFilters.svelte.js';
	import { simulateApiRequest, buildEndpointUrl } from '$lib/services/benchmarkService.js';

	// Reactive filters from store
	let filters = $derived(getFilters());

	// Full endpoint URL (for display purposes)
	let endpointUrl = $derived(buildEndpointUrl(filters));

	// State for API response
	let response = $state(/** @type {object | null} */ (null));
	let latencyMs = $state(/** @type {number | null} */ (null));
	let isLoading = $state(false);
	let error = $state(/** @type {string | null} */ (null));

	// Active tab for params/response
	let activeTab = $state(/** @type {'params' | 'response'} */ ('params'));

	/**
	 * Execute the simulated API call
	 */
	async function executeRequest() {
		isLoading = true;
		error = null;

		try {
			const result = await simulateApiRequest({
				model: filters.model,
				islOsl: filters.islOsl,
				precision: filters.precision,
				yAxisMetric: filters.yAxisMetric
			});

			latencyMs = result.latencyMs;

			if (!result.ok) {
				throw new Error(result.error?.message ?? `HTTP ${result.status}`);
			}

			response = result.data;
			activeTab = 'response';
		} catch (e) {
			error = e instanceof Error ? e.message : 'An error occurred';
		} finally {
			isLoading = false;
		}
	}

	/**
	 * Format JSON for display with syntax highlighting colors
	 * @param {unknown} obj
	 * @returns {string}
	 */
	function formatJson(obj) {
		return JSON.stringify(obj, null, 2);
	}
</script>

<div class="rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50">
	<!-- Header with endpoint and play button -->
	<div class="flex items-center gap-3 border-b border-slate-200 p-4 dark:border-slate-700">
		<div class="flex flex-1 items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-700">
			<span class="shrink-0 rounded bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400">
				GET
			</span>
			<code class="flex-1 overflow-x-auto text-sm text-slate-700 dm-mono dark:text-slate-300 whitespace-nowrap">
				{endpointUrl}
			</code>
			<span class="shrink-0 rounded bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/50 dark:text-amber-400">
				mock
			</span>
		</div>
		<button
			onclick={executeRequest}
			disabled={isLoading}
			class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white transition-colors hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-offset-slate-800"
			aria-label="Execute API request"
		>
			{#if isLoading}
				<Icon name="Spinner" class="h-5 w-5 animate-spin" />
			{:else}
				<Icon name="Play" class="h-5 w-5" />
			{/if}
		</button>
	</div>

	<!-- Tabs -->
	<div class="flex items-center border-b border-slate-200 dark:border-slate-700">
		<button
			onclick={() => (activeTab = 'params')}
			class="px-4 py-2 text-sm font-medium transition-colors {activeTab === 'params'
				? 'border-b-2 border-emerald-500 text-emerald-600 dark:text-emerald-400'
				: 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'}"
		>
			Params
		</button>
		<button
			onclick={() => (activeTab = 'response')}
			class="px-4 py-2 text-sm font-medium transition-colors {activeTab === 'response'
				? 'border-b-2 border-emerald-500 text-emerald-600 dark:text-emerald-400'
				: 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'}"
		>
			Response
		</button>
		{#if latencyMs !== null}
			<span class="ml-auto pr-4 text-xs text-slate-400 dark:text-slate-500">
				{latencyMs}ms
			</span>
		{/if}
	</div>

	<!-- Content Area -->
	<div class="max-h-80 overflow-auto p-4">
		{#if activeTab === 'params'}
			<!-- Params Panel -->
			<div class="space-y-2">
				<div class="grid grid-cols-[120px_1fr] gap-2 text-sm">
					<span class="text-slate-500 dark:text-slate-400 dm-mono">model</span>
					<span class="text-slate-800 dark:text-slate-200 dm-mono">{filters.model}</span>
				</div>
				<div class="grid grid-cols-[120px_1fr] gap-2 text-sm">
					<span class="text-slate-500 dark:text-slate-400 dm-mono">islOsl</span>
					<span class="text-slate-800 dark:text-slate-200 dm-mono">{filters.islOsl}</span>
				</div>
				<div class="grid grid-cols-[120px_1fr] gap-2 text-sm">
					<span class="text-slate-500 dark:text-slate-400 dm-mono">precision</span>
					<span class="text-slate-800 dark:text-slate-200 dm-mono">{filters.precision}</span>
				</div>
				<div class="grid grid-cols-[120px_1fr] gap-2 text-sm">
					<span class="text-slate-500 dark:text-slate-400 dm-mono">yAxisMetric</span>
					<span class="text-slate-800 dark:text-slate-200 dm-mono">{filters.yAxisMetric}</span>
				</div>
			</div>
		{:else}
			<!-- Response Panel -->
			{#if error}
				<div class="rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
					<strong>Error:</strong> {error}
				</div>
			{:else if response}
				<pre class="text-xs text-slate-700 dark:text-slate-300 dm-mono whitespace-pre-wrap break-words">{formatJson(response)}</pre>
			{:else}
				<p class="text-sm text-slate-500 dark:text-slate-400">
					Click the play button to execute the request and see the response.
				</p>
			{/if}
		{/if}
	</div>
</div>
