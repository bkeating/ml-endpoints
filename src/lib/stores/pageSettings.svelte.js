/**
 * Page-level settings state management using Svelte 5 runes
 * Handles mobile filter panel visibility for pages with chart filters
 */

// ============================================================================
// MOBILE FILTERS PANEL
// ============================================================================

/** @type {boolean} */
let mobileFiltersOpen = $state(false);

/** @type {boolean} */
let hasFilters = $state(false);

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

/**
 * Get whether the current page has filters
 * @returns {boolean}
 */
export function getHasFilters() {
	return hasFilters;
}

/**
 * Set whether the current page has filters (call from pages with filter sidebars)
 * @param {boolean} value
 */
export function setHasFilters(value) {
	hasFilters = value;
}
