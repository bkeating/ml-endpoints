<script>
	import { slide } from 'svelte/transition';
	import { untrack } from 'svelte';

	/**
	 * BenchmarkRange - A reusable gradient range visualization for benchmark results
	 *
	 * Displays a horizontal gradient bar from Poor (red) to Excellent (blue) with
	 * category labels, scale values, and position markers.
	 *
	 * @typedef {Object} Segment
	 * @property {string} label - Segment label (e.g., "Poor", "Fair")
	 * @property {number} threshold - Upper threshold value for this segment
	 *
	 * @typedef {Object} Props
	 * @property {string} [label] - Row label displayed on the left
	 * @property {number} value - Current value (0-100, lower is better)
	 * @property {number} [referenceValue] - Optional reference marker position
	 * @property {string} [referenceLabel] - Label for reference marker
	 * @property {string} [metricLabel] - Metric label (e.g., "Violations %")
	 * @property {Segment[]} [segments] - Custom segment definitions
	 * @property {number[]} [scaleValues] - Custom scale tick values
	 * @property {boolean} [showSegmentLabels] - Show Poor/Fair/Good... labels
	 * @property {boolean} [showDirectionIndicator] - Show Worse/Better indicator
	 * @property {number} [maxValue] - Maximum scale value
	 * @property {number} [markerWidth] - Width of the value marker in pixels
	 */

	/** @type {Props} */
	let {
		label = 'Overall',
		value = 0,
		referenceValue = undefined,
		referenceLabel = 'Reference',
		metricLabel = 'Violations %',
		segments = [
			{ label: 'Poor', threshold: 100 },
			{ label: 'Fair', threshold: 56.1 },
			{ label: 'Good', threshold: 28.1 },
			{ label: 'Very Good', threshold: 9.4 },
			{ label: 'Excellent', threshold: 0 }
		],
		scaleValues = [100, 56.1, 28.1, 9.4, 0.1, 0],
		showSegmentLabels: initialShowSegmentLabels = true,
		showDirectionIndicator: initialShowDirectionIndicator = true,
		maxValue = 100,
		markerWidth = 80
	} = $props();

	// Local state for toggling visibility (initialized from props, intentionally not reactive to prop changes)
	let segmentLabelsVisible = $state(untrack(() => initialShowSegmentLabels));
	let directionIndicatorVisible = $state(untrack(() => initialShowDirectionIndicator));

	/**
	 * Toggle visibility of labels when gradient bar is clicked
	 */
	function toggleLabels() {
		segmentLabelsVisible = !segmentLabelsVisible;
		directionIndicatorVisible = !directionIndicatorVisible;
	}

	/**
	 * Calculate position percentage for a given value (inverted scale: 100 = left, 0 = right)
	 * @param {number} val - The value to position
	 * @returns {number} Position as percentage (0-100)
	 */
	const getPosition = (val) => ((maxValue - val) / maxValue) * 100;

	// Derived positions
	let valuePosition = $derived(getPosition(value));
	let referencePosition = $derived(referenceValue !== undefined ? getPosition(referenceValue) : null);

	// Calculate segment label positions (evenly distributed across the bar)
	let segmentPositions = $derived(
		segments.map((segment, index) => {
			// Evenly distribute labels across the bar
			const position = (index / (segments.length - 1)) * 100;
			return {
				label: segment.label,
				position
			};
		})
	);

	// Scale value positions
	let scalePositions = $derived(
		scaleValues.map((val) => ({
			value: val,
			position: getPosition(val)
		}))
	);
</script>

<div class="benchmark-range w-full">
	<!-- Main Row: Label + Gradient Bar -->
	<div class="flex gap-6">
		<!-- Left Column: Row Label + Metric Label -->
		<div class="w-24 shrink-0 text-right">
			<span class="text-base font-medium text-slate-800 dark:text-slate-200">{label}</span>
		</div>

		<!-- Right Column: Gradient Bar Container -->
		<div class="relative flex-1">
			<!-- Category Labels Row (above bar) -->
			{#if segmentLabelsVisible}
				<div
					transition:slide={{ duration: 200 }}
					class="relative mb-2 flex h-6 w-full justify-around"
				>
					{#each segmentPositions as segment (segment.label)}
						<span class="text-sm font-medium text-slate-700 dark:text-slate-300">
							{segment.label}
						</span>
					{/each}
				</div>
			{/if}

			<!-- Gradient Bar (clickable to toggle labels) -->
			<button
				type="button"
				onclick={toggleLabels}
				aria-label="Toggle benchmark labels"
				aria-expanded={segmentLabelsVisible || directionIndicatorVisible}
				class="relative h-2 w-full cursor-pointer overflow-visible rounded border-none p-0"
				style="background: linear-gradient(to right,
					#ff4d4d 0%,
					#ff6b35 15%,
					#ffa500 30%,
					#c5d631 45%,
					#5cb85c 55%,
					#00b894 70%,
					#00a8cc 85%,
					#0077b6 100%
				);"
			>
				<!-- Value Marker - Gradient fade on both ends -->
				<div
					class="pointer-events-none absolute top-0 h-full -translate-x-1/2"
					style="left: {valuePosition}%; width: {markerWidth}px;"
				>
					<div
						class="h-full w-full"
						style="background: linear-gradient(to right,
							transparent 0%,
							rgba(3, 7, 18, 0.8) 9%,
							rgba(3, 7, 18, 0.9) 50%,
							rgba(3, 7, 18, 0.8) 65%,
							transparent 100%
						);"
					></div>
				</div>
			</button>

			<!-- Scale Values Row -->
			<div class="dm-mono mt-2 flex h-5 w-full justify-between text-xs text-slate-500 dark:text-slate-400">
				{#each scaleValues as scaleValue (scaleValue)}
					<span>{scaleValue}</span>
				{/each}
			</div>
		</div>
	</div>

	<!-- Metric Label + Direction Indicator Row (same line) -->
	{#if directionIndicatorVisible}
		<div transition:slide={{ duration: 200 }} class="mt-2 flex items-center gap-6">
			<!-- Metric Label (aligned with left column) -->
			<div class="w-24 shrink-0 text-right">
				<span class="text-xs text-slate-500 dark:text-slate-400">{metricLabel}</span>
			</div>
			<!-- Direction Indicator (aligned with gradient bar) -->
			<div class="flex flex-1 items-center text-xs text-slate-500 dark:text-slate-400">
				<span>←</span>
				<span class="ml-1">Worse</span>
				<div class="mx-2 h-px flex-1 bg-slate-300 dark:bg-slate-600"></div>
				<span>Reference</span>
				<div class="mx-2 h-px flex-1 bg-slate-300 dark:bg-slate-600"></div>
				<span class="mr-1">Better</span>
				<span>→</span>
			</div>
		</div>
	{/if}
</div>
