<script>
	/**
	 * Local toolbar for enhanced bar chart features.
	 * Provides controls for sorting, line overlay, and threshold lines.
	 *
	 * @typedef {'original' | 'ascending' | 'descending'} SortOrder
	 *
	 * @typedef {Object} Props
	 * @property {SortOrder} sortOrder - Current sort order
	 * @property {boolean} showLineOverlay - Whether line overlay is visible
	 * @property {boolean} showThresholds - Whether threshold lines are visible
	 * @property {(order: SortOrder) => void} onSortChange - Callback for sort order change
	 * @property {(show: boolean) => void} onLineOverlayChange - Callback for line overlay toggle
	 * @property {(show: boolean) => void} onThresholdsChange - Callback for thresholds toggle
	 */

	/** @type {Props} */
	let {
		sortOrder,
		showLineOverlay,
		showThresholds,
		onSortChange,
		onLineOverlayChange,
		onThresholdsChange
	} = $props();

	/** @type {{ value: SortOrder, label: string, icon: string }[]} */
	const sortOptions = [
		{ value: 'original', label: 'Original', icon: '⇆' },
		{ value: 'ascending', label: 'Low → High', icon: '↑' },
		{ value: 'descending', label: 'High → Low', icon: '↓' }
	];
</script>

<div class="toolbar-container">
	<div class="toolbar-inner">
		<!-- Sort Controls -->
		<div class="control-group">
			<span class="control-label">Sort by Value</span>
			<div class="button-group" role="radiogroup" aria-label="Sort order">
				{#each sortOptions as option (option.value)}
					<button
						type="button"
						role="radio"
						aria-checked={sortOrder === option.value}
						class="sort-button"
						class:active={sortOrder === option.value}
						onclick={() => onSortChange(option.value)}
					>
						<span class="sort-icon">{option.icon}</span>
						<span class="sort-label">{option.label}</span>
					</button>
				{/each}
			</div>
		</div>

		<!-- Divider -->
		<div class="divider" aria-hidden="true"></div>

		<!-- Toggle Controls -->
		<div class="toggle-group">
			<!-- Line Overlay Toggle -->
			<button
				type="button"
				class="toggle-button"
				class:active={showLineOverlay}
				onclick={() => onLineOverlayChange(!showLineOverlay)}
				aria-pressed={showLineOverlay}
				aria-label="Toggle efficiency trend line"
			>
				<svg class="toggle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M3 17L9 11L13 15L21 7" stroke-linecap="round" stroke-linejoin="round" />
					<circle cx="21" cy="7" r="2" fill="currentColor" />
					<circle cx="13" cy="15" r="2" fill="currentColor" />
					<circle cx="9" cy="11" r="2" fill="currentColor" />
					<circle cx="3" cy="17" r="2" fill="currentColor" />
				</svg>
				<span>Trend Line</span>
			</button>

			<!-- Threshold Lines Toggle -->
			<button
				type="button"
				class="toggle-button"
				class:active={showThresholds}
				onclick={() => onThresholdsChange(!showThresholds)}
				aria-pressed={showThresholds}
				aria-label="Toggle threshold reference lines"
			>
				<svg class="toggle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<line x1="3" y1="8" x2="21" y2="8" stroke-dasharray="4 2" />
					<line x1="3" y1="16" x2="21" y2="16" stroke-dasharray="4 2" />
					<rect x="16" y="5" width="5" height="6" rx="1" fill="currentColor" opacity="0.3" />
					<rect x="16" y="13" width="5" height="6" rx="1" fill="currentColor" opacity="0.3" />
				</svg>
				<span>Thresholds</span>
			</button>
		</div>

	</div>
</div>

<style lang="postcss">
	@reference "@app-css";

	.toolbar-container {
		@apply w-full py-3;
	}

	.toolbar-inner {
		@apply flex flex-wrap items-center justify-center gap-4 rounded-xl
			   bg-linear-to-r from-slate-50 via-slate-100/50 to-slate-100
			   dark:from-slate-800/50 dark:via-slate-800 dark:to-slate-800/50
			   border border-slate-200 dark:border-slate-700
			   px-4 py-3 shadow-sm;
	}

	.control-group {
		@apply flex items-center gap-3;
	}

	.control-label {
		@apply text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide;
	}

	.button-group {
		@apply flex rounded-lg bg-slate-300/50 dark:bg-slate-700/50 p-0.5;
	}

	.sort-button {
		@apply flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium
			   text-slate-600 dark:text-slate-400
			   rounded-md transition-all duration-200
			   cursor-pointer
			   hover:text-slate-900 dark:hover:text-slate-200
			   focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500;
	}

	.sort-button.active {
		background-color: #CCEBD4;
		@apply text-emerald-800 shadow-sm;
	}

	:global(.dark) .sort-button.active {
		background-color: #009966;
		@apply text-white;
	}

	.sort-icon {
		@apply text-base leading-none;
	}

	.sort-label {
		@apply hidden sm:inline;
	}

	.divider {
		@apply w-px h-8 bg-slate-300 dark:bg-slate-600;
	}

	.toggle-group {
		@apply flex items-center gap-2;
	}

	.toggle-button {
		@apply flex items-center gap-2 px-3 py-2 text-sm font-medium
			   text-slate-600 dark:text-slate-400
			   bg-white/50 dark:bg-slate-700/50
			   border border-slate-200 dark:border-slate-600
			   rounded-lg transition-all duration-200
			   cursor-pointer
			   hover:border-emerald-300 dark:hover:border-emerald-600
			   hover:text-emerald-700 dark:hover:text-emerald-300
			   focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500;
	}

	.toggle-button.active {
		background-color: #CCEBD4;
		@apply text-emerald-800 border-emerald-300 shadow-sm;
	}

	:global(.dark) .toggle-button.active {
		background-color: #009966;
		@apply text-white border-emerald-700;
	}

	.toggle-icon {
		@apply w-4 h-4;
	}

	.d3-badge {
		@apply flex items-center gap-1.5 px-2.5 py-1
			   text-xs font-semibold text-orange-600 dark:text-orange-400
			   bg-orange-50 dark:bg-orange-900/20
			   border border-orange-200 dark:border-orange-800
			   rounded-full;
	}

	.d3-logo {
		@apply w-4 h-4;
	}
</style>

