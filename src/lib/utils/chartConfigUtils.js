/**
 * Chart configuration utilities for ML Endpoints benchmark charts.
 * Builds chart config objects from Pareto curves with shared structure.
 */

/**
 * Build a chart config from displayed Pareto curves.
 * @param {Array} curves - Filtered pareto curves (visible, not disabled)
 * @param {Object} config - Chart metadata and axis config
 * @param {string} config.title - Chart title
 * @param {string} config.subtitle - Chart subtitle
 * @param {string} [config.subline] - Optional subline text
 * @param {string} config.xLabel - X-axis label
 * @param {string} config.yLabel - Y-axis label
 * @param {string} [config.xScale='log'] - X scale type
 * @param {string} [config.yScale='linear'] - Y scale type
 * @param {string} config.xKey - Run property for X (e.g. 'tps_per_user', 'concurrency')
 * @param {string} config.yKey - Run property for Y (e.g. 'system_tps', 'utilization')
 * @returns {Object} - Chart config for GtcChartSection
 */
export function buildChartConfig(curves, { title, subtitle, subline, xLabel, yLabel, xScale = 'log', yScale = 'linear', xKey, yKey }) {
	const models = curves.map((curve) => ({
		id: curve.id,
		name: curve.name,
		color: curve.color,
		points: curve.runs.map((run) => ({
			x: run[xKey],
			y: run[yKey],
			meta: {
				systemId: curve.systemId,
				runId: run.run_id,
				system: curve.system,
				model: curve.model,
				...run
			}
		}))
	}));

	return {
		title,
		subtitle,
		...(subline && { subline }),
		xLabel,
		yLabel,
		xScale,
		yScale,
		models
	};
}
