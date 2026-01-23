<script>
	import StatusBadge from '$lib/components/StatusBadge.svelte';
	import { tierColors } from '$lib/constants/colors.js';

	/** Placeholder members */
	const members = [
		{
			company: 'NVIDIA',
			tier: 'Premier',
			since: '2018',
			contacts: 12,
			status: 'active',
			renewal: 'Mar 2026'
		},
		{
			company: 'Google',
			tier: 'Premier',
			since: '2018',
			contacts: 8,
			status: 'active',
			renewal: 'Apr 2026'
		},
		{
			company: 'Intel',
			tier: 'General',
			since: '2019',
			contacts: 6,
			status: 'active',
			renewal: 'Feb 2026'
		},
		{
			company: 'Startup AI',
			tier: 'Associate',
			since: '2025',
			contacts: 2,
			status: 'pending',
			renewal: 'Jan 2027'
		},
		{
			company: 'Microsoft',
			tier: 'Premier',
			since: '2018',
			contacts: 10,
			status: 'active',
			renewal: 'May 2026'
		}
	];
</script>

<div class="space-y-6">
	<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<div>
			<h2 class="text-2xl font-bold text-slate-900 dark:text-white">Membership Management</h2>
			<p class="mt-1 text-slate-600 dark:text-slate-400">
				Oversee membership tiers, renewals, and member benefits
			</p>
		</div>
		<button
			disabled
			class="cursor-not-allowed rounded-lg bg-[#CCEBD4] px-4 py-2 font-medium text-slate-900 opacity-60 dark:bg-emerald-600 dark:text-white"
		>
			Add Member
		</button>
	</div>

	<!-- Tier Summary -->
	<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
		<div
			class="rounded-xl border border-amber-200 bg-linear-to-br from-amber-50 to-amber-100 p-6 dark:border-amber-800 dark:from-amber-900/20 dark:to-amber-800/20"
		>
			<div class="mb-3 flex items-center justify-between">
				<span class="font-semibold text-amber-700 dark:text-amber-400">Premier</span>
				<span class="text-2xl">&#9733;</span>
			</div>
			<div class="text-4xl font-bold text-amber-800 dark:text-amber-300">12</div>
			<div class="text-sm text-amber-600 dark:text-amber-500">$250,000/year</div>
		</div>
		<div
			class="rounded-xl border border-blue-200 bg-linear-to-br from-blue-50 to-blue-100 p-6 dark:border-blue-800 dark:from-blue-900/20 dark:to-blue-800/20"
		>
			<div class="mb-3 flex items-center justify-between">
				<span class="font-semibold text-blue-700 dark:text-blue-400">General</span>
				<span class="text-xl">&#9734;</span>
			</div>
			<div class="text-4xl font-bold text-blue-800 dark:text-blue-300">28</div>
			<div class="text-sm text-blue-600 dark:text-blue-500">$100,000/year</div>
		</div>
		<div
			class="rounded-xl border border-slate-200 bg-linear-to-br from-slate-50 to-slate-100 p-6 dark:border-slate-600 dark:from-slate-800/50 dark:to-slate-700/50"
		>
			<div class="mb-3 flex items-center justify-between">
				<span class="font-semibold text-slate-700 dark:text-slate-300">Associate</span>
				<span class="text-lg text-slate-400">&#9675;</span>
			</div>
			<div class="text-4xl font-bold text-slate-800 dark:text-slate-200">18</div>
			<div class="text-sm text-slate-500 dark:text-slate-400">$15,000/year</div>
		</div>
	</div>

	<!-- Member Table -->
	<div
		class="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800"
	>
		<div
			class="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-700"
		>
			<h3 class="font-semibold text-slate-900 dark:text-white">Member Organizations</h3>
			<div class="flex gap-2">
				<select
					disabled
					class="cursor-not-allowed rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
				>
					<option>All Tiers</option>
				</select>
				<select
					disabled
					class="cursor-not-allowed rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
				>
					<option>All Status</option>
				</select>
			</div>
		</div>
		<div class="overflow-x-auto">
			<table class="w-full">
				<thead class="bg-slate-50 dark:bg-slate-700/50">
					<tr>
						<th
							class="px-6 py-3 text-left text-xs font-semibold tracking-wider text-slate-600 uppercase dark:text-slate-300"
						>
							Company
						</th>
						<th
							class="px-6 py-3 text-left text-xs font-semibold tracking-wider text-slate-600 uppercase dark:text-slate-300"
						>
							Tier
						</th>
						<th
							class="px-6 py-3 text-left text-xs font-semibold tracking-wider text-slate-600 uppercase dark:text-slate-300"
						>
							Member Since
						</th>
						<th
							class="px-6 py-3 text-center text-xs font-semibold tracking-wider text-slate-600 uppercase dark:text-slate-300"
						>
							Contacts
						</th>
						<th
							class="px-6 py-3 text-left text-xs font-semibold tracking-wider text-slate-600 uppercase dark:text-slate-300"
						>
							Renewal
						</th>
						<th
							class="px-6 py-3 text-left text-xs font-semibold tracking-wider text-slate-600 uppercase dark:text-slate-300"
						>
							Status
						</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-200 dark:divide-slate-700">
					{#each members as member (member.company)}
						<tr class="hover:bg-slate-50 dark:hover:bg-slate-700/30">
							<td class="px-6 py-4">
								<div class="font-medium text-slate-900 dark:text-white">{member.company}</div>
							</td>
							<td class="px-6 py-4">
								<StatusBadge status={member.tier} colorMap={tierColors} />
							</td>
							<td class="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
								{member.since}
							</td>
							<td class="px-6 py-4 text-center text-sm text-slate-600 dark:text-slate-400">
								{member.contacts}
							</td>
							<td class="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
								{member.renewal}
							</td>
							<td class="px-6 py-4">
								<StatusBadge status={member.status} />
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>

	<!-- Upcoming Renewals -->
	<div
		class="rounded-xl border border-amber-200 bg-amber-50 p-6 dark:border-amber-800 dark:bg-amber-900/20"
	>
		<h3 class="mb-3 font-semibold text-amber-800 dark:text-amber-300">
			Upcoming Renewals (Next 90 Days)
		</h3>
		<div class="flex flex-wrap gap-3">
			{#each members.filter((m) => m.renewal.includes('2026')) as member (member.company)}
				<div
					class="rounded-lg border border-amber-200 bg-white px-4 py-2 dark:border-amber-700 dark:bg-slate-800"
				>
					<span class="font-medium text-slate-900 dark:text-white">{member.company}</span>
					<span class="ml-2 text-sm text-slate-500 dark:text-slate-400">{member.renewal}</span>
				</div>
			{/each}
		</div>
	</div>
</div>
