<script>
	/**
	 * ThroughputRTChart - Displays Overall Throughput RT curve
	 * Shows response time (usec) vs jOPS with multiple percentile series
	 * and vertical domain markers for critical-jOPS and max-jOPS.
	 */

	/** @type {{ criticalJops: number, maxJops: number, dataPoints: Array<{jops: number, min: number, median: number, p90: number, p95: number, p99: number, max: number}> }} */
	let { criticalJops, maxJops, dataPoints } = $props();

	// Chart dimensions
	const width = 900;
	const height = 500;
	const margin = { top: 40, right: 60, bottom: 80, left: 100 };
	const plotWidth = width - margin.left - margin.right;
	const plotHeight = height - margin.top - margin.bottom;

	// Series configuration
	const series = [
		{ key: 'min', label: 'min', color: '#ff6b6b', shape: 'square' },
		{ key: 'median', label: 'median', color: '#4169e1', shape: 'circle' },
		{ key: 'p90', label: '90-th percentile', color: '#32cd32', shape: 'triangle' },
		{ key: 'p95', label: '95-th percentile', color: '#ffff00', shape: 'diamond' },
		{ key: 'p99', label: '99-th percentile', color: '#ff00ff', shape: 'square' },
		{ key: 'max', label: 'max', color: '#00ffff', shape: 'triangleDown' }
	];

	// Calculate scales
	let xDomain = $derived.by(() => {
		const validPoints = dataPoints.filter((d) => d.jops > 0);
		if (validPoints.length === 0) return [0, 1400000];
		const maxX = Math.max(...validPoints.map((d) => d.jops), maxJops);
		return [0, maxX * 1.05];
	});

	let yDomain = $derived.by(() => {
		const allValues = dataPoints.flatMap((d) => [d.min, d.median, d.p90, d.p95, d.p99, d.max].filter((v) => v > 0 && !isNaN(v)));
		if (allValues.length === 0) return [100, 10000000];
		const minY = Math.min(...allValues);
		const maxY = Math.max(...allValues);
		// Round to nice log values
		const logMin = Math.floor(Math.log10(minY));
		const logMax = Math.ceil(Math.log10(maxY));
		return [Math.pow(10, logMin), Math.pow(10, logMax)];
	});

	// Scale functions
	function scaleX(value) {
		return margin.left + (value / xDomain[1]) * plotWidth;
	}

	function scaleY(value) {
		if (value <= 0 || isNaN(value)) return null;
		const logMin = Math.log10(yDomain[0]);
		const logMax = Math.log10(yDomain[1]);
		const logValue = Math.log10(value);
		return margin.top + plotHeight - ((logValue - logMin) / (logMax - logMin)) * plotHeight;
	}

	// Generate axis ticks
	let xTicks = $derived.by(() => {
		const ticks = [];
		const step = 200000;
		for (let i = 0; i <= xDomain[1]; i += step) {
			ticks.push(i);
		}
		return ticks;
	});

	let yTicks = $derived.by(() => {
		const ticks = [];
		const logMin = Math.log10(yDomain[0]);
		const logMax = Math.log10(yDomain[1]);
		for (let i = logMin; i <= logMax; i++) {
			ticks.push(Math.pow(10, i));
		}
		return ticks;
	});

	// Format numbers
	function formatX(value) {
		return value.toLocaleString();
	}

	function formatY(value) {
		return value.toLocaleString();
	}

	// Shape path generators
	function getShapePath(shape, x, y, size = 6) {
		if (y === null) return '';
		switch (shape) {
			case 'circle':
				return `M ${x} ${y} m -${size}, 0 a ${size},${size} 0 1,0 ${size * 2},0 a ${size},${size} 0 1,0 -${size * 2},0`;
			case 'square':
				return `M ${x - size} ${y - size} h ${size * 2} v ${size * 2} h -${size * 2} Z`;
			case 'triangle':
				return `M ${x} ${y - size} L ${x + size} ${y + size} L ${x - size} ${y + size} Z`;
			case 'triangleDown':
				return `M ${x} ${y + size} L ${x + size} ${y - size} L ${x - size} ${y - size} Z`;
			case 'diamond':
				return `M ${x} ${y - size} L ${x + size} ${y} L ${x} ${y + size} L ${x - size} ${y} Z`;
			default:
				return `M ${x - size} ${y - size} h ${size * 2} v ${size * 2} h -${size * 2} Z`;
		}
	}
</script>

<div class="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
	<header class="bg-slate-600 px-4 py-2 text-sm font-semibold text-white">
		Overall Throughput RT curve
	</header>
	<div class="p-4">
		<svg viewBox="0 0 {width} {height}" class="w-full" preserveAspectRatio="xMidYMid meet" style="aspect-ratio: {width} / {height};">
			<!-- Grid lines -->
			<g class="grid">
				<!-- Horizontal grid lines (Y axis) -->
				{#each yTicks as tick}
					{@const y = scaleY(tick)}
					{#if y !== null}
						<line
							x1={margin.left}
							y1={y}
							x2={width - margin.right}
							y2={y}
							stroke="#e5e7eb"
							stroke-width="1"
							stroke-dasharray="2,2"
						/>
					{/if}
				{/each}
				<!-- Vertical grid lines (X axis) -->
				{#each xTicks as tick}
					<line
						x1={scaleX(tick)}
						y1={margin.top}
						x2={scaleX(tick)}
						y2={height - margin.bottom}
						stroke="#e5e7eb"
						stroke-width="1"
						stroke-dasharray="2,2"
					/>
				{/each}
			</g>

			<!-- Domain markers -->
			<!-- Critical jOPS (orange) -->
			<line
				x1={scaleX(criticalJops)}
				y1={margin.top}
				x2={scaleX(criticalJops)}
				y2={height - margin.bottom}
				stroke="#ffa500"
				stroke-width="2"
			/>
			<text
				x={scaleX(criticalJops)}
				y={margin.top - 5}
				text-anchor="middle"
				class="fill-orange-500 text-xs"
			>
				critical-jOPS
			</text>

			<!-- Max jOPS (red) -->
			<line
				x1={scaleX(maxJops)}
				y1={margin.top}
				x2={scaleX(maxJops)}
				y2={height - margin.bottom}
				stroke="#ff0000"
				stroke-width="2"
			/>
			<text
				x={scaleX(maxJops)}
				y={margin.top - 5}
				text-anchor="middle"
				class="fill-red-500 text-xs"
			>
				max-jOPS
			</text>

			<!-- Data points -->
			{#each series as s}
				{#each dataPoints as point}
					{@const x = scaleX(point.jops)}
					{@const y = scaleY(point[s.key])}
					{#if y !== null && point.jops > 0}
						<path
							d={getShapePath(s.shape, x, y, 5)}
							fill={s.color}
							stroke="#333"
							stroke-width="0.5"
						/>
					{/if}
				{/each}
			{/each}

			<!-- Axes -->
			<!-- X axis -->
			<line
				x1={margin.left}
				y1={height - margin.bottom}
				x2={width - margin.right}
				y2={height - margin.bottom}
				stroke="#374151"
				stroke-width="1"
			/>
			{#each xTicks as tick}
				<g transform="translate({scaleX(tick)}, {height - margin.bottom})">
					<line y2="6" stroke="#374151" />
					<text y="20" text-anchor="middle" class="fill-slate-600 text-xs dark:fill-slate-400">
						{formatX(tick)}
					</text>
				</g>
			{/each}
			<text
				x={margin.left + plotWidth / 2}
				y={height - 20}
				text-anchor="middle"
				class="fill-slate-700 text-sm font-medium dark:fill-slate-300"
			>
				jOPS
			</text>

			<!-- Y axis -->
			<line
				x1={margin.left}
				y1={margin.top}
				x2={margin.left}
				y2={height - margin.bottom}
				stroke="#374151"
				stroke-width="1"
			/>
			{#each yTicks as tick}
				{@const y = scaleY(tick)}
				{#if y !== null}
					<g transform="translate({margin.left}, {y})">
						<line x2="-6" stroke="#374151" />
						<text x="-10" text-anchor="end" dominant-baseline="middle" class="fill-slate-600 text-xs dark:fill-slate-400">
							{formatY(tick)}
						</text>
					</g>
				{/if}
			{/each}
			<text
				x={30}
				y={margin.top + plotHeight / 2}
				text-anchor="middle"
				transform="rotate(-90, 30, {margin.top + plotHeight / 2})"
				class="fill-slate-700 text-sm font-medium dark:fill-slate-300"
			>
				Response time, usec
			</text>
		</svg>

		<!-- Legend -->
		<div class="mt-4 flex flex-wrap justify-center gap-4 border-t border-slate-200 pt-4 dark:border-slate-700">
			{#each series as s}
				<div class="flex items-center gap-2">
					<svg width="16" height="16" viewBox="0 0 16 16">
						<path d={getShapePath(s.shape, 8, 8, 5)} fill={s.color} stroke="#333" stroke-width="0.5" />
					</svg>
					<span class="text-sm text-slate-600 dark:text-slate-400">{s.label}</span>
				</div>
			{/each}
		</div>
	</div>
</div>
