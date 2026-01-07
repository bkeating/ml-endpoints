/**
 * Chart Data Remote Module
 *
 * Provides chart data for the benchmark dashboard.
 * Uses the benchmark service for data generation.
 *
 * NOTE: To integrate a real API, update the benchmarkService.js
 * implementation or replace this module's import.
 *
 * @module chartData
 */
import { getBenchmarkData } from '$lib/services/benchmarkService.js';

/**
 * Fetch chart data for the given filters
 *
 * @param {ChartFilters} filters - The filter parameters for the chart data
 * @returns {Promise<ChartDataResponse>} The chart data for latency, interactivity, and GPU reliability charts
 * @throws {Error} If the data request fails or parameters are invalid
 */
export async function getChartData(filters) {
	const { model, islOsl, precision, yAxisMetric } = filters;

	return getBenchmarkData({
		model,
		islOsl,
		precision,
		yAxisMetric
	});
}
