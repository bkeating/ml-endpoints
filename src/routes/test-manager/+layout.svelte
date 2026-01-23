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

	let { children } = $props();
</script>

<TabNavigation {tabs} basePath="/test-manager" {currentPath} ariaLabel="Test manager navigation" />

<div class="min-h-[60vh] bg-slate-50 dark:bg-slate-900">
	<div class="mx-auto max-w-7xl px-4 py-8 md:py-12">
		{@render children()}
	</div>
</div>
