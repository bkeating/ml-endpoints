/**
 * Page-level settings state management using Svelte 5 runes
 * Handles display options for demo-specific chart features
 */

// ============================================================================
// BAR CHART SETTINGS
// ============================================================================

/**
 * @typedef {'original' | 'ascending' | 'descending'} BarSortOrder
 */

/** @type {BarSortOrder} */
let barSortOrder = $state('original');

/** @type {boolean} */
let showLineOverlay = $state(false);

/** @type {boolean} */
let showThresholds = $state(false);

/**
 * Get the current bar chart sort order
 * @returns {BarSortOrder}
 */
export function getBarSortOrder() {
	return barSortOrder;
}

/**
 * Set the bar chart sort order
 * @param {BarSortOrder} order
 */
export function setBarSortOrder(order) {
	barSortOrder = order;
}

/**
 * Get the line overlay visibility state
 * @returns {boolean}
 */
export function getShowLineOverlay() {
	return showLineOverlay;
}

/**
 * Set the line overlay visibility
 * @param {boolean} show
 */
export function setShowLineOverlay(show) {
	showLineOverlay = show;
}

/**
 * Get the thresholds visibility state
 * @returns {boolean}
 */
export function getShowThresholds() {
	return showThresholds;
}

/**
 * Set the thresholds visibility
 * @param {boolean} show
 */
export function setShowThresholds(show) {
	showThresholds = show;
}

// ============================================================================
// PARETO CHART SETTINGS
// ============================================================================

/** @type {boolean} */
let showParetoInterpolation = $state(false);

/** @type {boolean} */
let showParetoAnnotations = $state(true);

/** @type {boolean} */
let showParetoIdealLine = $state(false);

/**
 * Get the Pareto interpolation visibility state
 * @returns {boolean}
 */
export function getShowParetoInterpolation() {
	return showParetoInterpolation;
}

/**
 * Set the Pareto interpolation visibility
 * @param {boolean} show
 */
export function setShowParetoInterpolation(show) {
	showParetoInterpolation = show;
}

/**
 * Get the Pareto annotations visibility state
 * @returns {boolean}
 */
export function getShowParetoAnnotations() {
	return showParetoAnnotations;
}

/**
 * Set the Pareto annotations visibility
 * @param {boolean} show
 */
export function setShowParetoAnnotations(show) {
	showParetoAnnotations = show;
}

/**
 * Get the Pareto ideal line visibility state
 * @returns {boolean}
 */
export function getShowParetoIdealLine() {
	return showParetoIdealLine;
}

/**
 * Set the Pareto ideal line visibility
 * @param {boolean} show
 */
export function setShowParetoIdealLine(show) {
	showParetoIdealLine = show;
}

// ============================================================================
// RESET
// ============================================================================

/**
 * Reset all page settings to defaults
 */
export function resetPageSettings() {
	// Bar chart
	barSortOrder = 'original';
	showLineOverlay = false;
	showThresholds = false;
	
	// Pareto chart
	showParetoInterpolation = false;
	showParetoAnnotations = true;
	showParetoIdealLine = false;
}
