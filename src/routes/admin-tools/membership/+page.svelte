<script>
	import StatusBadge from '$lib/components/StatusBadge.svelte';
	import StatCard from '$lib/components/StatCard.svelte';
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
	<div class="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
		<StatCard
			value="12"
			label="Premier ★"
			subtitle="$250,000/year"
			valueColor="text-amber-600 dark:text-amber-400"
		/>
		<StatCard
			value="28"
			label="General ☆"
			subtitle="$100,000/year"
			valueColor="text-blue-600 dark:text-blue-400"
		/>
		<StatCard
			value="18"
			label="Associate ○"
			subtitle="$15,000/year"
			valueColor="text-slate-600 dark:text-slate-400"
		/>
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
</div>
