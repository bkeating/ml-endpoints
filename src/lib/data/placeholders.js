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
 * All GPU configurations - IDs match data.json system_id values
 * @type {string[]}
 */
export const allGpuConfigs = [
	'h100_vllm',
	'h200_trt',
	'h200_vllm',
	'b200_trt',
	'b200_vllm',
	'mi300x_vllm',
	'mi325x_vllm',
	'mi355x_vllm'
];

/**
 * GPU configuration color mapping (ML Commons palette)
 * @type {Record<string, string>}
 */
export const gpuColors = {
	h100_vllm: '#535869',
	h200_trt: '#BED3FB',
	h200_vllm: '#F7CB84',
	b200_trt: '#F4B6A1',
	b200_vllm: '#62826C',
	mi300x_vllm: '#CCEBD4',
	mi325x_vllm: '#4E6BA1',
	mi355x_vllm: '#3D455A'
};

/**
 * GPU configuration display names
 * @type {Record<string, string>}
 */
export const gpuNames = {
	h100_vllm: 'H100 (vLLM)',
	h200_trt: 'H200 (TensorRT-LLM)',
	h200_vllm: 'H200 (vLLM)',
	b200_trt: 'B200 (TensorRT-LLM)',
	b200_vllm: 'B200 (vLLM)',
	mi300x_vllm: 'MI300X (vLLM)',
	mi325x_vllm: 'MI325X (vLLM)',
	mi355x_vllm: 'MI355X (vLLM)'
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
	h100_vllm: 1.0,
	h200_trt: 1.45,
	h200_vllm: 1.3,
	b200_trt: 1.7,
	b200_vllm: 1.55,
	mi300x_vllm: 1.2,
	mi325x_vllm: 1.35,
	mi355x_vllm: 1.5
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
// REAL SYSTEM DATA FOR GTC CHARTS
// ============================================================================

/**
 * Real system data for GTC charts
 * Maps system IDs to their actual benchmark data
 * @type {Record<string, Array<{ concurrentUsers: number, ttft: number, interactivity: number, systemThroughput: number, normalizedThroughput: number }>>}
 */
const realSystemData = {
	'system1': [
		{ concurrentUsers: 1, ttft: 210, interactivity: 200, systemThroughput: 200, normalizedThroughput: 50 },
		{ concurrentUsers: 1.99, ttft: 210, interactivity: 200, systemThroughput: 200, normalizedThroughput: 50 },
		{ concurrentUsers: 2, ttft: 230, interactivity: 195, systemThroughput: 390, normalizedThroughput: 98 },
		{ concurrentUsers: 3.99, ttft: 230, interactivity: 195, systemThroughput: 390, normalizedThroughput: 98 },
		{ concurrentUsers: 4, ttft: 260, interactivity: 190, systemThroughput: 760, normalizedThroughput: 190 },
		{ concurrentUsers: 7.99, ttft: 260, interactivity: 190, systemThroughput: 760, normalizedThroughput: 190 },
		{ concurrentUsers: 8, ttft: 320, interactivity: 185, systemThroughput: 1480, normalizedThroughput: 370 },
		{ concurrentUsers: 15.99, ttft: 320, interactivity: 185, systemThroughput: 1480, normalizedThroughput: 370 },
		{ concurrentUsers: 16, ttft: 380, interactivity: 181, systemThroughput: 2900, normalizedThroughput: 725 },
		{ concurrentUsers: 31.99, ttft: 380, interactivity: 181, systemThroughput: 2900, normalizedThroughput: 725 },
		{ concurrentUsers: 32, ttft: 440, interactivity: 172, systemThroughput: 5500, normalizedThroughput: 1375 },
		{ concurrentUsers: 63.99, ttft: 440, interactivity: 172, systemThroughput: 5500, normalizedThroughput: 1375 },
		{ concurrentUsers: 64, ttft: 560, interactivity: 156, systemThroughput: 10000, normalizedThroughput: 2500 }
	],
	'system2': [
		{ concurrentUsers: 1, ttft: 320, interactivity: 180, systemThroughput: 180, normalizedThroughput: 56 },
		{ concurrentUsers: 1.99, ttft: 320, interactivity: 180, systemThroughput: 180, normalizedThroughput: 56 },
		{ concurrentUsers: 2, ttft: 355, interactivity: 176, systemThroughput: 351, normalizedThroughput: 110 },
		{ concurrentUsers: 3.99, ttft: 355, interactivity: 176, systemThroughput: 351, normalizedThroughput: 110 },
		{ concurrentUsers: 4, ttft: 410, interactivity: 171, systemThroughput: 684, normalizedThroughput: 214 },
		{ concurrentUsers: 7.99, ttft: 410, interactivity: 171, systemThroughput: 684, normalizedThroughput: 214 },
		{ concurrentUsers: 8, ttft: 535, interactivity: 167, systemThroughput: 1332, normalizedThroughput: 416 },
		{ concurrentUsers: 15.99, ttft: 535, interactivity: 167, systemThroughput: 1332, normalizedThroughput: 416 },
		{ concurrentUsers: 16, ttft: 650, interactivity: 163, systemThroughput: 2610, normalizedThroughput: 816 },
		{ concurrentUsers: 31.99, ttft: 650, interactivity: 163, systemThroughput: 2610, normalizedThroughput: 816 },
		{ concurrentUsers: 32, ttft: 765, interactivity: 155, systemThroughput: 4950, normalizedThroughput: 1547 },
		{ concurrentUsers: 63.99, ttft: 765, interactivity: 155, systemThroughput: 4950, normalizedThroughput: 1547 },
		{ concurrentUsers: 64, ttft: 1000, interactivity: 141, systemThroughput: 9000, normalizedThroughput: 2813 }
	]
};

/**
 * Map GPU IDs to system IDs for real data lookup
 * @type {Record<string, string>}
 */
const gpuToSystemMap = {
	b200_trt: 'system1', // System 1: 4 chips, normalizing factor 1
	b200_vllm: 'system2' // System 2: 8 chips, normalizing factor 0.4
};

// ============================================================================
// COMPREHENSIVE DATA GENERATION FOR GTC CHARTS
// ============================================================================

/**
 * Generate comprehensive data points with all fields needed for GTC charts
 * Uses real data when available, otherwise generates synthetic data
 * Each point includes: concurrentUsers, ttft, interactivity, systemThroughput, normalizedThroughput
 * @param {string} gpuId
 * @param {object} filters
 * @returns {{ concurrentUsers: number, ttft: number, interactivity: number, systemThroughput: number, normalizedThroughput: number }[]}
 */
function generateComprehensivePoints(gpuId, filters) {
	// Check if we have real data for this GPU
	const systemId = gpuToSystemMap[gpuId];
	if (systemId && realSystemData[systemId]) {
		// Convert TTFT from ms to seconds for consistency
		return realSystemData[systemId].map((point) => ({
			...point,
			ttft: point.ttft / 1000 // Convert ms to seconds
		}));
	}

	// Fall back to synthetic data generation for other GPUs
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

	const seed = generateSeed(model, islOsl, precision, yAxisMetric, gpuId + '-comprehensive');
	const random = seededRandom(seed);

	// Base concurrent users progression
	const concurrentUsersBase = [1, 5, 10, 20, 35, 50, 75, 100, 150, 200];

	return concurrentUsersBase.map((users, i) => {
		const progress = i / (concurrentUsersBase.length - 1);

		// TTFT increases with concurrent users (more users = slower first token)
		const baseTTFT = 0.05 + progress * 0.45; // 0.05s to 0.5s
		const ttftNoise = 1 + (random() - 0.5) * 0.1;
		const ttft = Math.max(0.02, baseTTFT * ttftNoise);

		// Interactivity decreases with more users (lower tokens/sec per user)
		const baseInteractivity = 300 - progress * 250; // 300 to 50 tok/s/user
		const interactivityNoise = 1 + (random() - 0.5) * 0.15;
		const interactivity = Math.max(10, baseInteractivity * interactivityNoise);

		// System throughput increases with users but plateaus
		const baseSystemThroughput = 2000 + progress * 6000 * (1 - progress * 0.3); // Curved growth
		const systemThroughputNoise = 1 + (random() - 0.5) * 0.12;
		const combinedMult = gpuMult * modelMult * islOslConfig.scale * precMult;
		const systemThroughput = Math.max(500, baseSystemThroughput * systemThroughputNoise * combinedMult);

		// Normalized throughput (per GPU) decreases with more users
		const baseNormalizedThroughput = 8000 - progress * 4000; // 8000 to 4000 tok/s/gpu
		const normalizedNoise = 1 + (random() - 0.5) * 0.1;
		const normalizedThroughput = Math.max(1000, baseNormalizedThroughput * normalizedNoise * combinedMult * metricTransform.baseMultiplier);

		return {
			concurrentUsers: users,
			ttft: Math.round(ttft * 1000) / 1000, // Round to 3 decimals
			interactivity: Math.round(interactivity),
			systemThroughput: Math.round(systemThroughput),
			normalizedThroughput: Math.round(normalizedThroughput)
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
			h100_vllm: 8.5,
			h200_trt: 5.8,
			h200_vllm: 6.2,
			b200_trt: 3.5,
			b200_vllm: 4.2,
			mi300x_vllm: 7.1,
			mi325x_vllm: 5.5,
			mi355x_vllm: 4.8
		};

		const baseRate = baseFailureRates[gpuId] ?? 6.0;

		// Add some deterministic variation based on filters (±2%)
		const variation = (random() - 0.5) * 4;
		const finalRate = Math.max(0.5, Math.min(15, baseRate + variation));

		return {
			id: gpuId,
			name: gpuNames[gpuId] ?? gpuId,
			color: gpuColors[gpuId] ?? '#535869',
			value: Math.round(finalRate * 10) / 10 // Round to 1 decimal
		};
	});
}

// ============================================================================
// MAIN EXPORT
// ============================================================================

/**
 * Generate complete chart data based on filter parameters
 * Returns data for the latency chart, interactivity chart, GPU reliability chart, and 4 GTC charts
 * Always returns all GPU configurations
 *
 * NOTE: All data generated here is FAKE/SYNTHETIC for demonstration purposes.
 *
 * @param {{ model: string, islOsl: string, precision: string, yAxisMetric: string }} filters
 * @returns {{ latencyChart: object, interactivityChart: object, gpuReliabilityChart: object, ttftVsUsersChart: object, throughputVsInteractivityChart: object, normalizedThroughputVsUsersChart: object, normalizedThroughputVsTTFTChart: object }}
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
		color: gpuColors[gpuId] ?? '#535869'
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

	// Generate comprehensive data points for GTC charts
	const comprehensiveData = models.map((m) => ({
		...m,
		comprehensivePoints: generateComprehensivePoints(m.id, filters)
	}));

	// Chart 1: TTFT vs #Users (end-to-end latency)
	const ttftVsUsersChart = {
		title: 'End-to-end Latency',
		subtitle: 'How quickly users receive their first response as concurrent load increases. Lower curves indicate systems that maintain fast initial responses even under heavy load—critical for interactive applications where perceived responsiveness drives user satisfaction.',
		xLabel: '#Users',
		yLabel: 'Time to First Token (s)',
		models: comprehensiveData.map((m) => ({
			...m,
			points: m.comprehensivePoints.map((p) => ({
				x: p.concurrentUsers,
				y: p.ttft
			}))
		}))
	};

	// Chart 2: System throughput vs Interactivity (TPOT-related)
	const throughputVsInteractivityChart = {
		title: 'Time Per Output Token (TPOT)',
		subtitle: 'The trade-off between total system capacity and per-user token delivery speed. Points closer to the upper-right represent superior systems that achieve high aggregate throughput without sacrificing the smooth, real-time token streaming users expect.',
		xLabel: 'Interactivity (tok/s/user)',
		yLabel: 'System Throughput (tok/s)',
		models: comprehensiveData.map((m) => ({
			...m,
			points: m.comprehensivePoints.map((p) => ({
				x: p.interactivity,
				y: p.systemThroughput
			}))
		}))
	};

	// Chart 3: Normalized throughput vs #Users
	const normalizedThroughputVsUsersChart = {
		title: 'Per-GPU Efficiency',
		subtitle: 'How effectively each accelerator maintains performance under growing demand. Flatter curves that stay elevated reveal hardware that scales gracefully—delivering consistent per-GPU output rather than degrading as more users compete for resources.',
		xLabel: '#Users',
		yLabel: 'Normalized Throughput (tok/s/gpu)',
		models: comprehensiveData.map((m) => ({
			...m,
			points: m.comprehensivePoints.map((p) => ({
				x: p.concurrentUsers,
				y: p.normalizedThroughput
			}))
		}))
	};

	// Chart 4: Normalized throughput vs TTFT
	const normalizedThroughputVsTTFTChart = {
		title: 'Time to First Token',
		subtitle: 'Balancing per-accelerator output against initial response time constraints. The Pareto frontier here highlights configurations that maximize token generation per GPU while still meeting strict latency requirements—ideal for cost-conscious deployments.',
		xLabel: 'Time to First Token (s)',
		yLabel: 'Normalized Throughput (tok/s/gpu)',
		models: comprehensiveData.map((m) => ({
			...m,
			points: m.comprehensivePoints.map((p) => ({
				x: p.ttft,
				y: p.normalizedThroughput
			}))
		}))
	};

	return {
		latencyChart,
		interactivityChart,
		gpuReliabilityChart,
		ttftVsUsersChart,
		throughputVsInteractivityChart,
		normalizedThroughputVsUsersChart,
		normalizedThroughputVsTTFTChart
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
		id: 'b200_trt',
		name: 'B200 (TensorRT-LLM)',
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
		id: 'h200_trt',
		name: 'H200 (TensorRT-LLM)',
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
		id: 'h200_vllm',
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
		id: 'b200_vllm',
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
		id: 'mi355x_vllm',
		name: 'MI355X (vLLM)',
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
		id: 'h100_vllm',
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
