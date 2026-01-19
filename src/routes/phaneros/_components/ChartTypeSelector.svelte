<script>
	/**
	 * Chart Type Selector Component
	 * 
	 * Toggle between bar and line chart types.
	 */

	/**
	 * @typedef {Object} Props
	 * @property {'bar' | 'line'} chartType - Current chart type
	 * @property {(type: 'bar' | 'line') => void} onTypeChange - Callback when type changes
	 */

	/** @type {Props} */
	let { chartType, onTypeChange } = $props();
</script>

<div class="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden">
	<!-- Header -->
	<div class="px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
		<h3 class="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide dm-mono">
			Chart Type
		</h3>
	</div>

	<div class="p-4">
		<div class="flex gap-3">
			<!-- Bar Chart Option -->
			<button
				type="button"
				onclick={() => onTypeChange('bar')}
				class="flex-1 p-4 rounded-lg border-2 transition-all {chartType === 'bar' 
					? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' 
					: 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}"
				aria-pressed={chartType === 'bar'}
			>
				<div class="flex flex-col items-center gap-2">
					<svg class="h-8 w-8 {chartType === 'bar' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
					</svg>
					<span class="text-sm font-medium {chartType === 'bar' ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'}">
						Bar Chart
					</span>
				</div>
			</button>

			<!-- Line Chart Option -->
			<button
				type="button"
				onclick={() => onTypeChange('line')}
				class="flex-1 p-4 rounded-lg border-2 transition-all {chartType === 'line' 
					? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' 
					: 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}"
				aria-pressed={chartType === 'line'}
			>
				<div class="flex flex-col items-center gap-2">
					<svg class="h-8 w-8 {chartType === 'line' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
					</svg>
					<span class="text-sm font-medium {chartType === 'line' ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'}">
						Line Chart
					</span>
				</div>
			</button>
		</div>
	</div>
</div>
