/**
 * API endpoint for benchmark chart data.
 *
 * GET /api/benchmarks
 *
 * This endpoint demonstrates SvelteKit's server-side API pattern:
 * - +server.js files define API routes that run only on the server
 * - Named exports (GET, POST, etc.) handle different HTTP methods
 * - Valibot provides runtime type validation for query parameters
 *
 * Query Parameters:
 * - model: 'gpt-oss-120b' | 'deepseek-r1-0528' | 'llama-3.3-70b'
 * - islOsl: '1k/1k' | '1k/8k' | '8k/1k'
 * - precision: 'FP4' | 'FP8'
 * - yAxisMetric: various throughput and cost metrics
 *
 * Returns JSON with latencyChart, interactivityChart, and gpuReliabilityChart data.
 */
import { json, error } from '@sveltejs/kit';
import * as v from 'valibot';
import { generateChartData } from '$lib/data/placeholders.js';

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

/**
 * GET handler for benchmark chart data
 * @type {import('./$types').RequestHandler}
 */
export async function GET({ url }) {
	// Extract query parameters
	const rawParams = {
		model: url.searchParams.get('model'),
		islOsl: url.searchParams.get('islOsl'),
		precision: url.searchParams.get('precision'),
		yAxisMetric: url.searchParams.get('yAxisMetric')
	};

	// Validate parameters with Valibot
	const result = v.safeParse(filterSchema, rawParams);

	if (!result.success) {
		const issues = result.issues.map((issue) => ({
			path: issue.path?.map((p) => p.key).join('.') ?? 'unknown',
			message: issue.message
		}));

		throw error(400, {
			message: 'Invalid filter parameters',
			issues
		});
	}

	// Generate chart data from validated filters
	const chartData = generateChartData(result.output);

	return json(chartData);
}

