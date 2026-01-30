/**
 * Chart settings state management using Svelte 5 runes
 * Handles model visibility toggles and display options
 */

import { getModelIds } from '$lib/data/benchmarkData.js';
import { paretoSeries } from '$lib/data/paretoData.js';
import { allGpuConfigs } from '$lib/data/placeholders.js';

// Import endpoints data for system IDs
import endpointsData from '../../routes/benchmarks/gtc/endpoints-benchmark-data.json';

/**
 * @typedef {Object} ChartSettings
 * @property {Record<string, boolean>} modelVisibility - Map of model ID to visibility
 * @property {Record<string, boolean>} paretoVisibility - Map of pareto series ID to visibility
 * @property {Record<string, boolean>} systemVisibility - Map of system UUID to visibility
 * @property {boolean} hideNonOptimal - Whether to hide non-optimal data points
 * @property {boolean} hideLabels - Whether to hide data point labels
 */

// Initialize visibility map with only first model visible for each model set
// Combine IDs from both benchmarkData (hyphenated) and placeholders (underscored)
const benchmarkVisibility = Object.fromEntries(getModelIds().map((id, index) => [id, index === 0]));
const gtcVisibility = Object.fromEntries(allGpuConfigs.map((id, index) => [id, index === 0]));
const initialVisibility = { ...benchmarkVisibility, ...gtcVisibility };

// Initialize pareto series visibility with all series visible
const initialParetoVisibility = Object.fromEntries(paretoSeries.map((s) => [s.id, true]));

// Initialize system visibility from endpoints data (first system visible by default)
const initialSystemVisibility = Object.fromEntries(
	endpointsData.systems.map((system, index) => [system.id, index === 0])
);

/** @type {Record<string, boolean>} */
let modelVisibility = $state({ ...initialVisibility });

/** @type {Record<string, boolean>} */
let paretoVisibility = $state({ ...initialParetoVisibility });

/** @type {Record<string, boolean>} */
let systemVisibility = $state({ ...initialSystemVisibility });

/** @type {boolean} */
let hideNonOptimal = $state(false);

/** @type {boolean} */
let hideLabels = $state(false);

/** @type {string | null} */
let hoveredRunId = $state(null);

/** @type {{ modelName: string, modelColor: string } | null} */
let hoveredRunInfo = $state(null);

/**
 * Get current chart settings
 * @returns {ChartSettings}
 */
export function getSettings() {
	return {
		modelVisibility,
		paretoVisibility,
		systemVisibility,
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
	return modelVisibility[modelId] ?? false;
}

/**
 * Toggle visibility for a specific model
 * @param {string} modelId
 */
export function toggleModel(modelId) {
	modelVisibility[modelId] = !modelVisibility[modelId];
}

/**
 * Get all visible model IDs
 * @returns {string[]}
 */
export function getVisibleModelIds() {
	return Object.entries(modelVisibility)
		.filter(([, visible]) => visible)
		.map(([id]) => id);
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

// ============================================================================
// SYSTEM VISIBILITY (for GTC/Endpoints benchmark charts)
// ============================================================================

/**
 * Check if a specific system is visible (by UUID)
 * @param {string} systemId - System UUID
 * @returns {boolean}
 */
export function isSystemVisible(systemId) {
	return systemVisibility[systemId] ?? false;
}

// ============================================================================
// BENCHMARK MODEL FILTER (for filtering submissions by model)
// ============================================================================

/** @type {number | 'all'} - Selected benchmark model ID or 'all' for no filter */
let selectedBenchmarkModelId = $state(endpointsData.models[0]?.model_id ?? 'all');

/**
 * Get the currently selected benchmark model ID
 * @returns {number | 'all'}
 */
export function getSelectedBenchmarkModelId() {
	return selectedBenchmarkModelId;
}

/**
 * Set the selected benchmark model ID
 * @param {number | 'all'} modelId - Model ID or 'all'
 */
export function setSelectedBenchmarkModelId(modelId) {
	selectedBenchmarkModelId = modelId;
}

// ============================================================================
// ACCELERATOR FILTER (for filtering systems by accelerator type)
// ============================================================================

/** @type {string} - Selected accelerator model name or 'all' for no filter */
let selectedAccelerator = $state('all');

/**
 * Get the currently selected accelerator filter
 * @returns {string}
 */
export function getSelectedAccelerator() {
	return selectedAccelerator;
}

/**
 * Set the selected accelerator filter
 * @param {string} accelerator - Accelerator model name or 'all'
 */
export function setSelectedAccelerator(accelerator) {
	selectedAccelerator = accelerator;
}

/**
 * Check if a system is disabled by the accelerator filter
 * @param {string} acceleratorModelName - The system's accelerator model name
 * @returns {boolean} - True if the system should be disabled/hidden
 */
export function isSystemDisabledByAccelerator(acceleratorModelName) {
	if (selectedAccelerator === 'all') return false;
	return acceleratorModelName !== selectedAccelerator;
}

/**
 * Get system IDs that match the current accelerator filter
 * @returns {string[]} - Array of system IDs that match the filter
 */
export function getAcceleratorFilteredSystemIds() {
	if (selectedAccelerator === 'all') {
		return endpointsData.systems.map((s) => s.id);
	}
	return endpointsData.systems
		.filter((s) => s.accelerator_model_name === selectedAccelerator)
		.map((s) => s.id);
}

/**
 * Toggle visibility for a specific system
 * @param {string} systemId - System UUID
 */
export function toggleSystem(systemId) {
	systemVisibility[systemId] = !systemVisibility[systemId];
}

/**
 * Get all visible system IDs
 * @returns {string[]}
 */
export function getVisibleSystemIds() {
	return Object.entries(systemVisibility)
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

// ============================================================================
// CROSS-CHART HOVER SYNCHRONIZATION
// ============================================================================

/**
 * Set the currently hovered run ID and info (for cross-chart highlighting and tooltips)
 * @param {string | null} runId - Run UUID or null to clear
 * @param {{ modelName: string, modelColor: string }} [info] - Optional model info for tooltip display
 */
export function setHoveredRunId(runId, info = null) {
	hoveredRunId = runId;
	hoveredRunInfo = info;
}

/**
 * Get the currently hovered run ID
 * @returns {string | null}
 */
export function getHoveredRunId() {
	return hoveredRunId;
}

/**
 * Check if a specific run is currently hovered
 * @param {string} runId - Run UUID
 * @returns {boolean}
 */
export function isRunHovered(runId) {
	return hoveredRunId === runId;
}

/**
 * Get the currently hovered run info (model name and color)
 * @returns {{ modelName: string, modelColor: string } | null}
 */
export function getHoveredRunInfo() {
	return hoveredRunInfo;
}

/**
 * Reset all settings to defaults
 */
export function resetSettings() {
	modelVisibility = { ...initialVisibility };
	paretoVisibility = { ...initialParetoVisibility };
	systemVisibility = { ...initialSystemVisibility };
	selectedBenchmarkModelId = endpointsData.models[0]?.model_id ?? 'all';
	selectedAccelerator = 'all';
	hideNonOptimal = false;
	hideLabels = false;
}
