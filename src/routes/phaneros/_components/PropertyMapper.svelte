<script>
	/**
	 * Property Mapper Component
	 * 
	 * Analyzes API response structure and allows mapping properties
	 * to chart axes (x, y, label, color).
	 */
	import { analyzeJsonStructure, getColorPalette } from '$lib/stores/chartBuilder.svelte.js';

	/**
	 * @typedef {Object} Props
	 * @property {object | null} response - The API response to analyze
	 * @property {{ dataPath: string, xProp: string, yProp: string, labelProp: string, color: string }} mapping - Current mapping
	 * @property {(mapping: Partial<{ dataPath: string, xProp: string, yProp: string, labelProp: string, color: string }>) => void} onMappingChange - Callback when mapping changes
	 */

	/** @type {Props} */
	let {
		response = null,
		mapping,
		onMappingChange
	} = $props();

	// Analyze the response structure to find arrays
	let analyzedStructure = $derived(response ? analyzeJsonStructure(response) : []);
	
	// Get selected array's properties
	let selectedArray = $derived(
		analyzedStructure.find((a) => 
			(a.path === '(root)' && mapping.dataPath === '') || a.path === mapping.dataPath
		)
	);

	// Filter numeric properties for Y-axis
	let numericProperties = $derived(
		selectedArray?.properties.filter((p) => p.type === 'number') ?? []
	);

	// All properties for X-axis and labels
	let allProperties = $derived(selectedArray?.properties ?? []);

	const colorPalette = getColorPalette();

	function handleDataPathChange(e) {
		const value = e.target.value === '(root)' ? '' : e.target.value;
		onMappingChange({ dataPath: value, xProp: '', yProp: '', labelProp: '' });
	}

	function handleXPropChange(e) {
		onMappingChange({ xProp: e.target.value });
	}

	function handleYPropChange(e) {
		onMappingChange({ yProp: e.target.value });
	}

	function handleLabelPropChange(e) {
		onMappingChange({ labelProp: e.target.value });
	}

	function handleColorChange(color) {
		onMappingChange({ color });
	}
</script>

<div class="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden">
	<!-- Header -->
	<div class="px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
		<h3 class="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide dm-mono">
			Property Mapping
		</h3>
	</div>

	<div class="p-4">
		{#if !response}
			<div class="text-center py-8 text-slate-500 dark:text-slate-400">
				<svg class="h-12 w-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
				</svg>
				<p class="text-sm">Fetch data from an API endpoint first</p>
			</div>
		{:else if analyzedStructure.length === 0}
			<div class="text-center py-8 text-amber-600 dark:text-amber-400">
				<svg class="h-12 w-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
				</svg>
				<p class="text-sm">No arrays found in response</p>
				<p class="text-xs mt-1 text-slate-500 dark:text-slate-400">The API response must contain an array of objects to create a chart</p>
			</div>
		{:else}
			<div class="space-y-4">
				<!-- Data Array Selection -->
				<div class="flex flex-col gap-1">
					<label for="data-path" class="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400 dm-mono">
						Data Array
					</label>
					<select
						id="data-path"
						value={mapping.dataPath || '(root)'}
						onchange={handleDataPathChange}
						class="h-9 px-3 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-sm dm-mono focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
					>
						{#each analyzedStructure as array (array.path)}
							<option value={array.path}>
								{array.path} ({array.properties.length} properties)
							</option>
						{/each}
					</select>
				</div>

				{#if selectedArray}
					<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<!-- X-Axis Property -->
						<div class="flex flex-col gap-1">
							<label for="x-prop" class="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400 dm-mono">
								X-Axis Property
							</label>
							<select
								id="x-prop"
								value={mapping.xProp}
								onchange={handleXPropChange}
								class="h-9 px-3 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-sm dm-mono focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
							>
								<option value="">Select property...</option>
								{#each allProperties as prop (prop.name)}
									<option value={prop.name}>
										{prop.name} ({prop.type})
									</option>
								{/each}
							</select>
						</div>

						<!-- Y-Axis Property -->
						<div class="flex flex-col gap-1">
							<label for="y-prop" class="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400 dm-mono">
								Y-Axis Property
								<span class="text-amber-500">(numeric)</span>
							</label>
							<select
								id="y-prop"
								value={mapping.yProp}
								onchange={handleYPropChange}
								class="h-9 px-3 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-sm dm-mono focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
							>
								<option value="">Select property...</option>
								{#each numericProperties as prop (prop.name)}
									<option value={prop.name}>{prop.name}</option>
								{/each}
								{#if numericProperties.length === 0}
									<option disabled>No numeric properties found</option>
								{/if}
							</select>
						</div>

						<!-- Label Property -->
						<div class="flex flex-col gap-1">
							<label for="label-prop" class="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400 dm-mono">
								Label Property
								<span class="text-slate-400">(optional)</span>
							</label>
							<select
								id="label-prop"
								value={mapping.labelProp}
								onchange={handleLabelPropChange}
								class="h-9 px-3 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-sm dm-mono focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
							>
								<option value="">Use X-Axis value</option>
								{#each allProperties as prop (prop.name)}
									<option value={prop.name}>{prop.name}</option>
								{/each}
							</select>
						</div>

						<!-- Color Picker -->
						<div class="flex flex-col gap-1">
							<label class="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400 dm-mono">
								Layer Color
							</label>
							<div class="flex gap-1.5 flex-wrap">
								{#each colorPalette as color (color)}
									<button
										type="button"
										onclick={() => handleColorChange(color)}
										class="h-8 w-8 rounded-md border-2 transition-all {mapping.color === color 
											? 'border-slate-900 dark:border-white scale-110' 
											: 'border-transparent hover:scale-105'}"
										style="background-color: {color}"
										aria-label="Select color {color}"
									></button>
								{/each}
							</div>
						</div>
					</div>

					<!-- Sample Data Preview -->
					{#if selectedArray.sampleItem && mapping.xProp && mapping.yProp}
						<div class="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
							<h4 class="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400 dm-mono mb-2">
								Sample Data Point
							</h4>
							<div class="flex items-center gap-4 text-sm">
								<div class="flex items-center gap-2">
									<span class="text-slate-500 dark:text-slate-400">X:</span>
									<code class="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 dm-mono">
										{selectedArray.sampleItem[mapping.xProp] ?? 'N/A'}
									</code>
								</div>
								<div class="flex items-center gap-2">
									<span class="text-slate-500 dark:text-slate-400">Y:</span>
									<code class="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 dm-mono">
										{selectedArray.sampleItem[mapping.yProp] ?? 'N/A'}
									</code>
								</div>
								{#if mapping.labelProp}
									<div class="flex items-center gap-2">
										<span class="text-slate-500 dark:text-slate-400">Label:</span>
										<code class="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 dm-mono">
											{selectedArray.sampleItem[mapping.labelProp] ?? 'N/A'}
										</code>
									</div>
								{/if}
							</div>
						</div>
					{/if}
				{/if}
			</div>
		{/if}
	</div>
</div>
