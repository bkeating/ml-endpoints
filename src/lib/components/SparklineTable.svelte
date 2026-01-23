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

	/**
	 * Check if a column should be hidden on mobile
	 * Hide 'throughput' and 'latency' metric columns on mobile (shown under model name instead)
	 * @param {SparklineTableColumn} column
	 * @returns {boolean}
	 */
	const isHiddenOnMobile = (column) => column.key === 'throughput' || column.key === 'latency';
</script>

<div {...restProps} class="px-3 {restProps.class ?? ''}">
	<h2 class="font-instrument-sans mb-6 text-2xl font-semibold text-slate-800 dark:text-slate-200">
		{title}
	</h2>

	<div
		class="overflow-hidden overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800"
	>
		<table class="w-full min-w-0">
			<thead>
				<tr
					class="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900/50"
				>
					{#each columns as column (column.key)}
						<th
							class="px-4 py-4 text-left text-sm font-medium text-slate-600 md:px-6 dark:text-slate-400"
							class:text-center={column.type === 'action'}
							class:hidden={isHiddenOnMobile(column)}
							class:md:table-cell={isHiddenOnMobile(column)}
						>
							{column.label}
						</th>
					{/each}
				</tr>
			</thead>
			<tbody>
				{#each rows as row, rowIndex (row.id)}
					<tr
						class="border-b border-slate-100 transition-colors hover:bg-slate-50 dark:border-slate-700/50 dark:hover:bg-slate-700/30"
						class:border-b-0={rowIndex === rows.length - 1}
					>
						{#each columns as column (column.key)}
							{#if column.type === 'text'}
								<td class="px-4 py-4 md:px-6">
									<div class="flex items-center gap-3">
										<span
											class="h-3 w-3 shrink-0 rounded-full"
											style="background-color: {row.color};"
										></span>
										<div class="flex flex-col">
											<span class="font-medium text-slate-800 dark:text-slate-200">{row.name}</span>
											<!-- Mobile only: Show throughput and latency under model name -->
											{#if row.metrics['throughput'] || row.metrics['latency']}
												<span
													class="font-mono text-xs text-slate-500 md:hidden dark:text-slate-400"
												>
													{row.metrics['throughput'] ??
														''}{#if row.metrics['throughput'] && row.metrics['latency']}
														/
													{/if}{row.metrics['latency'] ?? ''}
												</span>
											{/if}
										</div>
									</div>
								</td>
							{:else if column.type === 'metric'}
								<td
									class="px-4 py-4"
									class:hidden={isHiddenOnMobile(column)}
									class:md:table-cell={isHiddenOnMobile(column)}
								>
									<span class="font-mono text-sm text-slate-700 dark:text-slate-300">
										{row.metrics[column.key] ?? '—'}
									</span>
								</td>
							{:else if column.type === 'sparkline'}
								<td class="px-4 py-4">
									<Sparkline
										data={row.sparklineData}
										color={row.color}
										gradientId={getGradientId(row.id)}
										width={120}
										height={36}
									/>
								</td>
							{:else if column.type === 'action'}
								<td class="px-4 py-4">
									<div class="flex justify-center">
										<button
											type="button"
											class="group flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-100 transition-all duration-200 hover:scale-105 dark:border-slate-600 dark:bg-slate-700 {getHoverColorClass(
												row.color
											)}"
											onclick={() => onActionClick(row)}
											aria-label="Play demo for {row.name}"
										>
											<Icon
												name="Play"
												class="ml-0.5 h-4 w-4 text-slate-500 group-hover:text-white dark:text-slate-400"
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
