<script>
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import Icon from '$lib/components/Icon.svelte';
	import { navItems, isNavItemActive } from '$lib/data/navigation.js';
	import { getTheme, toggleTheme } from '$lib/stores/theme.svelte.js';
	import { getMobileFiltersOpen, toggleMobileFilters } from '$lib/stores/pageSettings.svelte.js';

	let isDrawerOpen = $state(false);
	let mobileFiltersOpen = $derived(getMobileFiltersOpen());
	let computedNavItems = $derived(
		navItems.map((item) => ({
			...item,
			isActive: isNavItemActive(item, page.url.pathname)
		}))
	);

	const drawerMenuItems = $derived([
		{ type: 'button', id: 'search', label: 'Search', icon: 'Search', ariaLabel: 'Search' },
		{
			type: 'button',
			id: 'theme',
			label: getTheme() === 'dark' ? 'Dark Mode' : 'Light Mode',
			icon: getTheme() === 'dark' ? 'MoonFilled' : 'Moon',
			action: toggleTheme,
			ariaLabel: 'Toggle theme'
		},
		{
			type: 'link',
			id: 'get-involved',
			label: 'Get Involved',
			href: 'https://mlcommons.org/get-involved/',
			external: true,
			cta: true
		}
	]);

	const toggleDrawer = () => (isDrawerOpen = !isDrawerOpen);
	const closeDrawer = () => (isDrawerOpen = false);
</script>

<header
	class="font-instrument-sans sticky top-0 z-40 h-[80px] border-b border-[#ECEEF5] bg-white transition-colors duration-200 dark:border-slate-700 dark:bg-slate-900"
>
	<div
		class="mx-auto flex h-full w-full max-w-7xl items-center justify-between px-3 md:grid md:grid-cols-[1fr_auto_1fr]"
	>
		<div class="justify-self-start">
			<a href={resolve('/')} class="block">
				<img
					src={getTheme() === 'dark' ? '/ML-Commons-Logo-Dark.svg' : '/ML-Commons-Logo.svg'}
					alt="ML Commons"
					class="h-10"
				/>
			</a>
		</div>

		<nav class="hidden h-full items-center gap-6 md:flex" aria-label="Main navigation">
			{#each computedNavItems as item (item.label)}
				{#if item.disabled}
					<span
						class="flex h-full cursor-not-allowed items-center justify-center px-2 py-1 opacity-60 {item.isActive
							? 'border-b-2 border-[#CCEBD4] text-slate-900 dark:border-yellow-600 dark:text-white'
							: 'text-slate-900 dark:text-slate-300'}"
						aria-disabled="true"
					>
						{item.label}
					</span>
				{:else}
					<a
						href={resolve(item.href)}
						class="px-2 py-1 {item.isActive
							? 'flex h-full items-center justify-center border-b-2 border-[#CCEBD4] text-slate-900 dark:border-yellow-600 dark:text-white'
							: 'text-slate-900 hover:text-slate-600 dark:text-slate-300 dark:hover:text-white'}"
					>
						{item.label}
					</a>
				{/if}
			{/each}
		</nav>

		<div class="hidden items-center gap-2 justify-self-end md:flex">
			<a
				href="https://mlcommons.org/get-involved/"
				target="_blank"
				class="flex h-10 items-center justify-center rounded-full bg-[#CCEBD4] px-6 text-[#10141F] transition-colors duration-200 dark:bg-yellow-600 dark:text-white"
			>
				Get Involved
			</a>
			<button
				class="flex h-8 w-8 items-center justify-center rounded-full bg-[#10141F] text-white transition-colors duration-200 dark:bg-slate-700"
				aria-label="Search"
			>
				<Icon name="Search" class="h-[18px] w-[18px]" />
			</button>
			<button
				onclick={toggleTheme}
				class="text-slate-900 transition-colors duration-200 hover:text-slate-600 dark:text-white dark:hover:text-slate-300"
				aria-label="Toggle dark mode"
			>
				{#if getTheme() === 'dark'}
					<Icon name="MoonFilled" class="h-6 w-6" />
				{:else}
					<Icon name="Moon" class="h-6 w-6" />
				{/if}
			</button>
		</div>

		<div class="flex items-center gap-1 md:hidden">
			<button
				class="flex h-10 w-10 items-center justify-center rounded-lg transition-colors duration-200 {mobileFiltersOpen
					? 'bg-yellow-500 text-white'
					: 'text-slate-900 hover:bg-slate-100 dark:text-white dark:hover:text-slate-800'}"
				onclick={toggleMobileFilters}
				aria-label="Toggle chart filters"
				aria-expanded={mobileFiltersOpen}
			>
				<Icon name="AdjustmentsCog" class="h-6 w-6" />
			</button>
			<button
				class="flex h-10 w-10 items-center justify-center rounded-lg text-slate-900 transition-colors duration-200 hover:bg-slate-100 dark:text-white dark:hover:text-slate-800"
				onclick={toggleDrawer}
				aria-label="Open menu"
				aria-expanded={isDrawerOpen}
			>
				<Icon name="Menu" class="h-6 w-6" />
			</button>
		</div>
	</div>
</header>

{#if isDrawerOpen}
	<div
		class="fixed inset-0 z-40 bg-black/50 md:hidden"
		onclick={closeDrawer}
		onkeydown={(e) => e.key === 'Escape' && closeDrawer()}
		role="button"
		tabindex="-1"
		aria-label="Close menu"
	></div>
{/if}

<div
	class="fixed top-0 right-0 z-50 h-full w-72 transform bg-white shadow-2xl transition-transform duration-300 ease-out md:hidden dark:bg-slate-900 {isDrawerOpen
		? 'translate-x-0'
		: 'translate-x-full'}"
>
	<div
		class="flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-700"
	>
		<span class="text-lg font-semibold text-slate-900 dark:text-white">Menu</span>
		<button
			onclick={closeDrawer}
			class="flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 transition-colors duration-200 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-800"
			aria-label="Close menu"
		>
			<Icon name="Close" class="h-6 w-6" />
		</button>
	</div>

	<nav class="flex flex-col p-4" aria-label="Mobile navigation">
		{#each computedNavItems as item (item.label)}
			{#if item.disabled}
				<span
					class="cursor-not-allowed rounded-lg px-4 py-3 opacity-60 {item.isActive
						? 'border-l-4 border-[#CCEBD4] bg-[#CCEBD4]/20 dark:border-yellow-600 dark:bg-yellow-600/20'
						: ''} text-slate-900 dark:text-slate-200"
					aria-disabled="true"
				>
					{item.label}
				</span>
			{:else}
				<a
					href={resolve(item.href)}
					onclick={closeDrawer}
					class="rounded-lg px-4 py-3 text-slate-900 transition-colors duration-200 hover:bg-slate-100 dark:text-slate-200 dark:hover:text-slate-800 {item.isActive
						? 'border-l-4 border-[#CCEBD4] bg-[#CCEBD4]/20 dark:border-yellow-600 dark:bg-yellow-600/20'
						: ''}"
				>
					{item.label}
				</a>
			{/if}
		{/each}

		<hr class="my-4 border-slate-200 dark:border-slate-700" />

		{#each drawerMenuItems as item (item.id)}
			{#if item.type === 'link'}
				<a
					href={item.href}
					target={item.external ? '_blank' : undefined}
					rel={item.external ? 'noopener noreferrer' : undefined}
					onclick={closeDrawer}
					class="mt-4 flex items-center justify-center rounded-full bg-[#CCEBD4] px-6 py-3 font-medium text-[#10141F] transition-colors duration-200 dark:bg-yellow-600 dark:text-white"
				>
					{item.label}
				</a>
			{:else}
				<button
					type="button"
					class="flex items-center gap-3 rounded-lg px-4 py-3 text-slate-900 transition-colors duration-200 hover:bg-slate-100 dark:text-slate-200 dark:hover:text-slate-800"
					aria-label={item.ariaLabel}
					onclick={() => item.action?.()}
				>
					<Icon name={item.icon} class="h-5 w-5" />
					<span>{item.label}</span>
				</button>
			{/if}
		{/each}
	</nav>
</div>
