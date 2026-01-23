<script>
	import { page } from '$app/stores';
	import TabNavigation from '$lib/components/TabNavigation.svelte';

	let { children } = $props();

	/** Tab configuration */
	const tabs = [
		{ id: 'crm', label: 'CRM', icon: 'FileAnalytics' },
		{ id: 'workgroup', label: 'Workgroups', icon: 'ReportAnalytics' },
		{ id: 'cla', label: 'Contract CLA', icon: 'Link' },
		{ id: 'finance', label: 'Finance', icon: 'Download' },
		{ id: 'membership', label: 'Membership', icon: 'Settings' }
	];

	let currentPath = $derived($page.url.pathname);
</script>

<TabNavigation {tabs} basePath="/admin-tools" {currentPath} ariaLabel="Admin tools navigation" />

<div class="min-h-[60vh] bg-slate-50 dark:bg-slate-900">
	<div class="mx-auto max-w-7xl px-4 py-8 md:py-12">
		{@render children()}
	</div>
</div>
