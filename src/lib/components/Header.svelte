<script>
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { getTheme, toggleTheme } from '$lib/stores/theme.svelte.js';
	import { navItems, isNavItemActive } from '$lib/data/index.js';
	import { getMobileFiltersOpen, toggleMobileFilters, getHasFilters } from '$lib/stores/pageSettings.svelte.js';
	import Icon from '$lib/components/Icon.svelte';
	import Logo from '$lib/components/Logo.svelte';

	let isDrawerOpen = $state(false);
	let mobileFiltersOpen = $derived(getMobileFiltersOpen());
	let hasFilters = $derived(getHasFilters());
	let isDark = $derived(getTheme() === 'dark');
	let themeIcon = $derived(isDark ? 'MoonFilled' : 'Moon');
	let themeLabel = $derived(isDark ? 'Dark Mode' : 'Light Mode');

	let navItemsWithActive = $derived(
		navItems.map((item) => ({
			...item,
			isActive: isNavItemActive(item, page.url.pathname)
		}))
	);

	const desktopNavClass = (isActive) => [
		'flex h-full items-center px-2 py-1 text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white',
		isActive && 'border-b-2 border-emerald-500 text-slate-900 dark:text-white'
	];

	const mobileNavClass = (isActive) => [
		'rounded-lg px-4 py-3 text-slate-700 hover:bg-slate-100 dark:text-slate-200',
		isActive && 'border-l-4 border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10'
	];

	const toggleDrawer = () => isDrawerOpen = !isDrawerOpen;
	const closeDrawer = () => isDrawerOpen = false;
</script>

{#snippet navEntry(item, mobile = false)}
	{#if item.disabled}
		<span class={mobile ? 'cursor-not-allowed rounded-lg px-4 py-3 text-slate-400' : 'cursor-not-allowed px-2 py-1 text-slate-400'}>
			{item.label}
		</span>
	{:else if mobile}
		<a href={resolve(item.href)} onclick={closeDrawer} class={mobileNavClass(item.isActive)}>
			{item.label}
		</a>
	{:else}
		<a href={resolve(item.href)} class={desktopNavClass(item.isActive)}>
			{item.label}
		</a>
	{/if}
{/snippet}

<header class="sticky top-0 z-40 h-20 border-b border-slate-200 bg-white font-instrument-sans dark:border-slate-700 dark:bg-slate-900">
	<div class="mx-auto flex h-full w-full max-w-7xl items-center justify-between px-3">
		<a href={resolve('/')}>
			<Logo dark={isDark} class="h-10" />
		</a>

		<nav class="hidden h-full items-center gap-6 md:flex" aria-label="Main navigation">
			{#each navItemsWithActive as item (item.label)}
				{@render navEntry(item)}
			{/each}
		</nav>

		<div class="hidden items-center gap-2 md:flex">
			<div class="flex h-10 items-center rounded-full bg-emerald-100 px-6 text-emerald-900">Get Involved</div>
			<button onclick={toggleTheme} class="cursor-pointer text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white" aria-label="Toggle dark mode">
				<Icon name={themeIcon} class="size-6" />
			</button>
		</div>

		<div class="flex items-center gap-1 md:hidden">
			{#if hasFilters}
				<button
					class="flex size-10 items-center justify-center rounded-lg
						{mobileFiltersOpen
							? 'bg-amber-500 text-white'
							: 'text-slate-700 hover:bg-slate-100 dark:text-white'}"
					onclick={toggleMobileFilters}
					aria-label="Toggle chart filters"
					aria-expanded={mobileFiltersOpen}
				>
					<Icon name="AdjustmentsCog" class="size-6" />
				</button>
			{/if}
			<button class="flex size-10 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100 dark:text-white" onclick={toggleDrawer} aria-label="Open menu" aria-expanded={isDrawerOpen}>
				<Icon name="Menu" class="size-6" />
			</button>
		</div>
	</div>
</header>

{#if isDrawerOpen}
	<button class="fixed inset-0 z-40 bg-black/50 md:hidden" onclick={closeDrawer} aria-label="Close menu"></button>
{/if}

<div
	class="fixed top-0 right-0 z-50 h-full w-72 bg-white shadow-2xl transition-transform duration-300 ease-out md:hidden dark:bg-slate-900
		{isDrawerOpen ? 'translate-x-0' : 'translate-x-full'}"
>
	<div class="flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-700">
		<span class="text-lg font-semibold text-slate-900 dark:text-white">Menu</span>
		<button onclick={closeDrawer} class="flex size-10 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-400" aria-label="Close menu">
			<Icon name="Close" class="size-6" />
		</button>
	</div>

	<nav class="flex flex-col p-4" aria-label="Mobile navigation">
		{#each navItemsWithActive as item (item.label)}
			{@render navEntry(item, true)}
		{/each}

		<hr class="my-4 border-slate-200 dark:border-slate-700" />

		<button
			type="button"
			class="flex items-center gap-3 rounded-lg px-4 py-3 text-slate-700 hover:bg-slate-100 dark:text-slate-200"
			aria-label="Search"
		>
			<Icon name="Search" class="size-5" />
			<span>Search</span>
		</button>

		<button
			type="button"
			onclick={toggleTheme}
			class="flex cursor-pointer items-center gap-3 rounded-lg px-4 py-3 text-slate-700 hover:bg-slate-100 dark:text-slate-200"
			aria-label="Toggle theme"
		>
			<Icon name={themeIcon} class="size-5" />
			<span>{themeLabel}</span>
		</button>

		<div class="mt-4 flex items-center justify-center rounded-full bg-emerald-100 px-6 py-3 font-medium text-emerald-900">Get Involved</div>
	</nav>
</div>
