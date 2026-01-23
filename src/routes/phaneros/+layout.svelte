<script>
	/**
	 * Phaneros Admin Panel Layout
	 *
	 * Full-viewport app shell with no Header/Footer from the main site.
	 * Provides its own minimal header with theme toggle and layer toolbar.
	 */
	import { untrack } from 'svelte';
	import { getTheme, initTheme, toggleTheme } from '$lib/stores/theme.svelte.js';
	import {
		getLayers,
		getChartConfig,
		setChartConfig,
		getAllChartData,
		addLayer,
		removeLayer,
		updateLayer,
		updateLayerMapping,
		toggleLayerVisibility,
		fetchLayerData
	} from '$lib/stores/chartBuilder.svelte.js';
	import Icon from '$lib/components/Icon.svelte';
	import { resolve } from '$app/paths';
	import LayerToolbar from './_components/LayerToolbar.svelte';

	let { children, data } = $props();

	// Initialize theme from server cookie (runs once on mount)
	$effect(() => {
		untrack(() => initTheme(data.theme));
	});

	// Apply dark class to html element whenever theme changes
	$effect(() => {
		const theme = getTheme();
		if (typeof document !== 'undefined') {
			document.documentElement.classList.toggle('dark', theme === 'dark');
		}
	});

	// Reactive store values for toolbar
	let layers = $derived(getLayers());
	let chartConfig = $derived(getChartConfig());
	let chartData = $derived(getAllChartData());

	// Track selected layer
	let selectedLayerId = $state('');

	// Initialize selected layer
	$effect(() => {
		if (!selectedLayerId && layers.length > 0) {
			selectedLayerId = layers[0].id;
		}
		// If selected layer was removed, select first available
		if (selectedLayerId && !layers.find((l) => l.id === selectedLayerId)) {
			selectedLayerId = layers[0]?.id ?? '';
		}
	});

	function handleAddLayer() {
		const newId = addLayer();
		selectedLayerId = newId;
	}

	function handleRemoveLayer(layerId) {
		removeLayer(layerId);
	}

	// Calculate total data points
	let totalDataPoints = $derived(chartData.reduce((sum, l) => sum + l.data.length, 0));
	let visibleLayerCount = $derived(chartData.length);
</script>

<div
	class="flex h-screen flex-col overflow-hidden bg-slate-100 transition-colors duration-200 dark:bg-slate-800"
>
	<!-- Minimal Admin Header -->
	<header
		class="flex h-14 shrink-0 items-center justify-between border-b border-slate-300 bg-[#11151a] px-4 dark:border-slate-600 dark:bg-[#11151a]"
	>
		<div class="flex items-center gap-3">
			<a
				href={resolve('/')}
				class="flex items-center gap-2 text-slate-200 transition-colors hover:text-emerald-400 dark:text-slate-200 dark:hover:text-emerald-400"
				aria-label="Back to home"
			>
				<svg
					class="h-5 w-5"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					aria-hidden="true"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M10 19l-7-7m0 0l7-7m-7 7h18"
					/>
				</svg>
			</a>
			<div class="h-6 w-px bg-slate-600 dark:bg-slate-600"></div>
			<span class="dm-mono text-xl font-semibold text-slate-200 dark:text-slate-200">
				Phaner<span class="bg-[#CCEBD4] w-[13px] h-[13px] relative top-[0.8px] left-[0.7px] rounded-full inline-block mx-px"></span>s
			</span>
		</div>

		<div class="flex items-center gap-2">
			<button
				onclick={toggleTheme}
				class="flex h-8 w-8 items-center justify-center rounded-lg text-slate-200 transition-colors hover:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
				aria-label="Toggle dark mode"
			>
				{#if getTheme() === 'dark'}
					<Icon name="MoonFilled" class="h-5 w-5" />
				{:else}
					<Icon name="Moon" class="h-5 w-5" />
				{/if}
			</button>
		</div>
	</header>

	<!-- Layer Toolbar -->
	<LayerToolbar
		{layers}
		{selectedLayerId}
		onSelectLayer={(id) => (selectedLayerId = id)}
		onAddLayer={handleAddLayer}
		onRemoveLayer={handleRemoveLayer}
		onFetch={fetchLayerData}
		onLayerUpdate={updateLayer}
		onMappingUpdate={updateLayerMapping}
		onToggleVisibility={toggleLayerVisibility}
	/>

	<!-- Main Content Area -->
	<main class="min-h-0 flex-1 overflow-hidden">
		{@render children()}
	</main>

	<!-- Fixed Status Bar -->
	<footer
		class="flex h-8 shrink-0 items-center justify-between border-t border-slate-200 bg-white px-4 dark:border-slate-700 dark:bg-slate-800"
	>
		<div class="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
			<span>
				<span class="font-medium text-slate-700 dark:text-slate-300">{totalDataPoints}</span>
				data point{totalDataPoints !== 1 ? 's' : ''}
			</span>
			<span class="text-slate-300 dark:text-slate-600">•</span>
			<span>
				<span class="font-medium text-slate-700 dark:text-slate-300">{visibleLayerCount}</span>
				visible layer{visibleLayerCount !== 1 ? 's' : ''}
			</span>
			<span class="text-slate-300 dark:text-slate-600">•</span>
			<span>
				<span class="font-medium text-slate-700 dark:text-slate-300">{layers.length}</span>
				total layer{layers.length !== 1 ? 's' : ''}
			</span>
		</div>
		<div class="dm-mono text-[10px] text-slate-400 dark:text-slate-500">
			Phaneros Chart Builder
		</div>
	</footer>
</div>
