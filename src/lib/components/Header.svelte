<script>
	import Icon from '$lib/components/Icon.svelte';
	import { getTheme, toggleTheme } from '$lib/stores/theme.svelte.js';

	/** @type {{ navItems: Array<{ label: string; href: string; isActive: boolean }> }} */
	let { navItems = [] } = $props();
</script>

<header
	class="bg-white dark:bg-slate-900 border-b border-[#ECEEF5] dark:border-slate-700 h-[80px] font-instrument-sans transition-colors duration-200"
>
	<div class="w-full h-full max-w-7xl mx-auto px-3 grid grid-cols-[1fr_auto_1fr] items-center">
		<!-- Left: Logo -->
		<div class="justify-self-start">
			<a href="/" class="block">
				<img src="/ML-Commons-Logo.svg" alt="ML Commons" class="h-10 dark:invert" />
			</a>
		</div>

		<!-- Center: Navigation (true center) -->
		<nav class="flex gap-6 items-center h-full" aria-label="Main navigation">
			{#each navItems as item (item.label)}
				<a
					href={item.href}
					target="_blank"
					class="px-2 py-1 {item.isActive
						? 'border-b-2 border-[#CCEBD4] flex items-center justify-center h-full dark:border-emerald-600 text-slate-900 dark:text-white'
						: 'text-slate-900 dark:text-slate-300 hover:text-slate-600 dark:hover:text-white'}"
				>
					{item.label}
				</a>
			{/each}
		</nav>

		<!-- Right: Action buttons -->
		<div class="justify-self-end flex items-center gap-2">
			<a
				href="https://mlcommons.org/get-involved/"
				target="_blank"
				class="bg-[#CCEBD4] dark:bg-emerald-600 px-6 flex items-center justify-center h-10 rounded-full text-[#10141F] dark:text-white transition-colors duration-200"
			>
				Get Involved
			</a>
			<button
				class="bg-[#10141F] dark:bg-slate-700 text-white rounded-full h-8 w-8 flex items-center justify-center transition-colors duration-200"
				aria-label="Search"
			>
				<Icon name="Search" class="h-[18px] w-[18px]" />
			</button>
			<button
				onclick={toggleTheme}
				class="text-slate-900 dark:text-white hover:text-slate-600 dark:hover:text-slate-300 transition-colors duration-200"
				aria-label="Toggle dark mode"
			>
				{#if getTheme() === 'dark'}
					<Icon name="MoonFilled" class="h-6 w-6" />
				{:else}
					<Icon name="Moon" class="h-6 w-6" />
				{/if}
			</button>
		</div>
	</div>
</header>

