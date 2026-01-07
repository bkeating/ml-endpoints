<script>
	/**
	 * SparklineTable component
	 * Displays a table of benchmark results with sparkline visualizations
	 * 
	 * @component
	 */
	import Sparkline from './Sparkline.svelte';
	import Icon from './Icon.svelte';

	/**
	 * @typedef {Object} SparklineTableRow
	 * @property {string} id - Unique identifier
	 * @property {string} name - Display name
	 * @property {Record<string, string | number>} metrics - Key-value pairs of metric name to formatted value
	 * @property {number[]} sparklineData - Array of numeric values for sparkline
	 * @property {string} color - Hex color for the sparkline and button
	 */

	/**
	 * @typedef {Object} SparklineTableColumn
	 * @property {string} key - Column key (matches metrics keys or special keys)
	 * @property {string} label - Column header label
	 * @property {'text' | 'metric' | 'sparkline' | 'action'} type - Column type
	 */

	/** @type {string} */
	let {
		title = 'Benchmark Results',
		/** @type {SparklineTableRow[]} */
		rows = [],
		/** @type {SparklineTableColumn[]} */
		columns = [],
		onActionClick = () => {},
		...restProps
	} = $props();

	/**
	 * Generate unique gradient ID for each row to avoid conflicts
	 * @param {string} rowId
	 * @returns {string}
	 */
	const getGradientId = (rowId) => `sparkline-grad-${rowId}`;

	/**
	 * Get Tailwind hover color class from hex color
	 * Maps common colors to their Tailwind equivalents
	 * @param {string} hexColor
	 * @returns {string}
	 */
	const getHoverColorClass = (hexColor) => {
		const colorMap = {
			'#f97316': 'hover:bg-orange-500 hover:border-orange-500',
			'#22c55e': 'hover:bg-green-500 hover:border-green-500',
			'#3b82f6': 'hover:bg-blue-500 hover:border-blue-500',
			'#a855f7': 'hover:bg-purple-500 hover:border-purple-500',
			'#ec4899': 'hover:bg-pink-500 hover:border-pink-500',
			'#14b8a6': 'hover:bg-teal-500 hover:border-teal-500',
			'#f59e0b': 'hover:bg-amber-500 hover:border-amber-500',
			'#8b5cf6': 'hover:bg-violet-500 hover:border-violet-500',
			'#06b6d4': 'hover:bg-cyan-500 hover:border-cyan-500',
			'#ef4444': 'hover:bg-red-500 hover:border-red-500',
			'#84cc16': 'hover:bg-lime-500 hover:border-lime-500'
		};
		return colorMap[hexColor] ?? 'hover:bg-slate-500 hover:border-slate-500';
	};
</script>

<div {...restProps}>
	<h2 class="text-2xl font-semibold text-slate-800 dark:text-slate-200 mb-6 font-instrument-sans">
		{title}
	</h2>
	
	<div class="bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-700">
		<table class="w-full">
			<thead>
				<tr class="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
					{#each columns as column (column.key)}
						<th 
							class="text-left py-4 px-6 text-slate-600 dark:text-slate-400 font-medium text-sm"
							class:text-center={column.type === 'action'}
						>
							{column.label}
						</th>
					{/each}
				</tr>
			</thead>
			<tbody>
				{#each rows as row, rowIndex (row.id)}
					<tr 
						class="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
						class:border-b-0={rowIndex === rows.length - 1}
					>
						{#each columns as column (column.key)}
							{#if column.type === 'text'}
								<td class="py-4 px-6">
									<span class="text-slate-800 dark:text-slate-200 font-medium">{row.name}</span>
								</td>
							{:else if column.type === 'metric'}
								<td class="py-4 px-4">
									<span class="text-slate-700 dark:text-slate-300 font-mono">
										{row.metrics[column.key] ?? '—'}
									</span>
								</td>
							{:else if column.type === 'sparkline'}
								<td class="py-4 px-4">
									<Sparkline 
										data={row.sparklineData}
										color={row.color}
										gradientId={getGradientId(row.id)}
										width={120}
										height={36}
									/>
								</td>
							{:else if column.type === 'action'}
								<td class="py-4 px-4">
									<div class="flex justify-center">
										<button 
											type="button"
											class="group w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center transition-all duration-200 hover:scale-105 {getHoverColorClass(row.color)}"
											onclick={() => onActionClick(row)}
											aria-label="Play demo for {row.name}"
										>
											<Icon 
												name="Play" 
												class="w-4 h-4 text-slate-500 dark:text-slate-400 group-hover:text-white ml-0.5" 
											/>
										</button>
									</div>
								</td>
							{/if}
						{/each}
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>

