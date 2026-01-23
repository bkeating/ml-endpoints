<script>
	/**
	 * Layer Toolbar Component
	 *
	 * Photoshop-style compact toolbar for layer configuration.
	 * Shows all layer settings in a horizontal row for quick access.
	 */
	import {
		analyzeJsonStructure,
		getColorPalette,
		getChartType,
		setChartType
	} from '$lib/stores/chartBuilder.svelte.js';
	import Icon from '$lib/components/Icon.svelte';

	/**
	 * @typedef {import('$lib/stores/chartBuilder.svelte.js').DataLayer} DataLayer
	 */

	/**
	 * @typedef {Object} Props
	 * @property {DataLayer[]} layers
	 * @property {string} selectedLayerId
	 * @property {(layerId: string) => void} onSelectLayer
	 * @property {() => void} onAddLayer
	 * @property {(layerId: string) => void} onRemoveLayer
	 * @property {(layerId: string, endpoint: string) => void} onFetch
	 * @property {(layerId: string, updates: Partial<DataLayer>) => void} onLayerUpdate
	 * @property {(layerId: string, mapping: Partial<DataLayer['mapping']>) => void} onMappingUpdate
	 * @property {(layerId: string) => void} onToggleVisibility
	 */

	/** @type {Props} */
	let {
		layers,
		selectedLayerId,
		onSelectLayer,
		onAddLayer,
		onRemoveLayer,
		onFetch,
		onLayerUpdate,
		onMappingUpdate,
		onToggleVisibility
	} = $props();

	// Chart type state
	let chartType = $derived(getChartType());

	const colorPalette = getColorPalette();

	// Get currently selected layer
	let selectedLayer = $derived(layers.find((l) => l.id === selectedLayerId) ?? layers[0]);

	// Analyze the response structure for the selected layer
	let analyzedStructure = $derived(
		selectedLayer?.response ? analyzeJsonStructure(selectedLayer.response) : []
	);

	// Get selected array's properties
	let selectedArray = $derived(
		analyzedStructure.find(
			(a) =>
				(a.path === '(root)' && selectedLayer?.mapping.dataPath === '') ||
				a.path === selectedLayer?.mapping.dataPath
		)
	);

	// Filter numeric properties for Y-axis
	let numericProperties = $derived(
		selectedArray?.properties.filter((p) => p.type === 'number') ?? []
	);

	// All properties for X-axis
	let allProperties = $derived(selectedArray?.properties ?? []);

	// Local endpoint state for editing
	let editedEndpoint = $state('');
	let hasEdited = $state(false);

	// Sync edited endpoint when layer changes
	$effect(() => {
		if (selectedLayer) {
			editedEndpoint = selectedLayer.endpoint;
			hasEdited = false;
		}
	});

	const defaultEndpoint = 'https://mlendpoints.bulletpages.com/';
	let displayEndpoint = $derived(hasEdited ? editedEndpoint : selectedLayer?.endpoint || defaultEndpoint);

	function handleEndpointInput(e) {
		hasEdited = true;
		editedEndpoint = e.target.value;
	}

	function handleFetch() {
		if (selectedLayer && displayEndpoint.trim()) {
			onLayerUpdate(selectedLayer.id, { endpoint: displayEndpoint.trim() });
			onFetch(selectedLayer.id, displayEndpoint.trim());
			hasEdited = false;
		}
	}

	function handleKeydown(e) {
		if (e.key === 'Enter') {
			handleFetch();
		}
	}

	function handleDataPathChange(e) {
		if (!selectedLayer) return;
		const value = e.target.value === '(root)' ? '' : e.target.value;
		onMappingUpdate(selectedLayer.id, { dataPath: value, xProp: '', yProp: '', labelProp: '' });
	}

	function handleXPropChange(e) {
		if (!selectedLayer) return;
		onMappingUpdate(selectedLayer.id, { xProp: e.target.value });
	}

	function handleYPropChange(e) {
		if (!selectedLayer) return;
		onMappingUpdate(selectedLayer.id, { yProp: e.target.value });
	}

	function handleColorChange(color) {
		if (!selectedLayer) return;
		onMappingUpdate(selectedLayer.id, { color });
	}

	// Color picker popover state
	let showColorPicker = $state(false);
</script>

<div
	class="flex shrink-0 flex-wrap items-center gap-2 border-b border-slate-200 bg-slate-800/90 shadow-lg shadow-slate-900/10 backdrop-blur-md px-3 py-2 dark:border-slate-700 dark:bg-slate-800/95 dark:shadow-slate-900/50"
>
	<!-- Chart Type Toggle -->
	<div class="flex rounded-lg border border-slate-300 bg-slate-100 p-0.5 dark:border-slate-600 dark:bg-slate-700">
		<button
			type="button"
			onclick={() => setChartType('bar')}
			class="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors {chartType === 'bar'
				? 'bg-[#CCEBD4] text-slate-900 shadow-sm dark:bg-[#887B40] dark:text-slate-100'
				: 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'}"
			aria-label="Bar chart"
			title="Bar chart"
		>
			<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
			</svg>
		</button>
		<button
			type="button"
			onclick={() => setChartType('line')}
			class="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors {chartType === 'line'
				? 'bg-[#CCEBD4] text-slate-900 shadow-sm dark:bg-[#887B40] dark:text-slate-100'
				: 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'}"
			aria-label="Line chart"
			title="Line chart"
		>
			<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
			</svg>
		</button>
	</div>

	<div class="h-6 w-px bg-slate-300 dark:bg-slate-600"></div>

	<!-- Layer Selector -->
	<div class="flex items-center gap-1.5">
		<label
			for="layer-select"
			class="dm-mono hidden text-[10px] font-medium tracking-wider text-slate-500 uppercase sm:block dark:text-slate-400"
		>
			Layer
		</label>
		<!-- Color Picker -->
		{#if selectedLayer}
			<div class="relative">
				<button
					type="button"
					onclick={() => (showColorPicker = !showColorPicker)}
					class="flex h-6 w-6 items-center justify-center rounded-full border border-slate-300 transition-colors hover:border-slate-400 dark:border-slate-600 dark:hover:border-slate-500"
					style="background-color: {selectedLayer.mapping.color}"
					aria-label="Change color"
					title="Change color"
				></button>
				{#if showColorPicker}
					<div class="absolute top-full left-0 z-50 mt-1 flex gap-1 rounded-lg border border-slate-200 bg-white p-2 shadow-lg dark:border-slate-700 dark:bg-slate-800">
						{#each colorPalette as color (color)}
							<button
								type="button"
								onclick={() => {
									handleColorChange(color);
									showColorPicker = false;
								}}
								class="h-6 w-6 rounded border-2 transition-all {selectedLayer.mapping.color === color
									? 'scale-110 border-slate-900 dark:border-white'
									: 'border-transparent hover:scale-105'}"
								style="background-color: {color}"
								aria-label="Select color {color}"
							></button>
						{/each}
					</div>
				{/if}
			</div>
		{/if}
		<div class="flex items-center gap-1">
			<select
				id="layer-select"
				value={selectedLayerId}
				onchange={(e) => onSelectLayer(e.target.value)}
				class="dm-mono h-8 rounded border border-slate-300 bg-white px-2 pr-7 text-xs text-slate-900 focus:border-[#CCEBD4] focus:ring-1 focus:ring-[#CCEBD4] focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:focus:border-[#887B40] dark:focus:ring-[#887B40]"
			>
				{#each layers as layer (layer.id)}
					<option value={layer.id}>
						{layer.name}
					</option>
				{/each}
			</select>
			<!-- Visibility Toggle -->
			{#if selectedLayer}
				<button
					type="button"
					onclick={() => selectedLayer && onToggleVisibility(selectedLayer.id)}
					class="flex h-8 w-8 items-center justify-center rounded border transition-colors {selectedLayer.visible
						? 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
						: 'border-slate-300 bg-white text-slate-400 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-500'}"
					aria-label={selectedLayer.visible ? 'Hide layer' : 'Show layer'}
					title={selectedLayer.visible ? 'Hide layer' : 'Show layer'}
				>
					{#if selectedLayer.visible}
						<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
						</svg>
					{:else}
						<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
						</svg>
					{/if}
				</button>
			{/if}
			<button
				type="button"
				onclick={onAddLayer}
				class="flex h-8 w-8 items-center justify-center rounded border border-slate-300 bg-white text-slate-600 transition-colors hover:bg-[#CCEBD4]/30 hover:border-[#CCEBD4] hover:text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-400 dark:hover:bg-[#887B40]/20 dark:hover:border-[#887B40] dark:hover:text-slate-200"
				aria-label="Add layer"
				title="Add layer"
			>
				<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
				</svg>
			</button>
			{#if layers.length > 1}
				<button
					type="button"
					onclick={() => selectedLayer && onRemoveLayer(selectedLayer.id)}
					class="flex h-8 w-8 items-center justify-center rounded border border-slate-300 bg-white text-slate-600 transition-colors hover:bg-red-50 hover:border-red-400 hover:text-red-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-400 dark:hover:bg-red-900/20 dark:hover:border-red-500"
					aria-label="Remove layer"
					title="Remove layer"
				>
					<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			{/if}
		</div>
	</div>

	<div class="h-6 w-px bg-slate-300 dark:bg-slate-600"></div>

	<!-- API Endpoint -->
	<div class="flex min-w-0 flex-1 items-center gap-1.5">
		<label
			for="endpoint-input"
			class="dm-mono hidden text-[10px] font-medium tracking-wider text-slate-500 uppercase lg:block dark:text-slate-400"
		>
			API
		</label>
		<div class="flex min-w-0 flex-1 items-center gap-1">
			<input
				id="endpoint-input"
				type="url"
				value={displayEndpoint}
				oninput={handleEndpointInput}
				onkeydown={handleKeydown}
				placeholder="https://api.example.com/data"
				class="dm-mono h-8 min-w-0 flex-1 rounded border border-slate-300 bg-white px-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[#CCEBD4] focus:ring-1 focus:ring-[#CCEBD4] focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-[#887B40] dark:focus:ring-[#887B40]"
			/>
			<button
				type="button"
				onclick={handleFetch}
				disabled={selectedLayer?.isLoading || !displayEndpoint.trim()}
				class="flex h-8 items-center gap-1.5 rounded bg-[#CCEBD4] px-2.5 text-xs font-medium text-slate-900 transition-colors hover:bg-[#b8dcc4] disabled:bg-slate-300 dark:bg-[#887B40] dark:text-slate-100 dark:hover:bg-[#9a8d4d] dark:disabled:bg-slate-600"
			>
				{#if selectedLayer?.isLoading}
					<Icon name="Spinner" class="h-3.5 w-3.5 animate-spin" />
				{:else}
					<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
					</svg>
				{/if}
				<span class="hidden sm:inline">Fetch</span>
			</button>
		</div>
	</div>

	{#if selectedLayer?.response && analyzedStructure.length > 0}
		<div class="h-6 w-px bg-slate-300 dark:bg-slate-600"></div>

		<!-- Data Array (only show if more than one option) -->
		{#if analyzedStructure.length > 1}
			<div class="flex items-center gap-1.5">
				<label
					for="data-array-select"
					class="dm-mono hidden text-[10px] font-medium tracking-wider text-slate-500 uppercase xl:block dark:text-slate-400"
				>
					Array
				</label>
				<select
					id="data-array-select"
					value={selectedLayer.mapping.dataPath || '(root)'}
					onchange={handleDataPathChange}
					class="dm-mono h-8 rounded border border-slate-300 bg-white px-2 pr-6 text-xs text-slate-900 focus:border-[#CCEBD4] focus:ring-1 focus:ring-[#CCEBD4] focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:focus:border-[#887B40] dark:focus:ring-[#887B40]"
				>
					{#each analyzedStructure as array (array.path)}
						<option value={array.path}>
							{array.path}
						</option>
					{/each}
				</select>
			</div>
		{/if}

		<!-- X-Axis -->
		<div class="flex items-center gap-1.5">
			<label
				for="x-axis-select"
				class="dm-mono hidden text-[10px] font-medium tracking-wider text-slate-500 uppercase xl:block dark:text-slate-400"
			>
				X
			</label>
			<select
				id="x-axis-select"
				value={selectedLayer.mapping.xProp}
				onchange={handleXPropChange}
				class="dm-mono h-8 rounded border border-slate-300 bg-white px-2 pr-6 text-xs text-slate-900 focus:border-[#CCEBD4] focus:ring-1 focus:ring-[#CCEBD4] focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:focus:border-[#887B40] dark:focus:ring-[#887B40]"
			>
				<option value="">X axis...</option>
				{#each allProperties as prop (prop.name)}
					<option value={prop.name}>{prop.name}</option>
				{/each}
			</select>
		</div>

		<!-- Y-Axis -->
		<div class="flex items-center gap-1.5">
			<label
				for="y-axis-select"
				class="dm-mono hidden text-[10px] font-medium tracking-wider text-slate-500 uppercase xl:block dark:text-slate-400"
			>
				Y
			</label>
			<select
				id="y-axis-select"
				value={selectedLayer.mapping.yProp}
				onchange={handleYPropChange}
				class="dm-mono h-8 rounded border border-slate-300 bg-white px-2 pr-6 text-xs text-slate-900 focus:border-[#CCEBD4] focus:ring-1 focus:ring-[#CCEBD4] focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:focus:border-[#887B40] dark:focus:ring-[#887B40]"
			>
				<option value="">Y axis...</option>
				{#each numericProperties as prop (prop.name)}
					<option value={prop.name}>{prop.name}</option>
				{/each}
			</select>
		</div>
	{/if}

	<!-- Status Badge -->
	{#if selectedLayer}
		<div class="ml-auto flex items-center">
			{#if selectedLayer.isLoading}
				<span class="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
					Loading...
				</span>
			{:else if selectedLayer.error}
				<span class="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400" title={selectedLayer.error}>
					Error
				</span>
			{:else if selectedLayer.response && selectedLayer.mapping.xProp && selectedLayer.mapping.yProp}
				<span class="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
					Ready
				</span>
			{:else if selectedLayer.response}
				<span class="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
					Configure
				</span>
			{/if}
		</div>
	{/if}
</div>

<!-- Close color picker when clicking outside -->
<svelte:window
	onclick={(e) => {
		if (showColorPicker && !e.target?.closest?.('[aria-label="Change color"]')?.parentElement) {
			showColorPicker = false;
		}
	}}
/>
