<script>
	/**
	 * Reusable stat/KPI card component
	 *
	 * @typedef {Object} Props
	 * @property {string|number} value - Main metric value
	 * @property {string} label - Metric label
	 * @property {string} [subtitle] - Optional subtitle/description
	 * @property {string} [valueColor] - Tailwind color class for value (e.g., 'text-emerald-600')
	 * @property {string} [borderColor] - Optional left border color class (e.g., 'border-l-emerald-500')
	 */

	/** @type {Props} */
	let {
		value,
		label,
		subtitle = '',
		valueColor = 'text-slate-900 dark:text-white',
		borderColor = ''
	} = $props();
</script>

<div
	class="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800 {borderColor
		? `border-l-4 ${borderColor}`
		: ''}"
>
	<div class="text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400">
		{label}
	</div>
	<div class="mt-1 text-2xl font-bold {valueColor}">
		{value}
	</div>
	{#if subtitle}
		<div class="mt-1 text-xs text-slate-500 dark:text-slate-400">{subtitle}</div>
	{/if}
</div>
