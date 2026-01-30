<script>
	/**
	 * GTC Sidebar - Sticky left sidebar container for ChartFilters and siblings.
	 *
	 * This component provides:
	 * - Sticky positioning that works during scroll
	 * - Consistent styling for sidebar items
	 * - Snippet-based composition for adding siblings later
	 */

	/** @type {string} */
	let { class: className = '', children } = $props();
</script>

<aside
	class="sticky top-24 hidden h-fit max-h-[calc(100vh-7rem)] w-80 shrink-0 overflow-y-auto lg:block {className}"
	aria-label="Chart configuration sidebar"
>
	{@render children?.()}
</aside>
