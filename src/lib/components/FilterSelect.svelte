<script>
	/**
	 * Reusable labeled select dropdown for filter forms.
	 * Provides consistent styling and accessibility across all filter selects.
	 *
	 * @typedef {Object} Option
	 * @property {string} id - Option value
	 * @property {string} label - Display label
	 *
	 * @typedef {Object} Props
	 * @property {string} id - HTML id for the select element
	 * @property {string} label - Label text displayed above the select
	 * @property {string} value - Currently selected value
	 * @property {Option[]} options - Array of options to display
	 * @property {(value: string) => void} onchange - Callback when selection changes
	 * @property {string} [minWidth] - Minimum width class (e.g., 'min-w-48')
	 */

	/** @type {Props} */
	let { id, label, value, options, onchange, minWidth = 'min-w-48', maxWidth = 'max-w-48' } = $props();

	/**
	 * Handle select change event
	 * @param {Event} e
	 */
	function handleChange(e) {
		const target = /** @type {HTMLSelectElement} */ (e.target);
		onchange(target.value);
	}
</script>

<div class="flex {minWidth} {maxWidth} flex-col gap-1">
  {#if label}
	<label
		for={id}
      class="dm-mono text-xs font-medium tracking-wide text-slate-300 uppercase dark:text-slate-400"
    >
      {label}
    </label>
  {/if}
	<select
		{id}
		{value}
		onchange={handleChange}
		class="dm-mono h-9 rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
		aria-label={label}
	>
		{#each options as option (option.id)}
			<option value={option.id}>{option.label}</option>
		{/each}
	</select>
</div>
