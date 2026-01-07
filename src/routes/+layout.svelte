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
	import { navItems } from '$lib/data/navigation.js';
	import { untrack } from 'svelte';
	import { getTheme, initTheme } from '$lib/stores/theme.svelte.js';

	let { children, data } = $props();

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

<div class="min-h-screen bg-white dark:bg-slate-900 transition-colors duration-200">
	<Header {navItems} />
	<main class="flex-1">
		{@render children()}
	</main>
	<Footer />
</div>
