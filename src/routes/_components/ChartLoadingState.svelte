<script>
	/**
	 * Loading state component for chart data fetching.
	 * Displays a centered spinner with loading message.
	 */
	import Icon from '$lib/components/Icon.svelte';
</script>

<div class="mx-auto flex max-w-7xl items-center justify-center px-3 py-12">
	<div class="flex items-center gap-3 text-slate-500 dark:text-slate-400">
		<Icon name="Spinner" class="h-5 w-5 animate-spin" />
		<span>Loading chart data...</span>
	</div>
</div>
