<script>
	/**
	 * Test Manager page for managing MLPerf and AIRR testing across ML Commons.
	 * Features: API key management, model submissions, and benchmark results.
	 */
	import { page } from '$app/state';
	import Icon from '$lib/components/Icon.svelte';

	/** Tab configuration */
	const tabs = [
		{ id: 'api-keys', label: 'API Keys', icon: 'Link' },
		{ id: 'submissions', label: 'Model Submissions', icon: 'Play' },
		{ id: 'results', label: 'Benchmark Results', icon: 'ReportAnalytics' },
		{ id: 'airr', label: 'AIRR Testing', icon: 'FileAnalytics' }
	];

	/** Get active tab from URL params, default to 'api-keys' */
	let activeTabId = $derived(page.url?.searchParams?.get('tab') || 'api-keys');

	/** Placeholder API keys */
	const apiKeys = [
		{
			id: 'key-1',
			name: 'Production API Key',
			key: 'mlc_prod_sk_7f3d9a2b1c4e5f6g8h9i0j1k2l3m4n5o',
			created: 'Dec 1, 2025',
			lastUsed: '2 hours ago',
			enabled: true,
			permissions: ['read', 'write', 'submit']
		},
		{
			id: 'key-2',
			name: 'Development API Key',
			key: 'mlc_dev_sk_9a8b7c6d5e4f3g2h1i0j9k8l7m6n5o4p',
			created: 'Nov 15, 2025',
			lastUsed: '1 day ago',
			enabled: true,
			permissions: ['read', 'submit']
		},
		{
			id: 'key-3',
			name: 'CI/CD Pipeline Key',
			key: 'mlc_ci_sk_1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p',
			created: 'Oct 20, 2025',
			lastUsed: '5 minutes ago',
			enabled: true,
			permissions: ['read', 'submit']
		},
		{
			id: 'key-4',
			name: 'Legacy Key (Deprecated)',
			key: 'mlc_legacy_sk_0z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k',
			created: 'Jun 1, 2024',
			lastUsed: '3 months ago',
			enabled: false,
			permissions: ['read']
		}
	];

	/** Placeholder model submissions */
	const submissions = [
		{
			id: 'SUB-2026-0042',
			model: 'LLaMA-3.1-70B',
			benchmark: 'MLPerf Inference v4.1',
			hardware: 'NVIDIA H100 x8',
			submitter: 'NVIDIA',
			submitted: 'Jan 18, 2026',
			status: 'running',
			progress: 67
		},
		{
			id: 'SUB-2026-0041',
			model: 'Mixtral-8x22B',
			benchmark: 'MLPerf Inference v4.1',
			hardware: 'AMD MI300X x8',
			submitter: 'AMD',
			submitted: 'Jan 17, 2026',
			status: 'queued',
			progress: 0
		},
		{
			id: 'SUB-2026-0040',
			model: 'GPT-4-Turbo',
			benchmark: 'MLPerf Inference v4.1',
			hardware: 'Custom TPU v5',
			submitter: 'Google',
			submitted: 'Jan 16, 2026',
			status: 'completed',
			progress: 100
		},
		{
			id: 'SUB-2026-0039',
			model: 'Claude-3-Opus',
			benchmark: 'MLPerf Inference v4.1',
			hardware: 'AWS Trainium2',
			submitter: 'Anthropic',
			submitted: 'Jan 15, 2026',
			status: 'completed',
			progress: 100
		},
		{
			id: 'SUB-2026-0038',
			model: 'Gemini-Ultra',
			benchmark: 'MLPerf Training v4.0',
			hardware: 'TPU v5p Pod',
			submitter: 'Google',
			submitted: 'Jan 14, 2026',
			status: 'failed',
			progress: 45
		}
	];

	/** Placeholder benchmark results */
	const benchmarkResults = [
		{
			id: 'RES-2026-0156',
			model: 'GPT-4-Turbo',
			benchmark: 'MLPerf Inference v4.1',
			hardware: 'Custom TPU v5',
			submitter: 'Google',
			tokensPerSec: 12450,
			latencyP99: '42ms',
			powerEfficiency: '2.8 tokens/W',
			score: 98.7,
			verified: true,
			publishedDate: 'Jan 17, 2026'
		},
		{
			id: 'RES-2026-0155',
			model: 'Claude-3-Opus',
			benchmark: 'MLPerf Inference v4.1',
			hardware: 'AWS Trainium2',
			submitter: 'Anthropic',
			tokensPerSec: 11200,
			latencyP99: '48ms',
			powerEfficiency: '3.1 tokens/W',
			score: 96.2,
			verified: true,
			publishedDate: 'Jan 16, 2026'
		},
		{
			id: 'RES-2026-0154',
			model: 'LLaMA-3-70B',
			benchmark: 'MLPerf Inference v4.1',
			hardware: 'NVIDIA H100 x8',
			submitter: 'Meta',
			tokensPerSec: 10800,
			latencyP99: '51ms',
			powerEfficiency: '2.4 tokens/W',
			score: 94.5,
			verified: true,
			publishedDate: 'Jan 15, 2026'
		},
		{
			id: 'RES-2026-0153',
			model: 'Mixtral-8x7B',
			benchmark: 'MLPerf Inference v4.1',
			hardware: 'AMD MI300X x4',
			submitter: 'AMD',
			tokensPerSec: 8900,
			latencyP99: '62ms',
			powerEfficiency: '3.5 tokens/W',
			score: 91.8,
			verified: false,
			publishedDate: 'Jan 14, 2026'
		}
	];

	/** Placeholder AIRR test suites */
	const airrTestSuites = [
		{
			id: 'AIRR-001',
			name: 'Safety Evaluation Suite',
			description: 'Comprehensive safety testing for harmful content generation',
			tests: 156,
			lastRun: 'Jan 18, 2026',
			passRate: 94.2,
			status: 'active'
		},
		{
			id: 'AIRR-002',
			name: 'Fairness & Bias Detection',
			description: 'Evaluate model outputs for demographic bias patterns',
			tests: 89,
			lastRun: 'Jan 17, 2026',
			passRate: 87.6,
			status: 'active'
		},
		{
			id: 'AIRR-003',
			name: 'Robustness Testing',
			description: 'Adversarial input testing and edge case handling',
			tests: 234,
			lastRun: 'Jan 16, 2026',
			passRate: 91.3,
			status: 'active'
		},
		{
			id: 'AIRR-004',
			name: 'Privacy Compliance',
			description: 'Test for PII leakage and data memorization',
			tests: 67,
			lastRun: 'Jan 15, 2026',
			passRate: 98.5,
			status: 'active'
		}
	];

	/** Status badge colors */
	const statusColors = {
		running: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
		queued: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400',
		completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
		failed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
		active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
	};

	/** Track which keys are revealed */
	let revealedKeys = $state(new Set());

	/** Toggle key visibility */
	const toggleKeyVisibility = (keyId) => {
		if (revealedKeys.has(keyId)) {
			revealedKeys.delete(keyId);
		} else {
			revealedKeys.add(keyId);
		}
		revealedKeys = new Set(revealedKeys);
	};

	/** Mask API key */
	const maskKey = (key) => {
		return key.substring(0, 12) + '••••••••••••••••••••••••';
	};

	/** Copy to clipboard placeholder */
	let copiedKeyId = $state(null);
	const copyKey = (keyId, key) => {
		// In real implementation, this would copy to clipboard
		copiedKeyId = keyId;
		setTimeout(() => {
			copiedKeyId = null;
		}, 2000);
	};
</script>

<!-- Tab Navigation -->
<div
	class="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 sticky top-[80px] z-30"
>
	<div class="max-w-7xl mx-auto px-4">
		<nav class="flex gap-1 overflow-x-auto scrollbar-hide -mb-px" aria-label="Test manager navigation">
			{#each tabs as tab (tab.id)}
				<a
					href="/test-manager?tab={tab.id}"
					class="flex items-center gap-2 px-4 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors duration-200
						{activeTabId === tab.id
						? 'border-[#CCEBD4] dark:border-emerald-500 text-slate-900 dark:text-white'
						: 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'}"
					aria-current={activeTabId === tab.id ? 'page' : undefined}
				>
					<Icon name={tab.icon} class="h-4 w-4" />
					<span>{tab.label}</span>
				</a>
			{/each}
		</nav>
	</div>
</div>

<!-- Content Area -->
<div class="bg-slate-50 dark:bg-slate-900 min-h-[60vh]">
	<div class="max-w-7xl mx-auto px-4 py-8 md:py-12">
		<!-- API Keys Section -->
		{#if activeTabId === 'api-keys'}
			<div class="space-y-6">
				<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
					<div>
						<h2 class="text-2xl font-bold text-slate-900 dark:text-white">API Keys</h2>
						<p class="text-slate-600 dark:text-slate-400 mt-1">
							Manage your API keys for accessing MLPerf and AIRR testing services
						</p>
					</div>
					<button
						disabled
						class="px-4 py-2 rounded-lg bg-[#CCEBD4] dark:bg-emerald-600 text-slate-900 dark:text-white font-medium cursor-not-allowed opacity-60 flex items-center gap-2"
					>
						<span>+</span>
						Generate New Key
					</button>
				</div>

				<!-- Usage Stats -->
				<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
					<div class="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
						<div class="text-2xl font-bold text-slate-900 dark:text-white">12,847</div>
						<div class="text-sm text-slate-500 dark:text-slate-400">API Calls Today</div>
					</div>
					<div class="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
						<div class="text-2xl font-bold text-emerald-600 dark:text-emerald-400">99.8%</div>
						<div class="text-sm text-slate-500 dark:text-slate-400">Success Rate</div>
					</div>
					<div class="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
						<div class="text-2xl font-bold text-blue-600 dark:text-blue-400">3</div>
						<div class="text-sm text-slate-500 dark:text-slate-400">Active Keys</div>
					</div>
					<div class="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
						<div class="text-2xl font-bold text-slate-600 dark:text-slate-400">45ms</div>
						<div class="text-sm text-slate-500 dark:text-slate-400">Avg Latency</div>
					</div>
				</div>

				<!-- API Key Cards -->
				<div class="space-y-4">
					{#each apiKeys as apiKey (apiKey.id)}
						<div
							class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 {!apiKey.enabled ? 'opacity-60' : ''}"
						>
							<div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
								<div class="flex-1">
									<div class="flex items-center gap-3 mb-2">
										<h3 class="font-semibold text-slate-900 dark:text-white">{apiKey.name}</h3>
										{#if !apiKey.enabled}
											<span class="px-2 py-0.5 rounded text-xs font-medium bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
												Disabled
											</span>
										{/if}
									</div>

									<!-- API Key Display -->
									<div class="flex items-center gap-2 mb-3">
										<code
											class="flex-1 px-3 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg font-mono text-sm text-slate-700 dark:text-slate-300 overflow-x-auto"
										>
											{revealedKeys.has(apiKey.id) ? apiKey.key : maskKey(apiKey.key)}
										</code>
										<button
											onclick={() => toggleKeyVisibility(apiKey.id)}
											class="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
											aria-label={revealedKeys.has(apiKey.id) ? 'Hide key' : 'Show key'}
										>
											{#if revealedKeys.has(apiKey.id)}
												<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
												</svg>
											{:else}
												<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
												</svg>
											{/if}
										</button>
										<button
											onclick={() => copyKey(apiKey.id, apiKey.key)}
											class="px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 text-sm font-medium transition-colors flex items-center gap-1"
										>
											{#if copiedKeyId === apiKey.id}
												<svg class="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
												</svg>
												Copied!
											{:else}
												<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
												</svg>
												Copy Key
											{/if}
										</button>
									</div>

									<!-- Key Metadata -->
									<div class="flex flex-wrap gap-4 text-sm text-slate-500 dark:text-slate-400">
										<span>Created: {apiKey.created}</span>
										<span>Last used: {apiKey.lastUsed}</span>
										<span class="flex items-center gap-1">
											Permissions:
											{#each apiKey.permissions as perm}
												<span class="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-xs">
													{perm}
												</span>
											{/each}
										</span>
									</div>
								</div>

								<!-- Toggle Switch -->
								<div class="flex items-center gap-4">
									<label class="relative inline-flex items-center cursor-pointer">
										<input
											type="checkbox"
											checked={apiKey.enabled}
											disabled
											class="sr-only peer"
										/>
										<div
											class="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-500 cursor-not-allowed"
										></div>
										<span class="ml-2 text-sm text-slate-600 dark:text-slate-400">
											{apiKey.enabled ? 'Enabled' : 'Disabled'}
										</span>
									</label>
									<button
										disabled
										class="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-not-allowed opacity-60"
										aria-label="Delete key"
									>
										<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
										</svg>
									</button>
								</div>
							</div>
						</div>
					{/each}
				</div>
			</div>

		<!-- Model Submissions Section -->
		{:else if activeTabId === 'submissions'}
			<div class="space-y-6">
				<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
					<div>
						<h2 class="text-2xl font-bold text-slate-900 dark:text-white">Model Submissions</h2>
						<p class="text-slate-600 dark:text-slate-400 mt-1">
							Submit and track your MLPerf benchmark submissions
						</p>
					</div>
					<button
						disabled
						class="px-6 py-2.5 rounded-lg bg-[#CCEBD4] dark:bg-emerald-600 text-slate-900 dark:text-white font-medium cursor-not-allowed opacity-60 flex items-center gap-2"
					>
						<Icon name="Play" class="h-4 w-4" />
						Submit New Model
					</button>
				</div>

				<!-- Submission Stats -->
				<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
					<div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
						<div class="text-2xl font-bold text-blue-700 dark:text-blue-400">2</div>
						<div class="text-sm text-blue-600 dark:text-blue-500">Running</div>
					</div>
					<div class="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
						<div class="text-2xl font-bold text-slate-700 dark:text-slate-300">1</div>
						<div class="text-sm text-slate-500 dark:text-slate-400">Queued</div>
					</div>
					<div class="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-4 border border-emerald-200 dark:border-emerald-800">
						<div class="text-2xl font-bold text-emerald-700 dark:text-emerald-400">156</div>
						<div class="text-sm text-emerald-600 dark:text-emerald-500">Completed</div>
					</div>
					<div class="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
						<div class="text-2xl font-bold text-red-700 dark:text-red-400">3</div>
						<div class="text-sm text-red-600 dark:text-red-500">Failed</div>
					</div>
				</div>

				<!-- Submissions Table -->
				<div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
					<div class="overflow-x-auto">
						<table class="w-full">
							<thead class="bg-slate-50 dark:bg-slate-700/50">
								<tr>
									<th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
										Submission ID
									</th>
									<th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
										Model
									</th>
									<th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
										Hardware
									</th>
									<th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
										Benchmark
									</th>
									<th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
										Progress
									</th>
									<th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
										Status
									</th>
									<th class="px-6 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
										Actions
									</th>
								</tr>
							</thead>
							<tbody class="divide-y divide-slate-200 dark:divide-slate-700">
								{#each submissions as submission (submission.id)}
									<tr class="hover:bg-slate-50 dark:hover:bg-slate-700/30">
										<td class="px-6 py-4">
											<div class="font-mono text-sm text-slate-900 dark:text-white">{submission.id}</div>
											<div class="text-xs text-slate-500 dark:text-slate-400">{submission.submitted}</div>
										</td>
										<td class="px-6 py-4">
											<div class="font-medium text-slate-900 dark:text-white">{submission.model}</div>
											<div class="text-xs text-slate-500 dark:text-slate-400">{submission.submitter}</div>
										</td>
										<td class="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
											{submission.hardware}
										</td>
										<td class="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
											{submission.benchmark}
										</td>
										<td class="px-6 py-4">
											<div class="flex items-center gap-2">
												<div class="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden w-24">
													<div
														class="h-full rounded-full transition-all duration-300 {submission.status === 'failed' ? 'bg-red-500' : submission.status === 'completed' ? 'bg-emerald-500' : 'bg-blue-500'}"
														style="width: {submission.progress}%"
													></div>
												</div>
												<span class="text-xs text-slate-500 dark:text-slate-400 w-8">{submission.progress}%</span>
											</div>
										</td>
										<td class="px-6 py-4">
											<span class="px-2 py-1 rounded-full text-xs font-medium {statusColors[submission.status]}">
												{submission.status}
											</span>
										</td>
										<td class="px-6 py-4 text-right">
											<div class="flex items-center justify-end gap-2">
												<button
													disabled
													class="text-sm text-blue-600 dark:text-blue-400 hover:underline cursor-not-allowed opacity-60"
												>
													View
												</button>
												{#if submission.status === 'running' || submission.status === 'queued'}
													<button
														disabled
														class="text-sm text-red-600 dark:text-red-400 hover:underline cursor-not-allowed opacity-60"
													>
														Cancel
													</button>
												{/if}
												{#if submission.status === 'failed'}
													<button
														disabled
														class="text-sm text-amber-600 dark:text-amber-400 hover:underline cursor-not-allowed opacity-60"
													>
														Retry
													</button>
												{/if}
											</div>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</div>
			</div>

		<!-- Benchmark Results Section -->
		{:else if activeTabId === 'results'}
			<div class="space-y-6">
				<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
					<div>
						<h2 class="text-2xl font-bold text-slate-900 dark:text-white">Benchmark Results</h2>
						<p class="text-slate-600 dark:text-slate-400 mt-1">
							View and compare MLPerf benchmark results across submissions
						</p>
					</div>
					<div class="flex gap-2">
						<select
							disabled
							class="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-300 cursor-not-allowed opacity-60"
						>
							<option>All Benchmarks</option>
						</select>
						<button
							disabled
							class="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium cursor-not-allowed opacity-60 flex items-center gap-2"
						>
							<Icon name="Download" class="h-4 w-4" />
							Export
						</button>
					</div>
				</div>

				<!-- Results Table -->
				<div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
					<div class="overflow-x-auto">
						<table class="w-full">
							<thead class="bg-slate-50 dark:bg-slate-700/50">
								<tr>
									<th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
										Model / Submitter
									</th>
									<th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
										Hardware
									</th>
									<th class="px-6 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
										Tokens/sec
									</th>
									<th class="px-6 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
										Latency P99
									</th>
									<th class="px-6 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
										Efficiency
									</th>
									<th class="px-6 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
										Score
									</th>
									<th class="px-6 py-3 text-center text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
										Verified
									</th>
									<th class="px-6 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
										Actions
									</th>
								</tr>
							</thead>
							<tbody class="divide-y divide-slate-200 dark:divide-slate-700">
								{#each benchmarkResults as result, index (result.id)}
									<tr class="hover:bg-slate-50 dark:hover:bg-slate-700/30">
										<td class="px-6 py-4">
											<div class="flex items-center gap-3">
												<div class="flex items-center justify-center h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-700 text-sm font-bold text-slate-600 dark:text-slate-400">
													{index + 1}
												</div>
												<div>
													<div class="font-medium text-slate-900 dark:text-white">{result.model}</div>
													<div class="text-xs text-slate-500 dark:text-slate-400">{result.submitter}</div>
												</div>
											</div>
										</td>
										<td class="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
											{result.hardware}
										</td>
										<td class="px-6 py-4 text-right font-mono text-sm text-slate-900 dark:text-white">
											{result.tokensPerSec.toLocaleString()}
										</td>
										<td class="px-6 py-4 text-right font-mono text-sm text-slate-600 dark:text-slate-400">
											{result.latencyP99}
										</td>
										<td class="px-6 py-4 text-right font-mono text-sm text-slate-600 dark:text-slate-400">
											{result.powerEfficiency}
										</td>
										<td class="px-6 py-4 text-right">
											<span class="font-bold text-lg text-slate-900 dark:text-white">{result.score}</span>
										</td>
										<td class="px-6 py-4 text-center">
											{#if result.verified}
												<span class="inline-flex items-center justify-center h-6 w-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
													<svg class="h-4 w-4 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
														<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
													</svg>
												</span>
											{:else}
												<span class="inline-flex items-center justify-center h-6 w-6 rounded-full bg-amber-100 dark:bg-amber-900/30">
													<svg class="h-4 w-4 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
														<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
													</svg>
												</span>
											{/if}
										</td>
										<td class="px-6 py-4 text-right">
											<div class="flex items-center justify-end gap-2">
												<button
													disabled
													class="text-sm text-blue-600 dark:text-blue-400 hover:underline cursor-not-allowed opacity-60"
												>
													Details
												</button>
												<button
													disabled
													class="text-sm text-slate-600 dark:text-slate-400 hover:underline cursor-not-allowed opacity-60"
												>
													Compare
												</button>
											</div>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</div>

				<!-- Performance Chart Placeholder -->
				<div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
					<h3 class="font-semibold text-slate-900 dark:text-white mb-4">Performance Comparison</h3>
					<div class="h-64 flex items-end justify-around gap-4 px-8">
						{#each benchmarkResults as result (result.id)}
							<div class="flex flex-col items-center gap-2 flex-1">
								<div
									class="w-full bg-[#CCEBD4] dark:bg-emerald-600 rounded-t transition-all duration-500"
									style="height: {(result.score / 100) * 200}px"
								></div>
								<div class="text-xs text-slate-500 dark:text-slate-400 text-center truncate w-full">
									{result.model.split('-')[0]}
								</div>
							</div>
						{/each}
					</div>
				</div>
			</div>

		<!-- AIRR Testing Section -->
		{:else if activeTabId === 'airr'}
			<div class="space-y-6">
				<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
					<div>
						<h2 class="text-2xl font-bold text-slate-900 dark:text-white">AIRR Testing</h2>
						<p class="text-slate-600 dark:text-slate-400 mt-1">
							AI Risk & Reliability testing suites for safety, fairness, and robustness evaluation
						</p>
					</div>
					<button
						disabled
						class="px-4 py-2 rounded-lg bg-[#CCEBD4] dark:bg-emerald-600 text-slate-900 dark:text-white font-medium cursor-not-allowed opacity-60 flex items-center gap-2"
					>
						<Icon name="Play" class="h-4 w-4" />
						Run Test Suite
					</button>
				</div>

				<!-- AIRR Overview Stats -->
				<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
					<div class="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
						<div class="text-2xl font-bold text-slate-900 dark:text-white">546</div>
						<div class="text-sm text-slate-500 dark:text-slate-400">Total Tests</div>
					</div>
					<div class="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
						<div class="text-2xl font-bold text-emerald-600 dark:text-emerald-400">92.9%</div>
						<div class="text-sm text-slate-500 dark:text-slate-400">Avg Pass Rate</div>
					</div>
					<div class="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
						<div class="text-2xl font-bold text-blue-600 dark:text-blue-400">4</div>
						<div class="text-sm text-slate-500 dark:text-slate-400">Test Suites</div>
					</div>
					<div class="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
						<div class="text-2xl font-bold text-purple-600 dark:text-purple-400">23</div>
						<div class="text-sm text-slate-500 dark:text-slate-400">Models Tested</div>
					</div>
				</div>

				<!-- Test Suite Cards -->
				<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
					{#each airrTestSuites as suite (suite.id)}
						<div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
							<div class="flex items-start justify-between mb-4">
								<div>
									<div class="flex items-center gap-2 mb-1">
										<h3 class="text-lg font-semibold text-slate-900 dark:text-white">{suite.name}</h3>
										<span class="px-2 py-0.5 rounded-full text-xs font-medium {statusColors[suite.status]}">
											{suite.status}
										</span>
									</div>
									<p class="text-sm text-slate-500 dark:text-slate-400">{suite.description}</p>
								</div>
							</div>

							<!-- Pass Rate Visualization -->
							<div class="mb-4">
								<div class="flex items-center justify-between text-sm mb-2">
									<span class="text-slate-600 dark:text-slate-400">Pass Rate</span>
									<span class="font-semibold text-slate-900 dark:text-white">{suite.passRate}%</span>
								</div>
								<div class="h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
									<div
										class="h-full rounded-full transition-all duration-500 {suite.passRate >= 95 ? 'bg-emerald-500' : suite.passRate >= 85 ? 'bg-amber-500' : 'bg-red-500'}"
										style="width: {suite.passRate}%"
									></div>
								</div>
							</div>

							<!-- Suite Stats -->
							<div class="grid grid-cols-2 gap-4 mb-4">
								<div class="text-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
									<div class="text-xl font-bold text-slate-900 dark:text-white">{suite.tests}</div>
									<div class="text-xs text-slate-500 dark:text-slate-400">Tests</div>
								</div>
								<div class="text-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
									<div class="text-sm font-semibold text-slate-900 dark:text-white">{suite.lastRun}</div>
									<div class="text-xs text-slate-500 dark:text-slate-400">Last Run</div>
								</div>
							</div>

							<div class="flex gap-2">
								<button
									disabled
									class="flex-1 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 rounded-lg cursor-not-allowed opacity-60"
								>
									View Results
								</button>
								<button
									disabled
									class="flex-1 py-2 text-sm font-medium text-white bg-[#CCEBD4] dark:bg-emerald-600 text-slate-900 rounded-lg cursor-not-allowed opacity-60"
								>
									Run Tests
								</button>
							</div>
						</div>
					{/each}
				</div>

				<!-- Recent Test Runs -->
				<div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
					<h3 class="font-semibold text-slate-900 dark:text-white mb-4">Recent Test Runs</h3>
					<div class="space-y-3">
						{#each [
							{ model: 'GPT-4-Turbo', suite: 'Safety Evaluation', time: '2 hours ago', passed: 147, failed: 9 },
							{ model: 'Claude-3-Opus', suite: 'Fairness & Bias', time: '5 hours ago', passed: 82, failed: 7 },
							{ model: 'LLaMA-3-70B', suite: 'Robustness Testing', time: '1 day ago', passed: 218, failed: 16 }
						] as run (run.model + run.suite)}
							<div class="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/30 rounded-lg">
								<div class="flex items-center gap-4">
									<div>
										<div class="font-medium text-slate-900 dark:text-white">{run.model}</div>
										<div class="text-xs text-slate-500 dark:text-slate-400">{run.suite}</div>
									</div>
								</div>
								<div class="flex items-center gap-6">
									<div class="text-right">
										<span class="text-emerald-600 dark:text-emerald-400 font-medium">{run.passed}</span>
										<span class="text-slate-400 mx-1">/</span>
										<span class="text-red-600 dark:text-red-400 font-medium">{run.failed}</span>
									</div>
									<div class="text-xs text-slate-500 dark:text-slate-400 w-20 text-right">{run.time}</div>
								</div>
							</div>
						{/each}
					</div>
				</div>
			</div>
		{/if}


	</div>
</div>
