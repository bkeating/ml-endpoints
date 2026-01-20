<script>
	import StatusBadge from '$lib/components/StatusBadge.svelte';
	import { tierColors } from '$lib/constants/colors.js';

	/** Placeholder members */
	const members = [
		{ company: 'NVIDIA', tier: 'Premier', since: '2018', contacts: 12, status: 'active', renewal: 'Mar 2026' },
		{ company: 'Google', tier: 'Premier', since: '2018', contacts: 8, status: 'active', renewal: 'Apr 2026' },
		{ company: 'Intel', tier: 'General', since: '2019', contacts: 6, status: 'active', renewal: 'Feb 2026' },
		{ company: 'Startup AI', tier: 'Associate', since: '2025', contacts: 2, status: 'pending', renewal: 'Jan 2027' },
		{ company: 'Microsoft', tier: 'Premier', since: '2018', contacts: 10, status: 'active', renewal: 'May 2026' }
	];
</script>

<div class="space-y-6">
	<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
		<div>
			<h2 class="text-2xl font-bold text-slate-900 dark:text-white">Membership Management</h2>
			<p class="text-slate-600 dark:text-slate-400 mt-1">
				Oversee membership tiers, renewals, and member benefits
			</p>
		</div>
		<button
			disabled
			class="px-4 py-2 rounded-lg bg-[#CCEBD4] dark:bg-emerald-600 text-slate-900 dark:text-white font-medium cursor-not-allowed opacity-60"
		>
			Add Member
		</button>
	</div>

	<!-- Tier Summary -->
	<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
		<div class="bg-linear-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 rounded-xl p-6 border border-amber-200 dark:border-amber-800">
			<div class="flex items-center justify-between mb-3">
				<span class="text-amber-700 dark:text-amber-400 font-semibold">Premier</span>
				<span class="text-2xl">&#9733;</span>
			</div>
			<div class="text-4xl font-bold text-amber-800 dark:text-amber-300">12</div>
			<div class="text-sm text-amber-600 dark:text-amber-500">$250,000/year</div>
		</div>
		<div class="bg-linear-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
			<div class="flex items-center justify-between mb-3">
				<span class="text-blue-700 dark:text-blue-400 font-semibold">General</span>
				<span class="text-xl">&#9734;</span>
			</div>
			<div class="text-4xl font-bold text-blue-800 dark:text-blue-300">28</div>
			<div class="text-sm text-blue-600 dark:text-blue-500">$100,000/year</div>
		</div>
		<div class="bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-700/50 rounded-xl p-6 border border-slate-200 dark:border-slate-600">
			<div class="flex items-center justify-between mb-3">
				<span class="text-slate-700 dark:text-slate-300 font-semibold">Associate</span>
				<span class="text-lg text-slate-400">&#9675;</span>
			</div>
			<div class="text-4xl font-bold text-slate-800 dark:text-slate-200">18</div>
			<div class="text-sm text-slate-500 dark:text-slate-400">$15,000/year</div>
		</div>
	</div>

	<!-- Member Table -->
	<div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
		<div class="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
			<h3 class="font-semibold text-slate-900 dark:text-white">Member Organizations</h3>
			<div class="flex gap-2">
				<select
					disabled
					class="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-300 cursor-not-allowed opacity-60"
				>
					<option>All Tiers</option>
				</select>
				<select
					disabled
					class="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-300 cursor-not-allowed opacity-60"
				>
					<option>All Status</option>
				</select>
			</div>
		</div>
		<div class="overflow-x-auto">
			<table class="w-full">
				<thead class="bg-slate-50 dark:bg-slate-700/50">
					<tr>
						<th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
							Company
						</th>
						<th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
							Tier
						</th>
						<th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
							Member Since
						</th>
						<th class="px-6 py-3 text-center text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
							Contacts
						</th>
						<th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
							Renewal
						</th>
						<th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
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
	<div class="bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800 p-6">
		<h3 class="font-semibold text-amber-800 dark:text-amber-300 mb-3">Upcoming Renewals (Next 90 Days)</h3>
		<div class="flex flex-wrap gap-3">
			{#each members.filter((m) => m.renewal.includes('2026')) as member (member.company)}
				<div class="bg-white dark:bg-slate-800 px-4 py-2 rounded-lg border border-amber-200 dark:border-amber-700">
					<span class="font-medium text-slate-900 dark:text-white">{member.company}</span>
					<span class="text-sm text-slate-500 dark:text-slate-400 ml-2">{member.renewal}</span>
				</div>
			{/each}
		</div>
	</div>
</div>
