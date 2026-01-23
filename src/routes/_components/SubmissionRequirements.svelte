<script>
	/**
	 * Static content section explaining MLPerf submission requirements.
	 * Two-column layout with text on left and requirements card on right.
	 */
	import { resolve } from '$app/paths';
</script>

<div
	class="mb-12 flex flex-col gap-8 border-b-2 border-[#CCEBD4] pb-20 lg:flex-row lg:items-start lg:gap-6 dark:border-slate-700"
>
	<div class="w-full lg:w-1/2 lg:pr-6">
		<h2
			class="instrument-serif-regular-italic mb-3 text-2xl text-slate-800 sm:text-3xl md:text-5xl dark:text-slate-200"
		>
			How to submit MLPerf results
		</h2>
		<p class="my-3 leading-relaxed text-slate-500 dark:text-slate-400">
			If you are interested in submitting MLPerf benchmark results, please join the appropriate
			working group. Registration deadlines are several weeks in advance of submission dates to
			ensure that all submitters are aware of benchmark requirements, and to ensure proper provision
			of all necessary resources.
		</p>

		<ul
			class="my-3 ml-4 list-inside list-disc indent-4 leading-relaxed text-slate-500 dark:text-slate-400"
		>
			<li>Enable comparison while encouraging AI/ML innovation.</li>
			<li>Accelerate AI/ML progress through fair and useful measurement.</li>
			<li>Enforce reproducibility to ensure reliable results.</li>
			<li>Serve both the commercial and research communities.</li>
			<li>Keep benchmarking effort affordable so all can participate.</li>
			<li>Keep benchmarking effort affordable so all can participate.</li>
		</ul>

		<p class="my-3 leading-relaxed text-slate-500 dark:text-slate-400">
			Membership is required for most benchmark working groups (e.g., Training, Inference, Mobile).
			There are some public benchmark working groups that have no access requirements where
			non-members may submit to the benchmark by first signing a Non-member Test Agreement.
		</p>

		<p class="my-3 leading-relaxed text-slate-500 dark:text-slate-400">
			We encourage people to become MLCommons Members if they wish to contribute to MLCommons
			projects. However, if you are interested in contributing to one of our open source projects
			and do not think your organization would be a good fit as a Member, please enter your GitHub
			ID into our subscription form.
		</p>
	</div>
	<div class="relative w-full lg:w-1/2">
		<!-- Page corner fold effect (hidden on mobile) -->
		<div class="absolute top-0 right-0 hidden h-12 w-12 sm:block"></div>
		<div
			class="absolute top-0 right-12 hidden h-0 w-0 border-b-48 border-l-48 border-b-slate-700 border-l-transparent sm:block"
		></div>
		<div
			class="absolute top-12 right-0 hidden h-0 w-0 border-t-48 border-l-48 border-t-transparent border-l-slate-600 sm:block"
		></div>

		<!-- Main card -->
		<div class="clip-corner bg-slate-800 p-6 text-white sm:p-10 sm:pr-16">
			<h2
				class="mb-6 text-xs font-medium tracking-widest text-gray-300 sm:mb-8 sm:text-sm sm:tracking-[0.2em]"
			>
				SUBMISSION REQUIREMENTS:
			</h2>

			<ul class="space-y-4 sm:space-y-6">
				<li class="flex items-start gap-3 border-b border-slate-600 pb-4 sm:gap-4 sm:pb-6">
					<svg
						class="mt-0.5 h-5 w-5 shrink-0 text-gray-400"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
					<span class="text-sm text-gray-200 sm:text-base"
						>Join an appropriate MLCommons Working Group</span
					>
				</li>

				<li class="flex items-start gap-3 border-b border-slate-600 pb-4 sm:gap-4 sm:pb-6">
					<svg
						class="mt-0.5 h-5 w-5 shrink-0 text-gray-400"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
					<span class="text-sm text-gray-200 sm:text-base"
						>A signed Contributor License Agreement (CLA) to enable contributing code, logs, etc. to
						MLCommons GitHub repositories.</span
					>
				</li>

				<li class="flex items-start gap-3 border-b border-slate-600 pb-4 sm:gap-4 sm:pb-6">
					<svg
						class="mt-0.5 h-5 w-5 shrink-0 text-gray-400"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
					<span class="text-sm text-gray-200 sm:text-base"
						>Membership in MLCommons OR a signed Non-member Test Agreement</span
					>
				</li>

				<li class="flex items-start gap-3 border-b border-slate-600 pb-4 sm:gap-4 sm:pb-6">
					<svg
						class="mt-0.5 h-5 w-5 shrink-0 text-gray-400"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
					<span class="text-sm text-gray-200 sm:text-base"
						>A signed trademark license agreement (either the member OR non-member version, as
						appropriate)</span
					>
				</li>
			</ul>

			<div class="mt-6 space-y-3 text-xs text-gray-400 sm:mt-8 sm:space-y-4 sm:text-sm">
				<p>
					MLPerf is a registered trademark of MLCommons. The use of the MLPerf results and trademark
					are described in our <a href={resolve('/policies')} class="underline hover:text-gray-300"
						>Policies</a
					>.
				</p>
				<p>
					Both member and non-member trademark agreements are available upon request by contacting <a
						href="mailto:support@mlcommons.org"
						class="underline hover:text-gray-300">support@mlcommons.org</a
					>.
				</p>
			</div>
		</div>
	</div>
</div>
