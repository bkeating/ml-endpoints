<script>
	/**
	 * Chart Builder Main Component
	 *
	 * Streamlined chart preview with toolbar-based configuration.
	 * All layer configuration is handled by the LayerToolbar in the layout.
	 */
	import { slide } from 'svelte/transition';
	import ChartPreview from './ChartPreview.svelte';
	import {
		getChartType,
		getLayers,
		getChartConfig,
		setChartConfig,
		getAllChartData,
		buildChartPayload
	} from '$lib/stores/chartBuilder.svelte.js';

	// Reactive store values
	let chartType = $derived(getChartType());
	let layers = $derived(getLayers());
	let chartConfig = $derived(getChartConfig());
	let chartData = $derived(getAllChartData());

	// Preview container for responsive sizing
	let previewContainerWidth = $state(0);
	let chartContainerWidth = $state(0);

	// Sidebar state
	let showPayloadSidebar = $state(false);
	let sidebarWidth = $state(384); // Default width in pixels (w-96 = 384px)
	const minSidebarWidth = 300;
	const maxSidebarWidth = 800;
	let selectedLayerId = $state('');

	// Drag state
	let isDragging = $state(false);
	let dragStartX = $state(0);
	let dragStartWidth = $state(0);

	// Get layers with responses
	let layersWithResponses = $derived(layers.filter((l) => l.response !== null));

	// Initialize selected layer when sidebar opens or layers change
	$effect(() => {
		if (showPayloadSidebar && layersWithResponses.length > 0) {
			// If no selection or selected layer no longer has response, select first available
			if (
				!selectedLayerId ||
				!layersWithResponses.find((l) => l.id === selectedLayerId)
			) {
				selectedLayerId = layersWithResponses[0].id;
			}
		}
	});

	// Get selected layer's response JSON
	let selectedLayer = $derived(layers.find((l) => l.id === selectedLayerId));
	let formattedPayload = $derived(
		selectedLayer?.response ? JSON.stringify(selectedLayer.response, null, 2) : ''
	);

	// Handle drag start
	function handleDragStart(e) {
		isDragging = true;
		dragStartX = e.clientX;
		dragStartWidth = sidebarWidth;
		e.preventDefault();
	}

	// Handle drag
	function handleDrag(e) {
		if (!isDragging) return;
		const deltaX = dragStartX - e.clientX; // Inverted because we're dragging left edge
		const newWidth = Math.max(
			minSidebarWidth,
			Math.min(maxSidebarWidth, dragStartWidth + deltaX)
		);
		sidebarWidth = newWidth;
	}

	// Handle drag end
	function handleDragEnd() {
		isDragging = false;
	}

	// Set up global mouse event listeners
	$effect(() => {
		if (isDragging) {
			const handleMouseMove = (e) => handleDrag(e);
			const handleMouseUp = () => handleDragEnd();

			// Prevent text selection while dragging
			document.body.style.cursor = 'col-resize';
			document.body.style.userSelect = 'none';

			window.addEventListener('mousemove', handleMouseMove);
			window.addEventListener('mouseup', handleMouseUp);

			return () => {
				window.removeEventListener('mousemove', handleMouseMove);
				window.removeEventListener('mouseup', handleMouseUp);
				document.body.style.cursor = '';
				document.body.style.userSelect = '';
			};
		}
	});

	/**
	 * Format property name to a readable label
	 * @param {string} propName
	 * @returns {string}
	 */
	function formatPropertyLabel(propName) {
		if (!propName) return '';
		// Convert camelCase to Title Case
		return propName
			.replace(/([A-Z])/g, ' $1')
			.replace(/^./, (str) => str.toUpperCase())
			.trim();
	}

	// Derive axis labels from the first visible layer's mapping
	let xAxisLabel = $derived.by(() => {
		const visibleLayer = layers.find((l) => l.visible && l.mapping.xProp);
		return visibleLayer?.mapping.xProp ? formatPropertyLabel(visibleLayer.mapping.xProp) : 'X Axis';
	});

	let yAxisLabel = $derived.by(() => {
		const visibleLayer = layers.find((l) => l.visible && l.mapping.yProp);
		return visibleLayer?.mapping.yProp ? formatPropertyLabel(visibleLayer.mapping.yProp) : 'Y Axis';
	});
</script>

<!-- Chart Preview Area -->
<div class="flex h-full overflow-hidden bg-slate-100 dark:bg-slate-900">
	<!-- Main Chart Area -->
	<div
		class="flex min-w-0 flex-1 items-start justify-center overflow-auto bg-slate-100 p-6 dark:bg-slate-900"
		bind:clientWidth={chartContainerWidth}
	>
		{#if chartContainerWidth > 0}
			<div class="w-full max-w-7xl">
				<ChartPreview
					{chartType}
					layers={chartData}
					title={chartConfig.title}
					xAxisLabel={xAxisLabel}
					yAxisLabel={yAxisLabel}
					width={Math.min(chartContainerWidth - 48, 1280)}
					height={400}
					showPayloadToggle={true}
					onTogglePayload={() => (showPayloadSidebar = !showPayloadSidebar)}
					chartTitle={chartConfig.title}
					onChartTitleChange={(title) => setChartConfig({ title })}
					onSave={() => {
						const payload = buildChartPayload();
						console.log('=== CHART SAVE PAYLOAD ===');
						console.log('POST /api/charts');
						console.log(JSON.stringify(payload, null, 2));
						console.log('=========================');
					}}
				/>
			</div>
		{/if}
	</div>

	<!-- JSON Payload Sidebar -->
	{#if showPayloadSidebar}
		<div
			transition:slide={{ axis: 'x', duration: 200 }}
			class="relative flex h-full shrink-0 flex-col border-l border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800"
			style="width: {sidebarWidth}px;"
		>
			<!-- Resize Handle -->
			<button
				type="button"
				class="absolute left-0 top-0 z-10 h-full w-1 cursor-col-resize bg-transparent transition-colors hover:bg-[#CCEBD4] dark:hover:bg-[#887B40] {isDragging
					? 'bg-[#b8dcc4] dark:bg-[#9a8d4d]'
					: ''}"
				onmousedown={handleDragStart}
				aria-label="Resize sidebar"
			></button>
			<!-- Header -->
			<div
				class="flex shrink-0 items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/50"
			>
				<h3
					class="dm-mono text-sm font-semibold tracking-wide text-slate-700 uppercase dark:text-slate-300"
				>
					API Responses
				</h3>
				<button
					type="button"
					onclick={() => (showPayloadSidebar = false)}
					class="flex h-7 w-7 items-center justify-center rounded text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-300"
					aria-label="Close sidebar"
				>
					<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>

			<!-- Layer List -->
			<div class="shrink-0 border-b border-slate-200 dark:border-slate-700">
				<div class="max-h-48 overflow-y-auto p-2">
					{#if layersWithResponses.length === 0}
						<div class="py-4 text-center text-xs text-slate-500 dark:text-slate-400">
							No API responses yet
						</div>
					{:else}
						<div class="space-y-1">
							{#each layersWithResponses as layer (layer.id)}
								<button
									type="button"
									onclick={() => (selectedLayerId = layer.id)}
									class="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-xs transition-colors {selectedLayerId === layer.id
										? 'bg-[#CCEBD4] text-slate-900 dark:bg-[#887B40] dark:text-slate-100'
										: 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700'}"
								>
									<!-- Color Indicator -->
									<div
										class="h-3 w-3 shrink-0 rounded-full"
										style="background-color: {layer.mapping.color}"
									></div>
									<!-- Layer Name -->
									<span class="min-w-0 flex-1 truncate font-medium">{layer.name}</span>
									<!-- Status Indicator -->
									{#if layer.error}
										<svg class="h-3.5 w-3.5 shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
										</svg>
									{:else if layer.response}
										<svg class="h-3.5 w-3.5 shrink-0 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
										</svg>
									{/if}
								</button>
							{/each}
						</div>
					{/if}
				</div>
			</div>

			<!-- JSON Content -->
			<div class="min-h-0 flex-1 overflow-auto p-4">
				{#if selectedLayer && formattedPayload}
					<pre
						class="dm-mono h-full overflow-auto rounded-lg bg-slate-900 p-4 text-xs text-slate-100 dark:bg-slate-950"
					><code>{formattedPayload}</code></pre>
				{:else}
					<div class="flex h-full items-center justify-center text-xs text-slate-500 dark:text-slate-400">
						Select a layer to view its API response
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>
