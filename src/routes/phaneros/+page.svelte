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

<div class="h-full flex">
	<!-- Sidebar -->
	<AdminSidebar isOpen={sidebarOpen} onClose={() => sidebarOpen = false} />

	<!-- Main Content -->
	<div class="flex-1 flex flex-col min-w-0 overflow-hidden">
		<!-- Mobile Header Bar -->
		<div class="h-12 shrink-0 flex items-center gap-3 px-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 lg:hidden">
			<button
				onclick={() => sidebarOpen = true}
				class="h-8 w-8 flex items-center justify-center rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
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
