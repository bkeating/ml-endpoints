/**
 * Placeholder/mock data generators for benchmark charts
 *
 * NOTE: This module contains FAKE/PLACEHOLDER data generation logic.
 * All multipliers and transformations are synthetic for demonstration purposes.
 * Replace with real API calls when integrating with actual data sources.
 */

// ============================================================================
// GPU CONFIGURATION DATA
// ============================================================================

/**
 * All GPU configurations
 * @type {string[]}
 */
export const allGpuConfigs = [
	'h100-vllm',
	'h200-vllm',
	'h200-trt',
	'b200-trt',
	'b200-vllm',
	'ml300x-vllm',
	'ml325x-vllm',
	'ml355-vllm'
];

/**
 * GPU configuration color mapping
 * @type {Record<string, string>}
 */
export const gpuColors = {
	'h100-vllm': '#22c55e', // green-500
	'h200-vllm': '#3b82f6', // blue-500
	'h200-trt': '#f59e0b', // amber-500
	'b200-trt': '#ec4899', // pink-500
	'b200-vllm': '#8b5cf6', // violet-500
	'ml300x-vllm': '#06b6d4', // cyan-500
	'ml325x-vllm': '#ef4444', // red-500
	'ml355-vllm': '#84cc16' // lime-500
};

/**
 * GPU configuration display names
 * @type {Record<string, string>}
 */
export const gpuNames = {
	'h100-vllm': 'H100 (vLLM)',
	'h200-vllm': 'H200 (vLLM)',
	'h200-trt': 'H200 (TRT)',
	'b200-trt': 'B200 (TRT)',
	'b200-vllm': 'B200 (vLLM)',
	'ml300x-vllm': 'ML300X (vLLM)',
	'ml325x-vllm': 'ML325X (vLLM)',
	'ml355-vllm': 'ML355 (vLLM)'
};

// ============================================================================
// MODEL DATA
// ============================================================================

/**
 * Model display names
 * @type {Record<string, string>}
 */
export const modelNames = {
	'gpt-oss-120b': 'gpt-oss 120B',
	'deepseek-r1-0528': 'DeepSeek R1 0528',
	'llama-3.3-70b': 'Llama 3.3 70B Instruct'
};

// ============================================================================
// Y-AXIS METRIC LABELS
// ============================================================================

/**
 * Y-axis metric labels
 * @type {Record<string, string>}
 */
export const yAxisLabels = {
	'token-throughput-per-gpu': 'Token Throughput per GPU (toks/s/gpu)',
	'input-token-throughput-per-gpu': 'Input Token Throughput per GPU (toks/s/gpu)',
	'output-token-throughput-per-gpu': 'Output Token Throughput per GPU (toks/s/gpu)',
	'token-throughput-per-mw': 'Token Throughput per All in Utility (toks/s/MW)',
	'cost-per-million-owning-hyperscaler': 'Cost per Million Tokens ($)',
	'cost-per-million-owning-neocloud': 'Cost per Million Tokens ($)',
	'cost-per-million-3yr-rental': 'Cost per Million Tokens ($)',
	'cost-per-million-customer-values': 'Cost per Million Tokens ($)'
};

// ============================================================================
// FAKE DATA MULTIPLIERS
// These simulate how different filter combinations affect performance
// ============================================================================

/**
 * FAKE: Model performance multipliers
 * Larger models generally have lower throughput
 * @type {Record<string, number>}
 */
const modelMultipliers = {
	'gpt-oss-120b': 1.0,
	'deepseek-r1-0528': 0.85, // Slightly lower throughput
	'llama-3.3-70b': 1.25 // Smaller model = higher throughput
};

/**
 * FAKE: ISL/OSL performance multipliers
 * Different input/output sequence lengths affect throughput differently
 * @type {Record<string, { scale: number, xShift: number, curveShape: number }>}
 */
const islOslMultipliers = {
	'1k/1k': { scale: 1.0, xShift: 0, curveShape: 1.0 },
	'1k/8k': { scale: 0.7, xShift: 20, curveShape: 0.85 }, // Longer output = lower throughput
	'8k/1k': { scale: 0.85, xShift: -10, curveShape: 1.15 } // Longer input = moderate impact
};

/**
 * FAKE: Precision performance multipliers
 * Lower precision generally means higher throughput
 * @type {Record<string, number>}
 */
const precisionMultipliers = {
	FP4: 1.2, // Lower precision = faster
	FP8: 1.0 // Baseline
};

/**
 * FAKE: Y-axis metric transformations
 * Different metrics have different scales and characteristics
 * @type {Record<string, { baseMultiplier: number, isInverted: boolean, noiseLevel: number }>}
 */
const yAxisMetricTransforms = {
	'token-throughput-per-gpu': { baseMultiplier: 1.0, isInverted: false, noiseLevel: 0.05 },
	'input-token-throughput-per-gpu': { baseMultiplier: 1.15, isInverted: false, noiseLevel: 0.08 },
	'output-token-throughput-per-gpu': { baseMultiplier: 0.9, isInverted: false, noiseLevel: 0.06 },
	'token-throughput-per-mw': { baseMultiplier: 0.012, isInverted: false, noiseLevel: 0.1 }, // Much smaller scale
	'cost-per-million-owning-hyperscaler': {
		baseMultiplier: 0.015,
		isInverted: true,
		noiseLevel: 0.12
	},
	'cost-per-million-owning-neocloud': { baseMultiplier: 0.012, isInverted: true, noiseLevel: 0.1 },
	'cost-per-million-3yr-rental': { baseMultiplier: 0.018, isInverted: true, noiseLevel: 0.15 },
	'cost-per-million-customer-values': { baseMultiplier: 0.022, isInverted: true, noiseLevel: 0.08 }
};

/**
 * FAKE: GPU base performance multipliers
 * Different GPUs have different performance characteristics
 * @type {Record<string, number>}
 */
const gpuMultipliers = {
	'h100-vllm': 1.0,
	'h200-vllm': 1.3,
	'h200-trt': 1.45,
	'b200-trt': 1.7,
	'b200-vllm': 1.55,
	'ml300x-vllm': 1.2,
	'ml325x-vllm': 1.35,
	'ml355-vllm': 1.5
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * FAKE: Seeded random number generator for consistent "random" variations
 * @param {number} seed
 * @returns {() => number}
 */
function seededRandom(seed) {
	return () => {
		seed = (seed * 9301 + 49297) % 233280;
		return seed / 233280;
	};
}

/**
 * FAKE: Generate a deterministic seed from filter values
 * This ensures the same filters always produce the same "random" data
 * @param {string} model
 * @param {string} islOsl
 * @param {string} precision
 * @param {string} yAxisMetric
 * @param {string} gpuId
 * @returns {number}
 */
function generateSeed(model, islOsl, precision, yAxisMetric, gpuId) {
	const str = `${model}-${islOsl}-${precision}-${yAxisMetric}-${gpuId}`;
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		const char = str.charCodeAt(i);
		hash = (hash << 5) - hash + char;
		hash = hash & hash;
	}
	return Math.abs(hash);
}

// ============================================================================
// DATA GENERATION FUNCTIONS
// ============================================================================

/**
 * FAKE: Generate placeholder latency chart data for a GPU configuration
 * Data varies based on all filter parameters
 * @param {string} gpuId
 * @param {object} filters
 * @returns {{ x: number, y: number }[]}
 */
function generateLatencyPoints(gpuId, filters) {
	const { model, islOsl, precision, yAxisMetric } = filters;

	const gpuMult = gpuMultipliers[gpuId] ?? 1.0;
	const modelMult = modelMultipliers[model] ?? 1.0;
	const islOslConfig = islOslMultipliers[islOsl] ?? { scale: 1.0, xShift: 0, curveShape: 1.0 };
	const precMult = precisionMultipliers[precision] ?? 1.0;
	const metricTransform = yAxisMetricTransforms[yAxisMetric] ?? {
		baseMultiplier: 1.0,
		isInverted: false,
		noiseLevel: 0.05
	};

	const seed = generateSeed(model, islOsl, precision, yAxisMetric, gpuId);
	const random = seededRandom(seed);

	// Base curve points
	const basePoints = [
		{ x: 5, y: 800 },
		{ x: 15, y: 1800 },
		{ x: 30, y: 2900 },
		{ x: 50, y: 4200 },
		{ x: 75, y: 5100 },
		{ x: 100, y: 5800 },
		{ x: 130, y: 6300 },
		{ x: 160, y: 6600 },
		{ x: 185, y: 6800 }
	];

	// Combined multiplier from all filters
	const combinedMult =
		gpuMult * modelMult * islOslConfig.scale * precMult * metricTransform.baseMultiplier;

	return basePoints.map((p, i) => {
		// Apply curve shape modification from ISL/OSL
		const curveAdjust = Math.pow(i / basePoints.length, islOslConfig.curveShape);
		const curvedY = p.y * (0.5 + 0.5 * curveAdjust * 2);

		// Add deterministic noise
		const noise = 1 + (random() - 0.5) * metricTransform.noiseLevel * 2;

		// Calculate final Y value
		let finalY = curvedY * combinedMult * noise;

		// Invert for cost metrics (lower is better, so invert the curve)
		if (metricTransform.isInverted) {
			const maxY = 12000 * combinedMult;
			finalY = maxY - finalY + 500 * combinedMult;
		}

		return {
			x: Math.max(1, Math.round(p.x + islOslConfig.xShift)),
			y: Math.round(Math.max(100, finalY))
		};
	});
}

/**
 * FAKE: Generate placeholder interactivity chart data for a GPU configuration
 * Data varies based on all filter parameters
 * @param {string} gpuId
 * @param {object} filters
 * @returns {{ x: number, y: number }[]}
 */
function generateInteractivityPoints(gpuId, filters) {
	const { model, islOsl, precision, yAxisMetric } = filters;

	const gpuMult = gpuMultipliers[gpuId] ?? 1.0;
	const modelMult = modelMultipliers[model] ?? 1.0;
	const islOslConfig = islOslMultipliers[islOsl] ?? { scale: 1.0, xShift: 0, curveShape: 1.0 };
	const precMult = precisionMultipliers[precision] ?? 1.0;
	const metricTransform = yAxisMetricTransforms[yAxisMetric] ?? {
		baseMultiplier: 1.0,
		isInverted: false,
		noiseLevel: 0.05
	};

	// Use a different seed offset for interactivity chart
	const seed = generateSeed(model, islOsl, precision, yAxisMetric, gpuId + '-interactivity');
	const random = seededRandom(seed);

	// Base curve points (different shape than latency)
	const basePoints = [
		{ x: 10, y: 1200 },
		{ x: 25, y: 2400 },
		{ x: 50, y: 3800 },
		{ x: 75, y: 5000 },
		{ x: 100, y: 5800 },
		{ x: 150, y: 6800 },
		{ x: 200, y: 7400 },
		{ x: 250, y: 7800 },
		{ x: 300, y: 8000 }
	];

	// Combined multiplier (slightly different weighting for interactivity)
	const combinedMult =
		gpuMult *
		modelMult *
		Math.pow(islOslConfig.scale, 0.8) *
		precMult *
		metricTransform.baseMultiplier;

	return basePoints.map((p, i) => {
		// Different curve shape for interactivity
		const curveAdjust = Math.pow((i + 1) / basePoints.length, islOslConfig.curveShape * 1.1);
		const curvedY = p.y * (0.4 + 0.6 * curveAdjust * 1.8);

		// Add deterministic noise (slightly more variation)
		const noise = 1 + (random() - 0.5) * metricTransform.noiseLevel * 2.5;

		// Calculate final Y value
		let finalY = curvedY * combinedMult * noise;

		// Invert for cost metrics
		if (metricTransform.isInverted) {
			const maxY = 10000 * combinedMult;
			finalY = maxY - finalY + 400 * combinedMult;
		}

		// Shift X based on ISL/OSL (affects interactivity differently)
		const xShift = islOslConfig.xShift * 1.5;

		return {
			x: Math.max(5, Math.round(p.x + xShift)),
			y: Math.round(Math.max(100, finalY))
		};
	});
}

// ============================================================================
// GPU RELIABILITY DATA GENERATION
// ============================================================================

/**
 * FAKE: Generate GPU reliability/failure rate data
 * Returns failure rate percentages for each GPU configuration
 * @param {object} filters
 * @returns {{ id: string, name: string, color: string, value: number }[]}
 */
function generateGpuReliabilityData(filters) {
	const { model, islOsl, precision, yAxisMetric } = filters;

	return allGpuConfigs.map((gpuId) => {
		// Generate deterministic seed for consistent "random" failure rates
		const seed = generateSeed(model, islOsl, precision, yAxisMetric, gpuId + '-reliability');
		const random = seededRandom(seed);

		// Base failure rates vary by GPU type (newer GPUs tend to have lower failure rates)
		const baseFailureRates = {
			'h100-vllm': 8.5,
			'h200-vllm': 6.2,
			'h200-trt': 5.8,
			'b200-trt': 3.5,
			'b200-vllm': 4.2,
			'ml300x-vllm': 7.1,
			'ml325x-vllm': 5.5,
			'ml355-vllm': 4.8
		};

		const baseRate = baseFailureRates[gpuId] ?? 6.0;

		// Add some deterministic variation based on filters (±2%)
		const variation = (random() - 0.5) * 4;
		const finalRate = Math.max(0.5, Math.min(15, baseRate + variation));

		return {
			id: gpuId,
			name: gpuNames[gpuId] ?? gpuId,
			color: gpuColors[gpuId] ?? '#64748b',
			value: Math.round(finalRate * 10) / 10 // Round to 1 decimal
		};
	});
}

// ============================================================================
// MAIN EXPORT
// ============================================================================

/**
 * Generate complete chart data based on filter parameters
 * Returns data for the latency chart, interactivity chart, and GPU reliability chart
 * Always returns all GPU configurations
 *
 * NOTE: All data generated here is FAKE/SYNTHETIC for demonstration purposes.
 *
 * @param {{ model: string, islOsl: string, precision: string, yAxisMetric: string }} filters
 * @returns {{ latencyChart: object, interactivityChart: object, gpuReliabilityChart: object }}
 */
export function generateChartData(filters) {
	const { model, islOsl, precision, yAxisMetric } = filters;

	// Generate subtitle from filter values
	const modelLabel = modelNames[model] ?? model;
	const subtitle = `${modelLabel} • ${precision} • ${islOsl} • Source: SemiAnalysis InferenceMAX™`;

	// Get Y-axis label based on selected metric
	const yLabel = yAxisLabels[yAxisMetric] ?? 'Token Throughput per GPU (toks/s/gpu)';

	// Generate models data for ALL GPU configurations
	const models = allGpuConfigs.map((gpuId) => ({
		id: gpuId,
		name: gpuNames[gpuId] ?? gpuId,
		color: gpuColors[gpuId] ?? '#64748b'
	}));

	// Generate latency chart data with filter-dependent variations
	const latencyChart = {
		title: 'Token Throughput per GPU vs. End-to-end Latency',
		subtitle,
		xLabel: 'End-to-end Latency (s)',
		yLabel,
		models: models.map((m) => ({
			...m,
			points: generateLatencyPoints(m.id, filters)
		}))
	};

	// Generate interactivity chart data with filter-dependent variations
	const interactivityChart = {
		title: 'Token Throughput per GPU vs. Interactivity',
		subtitle,
		xLabel: 'Interactivity (tok/s/user)',
		yLabel,
		models: models.map((m) => ({
			...m,
			points: generateInteractivityPoints(m.id, filters)
		}))
	};

	// Generate GPU reliability chart data
	const gpuReliabilityChart = {
		title: 'GPU Reliability',
		subtitle: 'For each GPU model, the failure rate percentage of completed runs.',
		xLabel: 'Hardware Model',
		yLabel: 'Failure Rate (%)',
		data: generateGpuReliabilityData(filters)
	};

	return {
		latencyChart,
		interactivityChart,
		gpuReliabilityChart
	};
}

// ============================================================================
// SPARKLINE TABLE DATA
// ============================================================================

/**
 * GPU inference benchmark data for sparkline table
 * Each row represents a GPU configuration with performance metrics over time
 * @type {Array<{id: string, name: string, metrics: Record<string, string>, sparklineData: number[], color: string}>}
 */
export const gpuInferenceBenchmarks = [
	{
		id: 'b200-trt',
		name: 'B200 (TensorRT)',
		metrics: {
			throughput: '11,500 tok/s',
			latency: '45ms',
			efficiency: '98.2%'
		},
		// Steady growth with acceleration at end
		sparklineData: [45, 48, 52, 58, 67, 78, 88, 95, 98],
		color: '#f97316'
	},
	{
		id: 'h200-trt',
		name: 'H200 (TensorRT)',
		metrics: {
			throughput: '9,900 tok/s',
			latency: '52ms',
			efficiency: '96.8%'
		},
		// Dip and recovery pattern
		sparklineData: [72, 78, 65, 58, 62, 74, 85, 92, 96],
		color: '#22c55e'
	},
	{
		id: 'h200-vllm',
		name: 'H200 (vLLM)',
		metrics: {
			throughput: '9,000 tok/s',
			latency: '58ms',
			efficiency: '94.5%'
		},
		// Plateau then growth
		sparklineData: [68, 70, 71, 70, 72, 78, 86, 91, 94],
		color: '#3b82f6'
	},
	{
		id: 'b200-vllm',
		name: 'B200 (vLLM)',
		metrics: {
			throughput: '10,200 tok/s',
			latency: '48ms',
			efficiency: '97.1%'
		},
		// Volatile with upward trend
		sparklineData: [55, 72, 64, 80, 75, 88, 82, 94, 97],
		color: '#a855f7'
	},
	{
		id: 'ml355-vllm',
		name: 'ML355 (vLLM)',
		metrics: {
			throughput: '8,400 tok/s',
			latency: '62ms',
			efficiency: '92.3%'
		},
		// Step function growth
		sparklineData: [45, 46, 62, 63, 64, 80, 81, 91, 92],
		color: '#ec4899'
	},
	{
		id: 'h100-vllm',
		name: 'H100 (vLLM)',
		metrics: {
			throughput: '6,800 tok/s',
			latency: '78ms',
			efficiency: '89.7%'
		},
		// Gradual decline then sharp recovery
		sparklineData: [75, 72, 68, 62, 58, 55, 68, 82, 89],
		color: '#14b8a6'
	}
];

/**
 * Column definitions for GPU inference benchmark table
 * @type {Array<{key: string, label: string, type: 'text' | 'metric' | 'sparkline' | 'action'}>}
 */
export const gpuBenchmarkColumns = [
	{ key: 'name', label: 'GPU Configuration', type: 'text' },
	{ key: 'throughput', label: 'Throughput', type: 'metric' },
	{ key: 'latency', label: 'Latency', type: 'metric' },
	{ key: 'sparkline', label: 'Performance Trend', type: 'sparkline' },
	{ key: 'action', label: 'Run Demo', type: 'action' }
];
