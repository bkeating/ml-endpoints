/**
 * MLPerf Endpoints Pareto visualization sample data
 * 
 * Data structures designed for Pareto step-function charts showing:
 * - Total System Throughput vs Concurrent Clients
 * - % Utilization vs Concurrent Clients
 * - Interactivity (TPS/User) vs Concurrent Clients
 * - Throughput vs Interactivity trade-off
 * 
 * NOTE: This is SYNTHETIC demonstration data inspired by the MLPerf Endpoints spec.
 */

// ============================================================================
// PARETO SERIES DATA
// ============================================================================

/**
 * @typedef {Object} ParetoPoint
 * @property {number} concurrent_clients - Number of concurrent clients (X-axis)
 * @property {number} total_tput - Total system throughput in tokens/second
 * @property {number} tps_usr - Tokens per second per user (interactivity)
 * @property {number} util - Utilization percentage of max throughput
 * @property {boolean} [is_compliance_point] - Whether this is a min/max compliance point
 */

/**
 * @typedef {Object} ParetoSeries
 * @property {string} id - Unique series identifier
 * @property {string} label - Display label for legend
 * @property {string} hardware_config - Hardware configuration name
 * @property {string} vendor - Hardware vendor
 * @property {string} color - HSL or hex color
 * @property {ParetoPoint[]} points - Data points sorted by concurrent_clients
 * @property {number} max_throughput - Maximum throughput for normalization
 * @property {number} min_concurrency - Minimum concurrency level
 * @property {number} max_concurrency - Maximum concurrency level
 */

/**
 * @typedef {Object} ParetoAnnotation
 * @property {string} id - Unique annotation identifier
 * @property {string} text - Annotation text (supports \n for multi-line)
 * @property {{ x: number, y: number }} targetPoint - Data coordinates to point to
 * @property {{ dx: number, dy: number }} labelOffset - Pixel offset from target
 * @property {'start' | 'middle' | 'end'} anchor - Text anchor alignment
 */

/**
 * Sample Pareto series data for demonstration
 * Based on MLPerf Endpoints visualization spec
 * @type {ParetoSeries[]}
 */
export const paretoSeries = [
	{
		id: 'gb200x72-dynamo-fp4',
		label: 'GB200x72 w/ Dynamo TRT FP4',
		hardware_config: 'GB200x72_Dynamo_TRT_FP4',
		vendor: 'NVIDIA',
		color: '#2563eb', // blue-600
		points: [
			{ concurrent_clients: 1, total_tput: 5000, tps_usr: 5000, util: 0.7, is_compliance_point: true },
			{ concurrent_clients: 8, total_tput: 38000, tps_usr: 4750, util: 5.4 },
			{ concurrent_clients: 32, total_tput: 140000, tps_usr: 4375, util: 20.0 },
			{ concurrent_clients: 128, total_tput: 420000, tps_usr: 3281, util: 60.0 },
			{ concurrent_clients: 512, total_tput: 580000, tps_usr: 1133, util: 82.9 },
			{ concurrent_clients: 2048, total_tput: 650000, tps_usr: 317, util: 92.9 },
			{ concurrent_clients: 4096, total_tput: 700000, tps_usr: 171, util: 100.0, is_compliance_point: true }
		],
		max_throughput: 700000,
		min_concurrency: 1,
		max_concurrency: 4096
	},
	{
		id: 'h200x8-vllm-fp8',
		label: 'H200x8 vLLM FP8',
		hardware_config: 'H200x8_vLLM_FP8',
		vendor: 'NVIDIA',
		color: '#16a34a', // green-600
		points: [
			{ concurrent_clients: 1, total_tput: 3200, tps_usr: 3200, util: 1.5, is_compliance_point: true },
			{ concurrent_clients: 8, total_tput: 24000, tps_usr: 3000, util: 11.4 },
			{ concurrent_clients: 32, total_tput: 85000, tps_usr: 2656, util: 40.5 },
			{ concurrent_clients: 128, total_tput: 165000, tps_usr: 1289, util: 78.6 },
			{ concurrent_clients: 512, total_tput: 195000, tps_usr: 381, util: 92.9 },
			{ concurrent_clients: 1024, total_tput: 210000, tps_usr: 205, util: 100.0, is_compliance_point: true }
		],
		max_throughput: 210000,
		min_concurrency: 1,
		max_concurrency: 1024
	},
	{
		id: 'mi300x-rocm-fp8',
		label: 'MI300X ROCm FP8',
		hardware_config: 'MI300X_ROCm_FP8',
		vendor: 'AMD',
		color: '#dc2626', // red-600
		points: [
			{ concurrent_clients: 1, total_tput: 2800, tps_usr: 2800, util: 1.8, is_compliance_point: true },
			{ concurrent_clients: 8, total_tput: 21000, tps_usr: 2625, util: 13.5 },
			{ concurrent_clients: 32, total_tput: 72000, tps_usr: 2250, util: 46.2 },
			{ concurrent_clients: 128, total_tput: 125000, tps_usr: 977, util: 80.1 },
			{ concurrent_clients: 512, total_tput: 150000, tps_usr: 293, util: 96.2 },
			{ concurrent_clients: 1024, total_tput: 156000, tps_usr: 152, util: 100.0, is_compliance_point: true }
		],
		max_throughput: 156000,
		min_concurrency: 1,
		max_concurrency: 1024
	},
	{
		id: 'gaudi3-synapse-bf16',
		label: 'Gaudi3 Synapse BF16',
		hardware_config: 'Gaudi3_Synapse_BF16',
		vendor: 'Intel',
		color: '#9333ea', // purple-600
		points: [
			{ concurrent_clients: 1, total_tput: 1800, tps_usr: 1800, util: 2.0, is_compliance_point: true },
			{ concurrent_clients: 8, total_tput: 13500, tps_usr: 1688, util: 15.0 },
			{ concurrent_clients: 32, total_tput: 45000, tps_usr: 1406, util: 50.0 },
			{ concurrent_clients: 128, total_tput: 72000, tps_usr: 563, util: 80.0 },
			{ concurrent_clients: 512, total_tput: 85000, tps_usr: 166, util: 94.4 },
			{ concurrent_clients: 1024, total_tput: 90000, tps_usr: 88, util: 100.0, is_compliance_point: true }
		],
		max_throughput: 90000,
		min_concurrency: 1,
		max_concurrency: 1024
	}
];

/**
 * Sample annotations for Pareto charts - Throughput view
 * @type {ParetoAnnotation[]}
 */
export const paretoAnnotations = [
	{
		id: 'max-perf',
		text: 'Max concurrency where\nsystem throughput peaks',
		targetPoint: { x: 4096, y: 700000 },
		labelOffset: { dx: -120, dy: -50 },
		anchor: 'end'
	},
	{
		id: 'compliance-min',
		text: 'Compliance point:\nSingle client baseline',
		targetPoint: { x: 1, y: 5000 },
		labelOffset: { dx: 80, dy: -30 },
		anchor: 'start'
	},
	{
		id: 'scaling-region',
		text: '~Linear scaling region',
		targetPoint: { x: 32, y: 140000 },
		labelOffset: { dx: 60, dy: -60 },
		anchor: 'start'
	}
];

/**
 * Annotations for Utilization view (% of max throughput)
 * @type {ParetoAnnotation[]}
 */
export const utilizationAnnotations = [
	{
		id: 'max-util',
		text: 'Peak utilization at\nmax concurrency',
		targetPoint: { x: 4096, y: 100 },
		labelOffset: { dx: -120, dy: 30 },
		anchor: 'end'
	},
	{
		id: 'scaling-gap',
		text: 'Gap from ideal shows\nscaling inefficiency',
		targetPoint: { x: 128, y: 60 },
		labelOffset: { dx: 60, dy: -40 },
		anchor: 'start'
	}
];

/**
 * Annotations for Interactivity view (TPS per user)
 * @type {ParetoAnnotation[]}
 */
export const interactivityAnnotations = [
	{
		id: 'best-ux',
		text: 'Best user experience:\nlow concurrency',
		targetPoint: { x: 1, y: 5000 },
		labelOffset: { dx: 80, dy: 20 },
		anchor: 'start'
	},
	{
		id: 'ux-degradation',
		text: 'Per-user throughput\ndegrades as load increases',
		targetPoint: { x: 512, y: 1133 },
		labelOffset: { dx: -100, dy: -50 },
		anchor: 'end'
	},
	{
		id: 'min-ux',
		text: 'Minimum interactivity\nat peak load',
		targetPoint: { x: 4096, y: 171 },
		labelOffset: { dx: -120, dy: 30 },
		anchor: 'end'
	}
];

/**
 * Get annotations for a specific view mode
 * @param {'throughput' | 'utilization' | 'interactivity'} viewMode
 * @returns {ParetoAnnotation[]}
 */
export function getAnnotationsForView(viewMode) {
	switch (viewMode) {
		case 'throughput':
			return paretoAnnotations;
		case 'utilization':
			return utilizationAnnotations;
		case 'interactivity':
			return interactivityAnnotations;
		default:
			return [];
	}
}

// ============================================================================
// VIEW MODE CONFIGURATIONS
// ============================================================================

/**
 * View mode configurations for different Y-axis metrics
 * @type {Record<string, { yField: string, yLabel: string, stepDirection: 'after' | 'before', description: string }>}
 */
export const viewModes = {
	throughput: {
		yField: 'total_tput',
		yLabel: 'Total System Throughput (Tok/s)',
		stepDirection: 'after',
		description: 'Total system throughput at each concurrency level'
	},
	utilization: {
		yField: 'util',
		yLabel: '% Utilization of Max Throughput',
		stepDirection: 'after',
		description: 'Percentage of maximum achievable throughput'
	},
	interactivity: {
		yField: 'tps_usr',
		yLabel: 'Interactivity (Tok/s/user)',
		stepDirection: 'after',
		description: 'Per-user token throughput (user experience metric)'
	}
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Transform series data for a specific view mode
 * @param {ParetoSeries[]} series - Array of Pareto series
 * @param {'throughput' | 'utilization' | 'interactivity'} viewMode - Target view mode
 * @returns {Array<{ id: string, label: string, color: string, points: Array<{ x: number, y: number }> }>}
 */
export function transformForView(series, viewMode) {
	const config = viewModes[viewMode];
	const yField = config.yField;

	return series.map((s) => ({
		id: s.id,
		label: s.label,
		color: s.color,
		vendor: s.vendor,
		points: s.points.map((p) => ({
			x: p.concurrent_clients,
			y: p[yField],
			isCompliancePoint: p.is_compliance_point ?? false,
			// Keep original data for tooltips
			original: p
		}))
	}));
}

/**
 * Get the global max throughput across all series (for normalization)
 * @param {ParetoSeries[]} series
 * @returns {number}
 */
export function getGlobalMaxThroughput(series) {
	return Math.max(...series.map((s) => s.max_throughput));
}

/**
 * Compute utilization normalized to global max (for multi-series comparison)
 * @param {ParetoSeries[]} series
 * @returns {ParetoSeries[]}
 */
export function normalizeToGlobalMax(series) {
	const globalMax = getGlobalMaxThroughput(series);
	
	return series.map((s) => ({
		...s,
		points: s.points.map((p) => ({
			...p,
			util: (p.total_tput / globalMax) * 100
		}))
	}));
}

/**
 * Generate trade-off view data (Throughput vs Interactivity)
 * Note: This inverts the typical X/Y relationship
 * @param {ParetoSeries[]} series
 * @returns {Array<{ id: string, label: string, color: string, points: Array<{ x: number, y: number }> }>}
 */
export function generateTradeoffView(series) {
	return series.map((s) => ({
		id: s.id,
		label: s.label,
		color: s.color,
		vendor: s.vendor,
		points: s.points.map((p) => ({
			x: p.tps_usr,
			y: p.total_tput,
			original: p
		})).sort((a, b) => b.x - a.x) // Sort by interactivity descending
	}));
}

// ============================================================================
// VENDOR COLOR PALETTE
// ============================================================================

/**
 * Vendor-specific color assignments
 * @type {Record<string, string>}
 */
export const vendorColors = {
	NVIDIA: '#76b900', // NVIDIA green
	AMD: '#ed1c24', // AMD red
	Intel: '#0071c5', // Intel blue
	Google: '#4285f4', // Google blue
	Meta: '#0668e1', // Meta blue
	Microsoft: '#00a4ef' // Microsoft blue
};

/**
 * Hardware configuration color palette (extends d3.schemeTableau10)
 * @type {string[]}
 */
export const hardwareColorPalette = [
	'#2563eb', // blue-600
	'#16a34a', // green-600
	'#dc2626', // red-600
	'#9333ea', // purple-600
	'#ea580c', // orange-600
	'#0891b2', // cyan-600
	'#ca8a04', // yellow-600
	'#db2777', // pink-600
	'#4f46e5', // indigo-600
	'#059669'  // emerald-600
];
