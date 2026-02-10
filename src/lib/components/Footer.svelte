<script>
	let email = $state('');

	const linkGroups = [
		{
			title: 'Resources',
			links: [
				{ label: 'Benchmarks', href: 'https://mlcommons.org/benchmarks/' },
				{ label: 'Datasets', href: 'https://mlcommons.org/datasets/' },
				{ label: 'Best Practices', href: 'https://mlcommons.org/best-practices/' },
				{ label: 'GitHub', href: 'https://github.com/mlcommons' }
			]
		},
		{
			title: 'Community',
			links: [
				{ label: 'Get Involved', href: 'https://mlcommons.org/get-involved/' },
				{ label: 'Membership', href: 'https://mlcommons.org/membership/' },
				{ label: 'Events', href: 'https://mlcommons.org/events/' },
				{ label: 'News', href: 'https://mlcommons.org/news/' }
			]
		}
	];

	const legalLinks = [
		{ label: 'Privacy Policy', href: 'https://mlcommons.org/privacy/' },
		{ label: 'Policies', href: 'https://mlcommons.org/policies/' }
	];
</script>

<footer class="font-instrument-sans mt-12 bg-slate-50 dark:bg-slate-950/30">
	<div class="mx-auto max-w-7xl px-3 py-12 md:py-16">
		<div class="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
			<div class="lg:col-span-2">
				<img src="/brand/ML-Commons-Logo-Dark.svg" alt="ML Commons" class="mb-6 h-10 invert dark:invert-0" />
				<p class="mb-6 max-w-md text-sm leading-relaxed text-slate-700 dark:text-slate-400">
					MLCommons is an open engineering consortium with a mission to make machine learning better for everyone. We provide industry-standard benchmarks, datasets, and best practices.
				</p>
				<div class="mb-6">
					<h3 class="footer-heading">Stay Updated</h3>
					<form class="flex flex-col gap-3 sm:flex-row" onsubmit={(e) => e.preventDefault()}>
						<input
							type="email"
							bind:value={email}
							placeholder="Enter your email"
							class="h-12 flex-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 text-slate-900 dark:text-white transition-all duration-200 placeholder:text-slate-500 focus:border-transparent focus:ring-2 focus:ring-emerald-500 focus:outline-none"
							aria-label="Email address for newsletter"
						/>
						<button type="submit" class="h-12 rounded-lg bg-[#CCEBD4] px-6 font-medium whitespace-nowrap text-slate-900 transition-colors duration-200 hover:bg-emerald-300">
							Subscribe
						</button>
					</form>
				</div>
			</div>

			{#each linkGroups as group (group.title)}
				<div>
					<h3 class="footer-heading">{group.title}</h3>
					<ul class="space-y-3">
						{#each group.links as link (link.href)}
							<li><a href={link.href} target="_blank" rel="noopener noreferrer" class="footer-link">{link.label}</a></li>
						{/each}
					</ul>
				</div>
			{/each}
		</div>
	</div>

	<div class="border-t border-slate-300 dark:border-slate-800">
		<div class="mx-auto max-w-7xl px-3 py-6">
			<div class="flex flex-col items-center justify-between gap-4 md:flex-row">
				<p class="text-center text-xs leading-relaxed text-slate-600 dark:text-slate-500 md:text-left">
					&copy; {new Date().getFullYear()} MLCommons. MLCommons, MLPerf and MLCube are registered trademarks of MLCommons Association.
				</p>
				<div class="flex items-center gap-4 text-xs">
					{#each legalLinks as link, i (link.href)}
						{#if i > 0}<span class="text-slate-400 dark:text-slate-700" aria-hidden="true">|</span>{/if}
						<a href={link.href} target="_blank" rel="noopener noreferrer" class="footer-legal-link">{link.label}</a>
					{/each}
				</div>
			</div>
		</div>
	</div>
</footer>

<style lang="postcss">
	@reference "@app-css";

	.footer-heading {
		@apply mb-4 text-sm font-semibold uppercase tracking-wider text-slate-900 dark:text-white;
	}

	.footer-link {
		@apply text-sm text-slate-700 transition-colors duration-200 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white;
	}

	.footer-legal-link {
		@apply text-slate-600 transition-colors duration-200 hover:text-slate-900 dark:text-slate-500 dark:hover:text-slate-300;
	}
</style>
