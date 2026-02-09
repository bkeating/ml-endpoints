<script>
	/**
	 * GTC Chart Component - Supports both step and line chart types
	 * with configurable linear or logarithmic scales
	 */
	import { goto } from '$app/navigation';
	import ArrowsMaximize from '$lib/components/icons/ArrowsMaximize.svelte';
	import ZoomIn from '$lib/components/icons/ZoomIn.svelte';
	import ZoomOut from '$lib/components/icons/ZoomOut.svelte';
	import {
		createMargins,
		getInnerDimensions,
		createLinearScale,
		createLogScale,
		createStepLineGenerator,
		createSmoothLineGenerator,
		formatYAxis,
		calculateDomain,
		calculateLogDomain,
		generateClipPathId
	} from '../pareto-charts/_components/chartUtils.js';
	import { getStart, getEnd } from '$lib/stores/timelineRange.svelte.js';
	import { setHoveredRunId, getHoveredRunId, getHoveredRunInfo } from '$lib/stores/chartSettings.svelte.js';

	/**
	 * @typedef {Object} PointMeta
	 * @property {string} systemId - System identifier (UUID)
	 * @property {string} runId - Run identifier (UUID)
	 * @property {number} concurrency - Number of concurrent users
	 * @property {number} system_tps - System tokens per second
	 * @property {number} tps_per_user - Tokens per second per user (interactivity)
	 * @property {number} ttft - Time to first token P99 (seconds)
	 * @property {number} utilization - System utilization (0-1)
	 * @property {string} config_detail - Configuration details
	 * @property {Object} system - Full system object
	 * @property {Object} model - Full model object
	 */

	/**
	 * @typedef {Object} Props
	 * @property {Array<{id: string, name: string, color: string, points: Array<{x: number, y: number, meta?: PointMeta}>}>} data - Chart data with models
	 * @property {string} xAxisLabel - X-axis label
	 * @property {string} yAxisLabel - Y-axis label
	 * @property {number} [width] - Chart width
	 * @property {number} [height] - Chart height
	 * @property {'step' | 'line'} [lineType='line'] - Type of line to render
	 * @property {'linear' | 'log'} [xScaleType='linear'] - X-axis scale type
	 * @property {'linear' | 'log'} [yScaleType='linear'] - Y-axis scale type
	 * @property {boolean} [useTimelineRange=false] - Whether to use the shared timeline range store for X-axis filtering
	 * @property {boolean} [showComparison=false] - Whether to show comparison lines between systems on hover
	 */
	/** @type {Props} */
	let {
		data,
		xAxisLabel,
		yAxisLabel,
		width = 700,
		height = 450,
		lineType = 'line',
		xScaleType = 'linear',
		yScaleType = 'linear',
		useTimelineRange = false,
		showComparison = false
	} = $props();

	const ZOOM_FACTOR = 1.35;

	// Responsive margins
	let isMobile = $derived(width < 500);
	let margin = $derived(createMargins(isMobile));
	let { width: innerWidth, height: innerHeight } = $derived(
		getInnerDimensions(width, height, margin)
	);

	// Get X domain from timeline range store or calculate from data
	let rangeStart = $derived(useTimelineRange ? getStart() : null);
	let rangeEnd = $derived(useTimelineRange ? getEnd() : null);

	// Calculate full domain from all models based on scale type
	let allPoints = $derived(data.flatMap((model) => model.points));
	let fullXDomain = $derived(
		xScaleType === 'log'
			? calculateLogDomain(allPoints, 'x')
			: calculateDomain(allPoints, 'x')
	);

	// Use timeline range if enabled, otherwise use full domain
	let baseXDomain = $derived(
		useTimelineRange && rangeStart !== null && rangeEnd !== null
			? [rangeStart, rangeEnd]
			: fullXDomain
	);

	// Filter data points within the visible X range (with buffer for line continuity)
	let filteredData = $derived(
		useTimelineRange && rangeStart !== null && rangeEnd !== null
			? data.map((model) => ({
					...model,
					points: model.points.filter(
						(p) => p.x >= rangeStart - 10 && p.x <= rangeEnd + 10
					)
				}))
			: data
	);

	// Calculate Y domain based on scale type
	let baseYDomain = $derived(
		yScaleType === 'log'
			? calculateLogDomain(filteredData.flatMap((model) => model.points), 'y')
			: calculateDomain(filteredData.flatMap((model) => model.points), 'y')
	);

	let zoomXDomain = $state(null);
	let zoomYDomain = $state(null);
	let isPanning = $state(false);
	let activePointerId = $state(null);
	let panStart = $state(null);

	let xDomain = $derived(zoomXDomain ?? baseXDomain);
	let yDomain = $derived(zoomYDomain ?? baseYDomain);

	// Create scales based on scale type
	let xScale = $derived(
		xScaleType === 'log'
			? createLogScale(xDomain, [0, innerWidth])
			: createLinearScale(xDomain, [0, innerWidth])
	);
	let yScale = $derived(
		yScaleType === 'log'
			? createLogScale(yDomain, [innerHeight, 0])
			: createLinearScale(yDomain, [innerHeight, 0])
	);

	/**
	 * Generate clean tick values for logarithmic scales
	 * Uses powers of 10 and key intermediate values (2, 5) for readability
	 * @param {[number, number]} domain - Scale domain [min, max]
	 * @param {number} maxTicks - Maximum number of ticks
	 * @returns {number[]} Array of tick values
	 */
	function getLogTicks(domain, maxTicks = 5) {
		const [min, max] = domain;
		const logMin = Math.floor(Math.log10(Math.max(min, 0.001)));
		const logMax = Math.ceil(Math.log10(max));

		// Generate candidate ticks at powers of 10 and intermediate values
		const candidates = [];
		for (let exp = logMin; exp <= logMax; exp++) {
			const base = Math.pow(10, exp);
			[1, 2, 5].forEach(mult => {
				const val = base * mult;
				if (val >= min * 0.9 && val <= max * 1.1) {
					candidates.push(val);
				}
			});
		}

		// If too many candidates, filter to just powers of 10
		if (candidates.length > maxTicks) {
			const powersOf10 = candidates.filter(v => {
				const log = Math.log10(v);
				return Math.abs(log - Math.round(log)) < 0.001;
			});
			if (powersOf10.length >= 3) return powersOf10;
		}

		return candidates.slice(0, maxTicks);
	}

	/**
	 * Clamp a linear domain to remain within the base domain.
	 * @param {[number, number]} candidate
	 * @param {[number, number]} base
	 * @returns {[number, number]}
	 */
	function clampLinearDomain(candidate, base) {
		const [baseMin, baseMax] = base;
		let [min, max] = candidate;
		const span = max - min;
		const baseSpan = baseMax - baseMin;
		if (span >= baseSpan) return [baseMin, baseMax];
		if (min < baseMin) {
			max += baseMin - min;
			min = baseMin;
		}
		if (max > baseMax) {
			min -= max - baseMax;
			max = baseMax;
		}
		return [Math.max(baseMin, min), Math.min(baseMax, max)];
	}

	/**
	 * Clamp a logarithmic domain to remain within the base domain.
	 * @param {[number, number]} candidate
	 * @param {[number, number]} base
	 * @returns {[number, number]}
	 */
	function clampLogDomain(candidate, base) {
		const [baseMinRaw, baseMaxRaw] = base;
		const baseMin = Math.max(baseMinRaw, 1e-6);
		const baseMax = Math.max(baseMaxRaw, baseMin * 1.0001);
		let [minRaw, maxRaw] = candidate;
		let min = Math.max(minRaw, 1e-6);
		let max = Math.max(maxRaw, min * 1.0001);
		const logBaseMin = Math.log10(baseMin);
		const logBaseMax = Math.log10(baseMax);
		let logMin = Math.log10(min);
		let logMax = Math.log10(max);
		let span = logMax - logMin;
		const baseSpan = logBaseMax - logBaseMin;
		if (span >= baseSpan) return [baseMin, baseMax];
		if (logMin < logBaseMin) {
			logMax += logBaseMin - logMin;
			logMin = logBaseMin;
		}
		if (logMax > logBaseMax) {
			logMin -= logMax - logBaseMax;
			logMax = logBaseMax;
		}
		span = Math.max(logMax - logMin, 0.05);
		logMax = logMin + span;
		return [Math.pow(10, logMin), Math.pow(10, logMax)];
	}

	/**
	 * Compute a zoomed domain around center.
	 * @param {[number, number]} current
	 * @param {[number, number]} base
	 * @param {'linear' | 'log'} scaleType
	 * @param {number} factor
	 * @returns {[number, number]}
	 */
	function zoomDomain(current, base, scaleType, factor) {
		if (scaleType === 'log') {
			const [min, max] = current;
			const logMin = Math.log10(Math.max(min, 1e-6));
			const logMax = Math.log10(Math.max(max, 1e-6));
			const center = (logMin + logMax) / 2;
			const nextSpan = Math.max((logMax - logMin) / factor, 0.05);
			const candidate = [Math.pow(10, center - nextSpan / 2), Math.pow(10, center + nextSpan / 2)];
			return clampLogDomain(candidate, base);
		}
		const [min, max] = current;
		const center = (min + max) / 2;
		const nextSpan = Math.max((max - min) / factor, 1e-9);
		return clampLinearDomain([center - nextSpan / 2, center + nextSpan / 2], base);
	}

	/**
	 * Compute a panned domain from pixel movement.
	 * @param {[number, number]} current
	 * @param {[number, number]} base
	 * @param {'linear' | 'log'} scaleType
	 * @param {number} deltaPixels
	 * @param {number} axisSizePixels
	 * @param {number} directionSign
	 * @returns {[number, number]}
	 */
	function panDomainByPixels(current, base, scaleType, deltaPixels, axisSizePixels, directionSign) {
		if (axisSizePixels <= 0) return current;
		const shiftRatio = (deltaPixels / axisSizePixels) * directionSign;

		if (scaleType === 'log') {
			const logMin = Math.log10(Math.max(current[0], 1e-6));
			const logMax = Math.log10(Math.max(current[1], 1e-6));
			const delta = (logMax - logMin) * shiftRatio;
			const candidate = [Math.pow(10, logMin + delta), Math.pow(10, logMax + delta)];
			return clampLogDomain(candidate, base);
		}

		const span = current[1] - current[0];
		const delta = span * shiftRatio;
		return clampLinearDomain([current[0] + delta, current[1] + delta], base);
	}

	function handleZoomIn() {
		zoomXDomain = zoomDomain(xDomain, baseXDomain, xScaleType, ZOOM_FACTOR);
		zoomYDomain = zoomDomain(yDomain, baseYDomain, yScaleType, ZOOM_FACTOR);
	}

	function handleZoomOut() {
		zoomXDomain = zoomDomain(xDomain, baseXDomain, xScaleType, 1 / ZOOM_FACTOR);
		zoomYDomain = zoomDomain(yDomain, baseYDomain, yScaleType, 1 / ZOOM_FACTOR);
	}

	function handleResetZoom() {
		zoomXDomain = null;
		zoomYDomain = null;
	}

	function handleChartDoubleClick(event) {
		const target = event.target;
		if (target instanceof Element && target.closest('circle[role="button"]')) return;
		handleZoomIn();
		event.preventDefault();
	}

	/**
	 * Compare two numeric domains with a small tolerance.
	 * @param {[number, number]} a
	 * @param {[number, number]} b
	 * @returns {boolean}
	 */
	function domainsEqual(a, b) {
		const EPSILON = 1e-9;
		return Math.abs(a[0] - b[0]) < EPSILON && Math.abs(a[1] - b[1]) < EPSILON;
	}

	let isAtDefaultView = $derived(domainsEqual(xDomain, baseXDomain) && domainsEqual(yDomain, baseYDomain));

	function handlePanStart(event) {
		const target = event.target;
		if (target instanceof Element && target.closest('circle[role="button"]')) return;
		if (event.button !== 0) return;

		isPanning = true;
		activePointerId = event.pointerId;
		panStart = {
			x: event.clientX,
			y: event.clientY,
			xDomain: [...xDomain],
			yDomain: [...yDomain]
		};

		tooltipData = null;
		setHoveredRunId(null);
		event.preventDefault();
	}

	function handlePanMove(event) {
		if (!isPanning || event.pointerId !== activePointerId || !panStart) return;

		const deltaX = event.clientX - panStart.x;
		const deltaY = event.clientY - panStart.y;

		// X drags invert for natural "grab and move" behavior.
		zoomXDomain = panDomainByPixels(
			panStart.xDomain,
			baseXDomain,
			xScaleType,
			deltaX,
			innerWidth,
			-1
		);
		zoomYDomain = panDomainByPixels(
			panStart.yDomain,
			baseYDomain,
			yScaleType,
			deltaY,
			innerHeight,
			1
		);
	}

	function handlePanEnd(event) {
		if (!isPanning || event.pointerId !== activePointerId) return;
		isPanning = false;
		activePointerId = null;
		panStart = null;
	}

	// Ticks - use custom generator for log scales to avoid overcrowding
	let xTicks = $derived(
		xScaleType === 'log'
			? getLogTicks(xDomain, isMobile ? 4 : 5)
			: xScale.ticks(isMobile ? 4 : 6)
	);
	let yTicks = $derived(
		yScaleType === 'log'
			? getLogTicks(yDomain, 5)
			: yScale.ticks(6)
	);

	// Line generator based on type
	let lineGenerator = $derived(
		lineType === 'step'
			? createStepLineGenerator(xScale, yScale, 'after')
			: createSmoothLineGenerator(xScale, yScale)
	);


	/**
	 * Find the Y value on a step-after curve at a given X value.
	 * For step-after: use the Y value of the point with the largest X <= queryX
	 * @param {Array<{x: number, y: number}>} points - Sorted points array
	 * @param {number} queryX - The X value to query
	 * @returns {number | null} - The Y value at queryX, or null if out of range
	 */
	function getStepYAtX(points, queryX) {
		if (!points || points.length === 0) return null;

		// Sort by X to ensure correct step evaluation
		const sorted = [...points].sort((a, b) => a.x - b.x);

		// Find the point with the largest X <= queryX (step-after behavior)
		let result = null;
		for (const p of sorted) {
			if (p.x <= queryX) {
				result = p.y;
			} else {
				break;
			}
		}
		return result;
	}

	/**
	 * Compute comparison data when hovering over a point.
	 * Finds where a vertical line from the hovered point intersects other systems' curves.
	 * @param {Object} hoveredPoint - The point being hovered
	 * @param {Object} hoveredModel - The model/system being hovered
	 * @returns {Array<{model: Object, y: number, ratio: number}>} - Comparison data for other systems
	 */
	function computeComparisonPoints(hoveredPoint, hoveredModel) {
		if (!hoveredPoint || !showComparison || lineType !== 'step') return [];

		const queryX = hoveredPoint.x;
		const hoveredY = hoveredPoint.y;
		const comparisons = [];

		for (const model of filteredData) {
			if (model.id === hoveredModel.id) continue; // Skip the hovered system

			const y = getStepYAtX(model.points, queryX);
			if (y !== null && y > 0) {
				const ratio = hoveredY / y;
				comparisons.push({
					model,
					y,
					ratio,
					// Calculate which is better and by how much
					betterSystem: hoveredY >= y ? hoveredModel.name : model.name,
					multiplier: hoveredY >= y ? ratio : 1 / ratio
				});
			}
		}

		return comparisons;
	}

	// Tooltip state
	let tooltipData = $state(null);
	let tooltipPosition = $state({ x: 0, y: 0 });

	// Cross-chart hover state (reactive getter)
	let globalHoveredRunId = $derived(getHoveredRunId());
	let globalHoveredRunInfo = $derived(getHoveredRunInfo());

	// Find the highlighted point in this chart's data for synced tooltip
	let syncedTooltipPoint = $derived.by(() => {
		if (!globalHoveredRunId || tooltipData) return null; // Don't show synced tooltip if we're the source

		for (const model of filteredData) {
			const point = model.points.find((p) => p.meta?.runId === globalHoveredRunId);
			if (point) {
				return { point, model };
			}
		}
		return null;
	});

	// Calculate synced tooltip position based on the point's position in this chart
	let syncedTooltipPosition = $derived.by(() => {
		if (!syncedTooltipPoint) return null;
		const x = xScale(syncedTooltipPoint.point.x) + margin.left + 15;
		const y = yScale(syncedTooltipPoint.point.y) + margin.top - 10;
		return { x, y };
	});

	// Compute comparison points when hovering (for system comparison feature)
	let comparisonData = $derived.by(() => {
		if (!tooltipData || !showComparison) return [];
		return computeComparisonPoints(tooltipData.point, tooltipData.model);
	});

	/**
	 * Format value for display based on scale type and magnitude
	 * @param {number} value - Value to format
	 * @param {'linear' | 'log'} scaleType - Scale type
	 * @returns {string} Formatted value
	 */
	function formatValue(value, scaleType) {
		if (scaleType === 'log' && value < 1) {
			return value.toFixed(3);
		}
		return formatYAxis(value);
	}

	/**
	 * Format TTFT values with stable precision for citation.
	 * @param {number} value
	 * @returns {string}
	 */
	function formatTtft(value) {
		if (!Number.isFinite(value)) return 'N/A';
		return `${value < 1 ? value.toFixed(3) : formatYAxis(value)} s`;
	}

	/**
	 * Format utilization values as percentages (supports fraction or percent inputs).
	 * @param {number} value
	 * @returns {string}
	 */
	function formatUtilization(value) {
		if (!Number.isFinite(value)) return 'N/A';
		const percent = value <= 1 ? value * 100 : value;
		return `${percent.toFixed(1)}%`;
	}

	/**
	 * Build supplemental tooltip metric rows from run metadata.
	 * @param {{ meta?: any }} point
	 * @returns {Array<{label: string, value: string}>}
	 */
	function getTooltipMetrics(point) {
		const meta = point?.meta;
		if (!meta) return [];

		const metrics = [];
		if (Number.isFinite(meta.concurrency)) {
			metrics.push({ label: 'Concurrency', value: formatYAxis(meta.concurrency) });
		}
		if (Number.isFinite(meta.ttft)) {
			metrics.push({ label: 'TTFT P99', value: formatTtft(meta.ttft) });
		}
		if (Number.isFinite(meta.system_tps)) {
			metrics.push({ label: 'System Throughput', value: `${formatYAxis(meta.system_tps)} tok/s` });
		}
		if (Number.isFinite(meta.tps_per_user)) {
			metrics.push({ label: 'Interactivity', value: `${formatYAxis(meta.tps_per_user)} tok/s/user` });
		}
		if (Number.isFinite(meta.utilization)) {
			metrics.push({ label: 'Utilization', value: formatUtilization(meta.utilization) });
		}
		const runId = meta.run_id ?? meta.runId;
		if (typeof runId === 'string' && runId.length > 0) {
			metrics.push({ label: 'Run ID', value: runId });
		}

		return metrics;
	}

	/**
	 * Build an accessible point label with key citable values.
	 * @param {{x: number, y: number, meta?: any}} point
	 * @param {{name: string}} model
	 * @returns {string}
	 */
	function buildPointAriaLabel(point, model) {
		const base = `${model.name}. ${xAxisLabel}: ${formatValue(point.x, xScaleType)}. ${yAxisLabel}: ${formatValue(point.y, yScaleType)}.`;
		const metrics = getTooltipMetrics(point)
			.filter((metric) => metric.label !== 'Run ID')
			.slice(0, 4)
			.map((metric) => `${metric.label}: ${metric.value}`)
			.join('. ');

		return metrics ? `${base} ${metrics}.` : base;
	}

	function handlePointHover(event, point, model) {
		const svgRect = event.currentTarget.closest('svg')?.getBoundingClientRect();
		if (!svgRect) return;

		tooltipData = { point, model };
		tooltipPosition = {
			x: event.clientX - svgRect.left + 15,
			y: event.clientY - svgRect.top - 10
		};

		// Set global hovered run ID for cross-chart highlighting
		if (point.meta?.runId) {
			setHoveredRunId(point.meta.runId, { modelName: model.name, modelColor: model.color });
		}
	}

	function handlePointLeave() {
		tooltipData = null;
		setHoveredRunId(null);
	}

	/**
	 * Navigate to the report page with submission and run IDs.
	 * @param {Object} point - The data point with x, y, and meta
	 * @param {Object} _model - The model containing id and name (unused)
	 */
	function handlePointClick(point, _model) {
		if (!point.meta?.submission_id) return;

		const params = new URLSearchParams({
			submission: point.meta.submission_id,
			run: point.meta.run_id ?? ''
		});

		goto(`/report?${params.toString()}`);
	}

	const clipId = generateClipPathId();
</script>

<div class="gtc-chart group relative">
	<div class="invisible absolute top-2 right-2 z-20 flex items-center gap-1 rounded-md border border-slate-200/80 bg-white/90 p-1 opacity-0 shadow-sm backdrop-blur transition-all duration-150 pointer-events-none group-hover:visible group-hover:opacity-100 group-hover:pointer-events-auto group-focus-within:visible group-focus-within:opacity-100 group-focus-within:pointer-events-auto dark:border-slate-700 dark:bg-slate-800/90">
		<button
			type="button"
			class="rounded px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700"
			onclick={handleZoomIn}
			aria-label="Zoom in"
		>
			<ZoomIn class="h-4 w-4" />
		</button>
		<button
			type="button"
			class="rounded px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent dark:text-slate-200 dark:hover:bg-slate-700 dark:disabled:hover:bg-transparent"
			onclick={handleZoomOut}
			aria-label="Zoom out"
			disabled={isAtDefaultView}
		>
			<ZoomOut class="h-4 w-4" />
		</button>
		<button
			type="button"
			class="rounded px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent dark:text-slate-200 dark:hover:bg-slate-700 dark:disabled:hover:bg-transparent"
			onclick={handleResetZoom}
			aria-label="Reset zoom"
			disabled={isAtDefaultView}
		>
			<ArrowsMaximize class="h-4 w-4" />
		</button>
	</div>
	<svg
		{width}
		{height}
		class="font-instrument-sans h-auto w-full overflow-visible"
		class:cursor-grab={!isPanning}
		class:cursor-grabbing={isPanning}
		role="application"
		aria-label="Interactive chart, drag to pan"
		onpointerdown={handlePanStart}
		ondblclick={handleChartDoubleClick}
	>
		<defs>
			<linearGradient id="chartBg-{clipId}" x1="0%" y1="0%" x2="0%" y2="100%">
				<stop
					offset="0%"
					class="[stop-color:var(--color-slate-50)] dark:[stop-color:var(--color-slate-900)]"
				/>
				<stop
					offset="100%"
					class="[stop-color:var(--color-slate-100)] dark:[stop-color:var(--color-slate-800)]"
				/>
			</linearGradient>
			<clipPath id={clipId}>
				<rect x="0" y="0" width={innerWidth} height={innerHeight} />
			</clipPath>
		</defs>

		<!-- Background -->
		<rect
			x={margin.left}
			y={margin.top}
			width={innerWidth}
			height={innerHeight}
			fill="url(#chartBg-{clipId})"
			rx="4"
		/>

		<g transform="translate({margin.left}, {margin.top})">
			<!-- Grid lines -->
			<g class="grid">
				{#each yTicks as tick (tick)}
					<line
						x1="0"
						x2={innerWidth}
						y1={yScale(tick)}
						y2={yScale(tick)}
						class="stroke-slate-200/60 dark:stroke-slate-700/60"
						stroke-dasharray="4,4"
					/>
				{/each}
				{#each xTicks as tick (tick)}
					<line
						x1={xScale(tick)}
						x2={xScale(tick)}
						y1="0"
						y2={innerHeight}
						class="stroke-slate-200/60 dark:stroke-slate-700/60"
						stroke-dasharray="4,4"
					/>
				{/each}
			</g>

			<!-- Data (clipped) -->
			<g clip-path="url(#{clipId})">
				{#each filteredData as model (model.id)}
					<!-- Primary line path (step or smooth based on lineType) -->
					<path
						d={lineGenerator(model.points)}
						fill="none"
						stroke={model.color}
						stroke-width="2.5"
						stroke-linecap="round"
						stroke-linejoin="round"
						class="transition-opacity duration-300"
					/>
					<!-- Data points (interactive) -->
					{#each model.points as point, i (i)}
						{@const isHighlighted = globalHoveredRunId && point.meta?.runId === globalHoveredRunId}
						<circle
							cx={xScale(point.x)}
							cy={yScale(point.y)}
							r={isHighlighted ? 7 : 4}
							fill={isHighlighted ? 'white' : model.color}
							stroke={model.color}
							stroke-width={isHighlighted ? 3 : 1.5}
							class="cursor-pointer transition-all duration-150 hover:brightness-110"
							class:ring-highlight={isHighlighted}
							role="button"
							tabindex="0"
							aria-label={buildPointAriaLabel(point, model)}
							onmouseenter={(e) => handlePointHover(e, point, model)}
							onmouseleave={handlePointLeave}
							onclick={() => handlePointClick(point, model)}
							onkeydown={(e) => e.key === 'Enter' && handlePointClick(point, model)}
						/>
					{/each}
				{/each}

				<!-- Local crosshair lines (this chart is the hover source) -->
				{#if tooltipData}
					{@const localX = xScale(tooltipData.point.x)}
					{@const localY = yScale(tooltipData.point.y)}
					<g class="pointer-events-none">
						<line
							x1={localX}
							y1="0"
							x2={localX}
							y2={innerHeight}
							stroke={tooltipData.model.color}
							stroke-width="1"
							stroke-dasharray="4 3"
							opacity="0.5"
						/>
						<line
							x1="0"
							y1={localY}
							x2={innerWidth}
							y2={localY}
							stroke={tooltipData.model.color}
							stroke-width="1"
							stroke-dasharray="4 3"
							opacity="0.5"
						/>
					</g>
				{/if}

				<!-- Synced crosshair lines (from another chart's hover) -->
				{#if syncedTooltipPoint}
					{@const syncX = xScale(syncedTooltipPoint.point.x)}
					{@const syncY = yScale(syncedTooltipPoint.point.y)}
					<g class="pointer-events-none">
						<!-- Vertical crosshair -->
						<line
							x1={syncX}
							y1="0"
							x2={syncX}
							y2={innerHeight}
							stroke={syncedTooltipPoint.model.color}
							stroke-width="1"
							stroke-dasharray="4 3"
							opacity="0.5"
						/>
						<!-- Horizontal crosshair -->
						<line
							x1="0"
							y1={syncY}
							x2={innerWidth}
							y2={syncY}
							stroke={syncedTooltipPoint.model.color}
							stroke-width="1"
							stroke-dasharray="4 3"
							opacity="0.5"
						/>
					</g>
				{/if}

				<!-- Comparison lines between systems (when hovering with comparison mode on) -->
				{#if tooltipData && showComparison && comparisonData.length > 0}
					{@const hoveredX = xScale(tooltipData.point.x)}
					{@const hoveredY = yScale(tooltipData.point.y)}
					<g class="pointer-events-none">
						<!-- Hovered point's Y-value label (right next to the hovered point) -->
						<g transform="translate({hoveredX + 8}, {hoveredY})">
							<rect
								x="-2"
								y="-10"
								width="50"
								height="20"
								rx="3"
								class="fill-white dark:fill-slate-800"
								opacity="0.9"
							/>
							<text
								class="fill-slate-700 dark:fill-slate-200"
								font-size="11"
								font-weight="600"
								dy="4"
							>
								{formatValue(tooltipData.point.y, yScaleType)}
							</text>
						</g>

						{#each comparisonData as comparison (comparison.model.id)}
							{@const compY = yScale(comparison.y)}
							<!-- Vertical dotted line from hovered point to comparison point -->
							<line
								x1={hoveredX}
								y1={hoveredY}
								x2={hoveredX}
								y2={compY}
								stroke={comparison.model.color}
								stroke-width="2"
								stroke-dasharray="4,4"
								opacity="0.8"
							/>
							<!-- Comparison point marker on the other system's curve -->
							<circle
								cx={hoveredX}
								cy={compY}
								r="5"
								fill="white"
								stroke={comparison.model.color}
								stroke-width="2"
							/>
							<!-- Y-value label at comparison point (positioned at the actual comparison point) -->
							<g transform="translate({hoveredX - 8}, {compY})">
								<rect
									x="-48"
									y="-10"
									width="50"
									height="20"
									rx="3"
									class="fill-white dark:fill-slate-800"
									opacity="0.9"
								/>
								<text
									class="fill-slate-700 dark:fill-slate-200"
									font-size="11"
									font-weight="600"
									dy="4"
									text-anchor="end"
								>
									{formatValue(comparison.y, yScaleType)}
								</text>
							</g>
						{/each}

						<!-- Ratio badge near the hovered point (if only one comparison) -->
						{#if comparisonData.length === 1}
							{@const comp = comparisonData[0]}
							<g transform="translate({hoveredX + 8}, {hoveredY - 25})">
								<rect
									x="-4"
									y="-12"
									width="42"
									height="24"
									rx="4"
									class="fill-slate-800 dark:fill-slate-200"
								/>
								<text
									class="fill-white dark:fill-slate-800"
									font-size="12"
									font-weight="700"
									dy="4"
								>
									{comp.multiplier.toFixed(1)}x
								</text>
							</g>
						{/if}
					</g>
				{/if}
			</g>

			<!-- Y-axis -->
			<g class="y-axis">
				<line
					x1="0"
					x2="0"
					y1="0"
					y2={innerHeight}
					class="stroke-slate-400 dark:stroke-slate-500"
					stroke-width="1"
				/>
			{#each yTicks as tick (tick)}
				<g transform="translate(0, {yScale(tick)})">
					<line x1="-6" x2="0" y1="0" y2="0" class="stroke-slate-400 dark:stroke-slate-500" />
					<text
						x="-12"
						y="0"
						dy="0.35em"
						text-anchor="end"
						class="fill-slate-600 text-xs dark:fill-slate-400"
					>
						{formatValue(tick, yScaleType)}
					</text>
				</g>
			{/each}
				<text
					transform="rotate(-90)"
					x={-innerHeight / 2}
					y="-50"
					text-anchor="middle"
					class="fill-slate-700 font-semibold font-instrument-sans-bold dark:fill-slate-300"
				>
					{yAxisLabel}
				</text>
			</g>

			<!-- X-axis -->
			<g class="x-axis" transform="translate(0, {innerHeight})">
				<line
					x1="0"
					x2={innerWidth}
					y1="0"
					y2="0"
					class="stroke-slate-400 dark:stroke-slate-500"
					stroke-width="1"
				/>
			{#each xTicks as tick (tick)}
				<g transform="translate({xScale(tick)}, 0)">
					<line x1="0" x2="0" y1="0" y2="6" class="stroke-slate-400 dark:stroke-slate-500" />
					<text
						x="0"
						y="20"
						text-anchor="middle"
						class="fill-slate-600 text-xs dark:fill-slate-400"
					>
						{formatValue(tick, xScaleType)}
					</text>
				</g>
			{/each}
				<text
					x={innerWidth / 2}
					y="45"
					text-anchor="middle"
					class="fill-slate-700 font-semibold font-instrument-sans-bold dark:fill-slate-300"
				>
					{xAxisLabel}
				</text>
			</g>
		</g>
	</svg>

	<!-- Tooltip (source chart - user is hovering here) -->
	{#if tooltipData}
		<div
			class="pointer-events-none absolute z-50 min-w-48 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-lg dark:border-slate-700 dark:bg-slate-800"
			style="left: {tooltipPosition.x}px; top: {tooltipPosition.y}px;"
		>
			<div class="space-y-0.5 text-xs text-slate-600 dark:text-slate-400">
				<div class="font-semibold text-slate-800 dark:text-slate-200">{tooltipData.model.name}</div>
				<div>
					<strong>{xAxisLabel}:</strong> {formatValue(tooltipData.point.x, xScaleType)}
				</div>
				<div>
					<strong>{yAxisLabel}:</strong> {formatValue(tooltipData.point.y, yScaleType)}
				</div>
				{#if getTooltipMetrics(tooltipData.point).length > 0}
					<div class="mt-1 space-y-0.5 border-t border-slate-200 pt-1 dark:border-slate-600">
						{#each getTooltipMetrics(tooltipData.point) as metric (metric.label)}
							<div>
								<strong>{metric.label}:</strong> {metric.value}
							</div>
						{/each}
					</div>
				{/if}
				{#if tooltipData.point.meta?.model}
					<div class="mt-1 pt-1 border-t border-slate-200 dark:border-slate-600">
						<span class="text-slate-500">{tooltipData.point.meta.model.model_name}</span>
					</div>
				{/if}
			</div>
		</div>
	{/if}

	<!-- Synced Tooltip (other charts - showing the same run) -->
	{#if syncedTooltipPoint && syncedTooltipPosition}
		<div
			class="pointer-events-none absolute z-50 min-w-48 whitespace-nowrap rounded-lg border px-3 py-2 shadow-lg bg-white dark:bg-slate-800"
			style="left: {syncedTooltipPosition.x}px; top: {syncedTooltipPosition.y}px; border-color: {globalHoveredRunInfo?.modelColor ?? '#94a3b8'};"
		>
			<div class="space-y-0.5 text-xs text-slate-600 dark:text-slate-400">
				<div class="font-semibold text-slate-800 dark:text-slate-200">{globalHoveredRunInfo?.modelName ?? syncedTooltipPoint.model.name}</div>
				<div>
					<strong>{xAxisLabel}:</strong> {formatValue(syncedTooltipPoint.point.x, xScaleType)}
				</div>
				<div>
					<strong>{yAxisLabel}:</strong> {formatValue(syncedTooltipPoint.point.y, yScaleType)}
				</div>
				{#if getTooltipMetrics(syncedTooltipPoint.point).length > 0}
					<div class="mt-1 space-y-0.5 border-t border-slate-200 pt-1 dark:border-slate-600">
						{#each getTooltipMetrics(syncedTooltipPoint.point) as metric (metric.label)}
							<div>
								<strong>{metric.label}:</strong> {metric.value}
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	{/if}

</div>
<svelte:window onpointermove={handlePanMove} onpointerup={handlePanEnd} onpointercancel={handlePanEnd} />

<style lang="postcss">
	@reference "@app-css";

	.gtc-chart svg {
		max-width: 100%;
		height: auto;
		display: block;
	}

	/* Highlighted point styling for cross-chart hover sync */
	.ring-highlight {
		filter: drop-shadow(0 0 4px currentColor);
	}

	/* Remove focus outline from chart circles */
	.gtc-chart circle[role="button"]:focus,
	.gtc-chart circle[role="button"]:focus-visible,
	.gtc-chart circle[role="button"]:active {
		outline: none;
	}
</style>
