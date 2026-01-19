<script>
	import Icon from '$lib/components/Icon.svelte';
</script>

<div class="hero-container bg-linear-to-b from-[#353C52] to-[#252b3d] dark:from-[#102934] dark:to-[#070f1b] min-h-[380px] flex items-center justify-center font-instrument-sans relative overflow-hidden">
	<div class="hero-bg"></div>
	<div class="relative z-10 flex md:flex-row flex-col max-w-7xl mx-auto items-center px-4 gap-9 md:gap-9 text-slate-900 transition-colors duration-200 dark:text-slate-100">
		<div class="w-full md:w-1/3">
			<h1 class="text-5xl md:text-6xl mt-8 md:mt-0 font-bold text-white dark:text-white text-balance instrument-serif-regular-italic">
        <div class="w-16 h-16 bg-[#CCEBD4] rounded-full mb-2"></div>
				MLPerf <br />Endpoints
			</h1>
		</div>

		<div class="w-full md:w-2/3">
			<p class="mb-6 text-slate-100 text-lg md:text-xl leading-relaxed dark:text-slate-400 md:max-w-[70%] font-instrument-sans-200">
				MLPerf Endpoints turns complex AI benchmark data into clear, interactive visualizations that reveal performance trade-offs at a glance. Compare systems, understand what you're acquiring, and make confident infrastructure decisions.
			</p>

			<a
				href="https://mlcommons.org/get-involved/"
				target="_blank"
				class="bg-[#CCEBD4] dark:bg-emerald-600 px-8 gap-2 flex items-center justify-center h-12 rounded-full text-[#10141F] dark:text-white transition-colors duration-200 mb-6 md:mb-0 w-fit"
			>
				<span>Try MLPerf Endpoints Studio</span>
				<Icon name="ExternalLink" class="h-5 w-5" />
			</a>
		</div>
	</div>
</div>

<style lang="postcss">
	@reference "@app-css";

	.hero-bg {
		@apply absolute inset-0 z-0;
		background-image: url('/teamwork.jpg.webp');
		background-size: cover;
		background-position: center;
		filter: blur(4px) grayscale(100%);
		opacity: 0.15;
	}
</style>

