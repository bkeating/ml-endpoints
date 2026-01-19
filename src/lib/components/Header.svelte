<script>
	import Icon from '$lib/components/Icon.svelte';
	import { getTheme, toggleTheme } from '$lib/stores/theme.svelte.js';

	/** @type {{ navItems: Array<{ label: string; href: string; isActive: boolean }> }} */
	let { navItems = [] } = $props();

	/** Mobile drawer open state */
	let isDrawerOpen = $state(false);

	/** Toggle mobile drawer */
	const toggleDrawer = () => {
		isDrawerOpen = !isDrawerOpen;
	};

	/** Close drawer when clicking overlay */
	const closeDrawer = () => {
		isDrawerOpen = false;
	};
</script>

<header
	class="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-[#ECEEF5] dark:border-slate-700 h-[80px] font-instrument-sans transition-colors duration-200"
>
	<div class="w-full h-full max-w-7xl mx-auto px-3 flex md:grid md:grid-cols-[1fr_auto_1fr] items-center justify-between">
		<!-- Left: Logo -->
		<div class="justify-self-start">
			<a href="/" class="block">
				<img
					src={getTheme() === 'dark' ? '/ML-Commons-Logo-Dark.svg' : '/ML-Commons-Logo.svg'}
					alt="ML Commons"
					class="h-10"
				/>
			</a>
		</div>

		<!-- Center: Navigation (hidden on mobile) -->
		<nav class="hidden md:flex gap-6 items-center h-full" aria-label="Main navigation">
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

		<!-- Right: Action buttons (hidden on mobile) -->
		<div class="hidden md:flex justify-self-end items-center gap-2">
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

		<!-- Mobile: Hamburger menu button -->
		<button
			class="md:hidden flex items-center justify-center h-10 w-10 rounded-lg text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200"
			onclick={toggleDrawer}
			aria-label="Open menu"
			aria-expanded={isDrawerOpen}
		>
			<Icon name="Menu" class="h-6 w-6" />
		</button>
	</div>
</header>

<!-- Mobile Drawer Overlay -->
{#if isDrawerOpen}
	<div
		class="fixed inset-0 bg-black/50 z-40 md:hidden"
		onclick={closeDrawer}
		onkeydown={(e) => e.key === 'Escape' && closeDrawer()}
		role="button"
		tabindex="-1"
		aria-label="Close menu"
	></div>
{/if}

<!-- Mobile Drawer -->
<div
	class="fixed top-0 right-0 h-full w-72 bg-white dark:bg-slate-900 z-50 transform transition-transform duration-300 ease-out md:hidden shadow-2xl {isDrawerOpen ? 'translate-x-0' : 'translate-x-full'}"
>
	<!-- Drawer Header -->
	<div class="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
		<span class="text-lg font-semibold text-slate-900 dark:text-white">Menu</span>
		<button
			onclick={closeDrawer}
			class="h-10 w-10 flex items-center justify-center rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200"
			aria-label="Close menu"
		>
			<Icon name="Close" class="h-6 w-6" />
		</button>
	</div>

	<!-- Drawer Content -->
	<nav class="flex flex-col p-4" aria-label="Mobile navigation">
		<!-- Navigation Links -->
		{#each navItems as item (item.label)}
			<a
				href={item.href}
				target="_blank"
				onclick={closeDrawer}
				class="py-3 px-4 rounded-lg text-slate-900 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200 {item.isActive ? 'bg-[#CCEBD4]/20 dark:bg-emerald-600/20 border-l-4 border-[#CCEBD4] dark:border-emerald-600' : ''}"
			>
				{item.label}
			</a>
		{/each}

		<!-- Divider -->
		<hr class="my-4 border-slate-200 dark:border-slate-700" />

		<!-- Search Button -->
		<button
			class="flex items-center gap-3 py-3 px-4 rounded-lg text-slate-900 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200"
			aria-label="Search"
		>
			<Icon name="Search" class="h-5 w-5" />
			<span>Search</span>
		</button>

		<!-- Theme Toggle -->
		<button
			onclick={() => { toggleTheme(); }}
			class="flex items-center gap-3 py-3 px-4 rounded-lg text-slate-900 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200"
		>
			{#if getTheme() === 'dark'}
				<Icon name="MoonFilled" class="h-5 w-5" />
				<span>Dark Mode</span>
			{:else}
				<Icon name="Moon" class="h-5 w-5" />
				<span>Light Mode</span>
			{/if}
		</button>

		<!-- Get Involved CTA -->
		<a
			href="https://mlcommons.org/get-involved/"
			target="_blank"
			onclick={closeDrawer}
			class="mt-4 bg-[#CCEBD4] dark:bg-emerald-600 py-3 px-6 flex items-center justify-center rounded-full text-[#10141F] dark:text-white font-medium transition-colors duration-200"
		>
			Get Involved
		</a>
	</nav>
</div>
