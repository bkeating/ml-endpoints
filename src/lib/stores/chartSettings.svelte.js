/**
 * Chart settings state management using Svelte 5 runes
 * Handles model visibility toggles and display options
 */

import { getModelIds } from '$lib/data/benchmarkData.js';
import { paretoSeries } from '$lib/data/paretoData.js';

/**
 * @typedef {Object} ChartSettings
 * @property {Record<string, boolean>} modelVisibility - Map of model ID to visibility
 * @property {Record<string, boolean>} paretoVisibility - Map of pareto series ID to visibility
 * @property {boolean} hideNonOptimal - Whether to hide non-optimal data points
 * @property {boolean} hideLabels - Whether to hide data point labels
 */

// Initialize visibility map with all models visible
const initialVisibility = Object.fromEntries(getModelIds().map((id) => [id, true]));

// Initialize pareto series visibility with all series visible
const initialParetoVisibility = Object.fromEntries(paretoSeries.map((s) => [s.id, true]));

/** @type {Record<string, boolean>} */
let modelVisibility = $state({ ...initialVisibility });

/** @type {Record<string, boolean>} */
let paretoVisibility = $state({ ...initialParetoVisibility });

/** @type {boolean} */
let hideNonOptimal = $state(false);

/** @type {boolean} */
let hideLabels = $state(false);

/**
 * Get current chart settings
 * @returns {ChartSettings}
 */
export function getSettings() {
	return {
		modelVisibility,
		paretoVisibility,
		hideNonOptimal,
		hideLabels
	};
}

/**
 * Check if a specific model is visible
 * @param {string} modelId
 * @returns {boolean}
 */
export function isModelVisible(modelId) {
	return modelVisibility[modelId] ?? true;
}

/**
 * Toggle visibility for a specific model
 * @param {string} modelId
 */
export function toggleModel(modelId) {
	modelVisibility[modelId] = !modelVisibility[modelId];
}

/**
 * Check if a specific pareto series is visible
 * @param {string} seriesId
 * @returns {boolean}
 */
export function isParetoSeriesVisible(seriesId) {
	return paretoVisibility[seriesId] ?? true;
}

/**
 * Toggle visibility for a specific pareto series
 * @param {string} seriesId
 */
export function toggleParetoSeries(seriesId) {
	paretoVisibility[seriesId] = !paretoVisibility[seriesId];
}

/**
 * Get all visible pareto series IDs
 * @returns {string[]}
 */
export function getVisibleParetoSeriesIds() {
	return Object.entries(paretoVisibility)
		.filter(([, visible]) => visible)
		.map(([id]) => id);
}

/**
 * Toggle the "hide non-optimal" setting
 */
export function toggleNonOptimal() {
	hideNonOptimal = !hideNonOptimal;
}

/**
 * Get the current hideNonOptimal value
 * @returns {boolean}
 */
export function getHideNonOptimal() {
	return hideNonOptimal;
}

/**
 * Toggle the "hide labels" setting
 */
export function toggleLabels() {
	hideLabels = !hideLabels;
}

/**
 * Get the current hideLabels value
 * @returns {boolean}
 */
export function getHideLabels() {
	return hideLabels;
}

/**
 * Reset all settings to defaults
 */
export function resetSettings() {
	modelVisibility = { ...initialVisibility };
	paretoVisibility = { ...initialParetoVisibility };
	hideNonOptimal = false;
	hideLabels = false;
}
