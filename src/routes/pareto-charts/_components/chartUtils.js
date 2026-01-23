/**
 * Reusable D3 chart utilities
 * Extracted from ParetoChart for DRY approach across all benchmark charts
 */

import * as d3 from 'd3';

/**
 * Format Y-axis values with appropriate units
 * @param {number} value - Value to format
 * @param {string} [unit=''] - Optional unit suffix
 * @returns {string} Formatted value
 */
export function formatYAxis(value, unit = '') {
	if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M${unit}`;
	if (value >= 1000) return `${(value / 1000).toFixed(0)}k${unit}`;
	if (value < 1) return value.toFixed(1) + unit;
	return String(Math.round(value)) + unit;
}

/**
 * Create standard chart margins
 * @param {boolean} [isMobile=false] - Whether layout is mobile
 * @returns {{ top: number, right: number, bottom: number, left: number }}
 */
export function createMargins(isMobile = false) {
	return {
		top: 30,
		right: isMobile ? 12 : 30,
		bottom: 60,
		left: isMobile ? 60 : 70
	};
}

/**
 * Calculate inner dimensions from outer dimensions and margins
 * @param {number} width - Outer width
 * @param {number} height - Outer height
 * @param {Object} margin - Margin object
 * @returns {{ width: number, height: number }}
 */
export function getInnerDimensions(width, height, margin) {
	return {
		width: width - margin.left - margin.right,
		height: height - margin.top - margin.bottom
	};
}

/**
 * Create logarithmic X scale
 * @param {[number, number]} domain - Domain [min, max]
 * @param {[number, number]} range - Range [min, max]
 * @returns {d3.ScaleLogarithmic} Log scale
 */
export function createLogScale(domain, range) {
	return d3.scaleLog().domain(domain).range(range);
}

/**
 * Create linear scale
 * @param {[number, number]} domain - Domain [min, max]
 * @param {[number, number]} range - Range [min, max]
 * @returns {d3.ScaleLinear} Linear scale
 */
export function createLinearScale(domain, range) {
	return d3.scaleLinear().domain(domain).range(range);
}

/**
 * Generate tick values for logarithmic scale
 * @param {[number, number]} extent - Data extent [min, max]
 * @returns {number[]} Tick values
 */
export function getLogTicks(extent) {
	const [min, max] = extent;
	const ticks = [1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096];
	return ticks.filter((t) => t >= min && t <= max);
}

/**
 * Create step function line generator
 * @param {Function} xScale - X scale function
 * @param {Function} yScale - Y scale function
 * @param {'after' | 'before'} [direction='after'] - Step direction
 * @returns {d3.Line} Line generator
 */
export function createStepLineGenerator(xScale, yScale, direction = 'after') {
	return d3
		.line()
		.x((d) => xScale(d.x))
		.y((d) => yScale(d.y))
		.curve(direction === 'after' ? d3.curveStepAfter : d3.curveStepBefore);
}

/**
 * Create smooth line generator
 * @param {Function} xScale - X scale function
 * @param {Function} yScale - Y scale function
 * @returns {d3.Line} Line generator
 */
export function createSmoothLineGenerator(xScale, yScale) {
	return d3
		.line()
		.x((d) => xScale(d.x))
		.y((d) => yScale(d.y))
		.curve(d3.curveMonotoneX);
}

/**
 * Calculate domain from data with padding
 * @param {Array<{x: number, y: number}>} data - Data points
 * @param {'x' | 'y'} axis - Axis to calculate for
 * @param {number} [paddingPercent=0.02] - Padding as percentage
 * @returns {[number, number]} Domain [min, max]
 */
export function calculateDomain(data, axis, paddingPercent = 0.02) {
	const values = data.map((d) => d[axis]);
	const min = Math.min(...values);
	const max = Math.max(...values);

	// Ensure minimum range
	if (max - min < 0.01 * max) {
		const center = (min + max) / 2;
		const minRange = Math.max(max * 0.1, 1);
		return [Math.max(0, center - minRange / 2), center + minRange / 2];
	}

	const padding = (max - min) * paddingPercent;
	return [Math.max(0, min - padding), max + padding];
}

/**
 * Calculate logarithmic domain with padding
 * @param {Array<{x: number, y: number}>} data - Data points
 * @param {'x' | 'y'} axis - Axis to calculate for
 * @param {number} [paddingPercent=0.01] - Padding as percentage
 * @returns {[number, number]} Domain [min, max]
 */
export function calculateLogDomain(data, axis, paddingPercent = 0.01) {
	const values = data.map((d) => d[axis]);
	const min = Math.max(1, Math.min(...values));
	const max = Math.max(...values);

	const logMin = Math.log10(min);
	const logMax = Math.log10(max);
	const logPadding = (logMax - logMin) * paddingPercent;

	return [Math.pow(10, logMin - logPadding), Math.pow(10, logMax + logPadding)];
}

/**
 * Format tooltip value with appropriate units
 * @param {number} value - Value to format
 * @param {string} [label='Value'] - Label for the value
 * @returns {string} Formatted string
 */
export function formatTooltipValue(value, label = 'Value') {
	return `${label}: ${formatYAxis(value)}`;
}

/**
 * Generate unique clip path ID
 * @returns {string} Unique ID
 */
export function generateClipPathId() {
	return `chart-clip-${Math.random().toString(36).slice(2, 9)}`;
}
