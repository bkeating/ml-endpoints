<script>
	/**
	 * Reusable tab navigation component
	 * Displays a sticky tab bar with active state highlighting
	 *
	 * @typedef {Object} Tab
	 * @property {string} id - Tab identifier (used in URL)
	 * @property {string} label - Display label
	 * @property {string} [icon] - Optional icon name
	 *
	 * @typedef {Object} Props
	 * @property {Tab[]} tabs - Array of tab configurations
	 * @property {string} basePath - Base URL path (e.g., '/admin-tools')
	 * @property {string} currentPath - Current active path
	 * @property {string} [ariaLabel] - Accessible label for navigation
	 */

	import Icon from './Icon.svelte';

	/** @type {Props} */
	let { tabs, basePath, currentPath, ariaLabel = 'Section navigation' } = $props();

	/**
	 * Check if a tab is currently active
	 * @param {string} tabId
	 * @returns {boolean}
	 */
	function isActive(tabId) {
		return currentPath === `${basePath}/${tabId}`;
	}
</script>

<div
	class="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 sticky top-[80px] z-30"
>
	<div class="max-w-7xl mx-auto px-4">
		<nav class="flex gap-1 overflow-x-auto scrollbar-hide -mb-px" aria-label={ariaLabel}>
			{#each tabs as tab (tab.id)}
				<a
					href="{basePath}/{tab.id}"
					class="flex items-center gap-2 px-4 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors duration-200
						{isActive(tab.id)
						? 'border-[#CCEBD4] dark:border-emerald-500 text-slate-900 dark:text-white'
						: 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'}"
					aria-current={isActive(tab.id) ? 'page' : undefined}
				>
					{#if tab.icon}
						<Icon name={tab.icon} class="h-4 w-4" />
					{/if}
					<span>{tab.label}</span>
				</a>
			{/each}
		</nav>
	</div>
</div>
