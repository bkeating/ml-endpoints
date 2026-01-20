<script>
	import StatusBadge from '$lib/components/StatusBadge.svelte';

	/** Placeholder CLAs */
	const claAgreements = [
		{ company: 'NVIDIA Corporation', type: 'Corporate CLA', signedDate: 'Dec 15, 2025', status: 'signed', signatories: 12 },
		{ company: 'Google LLC', type: 'Corporate CLA', signedDate: 'Nov 20, 2025', status: 'signed', signatories: 8 },
		{ company: 'Startup AI Inc.', type: 'Individual CLA', signedDate: null, status: 'pending', signatories: 1 },
		{ company: 'Meta Platforms', type: 'Corporate CLA', signedDate: 'Oct 5, 2025', status: 'signed', signatories: 15 },
		{ company: 'OpenAI', type: 'Corporate CLA', signedDate: null, status: 'review', signatories: 0 }
	];
</script>

<div class="space-y-6">
	<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
		<div>
			<h2 class="text-2xl font-bold text-slate-900 dark:text-white">
				Contributor License Agreements
			</h2>
			<p class="text-slate-600 dark:text-slate-400 mt-1">
				Track and manage CLA signatures for contributors and organizations
			</p>
		</div>
		<button
			disabled
			class="px-4 py-2 rounded-lg bg-[#CCEBD4] dark:bg-emerald-600 text-slate-900 dark:text-white font-medium cursor-not-allowed opacity-60"
		>
			Request New CLA
		</button>
	</div>

	<!-- CLA Table -->
	<div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
		<div class="overflow-x-auto">
			<table class="w-full">
				<thead class="bg-slate-50 dark:bg-slate-700/50">
					<tr>
						<th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
							Organization
						</th>
						<th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
							Type
						</th>
						<th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
							Signed Date
						</th>
						<th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
							Signatories
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
					{#each claAgreements as cla (cla.company)}
						<tr class="hover:bg-slate-50 dark:hover:bg-slate-700/30">
							<td class="px-6 py-4">
								<div class="font-medium text-slate-900 dark:text-white">{cla.company}</div>
							</td>
							<td class="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
								{cla.type}
							</td>
							<td class="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
								{cla.signedDate || '—'}
							</td>
							<td class="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
								{cla.signatories}
							</td>
							<td class="px-6 py-4">
								<StatusBadge status={cla.status} />
							</td>
							<td class="px-6 py-4 text-right">
								<button
									disabled
									class="text-sm text-blue-600 dark:text-blue-400 hover:underline cursor-not-allowed opacity-60"
								>
									View
								</button>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>

	<!-- CLA Stats -->
	<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
		<div class="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-4 border border-emerald-200 dark:border-emerald-800">
			<div class="text-2xl font-bold text-emerald-700 dark:text-emerald-400">42</div>
			<div class="text-sm text-emerald-600 dark:text-emerald-500">Signed CLAs</div>
		</div>
		<div class="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
			<div class="text-2xl font-bold text-amber-700 dark:text-amber-400">8</div>
			<div class="text-sm text-amber-600 dark:text-amber-500">Pending Signatures</div>
		</div>
		<div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
			<div class="text-2xl font-bold text-blue-700 dark:text-blue-400">3</div>
			<div class="text-sm text-blue-600 dark:text-blue-500">Under Review</div>
		</div>
		<div class="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
			<div class="text-2xl font-bold text-slate-700 dark:text-slate-300">156</div>
			<div class="text-sm text-slate-500 dark:text-slate-400">Total Signatories</div>
		</div>
	</div>
</div>
