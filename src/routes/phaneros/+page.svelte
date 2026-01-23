<script>
	/**
	 * Phaneros Chart Builder Page
	 *
	 * Main admin panel page for creating charts from API data.
	 * Features:
	 * - API endpoint fetching
	 * - Property mapping to chart axes
	 * - Multiple data layer support
	 * - Real-time chart preview
	 */
	import AdminSidebar from './_components/AdminSidebar.svelte';
	import ChartBuilder from './_components/ChartBuilder.svelte';
	import Icon from '$lib/components/Icon.svelte';

	let sidebarOpen = $state(false);
</script>

<div class="flex h-full">
	<!-- Sidebar -->
	<AdminSidebar isOpen={sidebarOpen} onClose={() => (sidebarOpen = false)} />

	<!-- Main Content -->
	<div class="flex min-w-0 flex-1 flex-col overflow-hidden">
		<!-- Mobile Header Bar -->
		<div
			class="flex h-12 shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-4 lg:hidden dark:border-slate-700 dark:bg-slate-800"
		>
			<button
				onclick={() => (sidebarOpen = true)}
				class="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
				aria-label="Open sidebar"
			>
				<Icon name="Menu" class="h-5 w-5" />
			</button>
			<span class="font-medium text-slate-800 dark:text-slate-200">Chart Builder</span>
		</div>

		<!-- Page Content -->
		<div class="flex-1 overflow-auto">
			<ChartBuilder />
		</div>
	</div>
</div>
