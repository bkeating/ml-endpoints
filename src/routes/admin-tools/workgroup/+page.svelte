<script>
	import Icon from '$lib/components/Icon.svelte';
	import StatusBadge from '$lib/components/StatusBadge.svelte';
	import StatCard from '$lib/components/StatCard.svelte';

	/** Placeholder workgroups */
	const workgroups = [
		{
			name: 'Inference Working Group',
			members: 47,
			meetings: 12,
			nextMeeting: 'Jan 24, 2026',
			status: 'active'
		},
		{
			name: 'Training Working Group',
			members: 38,
			meetings: 8,
			nextMeeting: 'Jan 28, 2026',
			status: 'active'
		},
		{
			name: 'Storage Working Group',
			members: 23,
			meetings: 6,
			nextMeeting: 'Feb 3, 2026',
			status: 'active'
		},
		{ name: 'Power Working Group', members: 19, meetings: 4, nextMeeting: 'TBD', status: 'forming' }
	];
</script>

<div class="space-y-6">
	<div>
		<h2 class="text-2xl font-bold text-slate-900 dark:text-white">Working Groups</h2>
		<p class="mt-1 text-slate-600 dark:text-slate-400">
			Track participation and engagement across ML Commons working groups
		</p>
	</div>

	<!-- Participation Overview -->
	<div class="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
		<StatCard value="127" label="Total Participants" />
		<StatCard
			value="78%"
			label="Avg Attendance"
			valueColor="text-emerald-600 dark:text-emerald-400"
		/>
		<StatCard value="30" label="Meetings This Month" valueColor="text-blue-600 dark:text-blue-400" />
		<StatCard value="4" label="Active Groups" valueColor="text-purple-600 dark:text-purple-400" />
	</div>

	<!-- Workgroup Cards -->
	<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
		{#each workgroups as group (group.name)}
			<div
				class="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800"
			>
				<div class="mb-4 flex items-start justify-between">
					<div class="flex items-center gap-3">
						<h3 class="text-lg font-semibold text-slate-900 dark:text-white">{group.name}</h3>
						<StatusBadge status={group.status} />
					</div>
					<button
						disabled
						class="cursor-not-allowed text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
					>
						<Icon name="Settings" class="h-5 w-5" />
					</button>
				</div>

				<!-- Stats Row -->
				<div class="mb-4 grid grid-cols-3 gap-4">
					<div class="rounded-lg bg-slate-50 p-3 text-center dark:bg-slate-700/50">
						<div class="text-xl font-bold text-slate-900 dark:text-white">{group.members}</div>
						<div class="text-xs text-slate-500 dark:text-slate-400">Members</div>
					</div>
					<div class="rounded-lg bg-slate-50 p-3 text-center dark:bg-slate-700/50">
						<div class="text-xl font-bold text-slate-900 dark:text-white">{group.meetings}</div>
						<div class="text-xs text-slate-500 dark:text-slate-400">Meetings YTD</div>
					</div>
					<div class="rounded-lg bg-emerald-50 p-3 text-center dark:bg-emerald-900/20">
						<div class="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
							{group.nextMeeting}
						</div>
						<div class="text-xs text-slate-500 dark:text-slate-400">Next Meeting</div>
					</div>
				</div>

				<!-- Placeholder attendance chart -->
				<div
					class="mb-4 flex h-24 items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-700/30"
				>
					<div class="flex h-16 items-end gap-1">
						{#each [40, 65, 55, 80, 70, 90, 85, 75] as height (height)}
							<div
								class="w-6 rounded-t bg-[#CCEBD4] dark:bg-emerald-600"
								style="height: {height}%"
							></div>
						{/each}
					</div>
				</div>

				<div class="flex gap-2">
					<button
						disabled
						class="flex-1 cursor-not-allowed rounded-lg bg-slate-100 py-2 text-sm font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-400"
					>
						View Roster
					</button>
					<button
						disabled
						class="flex-1 cursor-not-allowed rounded-lg bg-slate-100 py-2 text-sm font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-400"
					>
						Meeting History
					</button>
				</div>
			</div>
		{/each}
	</div>
</div>
