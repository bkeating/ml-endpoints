<script>
	import Icon from '$lib/components/Icon.svelte';
</script>

<section class="h-[calc(100vh-140px)] md:h-auto bg-linear-to-b from-[#353C52] to-[#252b3d] dark:from-[#1f2a2e] dark:to-[#070f1b] min-h-[400px] flex items-center justify-center font-instrument-sans relative overflow-hidden">
	<div
		class="absolute inset-0 bg-[url('/teamwork.jpg.webp')] bg-cover bg-center blur-xs grayscale opacity-15"
		aria-hidden="true"
	></div>

	<div class="relative z-10 flex flex-col md:flex-row max-w-7xl mx-auto h-full items-end justify-end md:items-center md:justify-center px-4 gap-9">
		<div class="w-full md:w-1/3">
			<h1 class="text-5xl md:text-7xl mt-8 md:mt-0 font-bold text-white text-balance instrument-serif-regular-italic">
				MLPerf <br>
				<span class="inline-block w-7 h-7 bg-[#CCEBD4] rounded-full mb-2 mr-1"></span>
				Endpoints
			</h1>
		</div>

		<div class="w-full md:w-2/3">
			<p class="mb-6 text-slate-100 text-lg md:text-xl leading-relaxed dark:text-slate-300/60 md:max-w-[70%] font-instrument-sans-100">
				MLPerf Endpoints turns complex AI benchmark data into clear, interactive visualizations
				that reveal performance trade-offs at a glance. Compare systems, understand what you're
				acquiring, and make confident infrastructure decisions.
			</p>

			<a
				href="/phaneros"
				target="_blank"
				rel="noopener noreferrer"
				class="flex items-center justify-center gap-2 px-8 h-12 w-fit mb-3 md:mb-4 rounded-full bg-[#CCEBD4] dark:bg-emerald-600 text-[#10141F] dark:text-white transition-colors"
			>
				<span>Try MLPerf Endpoints Studio</span>
				<Icon name="ExternalLink" class="h-5 w-5" />
			</a>
      <a
				href="/phaneros"
				target="_blank"
				rel="noopener noreferrer"
				class="flex items-center justify-center gap-2 px-8 h-12 w-fit mb-16 md:mb-0 rounded-full border border-[#CCEBD4] dark:border-emerald-600 text-emerald-100 dark:text-emerald-100 transition-colors"
			>
      <Icon name="Artboard" class="h-5 w-5" />
				<span>Preview Design System</span>
			</a>
		</div>
	</div>
</section>
