<script>
	/**
	 * SubmissionMiniChart - Interactive mini sparkline with crosshair and value tooltip.
	 *
	 * Renders TTFT and Throughput vs Interactivity sparklines with:
	 * - Vertical + horizontal crosshair lines on hover
	 * - Snap-to-nearest-point circles on each visible line
	 * - Floating tooltip showing raw metric values
	 *
	 * @component
	 */

	import { setHoveredRunId, getHoveredRunId } from '$lib/stores/chartSettings.svelte.js';

	/** @type {{ runs: Array, submissionId: string, showTtft: boolean, showThroughput: boolean, chartColors: { ttft: string, throughput: string, sysTps?: string } }} */
	let {
		runs = [],
		submissionId = '',
		showTtft = true,
		showThroughput = true,
		chartColors = { ttft: '#62826C', throughput: '#37548A', sysTps: '#535869' }
	} = $props();

	/** @type {SVGSVGElement | null} */
	let svgEl = $state(null);

	/** Whether the mouse is currently over the chart */
	let isHovering = $state(false);

	/** Mouse X position in SVG viewBox coordinates (0–100) */
	let svgMouseX = $state(50);

	/** Global hovered run ID for cross-chart synchronization */
	let globalHoveredRunId = $derived(getHoveredRunId());

	/**
	 * Capture SVG element reference without bind:this.
	 * @param {SVGSVGElement} node
	 */
	function svgRef(node) {
		svgEl = node;
		return {
			destroy() {
				if (svgEl === node) svgEl = null;
			}
		};
	}

	// =========================================================================
	// DATA TRANSFORMATION
	// =========================================================================

	/**
	 * Build normalized sparkline data with raw values for tooltip display.
	 * Points are sorted by raw X and normalized into a 0–100 SVG viewBox.
	 *
	 * @param {Array} runs - Run data sorted by concurrency
	 * @param {'ttft' | 'throughput'} chartType - Determines X/Y accessor
	 * @returns {{ path: string, points: Array<{ x: number, y: number, rawX: number, rawY: number, concurrency: number, runId: string }> }}
	 */
	function buildChartData(runs, chartType) {
		if (!runs || runs.length < 2) return { path: '', points: [] };

		const mapped = runs.map((run) => ({
			rawX: chartType === 'ttft' ? run.ttft : run.tps_per_user,
			rawY: run.system_tps,
			concurrency: run.concurrency,
			runId: run.run_id
		}));

		mapped.sort((a, b) => a.rawX - b.rawX);

		const xMin = Math.min(...mapped.map((p) => p.rawX));
		const xMax = Math.max(...mapped.map((p) => p.rawX));
		const yMin = Math.min(...mapped.map((p) => p.rawY));
		const yMax = Math.max(...mapped.map((p) => p.rawY));
		const xRange = xMax - xMin || 1;
		const yRange = yMax - yMin || 1;

		const pad = 5;
		const span = 90; // 100 − 2 × pad

		const points = mapped.map((p) => ({
			x: pad + ((p.rawX - xMin) / xRange) * span,
			y: pad + span - ((p.rawY - yMin) / yRange) * span,
			rawX: p.rawX,
			rawY: p.rawY,
			concurrency: p.concurrency,
			runId: p.runId
		}));

		// Build a step path: horizontal segments connected by vertical joins.
		const path = points
			.slice(1)
			.reduce(
				(acc, current, index) => {
					const previous = points[index];
					return `${acc} L ${current.x.toFixed(2)} ${previous.y.toFixed(2)} L ${current.x.toFixed(2)} ${current.y.toFixed(2)}`;
				},
				`M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`
			);

		return { path, points };
	}

	/** Sparkline data for TTFT chart (X = TTFT, Y = System TPS) */
	let ttftData = $derived(buildChartData(runs, 'ttft'));

	/** Sparkline data for Throughput chart (X = Tok/s/user, Y = System TPS) */
	let throughputData = $derived(buildChartData(runs, 'throughput'));

	// =========================================================================
	// NEAREST-POINT SEARCH
	// =========================================================================

	/**
	 * Find the point closest to a target SVG X coordinate.
	 * @param {Array} points - Normalized chart points
	 * @param {number} targetX - Mouse X in SVG coords (0–100)
	 * @returns {Object | null}
	 */
	function findNearest(points, targetX) {
		if (!points.length) return null;
		return points.reduce((best, p) =>
			Math.abs(p.x - targetX) < Math.abs(best.x - targetX) ? p : best
		);
	}

	/** Nearest TTFT point to the cursor (null when hidden or not hovering) */
	let nearestTtft = $derived(
		isHovering && showTtft ? findNearest(ttftData.points, svgMouseX) : null
	);

	/** Nearest Throughput point to the cursor */
	let nearestThroughput = $derived(
		isHovering && showThroughput ? findNearest(throughputData.points, svgMouseX) : null
	);

	// =========================================================================
	// CROSS-CHART SYNCED HOVER (receiving from other charts)
	// =========================================================================

	/** Synced TTFT point when another chart broadcasts a hovered run */
	let syncedTtftPoint = $derived.by(() => {
		if (!globalHoveredRunId || isHovering || !showTtft) return null;
		return ttftData.points.find((p) => p.runId === globalHoveredRunId) ?? null;
	});

	/** Synced Throughput point when another chart broadcasts a hovered run */
	let syncedThroughputPoint = $derived.by(() => {
		if (!globalHoveredRunId || isHovering || !showThroughput) return null;
		return throughputData.points.find((p) => p.runId === globalHoveredRunId) ?? null;
	});

	// =========================================================================
	// EVENT HANDLERS
	// =========================================================================

	/**
	 * Convert client mouse coordinates to SVG viewBox X coordinate
	 * and broadcast nearest run for cross-chart synchronization.
	 * @param {MouseEvent} event
	 */
	function handleMouseMove(event) {
		if (!svgEl) return;
		const rect = svgEl.getBoundingClientRect();
		const newX = ((event.clientX - rect.left) / rect.width) * 100;
		svgMouseX = newX;

		// Broadcast nearest run ID for cross-chart hover sync
		const ttft = showTtft ? findNearest(ttftData.points, newX) : null;
		const thru = showThroughput ? findNearest(throughputData.points, newX) : null;
		const nearest =
			ttft && thru
				? Math.abs(ttft.x - newX) <= Math.abs(thru.x - newX)
					? ttft
					: thru
				: (ttft ?? thru);
		if (nearest?.runId) {
			setHoveredRunId(nearest.runId);
		}
	}

	/** Clear global hover when mouse leaves this chart */
	function handleMouseLeave() {
		isHovering = false;
		setHoveredRunId(null);
	}
</script>

<div class="relative h-24 w-full shrink-0" role="img" aria-label="Performance sparkline chart">
	<!-- Interactive SVG chart -->
	<svg
		{@attach svgRef}
		viewBox="0 0 100 100"
		preserveAspectRatio="none"
		class="h-full w-full"
		role="img"
		aria-label="Sparkline chart with crosshair"
		onmousemove={handleMouseMove}
		onmouseenter={() => (isHovering = true)}
		onmouseleave={handleMouseLeave}
	>
		<!-- Gradient definitions -->
		<defs>
			<linearGradient
				id="miniGradTtft-{submissionId}"
				x1="0%"
				y1="0%"
				x2="0%"
				y2="100%"
			>
				<stop offset="0%" style="stop-color: {chartColors.ttft}; stop-opacity: 0.15" />
				<stop offset="100%" style="stop-color: {chartColors.ttft}; stop-opacity: 0.02" />
			</linearGradient>
			<linearGradient
				id="miniGradThru-{submissionId}"
				x1="0%"
				y1="0%"
				x2="0%"
				y2="100%"
			>
				<stop
					offset="0%"
					style="stop-color: {chartColors.throughput}; stop-opacity: 0.15"
				/>
				<stop
					offset="100%"
					style="stop-color: {chartColors.throughput}; stop-opacity: 0.02"
				/>
			</linearGradient>
		</defs>

		<!-- TTFT sparkline -->
		{#if ttftData.path && showTtft}
			<path
				d="{ttftData.path} L 100 100 L 0 100 Z"
				fill="url(#miniGradTtft-{submissionId})"
				style="transition: d 500ms ease-out"
			/>
			<path
				d={ttftData.path}
				fill="none"
				stroke={chartColors.ttft}
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				vector-effect="non-scaling-stroke"
				style="transition: d 500ms ease-out"
			/>
		{/if}

		<!-- Throughput vs Interactivity sparkline -->
		{#if throughputData.path && showThroughput}
			<path
				d="{throughputData.path} L 100 100 L 0 100 Z"
				fill="url(#miniGradThru-{submissionId})"
				style="transition: d 500ms ease-out"
			/>
			<path
				d={throughputData.path}
				fill="none"
				stroke={chartColors.throughput}
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				vector-effect="non-scaling-stroke"
				style="transition: d 500ms ease-out"
			/>
		{/if}

		<!-- Crosshair overlay (visible only on hover) -->
		{#if isHovering}
			<!-- Vertical crosshair line spanning full chart height -->
			<line
				x1={svgMouseX}
				y1="0"
				x2={svgMouseX}
				y2="100"
				class="stroke-slate-400 dark:stroke-slate-500"
				stroke-width="1"
				stroke-dasharray="3 2"
				vector-effect="non-scaling-stroke"
			/>

			<!-- TTFT intersection: horizontal guide + dot -->
			{#if nearestTtft}
				<line
					x1="0"
					y1={nearestTtft.y}
					x2="100"
					y2={nearestTtft.y}
					stroke={chartColors.ttft}
					stroke-width="0.5"
					stroke-dasharray="2 2"
					vector-effect="non-scaling-stroke"
					opacity="0.4"
				/>
				<circle
					cx={nearestTtft.x}
					cy={nearestTtft.y}
					r="3"
					fill="white"
					stroke={chartColors.ttft}
					stroke-width="1.5"
					vector-effect="non-scaling-stroke"
				/>
			{/if}

			<!-- Throughput intersection: horizontal guide + dot -->
			{#if nearestThroughput}
				<line
					x1="0"
					y1={nearestThroughput.y}
					x2="100"
					y2={nearestThroughput.y}
					stroke={chartColors.throughput}
					stroke-width="0.5"
					stroke-dasharray="2 2"
					vector-effect="non-scaling-stroke"
					opacity="0.4"
				/>
				<circle
					cx={nearestThroughput.x}
					cy={nearestThroughput.y}
					r="3"
					fill="white"
					stroke={chartColors.throughput}
					stroke-width="1.5"
					vector-effect="non-scaling-stroke"
				/>
			{/if}
		{/if}

		<!-- Synced crosshair from another chart's hover (only when NOT locally hovered) -->
		{#if !isHovering && (syncedTtftPoint || syncedThroughputPoint)}
			{#if syncedTtftPoint}
				<line
					x1={syncedTtftPoint.x}
					y1="0"
					x2={syncedTtftPoint.x}
					y2="100"
					stroke={chartColors.ttft}
					stroke-width="1"
					stroke-dasharray="3 2"
					vector-effect="non-scaling-stroke"
					opacity="0.6"
				/>
				<line
					x1="0"
					y1={syncedTtftPoint.y}
					x2="100"
					y2={syncedTtftPoint.y}
					stroke={chartColors.ttft}
					stroke-width="0.5"
					stroke-dasharray="2 2"
					vector-effect="non-scaling-stroke"
					opacity="0.3"
				/>
				<circle
					cx={syncedTtftPoint.x}
					cy={syncedTtftPoint.y}
					r="3.5"
					fill="white"
					stroke={chartColors.ttft}
					stroke-width="2"
					vector-effect="non-scaling-stroke"
				/>
			{/if}
			{#if syncedThroughputPoint}
				<line
					x1={syncedThroughputPoint.x}
					y1="0"
					x2={syncedThroughputPoint.x}
					y2="100"
					stroke={chartColors.throughput}
					stroke-width="1"
					stroke-dasharray="3 2"
					vector-effect="non-scaling-stroke"
					opacity="0.6"
				/>
				<line
					x1="0"
					y1={syncedThroughputPoint.y}
					x2="100"
					y2={syncedThroughputPoint.y}
					stroke={chartColors.throughput}
					stroke-width="0.5"
					stroke-dasharray="2 2"
					vector-effect="non-scaling-stroke"
					opacity="0.3"
				/>
				<circle
					cx={syncedThroughputPoint.x}
					cy={syncedThroughputPoint.y}
					r="3.5"
					fill="white"
					stroke={chartColors.throughput}
					stroke-width="2"
					vector-effect="non-scaling-stroke"
				/>
			{/if}
		{/if}
	</svg>

	<!-- Axis labels overlay -->
	{#if showTtft}
		<div class="pointer-events-none absolute top-1 left-1">
			<span
				class="rounded bg-white/90 px-0.5 text-[8px] font-medium leading-none dark:bg-slate-800/90"
				style="color: {chartColors.ttft};"
			>
				TTFT (ms)
			</span>
		</div>
	{/if}
	{#if showThroughput}
		<div class="pointer-events-none absolute right-1 bottom-1">
			<span
				class="rounded bg-white/90 px-0.5 text-[8px] font-medium leading-none dark:bg-slate-800/90"
				style="color: {chartColors.throughput};"
			>
				Tok/s/user
			</span>
		</div>
	{/if}
	{#if showTtft || showThroughput}
		<div class="pointer-events-none absolute top-1/2 left-1 -translate-y-1/2">
			<span
				class="rounded bg-white/90 px-0.5 text-[7px] font-medium leading-none dark:bg-slate-800/90"
				style="writing-mode: vertical-rl; transform: rotate(180deg); color: {chartColors.sysTps ?? '#535869'};"
			>
				Sys TPS
			</span>
		</div>
	{/if}

	<!-- Value tooltip (positioned inside chart bounds to avoid overflow clipping) -->
	{#if isHovering && (nearestTtft || nearestThroughput)}
		<div
			class="pointer-events-none absolute z-50 rounded border border-slate-200 bg-white/95 px-2 py-1 shadow-md backdrop-blur-sm dark:border-slate-600 dark:bg-slate-800/95"
			style="top: 4px; {svgMouseX <= 55 ? `left: ${svgMouseX + 3}%` : `right: ${100 - svgMouseX + 3}%`};"
		>
			<div class="space-y-0.5 whitespace-nowrap text-[10px] leading-tight">
				{#if nearestTtft}
					<div class="flex items-center gap-1">
						<span
							class="h-1.5 w-1.5 shrink-0 rounded-full"
							style="background-color: {chartColors.ttft};"
						></span>
						<span class="text-slate-600 dark:text-slate-300">
							TTFT:
							<strong>
								{nearestTtft.rawX < 1
									? `${(nearestTtft.rawX * 1000).toFixed(0)}ms`
									: `${nearestTtft.rawX.toFixed(2)}s`}
							</strong>
						</span>
						<span class="text-slate-400">·</span>
						<span class="text-slate-600 dark:text-slate-300">
							TPS: <strong>{nearestTtft.rawY.toFixed(0)}</strong>
						</span>
					</div>
				{/if}
				{#if nearestThroughput}
					<div class="flex items-center gap-1">
						<span
							class="h-1.5 w-1.5 shrink-0 rounded-full"
							style="background-color: {chartColors.throughput};"
						></span>
						<span class="text-slate-600 dark:text-slate-300">
							Tok/s/user: <strong>{nearestThroughput.rawX.toFixed(0)}</strong>
						</span>
						<span class="text-slate-400">·</span>
						<span class="text-slate-600 dark:text-slate-300">
							TPS: <strong>{nearestThroughput.rawY.toFixed(0)}</strong>
						</span>
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>
