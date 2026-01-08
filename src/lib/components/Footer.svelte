<script>
	/** Newsletter email input (non-functional) */
	let email = $state('');
</script>

<footer class="bg-slate-900 dark:bg-slate-950 mt-12 font-instrument-sans">
	<!-- Main Footer Content -->
	<div class="max-w-7xl mx-auto px-3 py-12 md:py-16">
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-8">
			<!-- Logo & Newsletter Section -->
			<div class="lg:col-span-2">
				<img src="/ML-Commons-Logo-Dark.svg" alt="ML Commons" class="h-10 mb-6" />
				<p class="text-slate-400 text-sm leading-relaxed mb-6 max-w-md">
					MLCommons is an open engineering consortium with a mission to make machine learning better for everyone.
					We provide industry-standard benchmarks, datasets, and best practices.
				</p>

				<!-- Newsletter Subscription -->
				<div class="mb-6">
					<h3 class="text-white text-sm font-semibold uppercase tracking-wider mb-3">Stay Updated</h3>
					<form class="flex flex-col sm:flex-row gap-3" onsubmit={(e) => e.preventDefault()}>
						<input
							type="email"
							bind:value={email}
							placeholder="Enter your email"
							class="flex-1 h-12 px-4 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
							aria-label="Email address for newsletter"
						/>
						<button
							type="submit"
							class="h-12 px-6 rounded-lg bg-[#CCEBD4] text-slate-900 font-medium hover:bg-emerald-300 transition-colors duration-200 whitespace-nowrap"
						>
							Subscribe
						</button>
					</form>
				</div>
			</div>

			<!-- Resources Links -->
			<div>
				<h3 class="text-white text-sm font-semibold uppercase tracking-wider mb-4">Resources</h3>
				<ul class="space-y-3">
					<li>
						<a href="https://mlcommons.org/benchmarks/" target="_blank" class="text-slate-400 hover:text-white text-sm transition-colors duration-200">
							Benchmarks
						</a>
					</li>
					<li>
						<a href="https://mlcommons.org/datasets/" target="_blank" class="text-slate-400 hover:text-white text-sm transition-colors duration-200">
							Datasets
						</a>
					</li>
					<li>
						<a href="https://mlcommons.org/best-practices/" target="_blank" class="text-slate-400 hover:text-white text-sm transition-colors duration-200">
							Best Practices
						</a>
					</li>
					<li>
						<a href="https://github.com/mlcommons" target="_blank" class="text-slate-400 hover:text-white text-sm transition-colors duration-200">
							GitHub
						</a>
					</li>
				</ul>
			</div>

			<!-- Community Links -->
			<div>
				<h3 class="text-white text-sm font-semibold uppercase tracking-wider mb-4">Community</h3>
				<ul class="space-y-3">
					<li>
						<a href="https://mlcommons.org/get-involved/" target="_blank" class="text-slate-400 hover:text-white text-sm transition-colors duration-200">
							Get Involved
						</a>
					</li>
					<li>
						<a href="https://mlcommons.org/membership/" target="_blank" class="text-slate-400 hover:text-white text-sm transition-colors duration-200">
							Membership
						</a>
					</li>
					<li>
						<a href="https://mlcommons.org/events/" target="_blank" class="text-slate-400 hover:text-white text-sm transition-colors duration-200">
							Events
						</a>
					</li>
					<li>
						<a href="https://mlcommons.org/news/" target="_blank" class="text-slate-400 hover:text-white text-sm transition-colors duration-200">
							News
						</a>
					</li>
				</ul>
			</div>
		</div>
	</div>

	<!-- Bottom Bar -->
	<div class="border-t border-slate-800">
		<div class="max-w-7xl mx-auto px-3 py-6">
			<div class="flex flex-col md:flex-row items-center justify-between gap-4">
				<!-- Copyright & Trademark -->
				<div class="text-center md:text-left">
					<p class="text-xs text-slate-500 leading-relaxed">
						&copy; 2026 MLCommons. MLCommons, MLPerf and MLCube are registered trademarks of MLCommons Association.
					</p>
				</div>

				<!-- Legal Links -->
				<div class="flex items-center gap-4 text-xs">
					<a href="https://mlcommons.org/privacy/" target="_blank" class="text-slate-500 hover:text-slate-300 transition-colors duration-200">
						Privacy Policy
					</a>
					<span class="text-slate-700">|</span>
					<a href="https://mlcommons.org/policies/" target="_blank" class="text-slate-500 hover:text-slate-300 transition-colors duration-200">
						Policies
					</a>
				</div>
			</div>
		</div>
	</div>
</footer>
