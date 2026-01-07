<script>
	/**
	 * Error banner for displaying API or loading errors.
	 * 
	 * @typedef {Object} Props
	 * @property {string} [message] - Error message to display
	 */

	/** @type {Props} */
	let { message = 'An unexpected error occurred' } = $props();
</script>

<div
	class="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400 mb-12"
>
	<h3 class="mb-2 font-semibold">Error loading chart data</h3>
	<p class="text-sm">{message}</p>
</div>

