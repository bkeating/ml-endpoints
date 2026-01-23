/**
 * Benchmark Data Service
 *
 * Client-side service for generating benchmark chart data.
 * This module encapsulates all data generation logic and provides
 * a clean interface that can easily be swapped for a real API.
 *
 * NOTE: Currently uses placeholder data generation. To integrate a real API,
 * replace the implementation of `getBenchmarkData` with a fetch call.
 */
import * as v from 'valibot';
import { generateChartData } from '$lib/data/placeholders.js';

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================

/** Valibot schema for filter parameters */
const filterSchema = v.object({
	model: v.picklist(['gpt-oss-120b', 'deepseek-r1-0528', 'llama-3.3-70b']),
	islOsl: v.picklist(['1k/1k', '1k/8k', '8k/1k']),
	precision: v.picklist(['FP4', 'FP8']),
	yAxisMetric: v.picklist([
		'token-throughput-per-gpu',
		'input-token-throughput-per-gpu',
		'output-token-throughput-per-gpu',
		'token-throughput-per-mw',
		'cost-per-million-owning-hyperscaler',
		'cost-per-million-owning-neocloud',
		'cost-per-million-3yr-rental',
		'cost-per-million-customer-values'
	])
});

// ============================================================================
// CORE SERVICE FUNCTIONS
// ============================================================================

/**
 * Validate filter parameters using Valibot schema
 *
 * @param {object} filters - Raw filter parameters
 * @returns {{ success: true, data: object } | { success: false, issues: Array<{ path: string, message: string }> }}
 */
export function validateFilters(filters) {
	const result = v.safeParse(filterSchema, filters);

	if (!result.success) {
		const issues = result.issues.map((issue) => ({
			path: issue.path?.map((p) => p.key).join('.') ?? 'unknown',
			message: issue.message
		}));
		return { success: false, issues };
	}

	return { success: true, data: result.output };
}

/**
 * Get benchmark chart data for the given filters
 *
 * This is the primary function for fetching chart data.
 * Currently uses placeholder data generation.
 *
 * To integrate a real API, replace the body of this function with:
 * ```js
 * const params = new URLSearchParams(filters);
 * const response = await fetch(`https://api.example.com/benchmarks?${params}`);
 * return response.json();
 * ```
 *
 * @param {{ model: string, islOsl: string, precision: string, yAxisMetric: string }} filters
 * @returns {Promise<{ latencyChart: object, interactivityChart: object, gpuReliabilityChart: object }>}
 * @throws {Error} If filter validation fails
 */
export async function getBenchmarkData(filters) {
	// Validate filters
	const validation = validateFilters(filters);

	if (!validation.success) {
		const errorMessage = validation.issues.map((i) => `${i.path}: ${i.message}`).join(', ');
		throw new Error(`Invalid filter parameters: ${errorMessage}`);
	}

	// Generate chart data from validated filters
	return generateChartData(validation.data);
}

// ============================================================================
// API EXPLORER SIMULATION
// ============================================================================

/**
 * Simulate an API request for the API Explorer component
 *
 * Returns a mock response object that mimics what a real API would return,
 * including simulated network latency and response metadata.
 *
 * @param {{ model: string, islOsl: string, precision: string, yAxisMetric: string }} filters
 * @param {{ simulateDelay?: boolean, delayMs?: number }} [options]
 * @returns {Promise<{ ok: boolean, status: number, statusText: string, data: object | null, error: object | null, latencyMs: number }>}
 */
export async function simulateApiRequest(filters, options = {}) {
	const { simulateDelay = true, delayMs = 150 + Math.random() * 250 } = options;
	const startTime = performance.now();

	// Simulate network delay
	if (simulateDelay) {
		await new Promise((resolve) => setTimeout(resolve, delayMs));
	}

	// Validate filters
	const validation = validateFilters(filters);

	if (!validation.success) {
		return {
			ok: false,
			status: 400,
			statusText: 'Bad Request',
			data: null,
			error: {
				message: 'Invalid filter parameters',
				issues: validation.issues
			},
			latencyMs: Math.round(performance.now() - startTime)
		};
	}

	// Generate chart data
	const data = generateChartData(validation.data);

	return {
		ok: true,
		status: 200,
		statusText: 'OK',
		data,
		error: null,
		latencyMs: Math.round(performance.now() - startTime)
	};
}

/**
 * Build a mock endpoint URL from filters (for display purposes)
 *
 * @param {{ model: string, islOsl: string, precision: string, yAxisMetric: string }} filters
 * @returns {string}
 */
export function buildEndpointUrl(filters) {
	const params = new URLSearchParams({
		model: filters.model,
		islOsl: filters.islOsl,
		precision: filters.precision,
		yAxisMetric: filters.yAxisMetric
	});

	return `/api/benchmarks?${params.toString()}`;
}
