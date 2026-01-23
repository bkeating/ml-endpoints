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
	import { resolve } from '$app/paths';

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
	class="sticky top-[80px] z-30 border-b border-slate-200 dark:border-slate-700"
	style="background-color: #151a20;"
>
	<div class="mx-auto max-w-7xl px-4">
		<nav class="scrollbar-hide -mb-px flex gap-1 overflow-x-auto" aria-label={ariaLabel}>
			{#each tabs as tab (tab.id)}
				<a
					href={resolve(`${basePath}/${tab.id}`)}
					class="flex items-center gap-2 border-b-2 px-4 py-4 text-sm font-medium whitespace-nowrap transition-colors duration-200
						{isActive(tab.id)
						? 'border-[#CCEBD4] text-slate-900 dark:border-emerald-500 dark:text-white'
						: 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:text-slate-300'}"
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
