<script>
	/**
	 * Reusable labeled radio button group for filter forms.
	 * Provides consistent styling and accessibility across all filter radio groups.
	 *
	 * @typedef {Object} Option
	 * @property {string} id - Option value
	 * @property {string} label - Display label
	 *
	 * @typedef {Object} Props
	 * @property {string} name - HTML name attribute for the radio group
	 * @property {string} legend - Legend text displayed above the group
	 * @property {string} value - Currently selected value
	 * @property {Option[]} options - Array of options to display
	 * @property {(value: string) => void} onchange - Callback when selection changes
	 * @property {string} [ariaLabel] - Accessible label for the radiogroup
	 */

	/** @type {Props} */
	let { name, legend, value, options, onchange, ariaLabel = legend } = $props();
</script>

<fieldset class="flex flex-col gap-1">
	<legend
		class="text-xs font-medium uppercase tracking-wide text-slate-300 dark:text-slate-400 dm-mono"
	>
		{legend}
	</legend>
	<div
		class="flex gap-4 h-9 mt-1 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 px-3 rounded-lg"
		role="radiogroup"
		aria-label={ariaLabel}
	>
		{#each options as option (option.id)}
			<label class="flex cursor-pointer items-center gap-1.5 justify-center dm-mono">
				<input
					type="radio"
					{name}
					value={option.id}
					checked={value === option.id}
					onchange={() => onchange(option.id)}
					class="h-4 w-4 border-slate-300 text-emerald-600 focus:ring-emerald-500 dark:border-slate-600"
				/>
				<span class="text-sm text-slate-700 dark:text-slate-300">{option.label}</span>
			</label>
		{/each}
	</div>
</fieldset>

