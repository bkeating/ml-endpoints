<script>
	/**
	 * Root layout component that wraps all pages.
	 *
	 * Key patterns demonstrated:
	 * - $effect() runs side effects when reactive values change (like useEffect in React)
	 * - untrack() prevents the effect from re-running when initTheme's internal state changes
	 * - Theme initialization happens once on mount, then reactive updates apply the dark class
	 */
	import './app.css';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { navItems } from '$lib/data/index.js';
	import { untrack } from 'svelte';
	import { getTheme, initTheme } from '$lib/stores/theme.svelte.js';
	import { page } from '$app/state';

	let { children, data } = $props();

	// Check if we're in the admin panel (full-viewport app shell)
	let isAdminPanel = $derived(page.url?.pathname?.startsWith('/phaneros') ?? false);

	// Initialize theme from server cookie (runs once on mount)
	// untrack() prevents this effect from re-running when theme state changes
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

{#if isAdminPanel}
	<!-- Admin panel uses its own layout without Header/Footer -->
	{@render children()}
{:else}
	<div class="min-h-screen bg-white transition-colors duration-200 dark:bg-slate-900">
		<Header {navItems} />
		<main class="flex-1 relative">
			<!-- Faint background pattern layer -->
			<div
				class="pointer-events-none absolute inset-0 z-0 opacity-70 dark:opacity-[0.02]"
				aria-hidden="true"
				style="
					background-image: url('/brand/bg-pattern-squares.svg');
					background-position: 50% 0%;
					background-repeat: repeat;
				"
			></div>
			<!-- Main page content -->
			<div class="relative z-10">
				{@render children()}
			</div>
		</main>
		<Footer />
	</div>
{/if}
