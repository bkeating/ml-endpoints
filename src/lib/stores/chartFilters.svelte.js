/**
 * @typedef {'gpt-oss-120b' | 'deepseek-r1-0528' | 'llama-3.3-70b'} ModelId
 */

/**
 * @typedef {'1k/1k' | '1k/8k' | '8k/1k'} IslOsl
 */

/**
 * @typedef {'FP4' | 'FP8'} Precision
 */

/**
 * @typedef {'token-throughput-per-gpu' | 'input-token-throughput-per-gpu' | 'output-token-throughput-per-gpu' | 'token-throughput-per-mw' | 'cost-per-million-owning-hyperscaler' | 'cost-per-million-owning-neocloud' | 'cost-per-million-3yr-rental' | 'cost-per-million-customer-values'} YAxisMetric
 */

/**
 * @typedef {'throughput' | 'utilization' | 'interactivity'} ParetoViewMode
 */

/**
 * @typedef {Object} ChartFilters
 * @property {ModelId} model - Selected model
 * @property {IslOsl} islOsl - Input/Output sequence length configuration
 * @property {Precision} precision - Floating point precision
 * @property {YAxisMetric} yAxisMetric - Y-axis metric selection
 */

/** Model options for the filter form */
export const modelOptions = /** @type {const} */ ([
	{ id: 'gpt-oss-120b', label: 'gpt-oss 120B' },
	{ id: 'deepseek-r1-0528', label: 'DeepSeek R1 0528' },
	{ id: 'llama-3.3-70b', label: 'Llama 3.3 70B Instruct' }
]);

/** ISL/OSL options for the filter form */
export const islOslOptions = /** @type {const} */ ([
	{ id: '1k/1k', label: '1k/1k' },
	{ id: '1k/8k', label: '1k/8k' },
	{ id: '8k/1k', label: '8k/1k' }
]);

/** Precision options for the filter form */
export const precisionOptions = /** @type {const} */ ([
	{ id: 'FP4', label: 'FP4' },
	{ id: 'FP8', label: 'FP8' }
]);

/** Y-axis metric options for the filter form */
export const yAxisMetricOptions = /** @type {const} */ ([
	{ id: 'token-throughput-per-gpu', label: 'Token Throughput per GPU' },
	{ id: 'input-token-throughput-per-gpu', label: 'Input Token Throughput per GPU' },
	{ id: 'output-token-throughput-per-gpu', label: 'Output Token Throughput per GPU' },
	{ id: 'token-throughput-per-mw', label: 'Token Throughput per All in Utility MW' },
	{ id: 'cost-per-million-owning-hyperscaler', label: 'Cost per Million Tokens (Owning - Hyperscaler)' },
	{ id: 'cost-per-million-owning-neocloud', label: 'Cost per Million Tokens (Owning - Neocloud Giant)' },
	{ id: 'cost-per-million-3yr-rental', label: 'Cost per Million Tokens (3 Year rental)' },
	{ id: 'cost-per-million-customer-values', label: 'Cost per Million Tokens (Customer User Values)' }
]);

/** Pareto view mode options for the filter form */
export const paretoViewModeOptions = /** @type {const} */ ([
	{ id: 'throughput', label: 'Throughput', description: 'Total system throughput at each concurrency level' },
	{ id: 'utilization', label: 'Utilization', description: 'Percentage of maximum achievable throughput' },
	{ id: 'interactivity', label: 'Interactivity', description: 'Per-user token throughput (user experience metric)' }
]);

/** @type {ChartFilters} */
const defaultFilters = {
	model: 'gpt-oss-120b',
	islOsl: '1k/8k',
	precision: 'FP4',
	yAxisMetric: 'token-throughput-per-gpu'
};

// $state() creates reactive state that triggers updates when mutated
/** @type {ChartFilters} */
let filters = $state({ ...defaultFilters });

/** @type {ParetoViewMode} */
let paretoViewMode = $state('utilization');

/**
 * Get the current filter values
 * @returns {ChartFilters}
 */
export function getFilters() {
	return filters;
}

/**
 * Get the current Pareto view mode
 * @returns {ParetoViewMode}
 */
export function getParetoViewMode() {
	return paretoViewMode;
}

/**
 * Set the Pareto view mode
 * @param {ParetoViewMode} mode
 */
export function setParetoViewMode(mode) {
	paretoViewMode = mode;
}

/**
 * Get the current model
 * @returns {ModelId}
 */
export function getModel() {
	return filters.model;
}

/**
 * Set the model filter
 * @param {ModelId} model
 */
export function setModel(model) {
	filters.model = model;
}

/**
 * Get the current ISL/OSL setting
 * @returns {IslOsl}
 */
export function getIslOsl() {
	return filters.islOsl;
}

/**
 * Set the ISL/OSL filter
 * @param {IslOsl} islOsl
 */
export function setIslOsl(islOsl) {
	filters.islOsl = islOsl;
}

/**
 * Get the current precision setting
 * @returns {Precision}
 */
export function getPrecision() {
	return filters.precision;
}

/**
 * Set the precision filter
 * @param {Precision} precision
 */
export function setPrecision(precision) {
	filters.precision = precision;
}

/**
 * Get the current Y-axis metric
 * @returns {YAxisMetric}
 */
export function getYAxisMetric() {
	return filters.yAxisMetric;
}

/**
 * Set the Y-axis metric filter
 * @param {YAxisMetric} yAxisMetric
 */
export function setYAxisMetric(yAxisMetric) {
	filters.yAxisMetric = yAxisMetric;
}

/**
 * Reset all filters to default values
 */
export function resetFilters() {
	filters = { ...defaultFilters };
	paretoViewMode = 'utilization';
}

/**
 * Generate a subtitle from the current filter settings
 * @returns {string}
 */
export function getFilterSubtitle() {
	const model = modelOptions.find((m) => m.id === filters.model)?.label ?? filters.model;
	return `${model} • ${filters.precision} • ${filters.islOsl} • Source: SemiAnalysis InferenceMAX™`;
}
