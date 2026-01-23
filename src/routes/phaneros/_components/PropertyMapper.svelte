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
	let { response = null, mapping, onMappingChange } = $props();

	// Analyze the response structure to find arrays
	let analyzedStructure = $derived(response ? analyzeJsonStructure(response) : []);

	// Get selected array's properties
	let selectedArray = $derived(
		analyzedStructure.find(
			(a) => (a.path === '(root)' && mapping.dataPath === '') || a.path === mapping.dataPath
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

<div
	class="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800"
>
	<!-- Header -->
	<div
		class="border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/50"
	>
		<h3
			class="dm-mono text-sm font-semibold tracking-wide text-slate-700 uppercase dark:text-slate-300"
		>
			Property Mapping
		</h3>
	</div>

	<div class="p-4">
		{#if !response}
			<div class="py-8 text-center text-slate-500 dark:text-slate-400">
				<svg
					class="mx-auto mb-3 h-12 w-12 text-slate-300 dark:text-slate-600"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="1.5"
						d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
					/>
				</svg>
				<p class="text-sm">Fetch data from an API endpoint first</p>
			</div>
		{:else if analyzedStructure.length === 0}
			<div class="py-8 text-center text-amber-600 dark:text-amber-400">
				<svg class="mx-auto mb-3 h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="1.5"
						d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
					/>
				</svg>
				<p class="text-sm">No arrays found in response</p>
				<p class="mt-1 text-xs text-slate-500 dark:text-slate-400">
					The API response must contain an array of objects to create a chart
				</p>
			</div>
		{:else}
			<div class="space-y-4">
				<!-- Data Array Selection -->
				<div class="flex flex-col gap-1">
					<label
						for="data-path"
						class="dm-mono text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400"
					>
						Data Array
					</label>
					<select
						id="data-path"
						value={mapping.dataPath || '(root)'}
						onchange={handleDataPathChange}
						class="dm-mono h-9 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-[#CCEBD4] focus:ring-1 focus:ring-[#CCEBD4] focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:focus:border-[#887B40] dark:focus:ring-[#887B40]"
					>
						{#each analyzedStructure as array (array.path)}
							<option value={array.path}>
								{array.path} ({array.properties.length} properties)
							</option>
						{/each}
					</select>
				</div>

				{#if selectedArray}
					<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<!-- X-Axis Property -->
						<div class="flex flex-col gap-1">
							<label
								for="x-prop"
								class="dm-mono text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400"
							>
								X-Axis Property
							</label>
							<select
								id="x-prop"
								value={mapping.xProp}
								onchange={handleXPropChange}
								class="dm-mono h-9 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-[#CCEBD4] focus:ring-1 focus:ring-[#CCEBD4] focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:focus:border-[#887B40] dark:focus:ring-[#887B40]"
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
							<label
								for="y-prop"
								class="dm-mono text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400"
							>
								Y-Axis Property
								<span class="text-amber-500">(numeric)</span>
							</label>
							<select
								id="y-prop"
								value={mapping.yProp}
								onchange={handleYPropChange}
								class="dm-mono h-9 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-[#CCEBD4] focus:ring-1 focus:ring-[#CCEBD4] focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:focus:border-[#887B40] dark:focus:ring-[#887B40]"
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
							<label
								for="label-prop"
								class="dm-mono text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400"
							>
								Label Property
								<span class="text-slate-400">(optional)</span>
							</label>
							<select
								id="label-prop"
								value={mapping.labelProp}
								onchange={handleLabelPropChange}
								class="dm-mono h-9 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-[#CCEBD4] focus:ring-1 focus:ring-[#CCEBD4] focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:focus:border-[#887B40] dark:focus:ring-[#887B40]"
							>
								<option value="">Use X-Axis value</option>
								{#each allProperties as prop (prop.name)}
									<option value={prop.name}>{prop.name}</option>
								{/each}
							</select>
						</div>

						<!-- Color Picker -->
						<div class="flex flex-col gap-1">
							<span
								class="dm-mono text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400"
							>
								Layer Color
							</span>
							<div class="flex flex-wrap gap-1.5">
								{#each colorPalette as color (color)}
									<button
										type="button"
										onclick={() => handleColorChange(color)}
										class="h-8 w-8 rounded-md border-2 transition-all {mapping.color === color
											? 'scale-110 border-slate-900 dark:border-white'
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
						<div class="mt-4 border-t border-slate-200 pt-4 dark:border-slate-700">
							<h4
								class="dm-mono mb-2 text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400"
							>
								Sample Data Point
							</h4>
							<div class="flex items-center gap-4 text-sm">
								<div class="flex items-center gap-2">
									<span class="text-slate-500 dark:text-slate-400">X:</span>
									<code class="dm-mono rounded bg-slate-100 px-2 py-0.5 dark:bg-slate-700">
										{selectedArray.sampleItem[mapping.xProp] ?? 'N/A'}
									</code>
								</div>
								<div class="flex items-center gap-2">
									<span class="text-slate-500 dark:text-slate-400">Y:</span>
									<code class="dm-mono rounded bg-slate-100 px-2 py-0.5 dark:bg-slate-700">
										{selectedArray.sampleItem[mapping.yProp] ?? 'N/A'}
									</code>
								</div>
								{#if mapping.labelProp}
									<div class="flex items-center gap-2">
										<span class="text-slate-500 dark:text-slate-400">Label:</span>
										<code class="dm-mono rounded bg-slate-100 px-2 py-0.5 dark:bg-slate-700">
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
