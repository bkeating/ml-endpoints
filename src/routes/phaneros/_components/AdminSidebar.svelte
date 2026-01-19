<script>
	/**
	 * Admin Sidebar Navigation
	 * 
	 * Fixed sidebar for admin panel navigation.
	 * Collapsible on mobile via hamburger menu.
	 */
	import Icon from '$lib/components/Icon.svelte';

	/** @type {{ isOpen?: boolean, onClose?: () => void }} */
	let { isOpen = true, onClose = () => {} } = $props();

	const navItems = [
		{ id: 'charts', label: 'Chart Builder', icon: 'chart', active: true },
		{ id: 'saved', label: 'Saved Charts', icon: 'folder', active: false },
		{ id: 'settings', label: 'Settings', icon: 'settings', active: false }
	];
</script>

<!-- Mobile Overlay -->
{#if isOpen}
	<div
		class="fixed inset-0 bg-black/50 z-30 lg:hidden"
		onclick={onClose}
		onkeydown={(e) => e.key === 'Escape' && onClose()}
		role="button"
		tabindex="-1"
		aria-label="Close sidebar"
	></div>
{/if}

<!-- Sidebar -->
<aside
	class="fixed lg:relative top-0 left-0 h-full w-60 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 z-40 transform transition-transform duration-300 lg:transform-none {isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} flex flex-col"
>
	<!-- Sidebar Header (mobile only) -->
	<div class="h-14 shrink-0 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-700 lg:hidden">
		<span class="font-semibold text-slate-800 dark:text-slate-200">Menu</span>
		<button
			onclick={onClose}
			class="h-8 w-8 flex items-center justify-center rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
			aria-label="Close sidebar"
		>
			<Icon name="Close" class="h-5 w-5" />
		</button>
	</div>

	<!-- Navigation -->
	<nav class="flex-1 p-3 overflow-y-auto">
		<ul class="space-y-1">
			{#each navItems as item (item.id)}
				<li>
					<button
						class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors {item.active 
							? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' 
							: 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}"
						aria-current={item.active ? 'page' : undefined}
					>
						{#if item.icon === 'chart'}
							<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
							</svg>
						{:else if item.icon === 'folder'}
							<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
							</svg>
						{:else if item.icon === 'settings'}
							<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
							</svg>
						{/if}
						<span class="text-sm font-medium">{item.label}</span>
					</button>
				</li>
			{/each}
		</ul>
	</nav>

	<!-- Sidebar Footer -->
	<div class="p-3 border-t border-slate-200 dark:border-slate-700">
		<div class="px-3 py-2 text-xs text-slate-500 dark:text-slate-400 dm-mono">
			ML Commons • v0.1.0
		</div>
	</div>
</aside>
