<script>
	import StatusBadge from '$lib/components/StatusBadge.svelte';
	import StatCard from '$lib/components/StatCard.svelte';

	/** Placeholder CLAs */
	const claAgreements = [
		{
			company: 'NVIDIA Corporation',
			type: 'Corporate CLA',
			signedDate: 'Dec 15, 2025',
			status: 'signed',
			signatories: 12
		},
		{
			company: 'Google LLC',
			type: 'Corporate CLA',
			signedDate: 'Nov 20, 2025',
			status: 'signed',
			signatories: 8
		},
		{
			company: 'Startup AI Inc.',
			type: 'Individual CLA',
			signedDate: null,
			status: 'pending',
			signatories: 1
		},
		{
			company: 'Meta Platforms',
			type: 'Corporate CLA',
			signedDate: 'Oct 5, 2025',
			status: 'signed',
			signatories: 15
		},
		{ company: 'OpenAI', type: 'Corporate CLA', signedDate: null, status: 'review', signatories: 0 }
	];
</script>

<div class="space-y-6">
	<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<div>
			<h2 class="text-2xl font-bold text-slate-900 dark:text-white">
				Contributor License Agreements
			</h2>
			<p class="mt-1 text-slate-600 dark:text-slate-400">
				Track and manage CLA signatures for contributors and organizations
			</p>
		</div>
		<button
			disabled
			class="cursor-not-allowed rounded-lg bg-[#CCEBD4] px-4 py-2 font-medium text-slate-900 opacity-60 dark:bg-emerald-600 dark:text-white"
		>
			Request New CLA
		</button>
	</div>

	<!-- CLA Stats -->
	<div class="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
		<StatCard
			value="42"
			label="Signed CLAs"
			valueColor="text-emerald-600 dark:text-emerald-400"
		/>
		<StatCard
			value="8"
			label="Pending Signatures"
			valueColor="text-amber-600 dark:text-amber-400"
		/>
		<StatCard value="3" label="Under Review" valueColor="text-blue-600 dark:text-blue-400" />
		<StatCard value="156" label="Total Signatories" />
	</div>

	<!-- CLA Table -->
	<div
		class="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800"
	>
		<div class="overflow-x-auto">
			<table class="w-full">
				<thead class="bg-slate-50 dark:bg-slate-700/50">
					<tr>
						<th
							class="px-6 py-3 text-left text-xs font-semibold tracking-wider text-slate-600 uppercase dark:text-slate-300"
						>
							Organization
						</th>
						<th
							class="px-6 py-3 text-left text-xs font-semibold tracking-wider text-slate-600 uppercase dark:text-slate-300"
						>
							Type
						</th>
						<th
							class="px-6 py-3 text-left text-xs font-semibold tracking-wider text-slate-600 uppercase dark:text-slate-300"
						>
							Signed Date
						</th>
						<th
							class="px-6 py-3 text-left text-xs font-semibold tracking-wider text-slate-600 uppercase dark:text-slate-300"
						>
							Signatories
						</th>
						<th
							class="px-6 py-3 text-left text-xs font-semibold tracking-wider text-slate-600 uppercase dark:text-slate-300"
						>
							Status
						</th>
						<th
							class="px-6 py-3 text-right text-xs font-semibold tracking-wider text-slate-600 uppercase dark:text-slate-300"
						>
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
									class="cursor-not-allowed text-sm text-blue-600 opacity-60 hover:underline dark:text-blue-400"
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
</div>
