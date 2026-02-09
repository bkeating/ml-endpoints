<script>
	import {
		isSystemVisible,
		toggleSystem,
		getSelectedBenchmarkModelId,
		setSelectedBenchmarkModelId,
		getSelectedAccelerator,
		setSelectedAccelerator,
		isSystemDisabledByAccelerator
	} from '$lib/stores/chartSettings.svelte.js';
	import { getTheme } from '$lib/stores/theme.svelte.js';
	import endpointsData from '../endpoints-benchmark-data.json';

	const modelOptions = [
		{ id: 'all', label: 'All Models' },
		...endpointsData.models.map((model) => ({
			id: model.model_id,
			label: model.model_name
		}))
	];

	const uniqueAccelerators = [...new Set(endpointsData.systems.map((s) => s.accelerator_model_name))];
	const acceleratorOptions = [
		{ id: 'all', label: 'All Accelerators' },
		...uniqueAccelerators.map((name) => ({
			id: name,
			label: name
		}))
	];

	const COMPANY_PREFIXES = [
		'Microsoft',
		'SambaNova',
		'Qualcomm',
		'Cerebras',
		'NVIDIA',
		'Google',
		'Intel',
		'AMD',
		'AWS'
	];

	let selectedModel = $derived(getSelectedBenchmarkModelId());
	let selectedAccelerator = $derived(getSelectedAccelerator());
	let showAdvancedFilters = $state(false);

	function parseSystemName(systemName) {
		const match = systemName.match(/^(.+?)\s*\((.+)\)\s*$/);
		if (match) {
			return { main: match[1].trim(), subline: match[2].trim() };
		}
		return { main: systemName, subline: null };
	}

	function stripCompanyPrefix(name) {
		const n = name.trim();
		for (const prefix of COMPANY_PREFIXES) {
			if (n.toLowerCase().startsWith(prefix.toLowerCase())) {
				const rest = n.slice(prefix.length).trim();
				return rest || n;
			}
		}
		return n;
	}

	function getSystemLogo(system) {
		const name = `${system.system_name} ${system.accelerator_model_name} ${system.host_processor_model_name}`.toLowerCase();
		const isDarkTheme = getTheme() === 'dark';
		if (name.includes('nvidia')) {
			return { src: isDarkTheme ? '/logo-nvidia-dark.svg' : '/logo-nvidia.svg', alt: 'NVIDIA' };
		}
		if (name.includes('microsoft')) {
			return {
				src: isDarkTheme ? '/logo-microsoft-dark.svg' : '/logo-microsoft.svg',
				alt: 'Microsoft'
			};
		}
		if (name.includes('google')) {
			return { src: isDarkTheme ? '/logo-google-dark.svg' : '/logo-google.svg', alt: 'Google' };
		}
		if (name.includes('aws') || name.includes('amazon')) {
			return { src: isDarkTheme ? '/logo-aws-dark.svg' : '/logo-aws.svg', alt: 'AWS' };
		}
		if (name.includes('cerebras')) {
			return { src: isDarkTheme ? '/logo-cerebras-dark.svg' : '/logo-cerebras.svg', alt: 'Cerebras' };
		}
		if (name.includes('intel') || name.includes('xeon')) {
			return { src: isDarkTheme ? '/logo-intel-dark.svg' : '/logo-intel.svg', alt: 'Intel' };
		}
		if (name.includes('amd') || name.includes('epyc')) {
			return { src: isDarkTheme ? '/logo-amd-dark.svg' : '/logo-amd.svg', alt: 'AMD' };
		}
		return null;
	}

	let hardwareSystems = $derived(
		endpointsData.systems.slice(0, 8).map((system) => {
			const { main, subline } = parseSystemName(system.system_name);
			return {
				id: system.id,
				name: stripCompanyPrefix(main),
				subline,
				color: system.color,
				logo: getSystemLogo(system),
				disabledByFilter: isSystemDisabledByAccelerator(system.accelerator_model_name)
			};
		})
	);

</script>

<div
	class="transition-colors duration-300 ease-out mx-auto max-w-7xl rounded-lg border border-slate-200 bg-slate-800/90 shadow-xl backdrop-blur dark:border-slate-700 dark:bg-slate-800/75"
>
	<div class="p-4">
		<div class="flex flex-wrap items-center gap-3">
			<div class="flex items-center gap-2">
				<span class="text-[11px] font-semibold tracking-widest text-slate-300 uppercase">Hardware</span>
			</div>

			<div
				class="grid min-w-0 flex-1 grid-flow-col grid-rows-2 gap-2 overflow-x-auto pb-1 pr-2"
				aria-label="Hardware systems"
			>
				{#each hardwareSystems as hw (hw.id)}
					{@const visible = isSystemVisible(hw.id)}
					{@const disabled = hw.disabledByFilter}
					<button
						type="button"
						class="flex items-center gap-2 rounded-md border px-2 py-1 transition-colors whitespace-nowrap {visible && !disabled
							? 'border-emerald-300/40 bg-emerald-300/20 text-white'
							: 'border-slate-600 bg-slate-800/40 text-slate-300'} {disabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer hover:bg-slate-700/70'}"
						onclick={() => !disabled && toggleSystem(hw.id)}
						aria-pressed={visible}
						aria-disabled={disabled}
						disabled={disabled}
						aria-label="Toggle {hw.subline ? `${hw.name} (${hw.subline})` : hw.name} visibility{disabled ? ' (disabled by accelerator filter)' : ''}"
					>
						<input
							type="checkbox"
							checked={visible}
							onchange={() => !disabled && toggleSystem(hw.id)}
							class="h-3.5 w-3.5 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500 dark:border-slate-500 dark:bg-slate-700"
							aria-label="Select {hw.name}"
							disabled={disabled}
						/>
						<span class="text-xs">{hw.name}</span>
						{#if hw.logo}
							<img src={hw.logo.src} alt={hw.logo.alt} class="max-h-4 max-w-10 dark:invert" />
						{/if}
						<span class="h-2.5 w-2.5 rounded-full" style="background-color: {hw.color};"></span>
					</button>
				{/each}
			</div>

			<div class="flex items-center gap-2">
				<label for="top-nav-model-select" class="text-[11px] font-semibold tracking-widest text-slate-300 uppercase">
					Model
				</label>
				<select
					id="top-nav-model-select"
					value={selectedModel}
					onchange={(e) =>
						setSelectedBenchmarkModelId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
					class="rounded-md border border-slate-600 bg-slate-800 px-2 py-1 text-xs text-slate-100 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 focus:outline-none"
					aria-label="Select benchmark model"
				>
					{#each modelOptions as option (option.id)}
						<option value={option.id}>{option.label}</option>
					{/each}
				</select>
			</div>

			<div class="hidden items-center gap-1 lg:flex">
				<span class="text-[11px] font-semibold tracking-widest text-slate-300 uppercase">Workload</span>
				<span class="rounded border border-slate-600 px-1.5 py-0.5 text-[11px] text-slate-200">1k/1k</span>
				<span class="rounded border border-slate-600 px-1.5 py-0.5 text-[11px] text-slate-200">1k/8k</span>
				<span class="rounded border border-slate-600 px-1.5 py-0.5 text-[11px] text-slate-200">8k/1k</span>
			</div>

			<div class="hidden items-center gap-1 lg:flex">
				<span class="text-[11px] font-semibold tracking-widest text-slate-300 uppercase">Precision</span>
				<span class="rounded border border-slate-600 px-1.5 py-0.5 text-[11px] text-slate-200">FP4</span>
				<span class="rounded border border-slate-600 px-1.5 py-0.5 text-[11px] text-slate-200">FP8</span>
			</div>

			<button
				type="button"
				onclick={() => (showAdvancedFilters = !showAdvancedFilters)}
				class="rounded-md border border-slate-600 px-2 py-1 text-[11px] font-semibold tracking-widest text-slate-200 uppercase transition-colors hover:bg-slate-700 cursor-pointer"
				aria-expanded={showAdvancedFilters}
				aria-label="{showAdvancedFilters ? 'Hide' : 'Show'} advanced filters"
			>
				Advanced
			</button>
		</div>

		{#if showAdvancedFilters}
			<div class="mt-4 border-t border-slate-700 pt-4">
				<div class="flex items-center gap-2">
					<label
						for="top-nav-accelerator-filter"
						class="text-[11px] font-semibold tracking-widest text-slate-300 uppercase"
					>
						Accelerator
					</label>
					<select
						id="top-nav-accelerator-filter"
						value={selectedAccelerator}
						onchange={(e) => setSelectedAccelerator(e.target.value)}
						class="rounded-md border border-slate-600 bg-slate-800 px-2 py-1 text-xs text-slate-100 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 focus:outline-none"
						aria-label="Filter hardware by accelerator"
					>
						{#each acceleratorOptions as option (option.id)}
							<option value={option.id}>{option.label}</option>
						{/each}
					</select>
				</div>
			</div>
		{/if}
	</div>
</div>
