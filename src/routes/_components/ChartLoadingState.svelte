<script>
	/**
	 * Loading state component for chart data fetching.
	 * Displays a centered spinner with loading message.
	 */
	import Icon from '$lib/components/Icon.svelte';
</script>

<div class="flex items-center justify-center py-12 mx-auto max-w-7xl px-3">
	<div class="flex items-center gap-3 text-slate-500 dark:text-slate-400">
		<Icon name="Spinner" class="h-5 w-5 animate-spin" />
		<span>Loading chart data...</span>
	</div>
</div>
