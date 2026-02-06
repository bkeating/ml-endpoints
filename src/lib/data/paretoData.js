/**
 * MLPerf Endpoints Pareto visualization data utilities
 *
 * Data structures designed for Pareto step-function charts showing:
 * - Total System Throughput vs Concurrent Clients
 * - % Utilization vs Concurrent Clients
 * - Interactivity (TPS/User) vs Concurrent Clients
 * - Throughput vs Interactivity trade-off
 *
 * Data is fetched from db.json and transformed into chart-ready formats.
 */

// ============================================================================
// TYPE DEFINITIONS
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

// ============================================================================
// REACTIVE STATE (populated by fetchParetoData)
// ============================================================================

/** @type {ParetoSeries[]} */
export let paretoSeries = [];

/** @type {ParetoAnnotation[]} */
export let paretoAnnotations = [];

/** @type {ParetoAnnotation[]} */
export let utilizationAnnotations = [];

/** @type {ParetoAnnotation[]} */
export let interactivityAnnotations = [];

/** @type {Record<string, { yField: string, yLabel: string, stepDirection: 'after' | 'before', description: string }>} */
export let viewModes = {
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
// DATA FETCHING
// ============================================================================

/**
 * Fetch and parse pareto data from db.json
 * @returns {Promise<{ series: ParetoSeries[], annotations: Record<string, ParetoAnnotation[]>, viewModes: Record<string, any> }>}
 */
export async function fetchParetoData() {
	const response = await fetch('/db.json');
	if (!response.ok) {
		throw new Error(`Failed to fetch pareto data: ${response.statusText}`);
	}

	const data = await response.json();
	return parseParetoData(data);
}

/**
 * Parse raw db.json data into pareto series format
 * @param {Object} data - Raw data from db.json
 * @returns {{ series: ParetoSeries[], annotations: Record<string, ParetoAnnotation[]>, viewModes: Record<string, any> }}
 */
export function parseParetoData(data) {
	const {
		paretoHardwareConfigs = [],
		paretoPoints = [],
		paretoAnnotations: rawAnnotations = [],
		paretoViewModes = {},
		vendors = []
	} = data;

	// Create vendor lookup
	const vendorLookup = vendors.reduce((acc, v) => {
		acc[v.id] = v.name;
		return acc;
	}, {});

	// Group points by hardware config
	const pointsByConfig = paretoPoints.reduce((acc, point) => {
		const configId = point.hardwareConfigId;
		if (!acc[configId]) acc[configId] = [];
		acc[configId].push(point);
		return acc;
	}, {});

	// Transform hardware configs into series
	const series = paretoHardwareConfigs.map((config) => ({
		id: config.id,
		label: config.label,
		hardware_config: config.hardwareConfig,
		vendor: vendorLookup[config.vendorId] || config.vendorId.toUpperCase(),
		color: config.color,
		max_throughput: config.maxThroughput,
		min_concurrency: config.minConcurrency,
		max_concurrency: config.maxConcurrency,
		points: (pointsByConfig[config.id] || [])
			.map((p) => ({
				concurrent_clients: p.concurrentClients,
				total_tput: p.totalThroughput,
				tps_usr: p.tokensPerSecondPerUser,
				util: p.utilization,
				is_compliance_point: p.isCompliancePoint
			}))
			.sort((a, b) => a.concurrent_clients - b.concurrent_clients)
	}));

	// Group annotations by view mode
	const annotationsByView = rawAnnotations.reduce((acc, ann) => {
		const viewMode = ann.viewMode;
		if (!acc[viewMode]) acc[viewMode] = [];
		acc[viewMode].push({
			id: ann.id,
			text: ann.text,
			targetPoint: ann.targetPoint,
			labelOffset: ann.labelOffset,
			anchor: ann.anchor
		});
		return acc;
	}, {});

	// Transform view modes to use original field names
	const transformedViewModes = Object.entries(paretoViewModes).reduce((acc, [key, config]) => {
		acc[key] = {
			yField:
				config.yField === 'totalThroughput'
					? 'total_tput'
					: config.yField === 'utilization'
						? 'util'
						: config.yField === 'tokensPerSecondPerUser'
							? 'tps_usr'
							: config.yField,
			yLabel: config.yLabel,
			stepDirection: config.stepDirection,
			description: config.description
		};
		return acc;
	}, {});

	return {
		series,
		annotations: annotationsByView,
		viewModes: Object.keys(transformedViewModes).length > 0 ? transformedViewModes : viewModes
	};
}

/**
 * Initialize pareto data - call this on mount
 * Updates the module-level exports with fetched data
 * @returns {Promise<{ series: ParetoSeries[], annotations: Record<string, ParetoAnnotation[]>, viewModes: Record<string, any> }>}
 */
export async function initializeParetoData() {
	const result = await fetchParetoData();

	// Update module exports
	paretoSeries = result.series;
	paretoAnnotations = result.annotations.throughput || [];
	utilizationAnnotations = result.annotations.utilization || [];
	interactivityAnnotations = result.annotations.interactivity || [];
	viewModes = result.viewModes;

	return result;
}

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
	if (!series.length) return 0;
	return Math.max(...series.map((s) => s.max_throughput));
}

/**
 * Compute utilization normalized to global max (for multi-series comparison)
 * @param {ParetoSeries[]} series
 * @returns {ParetoSeries[]}
 */
export function normalizeToGlobalMax(series) {
	const globalMax = getGlobalMaxThroughput(series);
	if (globalMax === 0) return series;

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
		points: s.points
			.map((p) => ({
				x: p.tps_usr,
				y: p.total_tput,
				original: p
			}))
			.sort((a, b) => b.x - a.x) // Sort by interactivity descending
	}));
}

// ============================================================================
// VENDOR COLOR PALETTE
// ============================================================================

/**
 * Vendor-specific color assignments (ML Commons palette)
 * @type {Record<string, string>}
 */
export const vendorColors = {
	NVIDIA: '#62826C',
	AMD: '#D49681',
	Intel: '#4E6BA1',
	Google: '#37548A',
	Meta: '#4E6BA1',
	Microsoft: '#A0B5DD',
	AWS: '#E8B460',
	Cerebras: '#535869',
	Qualcomm: '#3D455A',
	SambaNova: '#44644E'
};

/**
 * Hardware configuration color palette (ML Commons palette)
 * @type {string[]}
 */
export const hardwareColorPalette = [
	'#535869',
	'#BED3FB',
	'#F7CB84',
	'#F4B6A1',
	'#62826C',
	'#CCEBD4',
	'#4E6BA1',
	'#3D455A',
	'#A0B5DD',
	'#E8B460',
	'#D49681',
	'#44644E',
	'#B3CEBA',
	'#37548A'
];
