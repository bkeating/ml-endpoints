<script>
	import { page } from '$app/stores';
	import TabNavigation from '$lib/components/TabNavigation.svelte';

	/** Tab configuration */
	const tabs = [
		{ id: 'api-keys', label: 'API Keys', icon: 'Link' },
		{ id: 'submissions', label: 'Model Submissions', icon: 'Play' },
		{ id: 'results', label: 'Benchmark Results', icon: 'ReportAnalytics' },
		{ id: 'airr', label: 'AIRR Testing', icon: 'FileAnalytics' }
	];

	let currentPath = $derived($page.url.pathname);
</script>

<TabNavigation {tabs} basePath="/test-manager" {currentPath} ariaLabel="Test manager navigation" />

<div class="bg-slate-50 dark:bg-slate-900 min-h-[60vh]">
	<div class="max-w-7xl mx-auto px-4 py-8 md:py-12">
		<slot />
	</div>
</div>
