<script>
	/**
	 * GTC Mobile Filter Button - Toggle button for mobile filter drawer.
	 *
	 * Only visible on mobile/tablet. Opens the slide-in filter drawer.
	 */
	import Icon from '$lib/components/Icon.svelte';
	import { toggleMobileFilters } from '$lib/stores/pageSettings.svelte.js';
</script>

<button
	type="button"
	onclick={toggleMobileFilters}
	class="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg transition-all duration-200 hover:bg-emerald-700 hover:shadow-xl active:scale-95 lg:hidden"
	aria-label="Open chart filters"
>
	<Icon name="AdjustmentsCog" class="h-6 w-6" />
</button>
