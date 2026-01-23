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
let showParetoInterpolation = $state(true);

/** @type {boolean} */
let showParetoAnnotations = $state(false);

/** @type {boolean} */
let showParetoIdealLine = $state(true);

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
// MOBILE FILTERS PANEL
// ============================================================================

/** @type {boolean} */
let mobileFiltersOpen = $state(false);

/**
 * Get the mobile filters panel open state
 * @returns {boolean}
 */
export function getMobileFiltersOpen() {
	return mobileFiltersOpen;
}

/**
 * Set the mobile filters panel open state
 * @param {boolean} open
 */
export function setMobileFiltersOpen(open) {
	mobileFiltersOpen = open;
}

/**
 * Toggle the mobile filters panel
 */
export function toggleMobileFilters() {
	mobileFiltersOpen = !mobileFiltersOpen;
}

/**
 * Close the mobile filters panel
 */
export function closeMobileFilters() {
	mobileFiltersOpen = false;
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
	showParetoInterpolation = true;
	showParetoAnnotations = false;
	showParetoIdealLine = true;

	// Mobile filters
	mobileFiltersOpen = false;
}
