/**
 * Fetch chart data from the benchmarks API
 *
 * @param {ChartFilters} filters - The filter parameters for the chart data
 * @returns {Promise<ChartDataResponse>} The chart data for both latency and interactivity charts
 * @throws {Error} If the API request fails or returns invalid data
 */
export async function getChartData(filters) {
	const { model, islOsl, precision, yAxisMetric } = filters;

	// Build query string from filter params
	const params = new URLSearchParams({
		model,
		islOsl,
		precision,
		yAxisMetric
	});

	const response = await fetch(`/api/benchmarks?${params.toString()}`);

	if (!response.ok) {
		const errorData = await response.json().catch(() => ({}));
		throw new Error(errorData.message ?? `API error: ${response.status}`);
	}

	return response.json();
}

