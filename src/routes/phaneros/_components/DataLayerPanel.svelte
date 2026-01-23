<script>
	/**
	 * Data Layer Panel Component
	 *
	 * Manages multiple data layers for the chart:
	 * - Add/remove layers
	 * - Toggle visibility
	 * - Reorder layers
	 * - Configure each layer's endpoint and mapping
	 */
	import { slide } from 'svelte/transition';
	import EndpointFetcher from './EndpointFetcher.svelte';
	import PropertyMapper from './PropertyMapper.svelte';

	/**
	 * @typedef {import('$lib/stores/chartBuilder.svelte.js').DataLayer} DataLayer
	 */

	/**
	 * @typedef {Object} Props
	 * @property {DataLayer[]} layers
	 * @property {(layerId: string, endpoint: string) => void} onFetch
	 * @property {(layerId: string, updates: Partial<DataLayer>) => void} onLayerUpdate
	 * @property {(layerId: string, mapping: Partial<DataLayer['mapping']>) => void} onMappingUpdate
	 * @property {(layerId: string) => void} onToggleVisibility
	 * @property {(layerId: string, direction: 'up' | 'down') => void} onMoveLayer
	 * @property {(layerId: string) => void} onRemoveLayer
	 * @property {() => void} onAddLayer
	 */

	/** @type {Props} */
	let {
		layers,
		onFetch,
		onLayerUpdate,
		onMappingUpdate,
		onToggleVisibility,
		onMoveLayer,
		onRemoveLayer,
		onAddLayer
	} = $props();

	// Track which layer is expanded - derive initial value from layers prop
	let expandedLayerId = $state(/** @type {string | null} */ (null));

	// Initialize expanded layer ID from first layer when layers change
	$effect(() => {
		if (expandedLayerId === null && layers.length > 0) {
			expandedLayerId = layers[0].id;
		}
	});

	function toggleExpand(layerId) {
		expandedLayerId = expandedLayerId === layerId ? null : layerId;
	}
</script>

<div
	class="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800"
>
	<!-- Header -->
	<div
		class="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/50"
	>
		<h3
			class="dm-mono text-sm font-semibold tracking-wide text-slate-700 uppercase dark:text-slate-300"
		>
			Data Layers
		</h3>
		<button
			type="button"
			onclick={onAddLayer}
			class="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-emerald-600"
		>
			<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
			</svg>
			Add Layer
		</button>
	</div>

	<div class="divide-y divide-slate-200 dark:divide-slate-700">
		{#each layers as layer, index (layer.id)}
			<div class="bg-white dark:bg-slate-800" transition:slide={{ duration: 200 }}>
				<!-- Layer Header -->
				<div class="flex items-center gap-3 px-4 py-3">
					<!-- Visibility Toggle -->
					<button
						type="button"
						onclick={() => onToggleVisibility(layer.id)}
						class="flex h-8 w-8 items-center justify-center rounded-lg transition-colors {layer.visible
							? 'text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-900/20'
							: 'text-slate-400 hover:bg-slate-100 dark:text-slate-500 dark:hover:bg-slate-700'}"
						aria-label={layer.visible ? 'Hide layer' : 'Show layer'}
					>
						{#if layer.visible}
							<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
								/>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
								/>
							</svg>
						{:else}
							<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
								/>
							</svg>
						{/if}
					</button>

					<!-- Color Indicator -->
					<div
						class="h-4 w-4 shrink-0 rounded-full"
						style="background-color: {layer.mapping.color}"
					></div>

					<!-- Layer Name (editable) -->
					<input
						type="text"
						value={layer.name}
						onchange={(e) => onLayerUpdate(layer.id, { name: e.target.value })}
						class="h-8 min-w-0 flex-1 rounded border border-transparent bg-transparent px-2 text-sm font-medium text-slate-800 hover:border-slate-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none dark:text-slate-200 dark:hover:border-slate-600"
						aria-label="Layer name"
					/>

					<!-- Status Indicators -->
					<div class="flex shrink-0 items-center gap-2">
						{#if layer.isLoading}
							<span
								class="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
							>
								Loading...
							</span>
						{:else if layer.error}
							<span
								class="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700 dark:bg-red-900/30 dark:text-red-400"
							>
								Error
							</span>
						{:else if layer.response && layer.mapping.xProp && layer.mapping.yProp}
							<span
								class="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
							>
								Ready
							</span>
						{/if}
					</div>

					<!-- Layer Actions -->
					<div class="flex shrink-0 items-center gap-1">
						<!-- Move Up -->
						<button
							type="button"
							onclick={() => onMoveLayer(layer.id, 'up')}
							disabled={index === 0}
							class="flex h-7 w-7 items-center justify-center rounded text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:bg-slate-700 dark:hover:text-slate-300"
							aria-label="Move layer up"
						>
							<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M5 15l7-7 7 7"
								/>
							</svg>
						</button>

						<!-- Move Down -->
						<button
							type="button"
							onclick={() => onMoveLayer(layer.id, 'down')}
							disabled={index === layers.length - 1}
							class="flex h-7 w-7 items-center justify-center rounded text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:bg-slate-700 dark:hover:text-slate-300"
							aria-label="Move layer down"
						>
							<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M19 9l-7 7-7-7"
								/>
							</svg>
						</button>

						<!-- Expand/Collapse -->
						<button
							type="button"
							onclick={() => toggleExpand(layer.id)}
							class="flex h-7 w-7 items-center justify-center rounded text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-300"
							aria-label={expandedLayerId === layer.id ? 'Collapse' : 'Expand'}
						>
							<svg
								class="h-4 w-4 transition-transform {expandedLayerId === layer.id
									? 'rotate-180'
									: ''}"
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

						<!-- Delete -->
						<button
							type="button"
							onclick={() => onRemoveLayer(layer.id)}
							disabled={layers.length <= 1}
							class="flex h-7 w-7 items-center justify-center rounded text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:bg-red-900/20"
							aria-label="Remove layer"
						>
							<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
								/>
							</svg>
						</button>
					</div>
				</div>

				<!-- Layer Configuration (expanded) -->
				{#if expandedLayerId === layer.id}
					<div
						transition:slide={{ duration: 200 }}
						class="space-y-4 border-t border-slate-100 px-4 pt-4 pb-4 dark:border-slate-700/50"
					>
						<!-- Endpoint Fetcher -->
						<EndpointFetcher
							endpoint={layer.endpoint}
							response={layer.response}
							isLoading={layer.isLoading}
							error={layer.error}
							onEndpointChange={(endpoint) => onLayerUpdate(layer.id, { endpoint })}
							onFetch={(endpoint) => onFetch(layer.id, endpoint)}
						/>

						<!-- Property Mapper -->
						<PropertyMapper
							response={layer.response}
							mapping={layer.mapping}
							onMappingChange={(updates) => onMappingUpdate(layer.id, updates)}
						/>
					</div>
				{/if}
			</div>
		{/each}
	</div>

	{#if layers.length === 0}
		<div class="p-8 text-center text-slate-500 dark:text-slate-400">
			<p class="text-sm">No layers configured</p>
			<button
				type="button"
				onclick={onAddLayer}
				class="mt-2 text-sm text-emerald-600 hover:underline dark:text-emerald-400"
			>
				Add your first layer
			</button>
		</div>
	{/if}
</div>
