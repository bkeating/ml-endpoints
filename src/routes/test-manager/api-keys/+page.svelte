<script>
	import StatCard from '$lib/components/StatCard.svelte';
	import { SvelteSet } from 'svelte/reactivity';

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
	let revealedKeys = new SvelteSet();

	/** Toggle key visibility */
	const toggleKeyVisibility = (keyId) => {
		if (revealedKeys.has(keyId)) {
			revealedKeys.delete(keyId);
		} else {
			revealedKeys.add(keyId);
		}
	};

	/** Mask API key */
	const maskKey = (key) => {
		return key.substring(0, 12) + '••••••••••••••••••••••••';
	};

	/** Copy to clipboard placeholder */
	let copiedKeyId = $state(null);
	const copyKey = (keyId) => {
		copiedKeyId = keyId;
		setTimeout(() => {
			copiedKeyId = null;
		}, 2000);
	};
</script>

<div class="space-y-6">
	<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<div>
			<h2 class="text-2xl font-bold text-slate-900 dark:text-white">API Keys</h2>
			<p class="mt-1 text-slate-600 dark:text-slate-400">
				Manage your API keys for accessing MLPerf and AIRR testing services
			</p>
		</div>
		<button
			disabled
			class="flex cursor-not-allowed items-center gap-2 rounded-lg bg-[#CCEBD4] px-4 py-2 font-medium text-slate-900 opacity-60 dark:bg-emerald-600 dark:text-white"
		>
			<span>+</span>
			Generate New Key
		</button>
	</div>

	<!-- Usage Stats -->
	<div class="grid grid-cols-2 gap-4 md:grid-cols-4">
		<StatCard value="12,847" label="API Calls Today" />
		<StatCard
			value="99.8%"
			label="Success Rate"
			valueColor="text-emerald-600 dark:text-emerald-400"
		/>
		<StatCard value="3" label="Active Keys" valueColor="text-blue-600 dark:text-blue-400" />
		<StatCard value="45ms" label="Avg Latency" valueColor="text-slate-600 dark:text-slate-400" />
	</div>

	<!-- API Key Cards -->
	<div class="space-y-4">
		{#each apiKeys as apiKey (apiKey.id)}
			<div
				class="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800 {!apiKey.enabled
					? 'opacity-60'
					: ''}"
			>
				<div class="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
					<div class="flex-1">
						<div class="mb-2 flex items-center gap-3">
							<h3 class="font-semibold text-slate-900 dark:text-white">{apiKey.name}</h3>
							{#if !apiKey.enabled}
								<span
									class="rounded bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-400"
								>
									Disabled
								</span>
							{/if}
						</div>

						<!-- API Key Display -->
						<div class="mb-3 flex items-center gap-2">
							<code
								class="flex-1 overflow-x-auto rounded-lg bg-slate-100 px-3 py-2 font-mono text-sm text-slate-700 dark:bg-slate-700 dark:text-slate-300"
							>
								{revealedKeys.has(apiKey.id) ? apiKey.key : maskKey(apiKey.key)}
							</code>
							<button
								onclick={() => toggleKeyVisibility(apiKey.id)}
								class="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
								aria-label={revealedKeys.has(apiKey.id) ? 'Hide key' : 'Show key'}
							>
								{#if revealedKeys.has(apiKey.id)}
									<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
										/>
									</svg>
								{:else}
									<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
										/>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
										/>
									</svg>
								{/if}
							</button>
							<button
								onclick={() => copyKey(apiKey.id)}
								class="flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
							>
								{#if copiedKeyId === apiKey.id}
									<svg
										class="h-4 w-4 text-emerald-500"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M5 13l4 4L19 7"
										/>
									</svg>
									Copied!
								{:else}
									<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
										/>
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
								{#each apiKey.permissions as perm (perm)}
									<span class="rounded bg-slate-100 px-1.5 py-0.5 text-xs dark:bg-slate-700">
										{perm}
									</span>
								{/each}
							</span>
						</div>
					</div>

					<!-- Toggle Switch -->
					<div class="flex items-center gap-4">
						<label class="relative inline-flex cursor-pointer items-center">
							<input type="checkbox" checked={apiKey.enabled} disabled class="peer sr-only" />
							<div
								class="peer h-6 w-11 cursor-not-allowed rounded-full bg-slate-200 peer-checked:bg-emerald-500 peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-slate-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white dark:border-slate-600 dark:bg-slate-700"
							></div>
							<span class="ml-2 text-sm text-slate-600 dark:text-slate-400">
								{apiKey.enabled ? 'Enabled' : 'Disabled'}
							</span>
						</label>
						<button
							disabled
							class="cursor-not-allowed rounded-lg p-2 text-red-500 opacity-60 hover:bg-red-50 dark:hover:bg-red-900/20"
							aria-label="Delete key"
						>
							<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
								/>
							</svg>
						</button>
					</div>
				</div>
			</div>
		{/each}
	</div>
</div>
