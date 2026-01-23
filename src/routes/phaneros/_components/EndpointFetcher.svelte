<script>
	/**
	 * Endpoint Fetcher Component
	 *
	 * Allows users to input an API endpoint URL and fetch its response.
	 * Similar to the API Explorer but for external endpoints.
	 */
	import { slide } from 'svelte/transition';
	import Icon from '$lib/components/Icon.svelte';

	/**
	 * @typedef {Object} Props
	 * @property {string} endpoint - Current endpoint URL
	 * @property {object | null} response - Fetched response data
	 * @property {boolean} isLoading - Whether currently fetching
	 * @property {string | null} error - Error message if fetch failed
	 * @property {(endpoint: string) => void} onFetch - Callback to trigger fetch
	 * @property {(endpoint: string) => void} onEndpointChange - Callback when endpoint changes
	 */

	/** @type {Props} */
	let {
		endpoint = '',
		response = null,
		isLoading = false,
		error = null,
		onFetch,
		onEndpointChange
	} = $props();

	let showResponse = $state(false);
	let localEndpoint = $derived(endpoint);
	let editedEndpoint = $state('');
	let hasEdited = $state(false);

	// Use edited value if user has typed, otherwise use prop
	let displayEndpoint = $derived(hasEdited ? editedEndpoint : localEndpoint);

	function handleInput(e) {
		hasEdited = true;
		editedEndpoint = e.target.value;
	}

	function handleSubmit(e) {
		e.preventDefault();
		const value = hasEdited ? editedEndpoint : localEndpoint;
		if (value.trim()) {
			onEndpointChange(value.trim());
			onFetch(value.trim());
			hasEdited = false;
		}
	}

	function handleKeydown(e) {
		if (e.key === 'Enter') {
			handleSubmit(e);
		}
	}

	/**
	 * Format JSON with syntax highlighting classes
	 * @param {any} obj
	 * @returns {string}
	 */
	function formatJson(obj) {
		return JSON.stringify(obj, null, 2);
	}
</script>

<div
	class="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800"
>
	<!-- Header -->
	<div
		class="border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/50"
	>
		<h3
			class="dm-mono text-sm font-semibold tracking-wide text-slate-700 uppercase dark:text-slate-300"
		>
			API Endpoint
		</h3>
	</div>

	<!-- Input Section -->
	<div class="p-4">
		<form onsubmit={handleSubmit} class="flex gap-2">
			<div class="relative flex-1">
				<input
					type="url"
					value={displayEndpoint}
					oninput={handleInput}
					onkeydown={handleKeydown}
					placeholder="https://api.example.com/data"
					class="dm-mono h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500"
					aria-label="API endpoint URL"
				/>
				{#if isLoading}
					<div class="absolute top-1/2 right-3 -translate-y-1/2">
						<Icon name="Spinner" class="h-4 w-4 animate-spin text-slate-400" />
					</div>
				{/if}
			</div>
			<button
				type="submit"
				disabled={isLoading || !displayEndpoint.trim()}
				class="flex h-10 items-center gap-2 rounded-lg bg-emerald-500 px-4 text-sm font-medium text-white transition-colors hover:bg-emerald-600 disabled:bg-slate-300 dark:disabled:bg-slate-600"
			>
				{#if isLoading}
					<Icon name="Spinner" class="h-4 w-4 animate-spin" />
					Fetching...
				{:else}
					<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
						/>
					</svg>
					Fetch
				{/if}
			</button>
		</form>

		<!-- Error Display -->
		{#if error}
			<div
				class="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20"
			>
				<div class="flex items-start gap-2">
					<svg
						class="mt-0.5 h-5 w-5 shrink-0 text-red-500"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
					<p class="text-sm text-red-700 dark:text-red-400">{error}</p>
				</div>
			</div>
		{/if}

		<!-- Success/Response Status -->
		{#if response && !error}
			<div class="mt-3 flex items-center justify-between">
				<div class="flex items-center gap-2">
					<svg
						class="h-5 w-5 text-emerald-500"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M5 13l4 4L19 7"
						/>
					</svg>
					<span class="text-sm text-emerald-700 dark:text-emerald-400">
						Data fetched successfully
					</span>
				</div>
				<button
					type="button"
					onclick={() => (showResponse = !showResponse)}
					class="flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
				>
					{showResponse ? 'Hide' : 'Show'} Response
					<svg
						class="h-4 w-4 transition-transform {showResponse ? 'rotate-180' : ''}"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M19 9l-7 7-7-7"
						/>
					</svg>
				</button>
			</div>

			<!-- Response Preview -->
			{#if showResponse}
				<div transition:slide={{ duration: 200 }} class="mt-3">
					<pre
						class="dm-mono max-h-64 overflow-auto rounded-lg bg-slate-900 p-3 text-xs text-slate-100 dark:bg-slate-950">{formatJson(
							response
						)}</pre>
				</div>
			{/if}
		{/if}
	</div>
</div>
