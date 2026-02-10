<script>
	/**
	 * RecentSubmissionsCarousel - Paginated grid of submission cards with mini sparklines.
	 * Includes inline legend (TTFT / Throughput toggle) and carousel navigation.
	 */
	import SubmissionMiniChart from './SubmissionMiniChart.svelte';
	import {
		getRunsForSubmission,
		getModelLogoUrl,
		getHardwareLogoUrl
	} from '$lib/utils/endpointsDataUtils.js';
	import { endpointsData } from '$lib/data/index.js';
	import { getTheme } from '$lib/stores/theme.svelte.js';

	/** @type {{ submissions: Array }} */
	let { submissions = [] } = $props();

	const CARDS_PER_PAGE = 4;
	let carouselPage = $state(0);
	let showTtft = $state(true);
	let showThroughput = $state(true);

	let chartColors = $derived({
		ttft: getTheme() === 'dark' ? '#B3CEBA' : '#62826C',
		throughput: getTheme() === 'dark' ? '#A0B5DD' : '#37548A',
		sysTps: getTheme() === 'dark' ? '#BED3FB' : '#535869'
	});

	let totalPages = $derived(Math.ceil(submissions.length / CARDS_PER_PAGE));
	let carouselTranslateX = $derived(-(carouselPage * 100));
	let isPrevDisabled = $derived(carouselPage === 0);
	let isNextDisabled = $derived(carouselPage >= totalPages - 1);

	function prevPage() {
		if (carouselPage > 0) carouselPage--;
	}

	function nextPage() {
		if (carouselPage < totalPages - 1) carouselPage++;
	}
</script>

<section class="mt-12 pt-8" aria-label="Most recent submissions">
	<div class="flex flex-col gap-6">
		<div class="flex items-center justify-between">
			<h2 class="text-2xl font-semibold text-slate-700 dark:text-white">Most Recent Submissions</h2>
			<div class="flex items-center gap-4" role="group" aria-label="Chart legend">
				<button
					type="button"
					class="flex items-center gap-2 transition-opacity {showTtft ? 'opacity-100' : 'opacity-40'}"
					onclick={() => (showTtft = !showTtft)}
					aria-pressed={showTtft}
					aria-label="Toggle TTFT data"
				>
					<div class="h-3 w-3 rounded-full" style="background-color: {chartColors.ttft}"></div>
					<span class="text-sm font-medium text-slate-700 dark:text-slate-300">TTFT</span>
				</button>
				<button
					type="button"
					class="flex items-center gap-2 transition-opacity {showThroughput ? 'opacity-100' : 'opacity-40'}"
					onclick={() => (showThroughput = !showThroughput)}
					aria-pressed={showThroughput}
					aria-label="Toggle Throughput vs Interactivity data"
				>
					<div class="h-3 w-3 rounded-full" style="background-color: {chartColors.throughput}"></div>
					<span class="text-sm font-medium text-slate-700 dark:text-slate-300">Thru vs Int</span>
				</button>
				<div class="ml-2 flex items-center gap-1">
					<button
						type="button"
						class="flex h-7 w-7 items-center justify-center rounded-md border cursor-pointer {isPrevDisabled
							? 'border-slate-200 bg-slate-50 text-slate-300 cursor-not-allowed dark:border-slate-700 dark:bg-slate-800 dark:text-slate-600'
							: 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'}"
						onclick={prevPage}
						disabled={isPrevDisabled}
						aria-label="Previous submissions"
					>
						<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
							<path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
						</svg>
					</button>
					<button
						type="button"
						class="flex h-7 w-7 items-center justify-center rounded-md border cursor-pointer {isNextDisabled
							? 'border-slate-200 bg-slate-50 text-slate-300 cursor-not-allowed dark:border-slate-700 dark:bg-slate-800 dark:text-slate-600'
							: 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'}"
						onclick={nextPage}
						disabled={isNextDisabled}
						aria-label="Next submissions"
					>
						<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
							<path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
						</svg>
					</button>
				</div>
			</div>
		</div>

		<div class="relative overflow-hidden">
			<div
				class="flex transition-transform duration-300 ease-out"
				style="transform: translateX({carouselTranslateX}%)"
			>
				{#each { length: totalPages } as _, pageIndex (pageIndex)}
					<div class="grid w-full shrink-0 grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
						{#each submissions.slice(
							pageIndex * CARDS_PER_PAGE,
							(pageIndex + 1) * CARDS_PER_PAGE
						) as submission (submission.submission_id)}
							{@const runs = getRunsForSubmission(submission.submission_id, endpointsData.runs)}
							{@const modelLogoUrl = getModelLogoUrl(submission, endpointsData.models)}
							{@const hardwareLogoUrl = getHardwareLogoUrl(submission)}
							<a
								href="/report?submission={submission.submission_id}"
								class="group relative flex flex-col overflow-hidden rounded-lg border border-slate-200 transition-shadow hover:shadow-lg dark:border-slate-700"
							>
								<SubmissionMiniChart
									{runs}
									submissionId={submission.submission_id}
									{showTtft}
									{showThroughput}
									{chartColors}
								/>
								<div
									class="relative z-10 bg-white/95 backdrop-blur-sm border-t border-slate-200/50 px-3 py-3 dark:bg-slate-800/95 dark:border-slate-700/50"
								>
									<div class="flex items-center justify-between">
										<span
											class="text-sm font-medium dm-mono-medium shadow-xs dark:text-[#c9b856] bg-[#CCEBD460] text-[#343b36] border-[#9ebba5] dark:bg-[#736628]/20 border dark:border-[#736628] px-2 rounded"
											>{submission.model_name}</span
										>
										<div class="flex items-center gap-2 opacity-75">
											{#if hardwareLogoUrl}
												<img
													src={hardwareLogoUrl}
													alt="Hardware Logo"
													class="max-w-14 max-h-5 grayscale dark:invert"
												/>
											{/if}
											{#if modelLogoUrl}
												<img
													src={modelLogoUrl}
													alt="Model Logo"
													class="max-w-16 max-h-5 dark:invert grayscale"
												/>
											{/if}
										</div>
									</div>
								</div>
							</a>
						{/each}
					</div>
				{/each}
			</div>
		</div>
	</div>
</section>
