<div class="hero-container bg-linear-to-b from-[#353C52] to-[#252b3d] dark:from-[#05141b] dark:to-[#0d2440] min-h-[550px] flex items-center justify-center font-instrument-sans relative overflow-hidden">
	<div class="hero-bg"></div>
	<div class="relative z-10 flex md:flex-row flex-col max-w-7xl mx-auto items-center px-4 gap-9 md:gap-9 text-slate-900 transition-colors duration-200 dark:text-slate-100">
		<div class="w-full md:w-1/3">
			<h1 class="text-5xl md:text-6xl mt-8 md:mt-0 font-bold text-white dark:text-white text-balance dm-mono">
				LLM Inference Benchmark
			</h1>
		</div>

		<div class="w-full md:w-2/3">
			<p class="mb-8 text-slate-100 text-lg md:text-xl leading-relaxed dark:text-slate-400 md:max-w-[70%] font-instrument-sans-200">
				This is a proof-of-concept for the ML Commons Endpoints project. It is meant to be a showcase
				and proof-of-concept for reactive state and d3.js charting visualizations as a possible
				solution. This project is basic, but it will grow rapidly with new features to keep proving out
				concepts.
			</p>

			<a
				href="https://mlcommons.org/get-involved/"
				target="_blank"
				class="bg-[#CCEBD4] dark:bg-emerald-600 px-8 flex items-center justify-center h-12 rounded-full text-[#10141F] dark:text-white transition-colors duration-200 mb-6 md:mb-0 w-fit"
			>
				<span>Get Involved</span>
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

