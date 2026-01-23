<script>
	/**
	 * Benchmark Parameters Sidebar
	 *
	 * Blender-inspired UI for configuring benchmark visualization parameters.
	 * Includes metric thresholds, workload config, and normalization controls.
	 */

	/** @type {{ width: number }} */
	let { width = 320 } = $props();

	// Percentile selection
	let selectedPercentile = $state('p95');

	// Threshold filters
	let ttftThreshold = $state(500);
	let throughputMin = $state(100);
	let interactivityMin = $state(10);

	// Concurrency range
	let concurrencyMin = $state(1);
	let concurrencyMax = $state(4096);

	// Workload configuration
	let inputTokens = $state(1024);
	let outputTokens = $state(1024);

	// Normalization / Scale factors
	let enableScaleFactor = $state(false);
	let scaleFactor = $state(1.0);
	let normalizeBy = $state('none');

	// Display options
	let showParetoOnly = $state(true);
	let showConfidenceInterval = $state(false);
	let interpolateGaps = $state(true);

	// Collapsed sections
	let sectionsExpanded = $state({
		metrics: true,
		workload: true,
		normalization: false,
		display: true
	});

	function toggleSection(section) {
		sectionsExpanded[section] = !sectionsExpanded[section];
	}

	function formatNumber(n) {
		if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
		return n.toString();
	}
</script>

<div class="flex h-full flex-col overflow-hidden bg-slate-950/20">
	<!-- Header -->
	<div class="flex shrink-0 items-center border-b border-slate-700 px-3 py-2.5">
		<div class="flex items-center gap-2">
			<svg class="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
			</svg>
			<span class="dm-mono text-sm font-semibold tracking-wider text-slate-200 uppercase">
				Benchmark Controls
			</span>
		</div>
	</div>

	<!-- Scrollable Content -->
	<div class="flex-1 overflow-y-auto">
		<!-- Metrics Section -->
		<div class="border-b border-slate-800">
			<button
				type="button"
				onclick={() => toggleSection('metrics')}
				class="flex w-full items-center justify-between px-3 py-2.5 text-left transition-colors hover:bg-slate-800/50"
			>
				<span class="dm-mono text-sm font-semibold tracking-wider text-slate-300 uppercase">Metrics</span>
				<svg class="h-3.5 w-3.5 text-slate-500 transition-transform {sectionsExpanded.metrics ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
				</svg>
			</button>
			{#if sectionsExpanded.metrics}
				<div class="space-y-4 px-3 pb-4">
					<!-- Percentile Selection -->
					<div class="space-y-2">
						<span class="text-sm text-slate-400">Percentile</span>
						<div class="flex gap-1" role="group" aria-label="Percentile selection">
							{#each ['p50', 'p90', 'p95', 'p99'] as p (p)}
								<button
									type="button"
									onclick={() => (selectedPercentile = p)}
									class="dm-mono flex-1 rounded px-2 py-2 text-sm font-medium transition-colors {selectedPercentile === p
										? 'bg-[#887C40] text-white'
										: 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-300'}"
								>
									{p.toUpperCase()}
								</button>
							{/each}
						</div>
					</div>

					<!-- TTFT Threshold -->
					<div class="space-y-2">
						<div class="flex items-center justify-between">
							<label for="ttft-threshold" class="text-sm text-slate-400">TTFT Cap (ms)</label>
							<span class="dm-mono text-sm text-slate-300">{ttftThreshold}ms</span>
						</div>
						<div class="flex items-center gap-3">
							<input
								id="ttft-threshold"
								type="range"
								min="50"
								max="2000"
								step="50"
								bind:value={ttftThreshold}
								class="slider-accent flex-1 cursor-pointer appearance-none rounded-full bg-slate-700"
							/>
							<input
								type="number"
								bind:value={ttftThreshold}
								class="dm-mono h-7 w-16 rounded border-0 bg-slate-800 px-2 text-right text-sm text-slate-200 focus:ring-1 focus:ring-[#CCEBD4]/50"
								aria-label="TTFT threshold value"
							/>
						</div>
					</div>

					<!-- Throughput Min -->
					<div class="space-y-2">
						<div class="flex items-center justify-between">
							<label for="throughput-min" class="text-sm text-slate-400">Min Throughput (tok/s)</label>
							<span class="dm-mono text-sm text-slate-300">{formatNumber(throughputMin)}</span>
						</div>
						<div class="flex items-center gap-3">
							<input
								id="throughput-min"
								type="range"
								min="0"
								max="10000"
								step="100"
								bind:value={throughputMin}
								class="slider-accent flex-1 cursor-pointer appearance-none rounded-full bg-slate-700"
							/>
							<input
								type="number"
								bind:value={throughputMin}
								class="dm-mono h-7 w-16 rounded border-0 bg-slate-800 px-2 text-right text-sm text-slate-200 focus:ring-1 focus:ring-[#CCEBD4]/50"
								aria-label="Throughput minimum value"
							/>
						</div>
					</div>

					<!-- Interactivity Min -->
					<div class="space-y-2">
						<div class="flex items-center justify-between">
							<label for="interactivity-min" class="text-sm text-slate-400">Min Interactivity (tok/s/user)</label>
							<span class="dm-mono text-sm text-slate-300">{interactivityMin}</span>
						</div>
						<div class="flex items-center gap-3">
							<input
								id="interactivity-min"
								type="range"
								min="1"
								max="100"
								step="1"
								bind:value={interactivityMin}
								class="slider-accent flex-1 cursor-pointer appearance-none rounded-full bg-slate-700"
							/>
							<input
								type="number"
								bind:value={interactivityMin}
								class="dm-mono h-7 w-16 rounded border-0 bg-slate-800 px-2 text-right text-sm text-slate-200 focus:ring-1 focus:ring-[#CCEBD4]/50"
								aria-label="Interactivity minimum value"
							/>
						</div>
					</div>
				</div>
			{/if}
		</div>

		<!-- Workload Section -->
		<div class="border-b border-slate-800">
			<button
				type="button"
				onclick={() => toggleSection('workload')}
				class="flex w-full items-center justify-between px-3 py-2.5 text-left transition-colors hover:bg-slate-800/50"
			>
				<span class="dm-mono text-sm font-semibold tracking-wider text-slate-300 uppercase">Workload</span>
				<svg class="h-3.5 w-3.5 text-slate-500 transition-transform {sectionsExpanded.workload ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
				</svg>
			</button>
			{#if sectionsExpanded.workload}
				<div class="space-y-4 px-3 pb-4">
					<!-- Sequence Length Presets -->
					<div class="space-y-2">
						<span class="text-sm text-slate-400">Sequence Preset</span>
						<div class="grid grid-cols-3 gap-1.5" role="group" aria-label="Sequence length presets">
							{#each [
								{ label: '1k/1k', i: 1024, o: 1024 },
								{ label: '1k/8k', i: 1024, o: 8192 },
								{ label: '8k/1k', i: 8192, o: 1024 },
								{ label: '8k/8k', i: 8192, o: 8192 },
								{ label: '32k/1k', i: 32768, o: 1024 },
								{ label: 'Custom', i: null, o: null }
							] as preset (preset.label)}
								<button
									type="button"
									onclick={() => {
										if (preset.i !== null) {
											inputTokens = preset.i;
											outputTokens = preset.o;
										}
									}}
									class="dm-mono rounded px-2 py-2 text-xs font-medium transition-colors {inputTokens === preset.i && outputTokens === preset.o
										? 'bg-[#887C40] text-white'
										: 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-300'}"
								>
									{preset.label}
								</button>
							{/each}
						</div>
					</div>

					<!-- Input/Output Tokens -->
					<div class="grid grid-cols-2 gap-3">
						<div class="space-y-1.5">
							<label for="input-tokens" class="text-sm text-slate-400">Input Tokens</label>
							<input
								id="input-tokens"
								type="number"
								bind:value={inputTokens}
								class="dm-mono h-8 w-full rounded border-0 bg-slate-800 px-2.5 text-sm text-slate-200 focus:ring-1 focus:ring-[#CCEBD4]/50"
							/>
						</div>
						<div class="space-y-1.5">
							<label for="output-tokens" class="text-sm text-slate-400">Output Tokens</label>
							<input
								id="output-tokens"
								type="number"
								bind:value={outputTokens}
								class="dm-mono h-8 w-full rounded border-0 bg-slate-800 px-2.5 text-sm text-slate-200 focus:ring-1 focus:ring-[#CCEBD4]/50"
							/>
						</div>
					</div>

					<!-- Concurrency Range -->
					<div class="space-y-2">
						<span id="concurrency-range-label" class="text-sm text-slate-400">Concurrency Range</span>
						<div class="flex items-center gap-3" role="group" aria-labelledby="concurrency-range-label">
							<input
								type="number"
								bind:value={concurrencyMin}
								class="dm-mono h-7 w-20 rounded border-0 bg-slate-800 px-2.5 text-center text-sm text-slate-200 focus:ring-1 focus:ring-[#CCEBD4]/50"
								aria-label="Minimum concurrency"
							/>
							<div class="flex-1 border-t border-dashed border-slate-600"></div>
							<input
								type="number"
								bind:value={concurrencyMax}
								class="dm-mono h-7 w-20 rounded border-0 bg-slate-800 px-2.5 text-center text-sm text-slate-200 focus:ring-1 focus:ring-[#CCEBD4]/50"
								aria-label="Maximum concurrency"
							/>
						</div>
					</div>
				</div>
			{/if}
		</div>

		<!-- Normalization Section -->
		<div class="border-b border-slate-800">
			<button
				type="button"
				onclick={() => toggleSection('normalization')}
				class="flex w-full items-center justify-between px-3 py-2.5 text-left transition-colors hover:bg-slate-800/50"
			>
				<span class="dm-mono text-sm font-semibold tracking-wider text-slate-300 uppercase">Scale Factor</span>
				<svg class="h-3.5 w-3.5 text-slate-500 transition-transform {sectionsExpanded.normalization ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
				</svg>
			</button>
			{#if sectionsExpanded.normalization}
				<div class="space-y-4 px-3 pb-4">
					<!-- Enable Scale Factor -->
					<label class="flex cursor-pointer items-center justify-between">
						<span class="text-sm text-slate-300">Enable normalization</span>
						<div class="inline-flex items-center cursor-pointer">
							<input
								type="checkbox"
								bind:checked={enableScaleFactor}
								class="sr-only peer"
							/>
							<div class="relative w-11 h-5 bg-slate-600 dark:bg-slate-700 rounded-full peer peer-focus:ring-2 peer-focus:ring-[#CCEBD4]/50 dark:peer-focus:ring-[#887B40]/50 peer-checked:after:translate-x-[26px] peer-checked:bg-[#CCEBD4] dark:peer-checked:bg-[#887B40] after:content-[''] after:absolute after:top-px after:start-px after:bg-white after:rounded-full after:h-[18px] after:w-[18px] after:transition-all after:shadow-lg"></div>
						</div>
					</label>

					{#if enableScaleFactor}
						<!-- Normalize By -->
						<div class="space-y-2">
							<label for="normalize-by" class="text-sm text-slate-400">Normalize By</label>
							<select
								id="normalize-by"
								bind:value={normalizeBy}
								class="dm-mono h-8 w-full rounded border-0 bg-slate-800 px-2.5 text-sm text-slate-200 focus:ring-1 focus:ring-[#CCEBD4]/50"
							>
								<option value="none">None</option>
								<option value="chip">Per Chip</option>
								<option value="system">Per System</option>
								<option value="power">Per Watt</option>
							</select>
						</div>

						<!-- Scale Factor Value -->
						<div class="space-y-2">
							<div class="flex items-center justify-between">
								<label for="scale-factor" class="text-sm text-slate-400">Scale Factor</label>
								<span class="dm-mono text-sm text-slate-300">{scaleFactor.toFixed(2)}x</span>
							</div>
							<input
								id="scale-factor"
								type="range"
								min="0.1"
								max="10"
								step="0.1"
								bind:value={scaleFactor}
								class="slider-accent w-full cursor-pointer appearance-none rounded-full bg-slate-700"
							/>
						</div>

						<!-- Warning -->
						<div class="flex items-start gap-2.5 rounded bg-amber-900/30 p-2.5">
							<svg class="mt-0.5 h-4 w-4 shrink-0 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
							</svg>
							<span class="text-xs leading-relaxed text-amber-400/90">
								Unofficial comparison. Scale factors are user-defined.
							</span>
						</div>
					{/if}
				</div>
			{/if}
		</div>

		<!-- Display Section -->
		<div class="border-b border-slate-800">
			<button
				type="button"
				onclick={() => toggleSection('display')}
				class="flex w-full items-center justify-between px-3 py-2.5 text-left transition-colors hover:bg-slate-800/50"
			>
				<span class="dm-mono text-sm font-semibold tracking-wider text-slate-300 uppercase">Display</span>
				<svg class="h-3.5 w-3.5 text-slate-500 transition-transform {sectionsExpanded.display ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
				</svg>
			</button>
			{#if sectionsExpanded.display}
				<div class="space-y-2.5 px-3 pb-4">
					<label class="flex cursor-pointer items-center justify-between">
						<span class="text-sm text-slate-300">Show Pareto frontier only</span>
						<div class="inline-flex items-center cursor-pointer">
							<input
								type="checkbox"
								bind:checked={showParetoOnly}
								class="sr-only peer"
							/>
							<div class="relative w-11 h-5 bg-slate-600 dark:bg-slate-700 rounded-full peer peer-focus:ring-2 peer-focus:ring-[#CCEBD4]/50 dark:peer-focus:ring-[#887B40]/50 peer-checked:after:translate-x-[26px] peer-checked:bg-[#CCEBD4] dark:peer-checked:bg-[#887B40] after:content-[''] after:absolute after:top-px after:start-px after:bg-white after:rounded-full after:h-[18px] after:w-[18px] after:transition-all after:shadow-lg"></div>
						</div>
					</label>
					<label class="flex cursor-pointer items-center justify-between">
						<span class="text-sm text-slate-300">Show confidence intervals</span>
						<div class="inline-flex items-center cursor-pointer">
							<input
								type="checkbox"
								bind:checked={showConfidenceInterval}
								class="sr-only peer"
							/>
							<div class="relative w-11 h-5 bg-slate-600 dark:bg-slate-700 rounded-full peer peer-focus:ring-2 peer-focus:ring-[#CCEBD4]/50 dark:peer-focus:ring-[#887B40]/50 peer-checked:after:translate-x-[26px] peer-checked:bg-[#CCEBD4] dark:peer-checked:bg-[#887B40] after:content-[''] after:absolute after:top-px after:start-px after:bg-white after:rounded-full after:h-[18px] after:w-[18px] after:transition-all after:shadow-lg"></div>
						</div>
					</label>
					<label class="flex cursor-pointer items-center justify-between">
						<span class="text-sm text-slate-300">Interpolate data gaps</span>
						<div class="inline-flex items-center cursor-pointer">
							<input
								type="checkbox"
								bind:checked={interpolateGaps}
								class="sr-only peer"
							/>
							<div class="relative w-11 h-5 bg-slate-600 dark:bg-slate-700 rounded-full peer peer-focus:ring-2 peer-focus:ring-[#CCEBD4]/50 dark:peer-focus:ring-[#887B40]/50 peer-checked:after:translate-x-[26px] peer-checked:bg-[#CCEBD4] dark:peer-checked:bg-[#887B40] after:content-[''] after:absolute after:top-px after:start-px after:bg-white after:rounded-full after:h-[18px] after:w-[18px] after:transition-all after:shadow-lg"></div>
						</div>
					</label>
				</div>
			{/if}
		</div>
	</div>
</div>

<style lang="postcss">
	@reference "@app-css";

	:root {
		--accent-color: #CCEBD4;
		--accent-color-dark: #887B40;
	}

	.accent-bg {
		background-color: rgba(204, 235, 212, 0.2);
	}

	.accent-text {
		color: var(--accent-color);
	}

	:global(.dark) .accent-bg {
		background-color: rgba(136, 123, 64, 0.2);
	}

	:global(.dark) .accent-text {
		color: var(--accent-color-dark);
	}

	/* Range slider styling with accent color */
	.slider-accent::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 12px;
		height: 12px;
		border-radius: 9999px;
		background: #CCEBD4;
		cursor: pointer;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
		margin-top: -4px;
	}

	.slider-accent::-moz-range-thumb {
		width: 12px;
		height: 12px;
		border-radius: 9999px;
		background: #CCEBD4;
		cursor: pointer;
		border: none;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
	}

	/* Track styling */
	.slider-accent::-webkit-slider-runnable-track {
		height: 4px;
		border-radius: 9999px;
		background: linear-gradient(to right, #CCEBD4 0%, #CCEBD4 var(--slider-progress, 50%), #334155 var(--slider-progress, 50%), #334155 100%);
	}

	.slider-accent::-moz-range-track {
		height: 4px;
		border-radius: 9999px;
		background: #334155;
	}

	.slider-accent::-moz-range-progress {
		height: 4px;
		border-radius: 9999px;
		background: #CCEBD4;
	}

	:global(.dark) .slider-accent::-webkit-slider-thumb {
		background: #887B40;
	}

	:global(.dark) .slider-accent::-moz-range-thumb {
		background: #887B40;
	}

	:global(.dark) .slider-accent::-webkit-slider-runnable-track {
		background: linear-gradient(to right, #887B40 0%, #887B40 var(--slider-progress, 50%), #1e293b var(--slider-progress, 50%), #1e293b 100%);
	}

	:global(.dark) .slider-accent::-moz-range-progress {
		background: #887B40;
	}
</style>
