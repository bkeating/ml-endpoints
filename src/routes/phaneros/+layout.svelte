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
	import { resolve } from '$app/paths';

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

<div
	class="flex h-screen flex-col overflow-hidden bg-slate-100 transition-colors duration-200 dark:bg-slate-900"
>
	<!-- Minimal Admin Header -->
	<header
		class="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 dark:border-slate-700 dark:bg-slate-800"
	>
		<div class="flex items-center gap-3">
			<a
				href={resolve('/')}
				class="flex items-center gap-2 text-slate-700 transition-colors hover:text-emerald-600 dark:text-slate-200 dark:hover:text-emerald-400"
				aria-label="Back to home"
			>
				<svg
					class="h-6 w-6"
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
			<div class="h-6 w-px bg-slate-200 dark:bg-slate-700"></div>
			<h1 class="font-instrument-sans text-lg font-semibold text-slate-800 dark:text-slate-200">
				Phaneros
			</h1>
			<span
				class="dm-mono rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400"
			>
				Admin
			</span>
		</div>

		<div class="flex items-center gap-2">
			<button
				onclick={toggleTheme}
				class="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
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
