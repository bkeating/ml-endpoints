/**
 * Axis Selector Store
 * Manages state for the custom chart view with X/Y axis selection
 */

// ============================================================================
// TYPES
// ============================================================================

/**
 * @typedef {'concurrent-users' | 'ttft' | 'system-throughput' | 'interactivity' | 'normalized-throughput'} AxisId
 */

/**
 * @typedef {Object} AxisOption
 * @property {AxisId} id - Axis identifier
 * @property {string} label - Display label
 * @property {string} field - Data field name
 */

// ============================================================================
// CONSTANTS
// ============================================================================

/** @type {AxisOption[]} */
export const axisOptions = [
	{ id: 'concurrent-users', label: '# Concurrent Users', field: 'concurrentUsers' },
	{ id: 'ttft', label: 'TTFT (ms)', field: 'ttft' },
	{ id: 'system-throughput', label: 'System Throughput (tok/s)', field: 'systemThroughput' },
	{ id: 'interactivity', label: 'Interactivity (tok/s/user)', field: 'interactivity' },
	{ id: 'normalized-throughput', label: 'Normalized Throughput', field: 'normalizedThroughput' }
];

// ============================================================================
// STATE
// ============================================================================

/** @type {AxisId} */
let selectedXAxis = $state('concurrent-users');

/** @type {AxisId} */
let selectedYAxis = $state('ttft');

/** @type {Array<Object>} */
let systemsData = $state([]);

let loading = $state(true);

// ============================================================================
// GETTERS
// ============================================================================

/**
 * Get the current X-axis selection
 * @returns {AxisId}
 */
export function getSelectedXAxis() {
	return selectedXAxis;
}

/**
 * Get the current Y-axis selection
 * @returns {AxisId}
 */
export function getSelectedYAxis() {
	return selectedYAxis;
}

/**
 * Get the systems data
 * @returns {Array<Object>}
 */
export function getSystemsData() {
	return systemsData;
}

/**
 * Get loading state
 * @returns {boolean}
 */
export function getLoading() {
	return loading;
}

/**
 * Get the X-axis option details
 * @returns {AxisOption | undefined}
 */
export function getXAxisOption() {
	return axisOptions.find((opt) => opt.id === selectedXAxis);
}

/**
 * Get the Y-axis option details
 * @returns {AxisOption | undefined}
 */
export function getYAxisOption() {
	return axisOptions.find((opt) => opt.id === selectedYAxis);
}

// ============================================================================
// SETTERS
// ============================================================================

/**
 * Set the X-axis selection
 * @param {AxisId} axis
 */
export function setSelectedXAxis(axis) {
	selectedXAxis = axis;
}

/**
 * Set the Y-axis selection
 * @param {AxisId} axis
 */
export function setSelectedYAxis(axis) {
	selectedYAxis = axis;
}

/**
 * Set the systems data
 * @param {Array<Object>} data
 */
export function setSystemsData(data) {
	systemsData = data;
}

/**
 * Set loading state
 * @param {boolean} isLoading
 */
export function setLoading(isLoading) {
	loading = isLoading;
}

// ============================================================================
// DATA TRANSFORMATION
// ============================================================================

/**
 * Get chart data based on current axis selections
 * @returns {Array<{x: number, y: number, original: Object}>}
 */
export function getChartData() {
	const xOption = getXAxisOption();
	const yOption = getYAxisOption();
	
	if (!xOption || !yOption || systemsData.length === 0) {
		return [];
	}
	
	// Use first system's data points
	const system = systemsData[0];
	if (!system?.dataPoints?.length) {
		return [];
	}
	
	const xField = xOption.field;
	const yField = yOption.field;
	
	return system.dataPoints
		.map((point) => ({
			x: point[xField] ?? 0,
			y: point[yField] ?? 0,
			original: point
		}))
		.filter((point) => point.x !== 0 && point.y !== 0)
		.sort((a, b) => a.x - b.x);
}

/**
 * Get the chart title based on current axis selections
 * @returns {string}
 */
export function getChartTitle() {
	const xOption = getXAxisOption();
	const yOption = getYAxisOption();
	
	if (!xOption || !yOption) return 'Custom Chart';
	
	return `${yOption.label} vs ${xOption.label}`;
}

/**
 * Determine if X-axis should use log scale
 * @returns {boolean}
 */
export function useLogScaleX() {
	return selectedXAxis === 'concurrent-users';
}

/**
 * Determine if Y-axis should use log scale
 * @returns {boolean}
 */
export function useLogScaleY() {
	return selectedYAxis === 'system-throughput' || selectedYAxis === 'normalized-throughput';
}
