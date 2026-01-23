/**
 * MLPerf Benchmark Filters Store
 *
 * Manages reactive state for filtering MLPerf Inference benchmark data.
 * Filters cascade: version -> model -> scenario -> organization -> accelerator
 *
 * @typedef {'v5.1' | 'v5.0' | 'v4.1' | 'v4.0'} MlperfVersion
 * @typedef {'Offline' | 'Server'} Scenario
 */

import { SvelteSet } from 'svelte/reactivity';

/**
 * @typedef {Object} BenchmarkResult
 * @property {string} id - Unique identifier
 * @property {string} version - MLPerf version
 * @property {string} model - MLC model name
 * @property {string} scenario - Offline or Server
 * @property {string} organization - Submitting organization
 * @property {string} accelerator - Hardware accelerator
 * @property {number} acceleratorCount - Number of accelerators
 * @property {string} systemName - Full system name
 * @property {number} performance - Performance metric (tokens/s)
 * @property {string} [notes] - Additional notes
 */

/** MLPerf version options */
export const versionOptions = /** @type {const} */ ([
	{ id: 'v5.1', label: 'v5.1' },
	{ id: 'v5.0', label: 'v5.0' },
	{ id: 'v4.1', label: 'v4.1' },
	{ id: 'v4.0', label: 'v4.0' }
]);

/** Scenario options */
export const scenarioOptions = /** @type {const} */ ([
	{ id: 'Offline', label: 'Offline' },
	{ id: 'Server', label: 'Server' }
]);

// Sample benchmark data (simulating MLPerf Inference results)
/** @type {BenchmarkResult[]} */
const sampleData = [
	// v5.1 - llama3.1-8b-datacenter
	{
		id: '1',
		version: 'v5.1',
		model: 'llama3.1-8b-datacenter',
		scenario: 'Offline',
		organization: 'RedHat',
		accelerator: 'NVIDIA H100-SXM-80GB',
		acceleratorCount: 1,
		systemName: 'Dell PowerEdge XE8640 (1xH100-SXM-80GB vLLM)',
		performance: 5776.32
	},
	{
		id: '2',
		version: 'v5.1',
		model: 'llama3.1-8b-datacenter',
		scenario: 'Offline',
		organization: 'RedHat',
		accelerator: 'NVIDIA L40S',
		acceleratorCount: 1,
		systemName: 'IBM Cloud gx3 instance 1xL40S-PCIE-48GB vLLM',
		performance: 1641.89
	},
	{
		id: '3',
		version: 'v5.1',
		model: 'llama3.1-8b-datacenter',
		scenario: 'Server',
		organization: 'RedHat',
		accelerator: 'NVIDIA H100-SXM-80GB',
		acceleratorCount: 1,
		systemName: 'Dell PowerEdge XE8640 (1xH100-SXM-80GB vLLM)',
		performance: 5102.45
	},
	{
		id: '4',
		version: 'v5.1',
		model: 'llama3.1-8b-datacenter',
		scenario: 'Server',
		organization: 'RedHat',
		accelerator: 'NVIDIA L40S',
		acceleratorCount: 1,
		systemName: 'IBM Cloud gx3 instance 1xL40S-PCIE-48GB vLLM',
		performance: 1366.21
	},
	{
		id: '5',
		version: 'v5.1',
		model: 'llama3.1-8b-datacenter',
		scenario: 'Offline',
		organization: 'NVIDIA',
		accelerator: 'NVIDIA H100-SXM-80GB',
		acceleratorCount: 8,
		systemName: 'NVIDIA DGX H100 (8xH100-SXM-80GB TensorRT-LLM)',
		performance: 42156.78
	},
	{
		id: '6',
		version: 'v5.1',
		model: 'llama3.1-8b-datacenter',
		scenario: 'Server',
		organization: 'NVIDIA',
		accelerator: 'NVIDIA H100-SXM-80GB',
		acceleratorCount: 8,
		systemName: 'NVIDIA DGX H100 (8xH100-SXM-80GB TensorRT-LLM)',
		performance: 38921.34
	},
	// v5.1 - llama3.1-70b-datacenter
	{
		id: '7',
		version: 'v5.1',
		model: 'llama3.1-70b-datacenter',
		scenario: 'Offline',
		organization: 'NVIDIA',
		accelerator: 'NVIDIA H100-SXM-80GB',
		acceleratorCount: 8,
		systemName: 'NVIDIA DGX H100 (8xH100-SXM-80GB TensorRT-LLM)',
		performance: 8234.56
	},
	{
		id: '8',
		version: 'v5.1',
		model: 'llama3.1-70b-datacenter',
		scenario: 'Server',
		organization: 'NVIDIA',
		accelerator: 'NVIDIA H100-SXM-80GB',
		acceleratorCount: 8,
		systemName: 'NVIDIA DGX H100 (8xH100-SXM-80GB TensorRT-LLM)',
		performance: 7456.23
	},
	{
		id: '9',
		version: 'v5.1',
		model: 'llama3.1-70b-datacenter',
		scenario: 'Offline',
		organization: 'Intel',
		accelerator: 'Intel Gaudi2',
		acceleratorCount: 8,
		systemName: 'Intel Gaudi2 Server (8xGaudi2)',
		performance: 4521.67
	},
	// v5.0 data
	{
		id: '10',
		version: 'v5.0',
		model: 'llama2-70b-datacenter',
		scenario: 'Offline',
		organization: 'NVIDIA',
		accelerator: 'NVIDIA H100-SXM-80GB',
		acceleratorCount: 8,
		systemName: 'NVIDIA DGX H100 (8xH100-SXM-80GB TensorRT-LLM)',
		performance: 7856.34
	},
	{
		id: '11',
		version: 'v5.0',
		model: 'llama2-70b-datacenter',
		scenario: 'Server',
		organization: 'NVIDIA',
		accelerator: 'NVIDIA H100-SXM-80GB',
		acceleratorCount: 8,
		systemName: 'NVIDIA DGX H100 (8xH100-SXM-80GB TensorRT-LLM)',
		performance: 7123.45
	},
	{
		id: '12',
		version: 'v5.0',
		model: 'gpt-j-datacenter',
		scenario: 'Offline',
		organization: 'Dell',
		accelerator: 'NVIDIA A100-SXM-80GB',
		acceleratorCount: 4,
		systemName: 'Dell PowerEdge R750xa (4xA100-SXM-80GB)',
		performance: 12456.78
	},
	// v4.1 data
	{
		id: '13',
		version: 'v4.1',
		model: 'bert-large',
		scenario: 'Offline',
		organization: 'NVIDIA',
		accelerator: 'NVIDIA A100-SXM-80GB',
		acceleratorCount: 8,
		systemName: 'NVIDIA DGX A100 (8xA100-SXM-80GB)',
		performance: 45678.9
	},
	{
		id: '14',
		version: 'v4.1',
		model: 'bert-large',
		scenario: 'Server',
		organization: 'NVIDIA',
		accelerator: 'NVIDIA A100-SXM-80GB',
		acceleratorCount: 8,
		systemName: 'NVIDIA DGX A100 (8xA100-SXM-80GB)',
		performance: 42345.67
	},
	{
		id: '15',
		version: 'v4.1',
		model: 'resnet50',
		scenario: 'Offline',
		organization: 'Qualcomm',
		accelerator: 'Qualcomm Cloud AI 100',
		acceleratorCount: 16,
		systemName: 'Qualcomm Cloud AI 100 Server',
		performance: 123456.78
	}
];

// ============================================================================
// REACTIVE STATE
// ============================================================================

/** @type {string} */
let selectedVersion = $state('v5.1');

/** @type {string} */
let selectedModel = $state('');

/** @type {string[]} */
let selectedScenarios = $state(['Offline', 'Server']);

/** @type {string[]} */
let selectedOrganizations = $state([]);

/** @type {string[]} */
let selectedAccelerators = $state([]);

/** @type {string[]} */
let selectedAcceleratorCounts = $state([]);

// ============================================================================
// DERIVED VALUES - Cascading filter options
// ============================================================================

/**
 * Get all benchmark data
 * @returns {BenchmarkResult[]}
 */
export function getAllData() {
	return sampleData;
}

/**
 * Get data filtered by version only
 * @returns {BenchmarkResult[]}
 */
export function getDataByVersion() {
	return sampleData.filter((d) => d.version === selectedVersion);
}

/**
 * Get available models for selected version
 * @returns {{ id: string, label: string }[]}
 */
export function getAvailableModels() {
	const versionData = getDataByVersion();
	const models = [...new SvelteSet(versionData.map((d) => d.model))];
	return models.map((m) => ({ id: m, label: m }));
}

/**
 * Get data filtered by version and model
 * @returns {BenchmarkResult[]}
 */
export function getDataByVersionAndModel() {
	return sampleData.filter((d) => d.version === selectedVersion && d.model === selectedModel);
}

/**
 * Get available scenarios for selected version and model
 * @returns {{ id: string, label: string }[]}
 */
export function getAvailableScenarios() {
	const data = getDataByVersionAndModel();
	const scenarios = [...new SvelteSet(data.map((d) => d.scenario))];
	return scenarios.map((s) => ({ id: s, label: s }));
}

/**
 * Get available organizations for current filter state
 * @returns {{ id: string, label: string }[]}
 */
export function getAvailableOrganizations() {
	const data = getDataByVersionAndModel().filter(
		(d) => selectedScenarios.length === 0 || selectedScenarios.includes(d.scenario)
	);
	const orgs = [...new SvelteSet(data.map((d) => d.organization))];
	return orgs.map((o) => ({ id: o, label: o }));
}

/**
 * Get available accelerators for current filter state
 * @returns {{ id: string, label: string }[]}
 */
export function getAvailableAccelerators() {
	const data = getDataByVersionAndModel().filter(
		(d) =>
			(selectedScenarios.length === 0 || selectedScenarios.includes(d.scenario)) &&
			(selectedOrganizations.length === 0 || selectedOrganizations.includes(d.organization))
	);
	const accelerators = [...new SvelteSet(data.map((d) => d.accelerator))];
	return accelerators.map((a) => ({ id: a, label: a }));
}

/**
 * Get available accelerator counts for current filter state
 * @returns {{ id: string, label: string }[]}
 */
export function getAvailableAcceleratorCounts() {
	const data = getDataByVersionAndModel().filter(
		(d) =>
			(selectedScenarios.length === 0 || selectedScenarios.includes(d.scenario)) &&
			(selectedOrganizations.length === 0 || selectedOrganizations.includes(d.organization)) &&
			(selectedAccelerators.length === 0 || selectedAccelerators.includes(d.accelerator))
	);
	const counts = [...new SvelteSet(data.map((d) => d.acceleratorCount))].sort((a, b) => a - b);
	return counts.map((c) => ({ id: String(c), label: String(c) }));
}

/**
 * Get fully filtered results
 * @returns {BenchmarkResult[]}
 */
export function getFilteredResults() {
	return sampleData.filter((d) => {
		if (d.version !== selectedVersion) return false;
		if (selectedModel && d.model !== selectedModel) return false;
		if (selectedScenarios.length > 0 && !selectedScenarios.includes(d.scenario)) return false;
		if (selectedOrganizations.length > 0 && !selectedOrganizations.includes(d.organization))
			return false;
		if (selectedAccelerators.length > 0 && !selectedAccelerators.includes(d.accelerator))
			return false;
		if (
			selectedAcceleratorCounts.length > 0 &&
			!selectedAcceleratorCounts.includes(String(d.acceleratorCount))
		)
			return false;
		return true;
	});
}

// ============================================================================
// GETTERS
// ============================================================================

/** @returns {string} */
export function getSelectedVersion() {
	return selectedVersion;
}

/** @returns {string} */
export function getSelectedModel() {
	return selectedModel;
}

/** @returns {string[]} */
export function getSelectedScenarios() {
	return selectedScenarios;
}

/** @returns {string[]} */
export function getSelectedOrganizations() {
	return selectedOrganizations;
}

/** @returns {string[]} */
export function getSelectedAccelerators() {
	return selectedAccelerators;
}

/** @returns {string[]} */
export function getSelectedAcceleratorCounts() {
	return selectedAcceleratorCounts;
}

// ============================================================================
// SETTERS
// ============================================================================

/**
 * Set the MLPerf version and reset dependent filters
 * @param {string} version
 */
export function setVersion(version) {
	selectedVersion = version;
	// Reset dependent filters
	const models = getAvailableModels();
	selectedModel = models.length > 0 ? models[0].id : '';
	selectedScenarios = ['Offline', 'Server'];
	selectedOrganizations = [];
	selectedAccelerators = [];
	selectedAcceleratorCounts = [];
}

/**
 * Set the model and reset dependent filters
 * @param {string} model
 */
export function setModel(model) {
	selectedModel = model;
	// Reset dependent filters but keep scenarios
	selectedOrganizations = [];
	selectedAccelerators = [];
	selectedAcceleratorCounts = [];
}

/**
 * Toggle a scenario selection
 * @param {string} scenario
 */
export function toggleScenario(scenario) {
	if (selectedScenarios.includes(scenario)) {
		selectedScenarios = selectedScenarios.filter((s) => s !== scenario);
	} else {
		selectedScenarios = [...selectedScenarios, scenario];
	}
}

/**
 * Set scenarios directly
 * @param {string[]} scenarios
 */
export function setScenarios(scenarios) {
	selectedScenarios = scenarios;
}

/**
 * Toggle an organization selection
 * @param {string} org
 */
export function toggleOrganization(org) {
	if (selectedOrganizations.includes(org)) {
		selectedOrganizations = selectedOrganizations.filter((o) => o !== org);
	} else {
		selectedOrganizations = [...selectedOrganizations, org];
	}
}

/**
 * Set organizations directly
 * @param {string[]} orgs
 */
export function setOrganizations(orgs) {
	selectedOrganizations = orgs;
}

/**
 * Toggle an accelerator selection
 * @param {string} accelerator
 */
export function toggleAccelerator(accelerator) {
	if (selectedAccelerators.includes(accelerator)) {
		selectedAccelerators = selectedAccelerators.filter((a) => a !== accelerator);
	} else {
		selectedAccelerators = [...selectedAccelerators, accelerator];
	}
}

/**
 * Set accelerators directly
 * @param {string[]} accelerators
 */
export function setAccelerators(accelerators) {
	selectedAccelerators = accelerators;
}

/**
 * Toggle an accelerator count selection
 * @param {string} count
 */
export function toggleAcceleratorCount(count) {
	if (selectedAcceleratorCounts.includes(count)) {
		selectedAcceleratorCounts = selectedAcceleratorCounts.filter((c) => c !== count);
	} else {
		selectedAcceleratorCounts = [...selectedAcceleratorCounts, count];
	}
}

/**
 * Set accelerator counts directly
 * @param {string[]} counts
 */
export function setAcceleratorCounts(counts) {
	selectedAcceleratorCounts = counts;
}

/**
 * Select all organizations
 */
export function selectAllOrganizations() {
	const available = getAvailableOrganizations();
	selectedOrganizations = available.map((o) => o.id);
}

/**
 * Reset all filters to defaults
 */
export function resetFilters() {
	selectedVersion = 'v5.1';
	const models = getAvailableModels();
	selectedModel = models.length > 0 ? models[0].id : '';
	selectedScenarios = ['Offline', 'Server'];
	selectedOrganizations = [];
	selectedAccelerators = [];
	selectedAcceleratorCounts = [];
}

/**
 * Clear all filters (except version)
 */
export function clearFilters() {
	selectedModel = '';
	selectedScenarios = [];
	selectedOrganizations = [];
	selectedAccelerators = [];
	selectedAcceleratorCounts = [];
}

// ============================================================================
// COMPUTED STATS
// ============================================================================

/**
 * Get summary statistics for filtered results
 * @returns {{ totalSubmissions: number, uniqueOrgs: number, uniqueAccelerators: number, maxPerformance: number, avgPerformance: number }}
 */
export function getFilteredStats() {
	const results = getFilteredResults();
	const uniqueOrgs = new SvelteSet(results.map((r) => r.organization)).size;
	const uniqueAccelerators = new SvelteSet(results.map((r) => r.accelerator)).size;
	const performances = results.map((r) => r.performance);
	const maxPerformance = performances.length > 0 ? Math.max(...performances) : 0;
	const avgPerformance =
		performances.length > 0 ? performances.reduce((a, b) => a + b, 0) / performances.length : 0;

	return {
		totalSubmissions: results.length,
		uniqueOrgs,
		uniqueAccelerators,
		maxPerformance,
		avgPerformance
	};
}

// Initialize with first available model
// Note: This runs once at module initialization
(() => {
	const initialModels = getAvailableModels();
	if (initialModels.length > 0 && selectedModel === '') {
		selectedModel = initialModels[0].id;
	}
})();
