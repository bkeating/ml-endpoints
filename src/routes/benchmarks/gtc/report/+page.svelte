<script>
	/**
	 * GTC Report Page - Displays detailed benchmark report for a specific data point.
	 *
	 * Query Parameters:
	 * - system: System identifier (e.g., 'h100_vllm', 'b200_trt')
	 * - users: Number of concurrent users for this measurement
	 * - config: Configuration detail string
	 */
	import { page } from '$app/stores';

	let systemId = $derived($page.url.searchParams.get('system') ?? '');
	let users = $derived($page.url.searchParams.get('users') ?? '');
	let config = $derived($page.url.searchParams.get('config') ?? '');
</script>

<div class="mx-auto max-w-4xl px-4 py-12">
	<a
		href="/benchmarks/gtc"
		class="mb-6 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
	>
		<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
			<path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
		</svg>
		Back to Benchmarks
	</a>

	<h1
		class="instrument-serif-regular-italic mb-4 text-3xl font-bold text-slate-800 dark:text-white md:text-4xl"
	>
		Benchmark Report
	</h1>

	<div class="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
		<dl class="grid gap-4 sm:grid-cols-3">
			<div>
				<dt class="text-sm font-medium text-slate-500 dark:text-slate-400">System</dt>
				<dd class="mt-1 text-lg font-semibold text-slate-900 dark:text-white">{systemId || '—'}</dd>
			</div>
			<div>
				<dt class="text-sm font-medium text-slate-500 dark:text-slate-400">Concurrent Users</dt>
				<dd class="mt-1 text-lg font-semibold text-slate-900 dark:text-white">{users || '—'}</dd>
			</div>
			<div>
				<dt class="text-sm font-medium text-slate-500 dark:text-slate-400">Configuration</dt>
				<dd class="mt-1 text-lg font-semibold text-slate-900 dark:text-white">{config || '—'}</dd>
			</div>
		</dl>
	</div>

	<p class="mt-8 text-slate-600 dark:text-slate-400">
		Detailed report content will be displayed here based on the selected data point.
	</p>
</div>
