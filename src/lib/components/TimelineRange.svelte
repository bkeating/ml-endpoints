<script>
	import * as d3 from 'd3';
	import {
		getStart,
		getEnd,
		getMin,
		getMax,
		setStart,
		setEnd,
		setRange
	} from '$lib/stores/timelineRange.svelte.js';

	/**
	 * @typedef {Object} Props
	 * @property {number} [width] - Component width
	 * @property {number} [height] - Component height
	 * @property {string} [label] - Optional label for the timeline
	 */

	/** @type {Props} */
	let { width = 700, height = 60, label = 'Latency Range (s)' } = $props();

	const padding = { left: 70, right: 30, top: 20, bottom: 20 };
	const trackHeight = 8;
	const handleWidth = 12;

	// Reactive getters
	let start = $derived(getStart());
	let end = $derived(getEnd());
	let min = $derived(getMin());
	let max = $derived(getMax());

	// Derived dimensions
	let innerWidth = $derived(width - padding.left - padding.right);
	let trackY = $derived((height - trackHeight) / 2);

	// D3 scale for mapping values to pixels
	let xScale = $derived(d3.scaleLinear().domain([min, max]).range([0, innerWidth]));

	// Inverse scale for mapping pixels to values
	let xScaleInverse = $derived(d3.scaleLinear().domain([0, innerWidth]).range([min, max]));

	// Tick marks
	let ticks = $derived(xScale.ticks(8));

	// Selection positions in pixels
	let selectionLeft = $derived(xScale(start));
	let selectionRight = $derived(xScale(end));
	let selectionWidth = $derived(selectionRight - selectionLeft);

	// Drag state
	/** @type {'left' | 'right' | 'body' | null} */
	let dragging = $state(null);
	let dragStartX = $state(0);
	let dragStartValue = $state(0);
	let dragStartEnd = $state(0);

	/** @type {SVGSVGElement | null} */
	let svgElement = $state(null);

	/**
	 * Get mouse X position relative to track (in pixels)
	 * @param {MouseEvent} event
	 * @returns {number}
	 */
	function getRelativeX(event) {
		if (!svgElement) return 0;
		const rect = svgElement.getBoundingClientRect();
		return event.clientX - rect.left - padding.left;
	}

	/** @type {SVGGElement | null} */
	let leftHandleEl = $state(null);
	/** @type {SVGGElement | null} */
	let rightHandleEl = $state(null);

	/**
	 * Handle mouse down on left handle
	 * @param {MouseEvent} event
	 */
	function onLeftHandleDown(event) {
		event.preventDefault();
		leftHandleEl?.focus();
		dragging = 'left';
		dragStartX = getRelativeX(event);
		dragStartValue = start;
		window.addEventListener('mousemove', onMouseMove);
		window.addEventListener('mouseup', onMouseUp);
	}

	/**
	 * Handle mouse down on right handle
	 * @param {MouseEvent} event
	 */
	function onRightHandleDown(event) {
		event.preventDefault();
		rightHandleEl?.focus();
		dragging = 'right';
		dragStartX = getRelativeX(event);
		dragStartValue = end;
		window.addEventListener('mousemove', onMouseMove);
		window.addEventListener('mouseup', onMouseUp);
	}

	/**
	 * Handle mouse down on selection body (for scrubbing)
	 * @param {MouseEvent} event
	 */
	function onBodyDown(event) {
		event.preventDefault();
		dragging = 'body';
		dragStartX = getRelativeX(event);
		dragStartValue = start;
		dragStartEnd = end;
		window.addEventListener('mousemove', onMouseMove);
		window.addEventListener('mouseup', onMouseUp);
	}

	/**
	 * Handle mouse move during drag
	 * @param {MouseEvent} event
	 */
	function onMouseMove(event) {
		if (!dragging || !svgElement) return;

		// Get current mouse position relative to timeline SVG
		const rect = svgElement.getBoundingClientRect();
		const relativeX = event.clientX - rect.left - padding.left;
		
		// Calculate the scale fresh to avoid stale closure issues
		const currentInnerWidth = width - padding.left - padding.right;
		const pixelToValue = (px) => (px / currentInnerWidth) * (max - min) + min;
		const currentValue = pixelToValue(relativeX);

		if (dragging === 'left') {
			setStart(currentValue);
		} else if (dragging === 'right') {
			setEnd(currentValue);
		} else if (dragging === 'body') {
			// For body drag, calculate delta and apply to both start and end
			const deltaPixels = relativeX - dragStartX;
			const deltaValue = (deltaPixels / currentInnerWidth) * (max - min);
			setRange(dragStartValue + deltaValue, dragStartEnd + deltaValue);
		}
	}

	/**
	 * Handle mouse up - end drag
	 */
	function onMouseUp() {
		dragging = null;
		window.removeEventListener('mousemove', onMouseMove);
		window.removeEventListener('mouseup', onMouseUp);
	}

	/**
	 * Handle click on track to jump to position
	 * @param {MouseEvent} event
	 */
	function onTrackClick(event) {
		const relativeX = getRelativeX(event);
		const currentInnerWidth = width - padding.left - padding.right;
		const clickValue = (relativeX / currentInnerWidth) * (max - min) + min;
		
		// Determine if click is closer to start or end
		const distToStart = Math.abs(clickValue - start);
		const distToEnd = Math.abs(clickValue - end);
		
		if (distToStart < distToEnd) {
			setStart(clickValue);
		} else {
			setEnd(clickValue);
		}
	}

	/**
	 * Handle keyboard navigation for handles
	 * @param {KeyboardEvent} event
	 * @param {'start' | 'end'} handle
	 */
	function onHandleKeydown(event, handle) {
		const step = event.shiftKey ? 10 : 1;
		
		if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
			event.preventDefault();
			if (handle === 'start') {
				setStart(start - step);
			} else {
				setEnd(end - step);
			}
		} else if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
			event.preventDefault();
			if (handle === 'start') {
				setStart(start + step);
			} else {
				setEnd(end + step);
			}
		}
	}

	/**
	 * Handle keyboard navigation for selection body
	 * @param {KeyboardEvent} event
	 */
	function onBodyKeydown(event) {
		const step = event.shiftKey ? 10 : 1;
		const rangeWidth = end - start;
		
		if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
			event.preventDefault();
			setRange(start - step, end - step);
		} else if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
			event.preventDefault();
			setRange(start + step, end + step);
		}
	}
</script>

<div class="timeline-range">
	{#if label}
		<span class="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400" style="padding-left: {padding.left}px;">
			{label}
		</span>
	{/if}
	
	<svg bind:this={svgElement} {width} {height} class="select-none">
		<g transform="translate({padding.left}, 0)">
			<!-- Track background (clickable) -->
			<rect
				x="0"
				y={trackY}
				width={innerWidth}
				height={trackHeight}
				rx="4"
				class="cursor-pointer fill-slate-200 dark:fill-slate-700"
				onclick={onTrackClick}
				onkeydown={onBodyKeydown}
				role="slider"
				aria-label="Timeline track"
				aria-valuemin={min}
				aria-valuemax={max}
				aria-valuenow={start}
				tabindex="-1"
			/>

			<!-- Selection highlight -->
			<rect
				x={selectionLeft}
				y={trackY}
				width={Math.max(0, selectionWidth)}
				height={trackHeight}
				rx="4"
				class="cursor-grab fill-emerald-500 dark:fill-emerald-600 {dragging === 'body' ? 'cursor-grabbing' : ''}"
				onmousedown={onBodyDown}
				onkeydown={onBodyKeydown}
				role="slider"
				aria-label="Selection range"
				aria-valuemin={min}
				aria-valuemax={max}
				aria-valuenow={(start + end) / 2}
				tabindex="0"
			/>

			<!-- Left handle -->
			<g
				bind:this={leftHandleEl}
				transform="translate({selectionLeft - handleWidth / 2}, {trackY - 4})"
				class="cursor-ew-resize"
				onmousedown={onLeftHandleDown}
				onkeydown={(e) => onHandleKeydown(e, 'start')}
				role="slider"
				aria-label="Start handle"
				aria-valuemin={min}
				aria-valuemax={end}
				aria-valuenow={start}
				tabindex="0"
			>
				<rect
					x="0"
					y="0"
					width={handleWidth}
					height={trackHeight + 8}
					rx="3"
					class="fill-white stroke-emerald-600 dark:fill-slate-800 dark:stroke-emerald-500"
					stroke-width="2"
				/>
				<!-- Grip lines -->
				<line x1="4" y1="4" x2="4" y2={trackHeight + 4} class="stroke-slate-400" stroke-width="1" />
				<line x1="8" y1="4" x2="8" y2={trackHeight + 4} class="stroke-slate-400" stroke-width="1" />
			</g>

			<!-- Right handle -->
			<g
				bind:this={rightHandleEl}
				transform="translate({selectionRight - handleWidth / 2}, {trackY - 4})"
				class="cursor-ew-resize"
				onmousedown={onRightHandleDown}
				onkeydown={(e) => onHandleKeydown(e, 'end')}
				role="slider"
				aria-label="End handle"
				aria-valuemin={start}
				aria-valuemax={max}
				aria-valuenow={end}
				tabindex="0"
			>
				<rect
					x="0"
					y="0"
					width={handleWidth}
					height={trackHeight + 8}
					rx="3"
					class="fill-white stroke-emerald-600 dark:fill-slate-800 dark:stroke-emerald-500"
					stroke-width="2"
				/>
				<!-- Grip lines -->
				<line x1="4" y1="4" x2="4" y2={trackHeight + 4} class="stroke-slate-400" stroke-width="1" />
				<line x1="8" y1="4" x2="8" y2={trackHeight + 4} class="stroke-slate-400" stroke-width="1" />
			</g>

			<!-- Tick marks -->
			{#each ticks as tick (tick)}
				<g transform="translate({xScale(tick)}, {trackY + trackHeight + 6})">
					<text
						x="0"
						y="0"
						dy="0.7em"
						text-anchor="middle"
						class="fill-slate-500 text-[10px] dark:fill-slate-400"
					>
						{tick}
					</text>
				</g>
			{/each}
		</g>
	</svg>

	<!-- Range indicator -->
	<div class="mt-1 flex justify-between text-xs text-slate-500 dark:text-slate-400" style="padding-left: {padding.left}px; padding-right: {padding.right}px;">
		<span>Selected: {start.toFixed(0)}s - {end.toFixed(0)}s</span>
		<span>Range: {(end - start).toFixed(0)}s</span>
	</div>
</div>

