<script>
	import Icon from '$lib/components/Icon.svelte';
	import { resolve } from '$app/paths';
</script>

<section
	class="font-instrument-sans relative flex h-[calc(100vh-140px)] min-h-[400px] items-center justify-center overflow-hidden bg-linear-to-b from-[#353C52] to-[#252b3d] md:h-auto dark:from-[#1f2a2e] dark:to-[#070f1b]"
>
	<div
		class="absolute inset-0 bg-[url('/teamwork.webp')] bg-cover bg-center opacity-15 blur-xs grayscale"
		aria-hidden="true"
	></div>

	<div
		class="relative z-10 mx-auto flex h-full max-w-7xl flex-col items-end justify-end gap-9 px-4 md:flex-row md:items-center md:justify-center"
	>
		<div class="w-full md:w-1/3">
			<h1
				class="instrument-serif-regular-italic mt-8 text-5xl font-bold text-balance text-white md:mt-0 md:text-7xl"
			>
				MLPerf <br />
				<span class="mr-1 mb-2 inline-block h-7 w-7 rounded-full bg-[#CCEBD4]"></span>
				Endpoints
			</h1>
		</div>

		<div class="w-full md:w-2/3">
			<p
				class="font-instrument-sans-100 mb-6 text-lg leading-relaxed text-slate-100 md:max-w-[70%] md:text-xl dark:text-slate-300/60"
			>
				MLPerf Endpoints turns complex AI benchmark data into clear, interactive visualizations that
				reveal performance trade-offs at a glance. Compare systems, understand what you're
				acquiring, and make confident infrastructure decisions.
			</p>

			<a
				href={resolve('/phaneros')}
				target="_blank"
				rel="noopener noreferrer"
				class="mb-3 flex h-12 w-fit items-center justify-center gap-2 rounded-full bg-[#CCEBD4] px-8 text-[#10141F] transition-colors md:mb-4 dark:bg-yellow-500 dark:text-white"
			>
				<span>Try MLPerf Endpoints Studio</span>
				<Icon name="ExternalLink" class="h-5 w-5" />
			</a>
			<a
				href={resolve('/phaneros')}
				target="_blank"
				rel="noopener noreferrer"
				class="mb-16 flex h-12 w-fit items-center justify-center gap-2 rounded-full border border-[#CCEBD4] px-8 text-yellow-100 transition-colors md:mb-0 dark:border-yellow-500 dark:text-yellow-100"
			>
				<Icon name="Artboard" class="h-5 w-5" />
				<span>Preview Design System</span>
			</a>
		</div>
	</div>
</section>
