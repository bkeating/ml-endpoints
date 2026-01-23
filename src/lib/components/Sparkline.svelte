<script>
	/**
	 * Reusable Sparkline component
	 * Renders an SVG sparkline with gradient fill and end-point indicator
	 *
	 * @component
	 */

	/** @type {number[]} */
	let {
		data = [],
		width = 120,
		height = 36,
		color = '#22c55e',
		gradientId = 'sparkline-grad',
		strokeWidth = 2,
		showEndPoint = true,
		...restProps
	} = $props();

	// Chart padding
	const padding = { top: 4, right: 6, bottom: 4, left: 4 };

	/** @type {number} */
	let chartWidth = $derived(width - padding.left - padding.right);

	/** @type {number} */
	let chartHeight = $derived(height - padding.top - padding.bottom);

	/**
	 * Compute normalized Y coordinates from data points
	 * @type {Array<{x: number, y: number}>}
	 */
	let points = $derived.by(() => {
		if (data.length === 0) return [];

		const minY = Math.min(...data);
		const maxY = Math.max(...data);
		const range = maxY - minY || 1;

		return data.map((value, index) => ({
			x: padding.left + (index / (data.length - 1)) * chartWidth,
			y: padding.top + chartHeight - ((value - minY) / range) * chartHeight
		}));
	});

	/**
	 * Generate SVG path for the line
	 * @type {string}
	 */
	let linePath = $derived.by(() => {
		if (points.length === 0) return '';
		return points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
	});

	/**
	 * Generate SVG path for the gradient fill area
	 * @type {string}
	 */
	let areaPath = $derived.by(() => {
		if (points.length === 0) return '';
		const bottomY = height - padding.bottom;
		return `${linePath} L${points[points.length - 1].x},${bottomY} L${points[0].x},${bottomY} Z`;
	});

	/**
	 * Get the last point for the end indicator
	 * @type {{x: number, y: number} | null}
	 */
	let lastPoint = $derived(points.length > 0 ? points[points.length - 1] : null);
</script>

<svg
	{width}
	{height}
	viewBox="0 0 {width} {height}"
	role="img"
	aria-label="Sparkline chart"
	{...restProps}
>
	<defs>
		<linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
			<stop offset="0%" style="stop-color:{color};stop-opacity:0.3" />
			<stop offset="100%" style="stop-color:{color};stop-opacity:0.05" />
		</linearGradient>
	</defs>

	{#if points.length > 0}
		<!-- Gradient fill area -->
		<path d={areaPath} fill="url(#{gradientId})" />

		<!-- Line stroke -->
		<path
			d={linePath}
			fill="none"
			stroke={color}
			stroke-width={strokeWidth}
			stroke-linecap="round"
			stroke-linejoin="round"
		/>

		<!-- End point indicator -->
		{#if showEndPoint && lastPoint}
			<circle cx={lastPoint.x} cy={lastPoint.y} r="3" fill={color} />
		{/if}
	{/if}
</svg>
