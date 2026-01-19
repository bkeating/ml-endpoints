<script>
	/**
	 * Custom multi-select dropdown for hardware/GPU selection.
	 * Shows color-coded chips for selected items and a dropdown for toggling.
	 *
	 * @typedef {Object} HardwareOption
	 * @property {string} id - Unique identifier
	 * @property {string} name - Display name
	 * @property {string} color - Hex color code
	 *
	 * @typedef {Object} Props
	 * @property {HardwareOption[]} options - Available hardware options
	 * @property {(id: string) => boolean} isSelected - Function to check if option is selected
	 * @property {(id: string) => void} onToggle - Callback when option is toggled
	 * @property {string} [label] - Label text
	 */

	import Icon from '$lib/components/Icon.svelte';

	/** @type {Props} */
	let { options, isSelected, onToggle, label = 'Hardware' } = $props();

	let isOpen = $state(false);
	let dropdownRef = $state(null);

	// Unique ID for accessibility
	const labelId = `hardware-label-${Math.random().toString(36).slice(2, 9)}`;

	// Count selected items
	let selectedCount = $derived(options.filter((opt) => isSelected(opt.id)).length);

	/**
	 * Handle click outside to close dropdown
	 * @param {MouseEvent} event
	 */
	function handleClickOutside(event) {
		if (dropdownRef && !dropdownRef.contains(event.target)) {
			isOpen = false;
		}
	}

	/**
	 * Handle keyboard navigation
	 * @param {KeyboardEvent} event
	 */
	function handleKeydown(event) {
		if (event.key === 'Escape') {
			isOpen = false;
		}
	}

	$effect(() => {
		if (isOpen) {
			document.addEventListener('click', handleClickOutside);
			document.addEventListener('keydown', handleKeydown);
		}
		return () => {
			document.removeEventListener('click', handleClickOutside);
			document.removeEventListener('keydown', handleKeydown);
		};
	});
</script>

<div class="flex min-w-36 flex-col gap-1" bind:this={dropdownRef}>
	<span class="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400 dm-mono" id={labelId}>
		{label}
	</span>
	<div class="relative">
		<button
			type="button"
			onclick={() => (isOpen = !isOpen)}
			class="flex h-9 w-full items-center justify-between gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
			aria-expanded={isOpen}
			aria-haspopup="listbox"
			aria-labelledby={labelId}
		>
			<span class="truncate dm-mono">
				{selectedCount} of {options.length} selected
			</span>
			<Icon
				name="ChevronDown"
				class="h-4 w-4 shrink-0 text-slate-500 transition-transform duration-200 {isOpen ? 'rotate-180' : ''}"
			/>
		</button>

		{#if isOpen}
			<div
				class="absolute left-0 top-full z-50 mt-1 max-h-64 w-full min-w-56 overflow-auto rounded-md border border-slate-200 bg-white shadow-lg dark:border-slate-600 dark:bg-slate-800"
				role="listbox"
				aria-multiselectable="true"
			>
				{#each options as option (option.id)}
					{@const selected = isSelected(option.id)}
					<button
						type="button"
						role="option"
						aria-selected={selected}
						onclick={() => onToggle(option.id)}
						class="flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-slate-100 dark:hover:bg-slate-700 {selected ? 'rounded-sm' : ''}"
						style={selected ? `background-color: ${option.color}20;` : ''}
					>
						<span
							class="h-3 w-3 shrink-0 rounded-full border-2 transition-colors"
							style="background-color: {selected ? option.color : 'transparent'}; border-color: {option.color};"
						></span>
						<span class="truncate {selected ? 'font-medium text-slate-900 dark:text-slate-100' : 'text-slate-700 dark:text-slate-300'}">
							{option.name}
						</span>
						{#if selected}
							<Icon name="Close" class="ml-auto h-3.5 w-3.5 text-slate-500" />
						{/if}
					</button>
				{/each}
			</div>
		{/if}
	</div>
</div>
