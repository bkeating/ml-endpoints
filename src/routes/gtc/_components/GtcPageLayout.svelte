<script>
	/**
	 * GTC Page Layout - Main content container.
	 *
	 * Provides a responsive layout for the main content area.
	 *
	 * Usage:
	 *   <GtcPageLayout>
	 *     {#snippet main()}<MainContent />{/snippet}
	 *   </GtcPageLayout>
	 */

	/** @type {import('svelte').Snippet} */
	let { main } = $props();
</script>

<div class="mx-auto max-w-7xl px-3 py-6">
	<!-- Main Content Area -->
	<main class="min-w-0">
		{@render main()}
	</main>
</div>
