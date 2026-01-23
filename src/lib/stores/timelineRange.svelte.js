/**
 * Timeline range state management using Svelte 5 runes
 * Manages the visible X-axis range for filtering charts
 * Supports multiple charts sharing the same range
 */

/**
 * @typedef {Object} TimelineRangeState
 * @property {number} min - Minimum value of the full range
 * @property {number} max - Maximum value of the full range
 * @property {number} start - Current selection start
 * @property {number} end - Current selection end
 */

/** @type {number} */
let min = $state(0);

/** @type {number} */
let max = $state(200);

/** @type {number} */
let start = $state(0);

/** @type {number} */
let end = $state(200);

/**
 * Get the current timeline range state
 * @returns {TimelineRangeState}
 */
export function getRange() {
	return { min, max, start, end };
}

/**
 * Get the current visible range as a tuple for chart xDomain
 * @returns {[number, number]}
 */
export function getVisibleRange() {
	return [start, end];
}

/**
 * Get the full range bounds
 * @returns {[number, number]}
 */
export function getFullRange() {
	return [min, max];
}

/**
 * Set the selection start value (clamped to valid range)
 * @param {number} value
 */
export function setStart(value) {
	start = Math.max(min, Math.min(value, end - 1));
}

/**
 * Set the selection end value (clamped to valid range)
 * @param {number} value
 */
export function setEnd(value) {
	end = Math.min(max, Math.max(value, start + 1));
}

/**
 * Set both start and end simultaneously (for dragging the selection)
 * @param {number} newStart
 * @param {number} newEnd
 */
export function setRange(newStart, newEnd) {
	const rangeWidth = newEnd - newStart;

	// Clamp to bounds while preserving range width
	if (newStart < min) {
		start = min;
		end = min + rangeWidth;
	} else if (newEnd > max) {
		end = max;
		start = max - rangeWidth;
	} else {
		start = newStart;
		end = newEnd;
	}
}

/**
 * Initialize the timeline with new bounds
 * @param {number} newMin
 * @param {number} newMax
 * @param {number} [initialStart]
 * @param {number} [initialEnd]
 */
export function initRange(newMin, newMax, initialStart, initialEnd) {
	min = newMin;
	max = newMax;
	start = initialStart ?? newMin;
	end = initialEnd ?? newMax;
}

/**
 * Reset selection to full range
 */
export function resetRange() {
	start = min;
	end = max;
}

/**
 * Get start value reactively
 * @returns {number}
 */
export function getStart() {
	return start;
}

/**
 * Get end value reactively
 * @returns {number}
 */
export function getEnd() {
	return end;
}

/**
 * Get min value reactively
 * @returns {number}
 */
export function getMin() {
	return min;
}

/**
 * Get max value reactively
 * @returns {number}
 */
export function getMax() {
	return max;
}
