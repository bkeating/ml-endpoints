/**
 * Data transformation utilities for benchmark visualization
 * Converts raw benchmark data into chart-ready formats
 */

/**
 * Calculate normalized throughput
 * @param {number} throughput - System throughput (tokens/sec)
 * @param {number} chips - Number of chips
 * @param {number} normalizingFactor - Normalizing factor
 * @returns {number} Normalized throughput
 */
export function calculateNormalizedThroughput(throughput, chips, normalizingFactor) {
	return throughput / chips / normalizingFactor;
}

/**
 * Parse system data from relational db.json structure
 * Joins systems with their pareto curves and data points
 * @param {Object} rawData - Raw data from db.json
 * @returns {Array<Object>} Parsed system data with embedded data points
 */
export function parseSystemData(rawData) {
	const { systems = [], paretoCurves = [], dataPoints = [] } = rawData;

	if (!systems.length) return [];

	// Create lookup maps for efficient joining
	const paretoCurvesBySystemId = paretoCurves.reduce((acc, curve) => {
		acc[curve.systemId] = curve;
		return acc;
	}, {});

	const dataPointsByParetoId = dataPoints.reduce((acc, point) => {
		const curveId = point.paretoCurveId;
		if (!acc[curveId]) acc[curveId] = [];
		acc[curveId].push(point);
		return acc;
	}, {});

	return systems
		.map((system) => {
			const paretoCurve = paretoCurvesBySystemId[system.id];
			if (!paretoCurve) return null;

			const systemDataPoints = dataPointsByParetoId[paretoCurve.id] || [];

			return {
				id: system.id,
				name: system.systemName,
				submitter: system.submitter,
				chips: system.chips,
				normalizingFactor: system.normalizingFactor,
				accelerator: system.accelerator,
				division: system.division,
				status: system.status,
				dataPoints: systemDataPoints
					.map((point) => ({
						...point,
						concurrentUsers: point.concurrentUsers.min
					}))
					.sort((a, b) => a.concurrentUsers - b.concurrentUsers)
			};
		})
		.filter(Boolean);
}

/**
 * Prepare data for Chart 1: TTFT vs Concurrent Users
 * @param {Object} systemData - System data object
 * @returns {Array<{x: number, y: number}>} Chart data points
 */
export function prepareTTFTChartData(systemData) {
	return systemData.dataPoints.map((point) => ({
		x: point.concurrentUsers,
		y: point.ttft,
		original: point
	}));
}

/**
 * Prepare data for Chart 2: System Throughput vs Interactivity
 * @param {Object} systemData - System data object
 * @returns {Array<{x: number, y: number}>} Chart data points
 */
export function prepareThroughputInteractivityData(systemData) {
	return (
		systemData.dataPoints
			.map((point) => ({
				x: point.interactivity,
				y: point.systemThroughput,
				original: point
			}))
			// Sort by interactivity descending for smooth line rendering
			.sort((a, b) => b.x - a.x)
	);
}

/**
 * Prepare data for Chart 3: Normalized Throughput vs Concurrent Users
 * @param {Object} systemData - System data object
 * @returns {Array<{x: number, y: number}>} Chart data points
 */
export function prepareNormalizedThroughputData(systemData) {
	return systemData.dataPoints.map((point) => ({
		x: point.concurrentUsers,
		y: point.normalizedThroughput,
		original: point
	}));
}

/**
 * Prepare data for Chart 4: Normalized Throughput vs TTFT
 * @param {Object} systemData - System data object
 * @returns {Array<{x: number, y: number}>} Chart data points
 */
export function prepareNormalizedTTFTData(systemData) {
	return (
		systemData.dataPoints
			.map((point) => ({
				x: point.ttft,
				y: point.normalizedThroughput,
				original: point
			}))
			// Sort by TTFT ascending for smooth line rendering
			.sort((a, b) => a.x - b.x)
	);
}

/**
 * Get color for a system (cycle through ML Commons palette)
 * @param {number} index - System index
 * @returns {string} Hex color
 */
export function getSystemColor(index) {
	const colors = [
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
	return colors[index % colors.length];
}
