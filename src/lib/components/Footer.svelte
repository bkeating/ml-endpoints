<script>
	/** Newsletter email input (non-functional) */
	let email = $state('');
</script>

<footer class="font-instrument-sans mt-12 bg-slate-900 dark:bg-slate-950">
	<!-- Main Footer Content -->
	<div class="mx-auto max-w-7xl px-3 py-12 md:py-16">
		<div class="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
			<!-- Logo & Newsletter Section -->
			<div class="lg:col-span-2">
				<img src="/ML-Commons-Logo-Dark.svg" alt="ML Commons" class="mb-6 h-10" />
				<p class="mb-6 max-w-md text-sm leading-relaxed text-slate-400">
					MLCommons is an open engineering consortium with a mission to make machine learning better
					for everyone. We provide industry-standard benchmarks, datasets, and best practices.
				</p>

				<!-- Newsletter Subscription -->
				<div class="mb-6">
					<h3 class="mb-3 text-sm font-semibold tracking-wider text-white uppercase">
						Stay Updated
					</h3>
					<form class="flex flex-col gap-3 sm:flex-row" onsubmit={(e) => e.preventDefault()}>
						<input
							type="email"
							bind:value={email}
							placeholder="Enter your email"
							class="h-12 flex-1 rounded-lg border border-slate-700 bg-slate-800 px-4 text-white transition-all duration-200 placeholder:text-slate-500 focus:border-transparent focus:ring-2 focus:ring-emerald-500 focus:outline-none"
							aria-label="Email address for newsletter"
						/>
						<button
							type="submit"
							class="h-12 rounded-lg bg-[#CCEBD4] px-6 font-medium whitespace-nowrap text-slate-900 transition-colors duration-200 hover:bg-emerald-300"
						>
							Subscribe
						</button>
					</form>
				</div>
			</div>

			<!-- Resources Links -->
			<div>
				<h3 class="mb-4 text-sm font-semibold tracking-wider text-white uppercase">Resources</h3>
				<ul class="space-y-3">
					<li>
						<a
							href="https://mlcommons.org/benchmarks/"
							target="_blank"
							class="text-sm text-slate-400 transition-colors duration-200 hover:text-white"
						>
							Benchmarks
						</a>
					</li>
					<li>
						<a
							href="https://mlcommons.org/datasets/"
							target="_blank"
							class="text-sm text-slate-400 transition-colors duration-200 hover:text-white"
						>
							Datasets
						</a>
					</li>
					<li>
						<a
							href="https://mlcommons.org/best-practices/"
							target="_blank"
							class="text-sm text-slate-400 transition-colors duration-200 hover:text-white"
						>
							Best Practices
						</a>
					</li>
					<li>
						<a
							href="https://github.com/mlcommons"
							target="_blank"
							class="text-sm text-slate-400 transition-colors duration-200 hover:text-white"
						>
							GitHub
						</a>
					</li>
				</ul>
			</div>

			<!-- Community Links -->
			<div>
				<h3 class="mb-4 text-sm font-semibold tracking-wider text-white uppercase">Community</h3>
				<ul class="space-y-3">
					<li>
						<a
							href="https://mlcommons.org/get-involved/"
							target="_blank"
							class="text-sm text-slate-400 transition-colors duration-200 hover:text-white"
						>
							Get Involved
						</a>
					</li>
					<li>
						<a
							href="https://mlcommons.org/membership/"
							target="_blank"
							class="text-sm text-slate-400 transition-colors duration-200 hover:text-white"
						>
							Membership
						</a>
					</li>
					<li>
						<a
							href="https://mlcommons.org/events/"
							target="_blank"
							class="text-sm text-slate-400 transition-colors duration-200 hover:text-white"
						>
							Events
						</a>
					</li>
					<li>
						<a
							href="https://mlcommons.org/news/"
							target="_blank"
							class="text-sm text-slate-400 transition-colors duration-200 hover:text-white"
						>
							News
						</a>
					</li>
				</ul>
			</div>
		</div>
	</div>

	<!-- Bottom Bar -->
	<div class="border-t border-slate-800">
		<div class="mx-auto max-w-7xl px-3 py-6">
			<div class="flex flex-col items-center justify-between gap-4 md:flex-row">
				<!-- Copyright & Trademark -->
				<div class="text-center md:text-left">
					<p class="text-xs leading-relaxed text-slate-500">
						&copy; 2026 MLCommons. MLCommons, MLPerf and MLCube are registered trademarks of
						MLCommons Association.
					</p>
				</div>

				<!-- Legal Links -->
				<div class="flex items-center gap-4 text-xs">
					<a
						href="https://mlcommons.org/privacy/"
						target="_blank"
						class="text-slate-500 transition-colors duration-200 hover:text-slate-300"
					>
						Privacy Policy
					</a>
					<span class="text-slate-700">|</span>
					<a
						href="https://mlcommons.org/policies/"
						target="_blank"
						class="text-slate-500 transition-colors duration-200 hover:text-slate-300"
					>
						Policies
					</a>
				</div>
			</div>
		</div>
	</div>
</footer>
