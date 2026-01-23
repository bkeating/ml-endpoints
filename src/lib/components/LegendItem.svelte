<script>
	/**
	 * @typedef {Object} Props
	 * @property {string} name - Display name of the model
	 * @property {string} color - Color hex code for the model
	 * @property {boolean} visible - Whether the model is currently visible
	 * @property {() => void} ontoggle - Callback when visibility is toggled
	 */

	/** @type {Props} */
	let { name, color, visible, ontoggle } = $props();
</script>

<button
	type="button"
	onclick={ontoggle}
	class="group flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-left transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-800"
	aria-pressed={visible}
	aria-label="Toggle {name} visibility"
>
	<span
		class="h-3 w-3 rounded-full transition-opacity duration-200"
		style="background-color: {color}; opacity: {visible ? 1 : 0.3};"
	></span>
	<span
		class="text-sm font-medium transition-opacity duration-200 {visible
			? 'text-slate-800 dark:text-slate-200'
			: 'text-slate-400 line-through dark:text-slate-500'}"
	>
		{name}
	</span>
</button>
