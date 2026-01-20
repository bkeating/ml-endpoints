<script>
	import StatCard from '$lib/components/StatCard.svelte';

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
		copiedKeyId = keyId;
		setTimeout(() => {
			copiedKeyId = null;
		}, 2000);
	};
</script>

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
		<StatCard value="12,847" label="API Calls Today" />
		<StatCard value="99.8%" label="Success Rate" valueColor="text-emerald-600 dark:text-emerald-400" />
		<StatCard value="3" label="Active Keys" valueColor="text-blue-600 dark:text-blue-400" />
		<StatCard value="45ms" label="Avg Latency" valueColor="text-slate-600 dark:text-slate-400" />
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
