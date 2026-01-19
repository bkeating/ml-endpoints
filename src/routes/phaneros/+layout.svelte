<script>
	/**
	 * Phaneros Admin Panel Layout
	 * 
	 * Full-viewport app shell with no Header/Footer from the main site.
	 * Provides its own minimal header with theme toggle.
	 */
	import { untrack } from 'svelte';
	import { getTheme, initTheme, toggleTheme } from '$lib/stores/theme.svelte.js';
	import Icon from '$lib/components/Icon.svelte';

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
</script>

<div class="h-screen flex flex-col bg-slate-100 dark:bg-slate-900 transition-colors duration-200 overflow-hidden">
	<!-- Minimal Admin Header -->
	<header class="h-14 shrink-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 flex items-center justify-between">
		<div class="flex items-center gap-3">
			<a href="/" class="flex items-center gap-2 text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
				<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
				</svg>
			</a>
			<div class="h-6 w-px bg-slate-200 dark:bg-slate-700"></div>
			<h1 class="text-lg font-semibold text-slate-800 dark:text-slate-200 font-instrument-sans">
				Phaneros
			</h1>
			<span class="text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 dm-mono">
				Admin
			</span>
		</div>

		<div class="flex items-center gap-2">
			<button
				onclick={toggleTheme}
				class="h-8 w-8 flex items-center justify-center rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
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

	<!-- Main Content Area -->
	<main class="flex-1 overflow-hidden">
		{@render children()}
	</main>
</div>
