<script>
	import Icon from '$lib/components/Icon.svelte';
	import StatusBadge from '$lib/components/StatusBadge.svelte';

	/** Placeholder workgroups */
	const workgroups = [
		{ name: 'Inference Working Group', members: 47, meetings: 12, nextMeeting: 'Jan 24, 2026', status: 'active' },
		{ name: 'Training Working Group', members: 38, meetings: 8, nextMeeting: 'Jan 28, 2026', status: 'active' },
		{ name: 'Storage Working Group', members: 23, meetings: 6, nextMeeting: 'Feb 3, 2026', status: 'active' },
		{ name: 'Power Working Group', members: 19, meetings: 4, nextMeeting: 'TBD', status: 'forming' }
	];
</script>

<div class="space-y-6">
	<div>
		<h2 class="text-2xl font-bold text-slate-900 dark:text-white">Working Groups</h2>
		<p class="text-slate-600 dark:text-slate-400 mt-1">
			Track participation and engagement across ML Commons working groups
		</p>
	</div>

	<!-- Workgroup Cards -->
	<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
		{#each workgroups as group (group.name)}
			<div
				class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6"
			>
				<div class="flex items-start justify-between mb-4">
					<div class="flex items-center gap-3">
						<h3 class="text-lg font-semibold text-slate-900 dark:text-white">{group.name}</h3>
						<StatusBadge status={group.status} />
					</div>
					<button
						disabled
						class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-not-allowed"
					>
						<Icon name="Settings" class="h-5 w-5" />
					</button>
				</div>

				<!-- Stats Row -->
				<div class="grid grid-cols-3 gap-4 mb-4">
					<div class="text-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
						<div class="text-xl font-bold text-slate-900 dark:text-white">{group.members}</div>
						<div class="text-xs text-slate-500 dark:text-slate-400">Members</div>
					</div>
					<div class="text-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
						<div class="text-xl font-bold text-slate-900 dark:text-white">{group.meetings}</div>
						<div class="text-xs text-slate-500 dark:text-slate-400">Meetings YTD</div>
					</div>
					<div class="text-center p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
						<div class="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
							{group.nextMeeting}
						</div>
						<div class="text-xs text-slate-500 dark:text-slate-400">Next Meeting</div>
					</div>
				</div>

				<!-- Placeholder attendance chart -->
				<div class="h-24 bg-slate-50 dark:bg-slate-700/30 rounded-lg flex items-center justify-center mb-4">
					<div class="flex items-end gap-1 h-16">
						{#each [40, 65, 55, 80, 70, 90, 85, 75] as height}
							<div
								class="w-6 bg-[#CCEBD4] dark:bg-emerald-600 rounded-t"
								style="height: {height}%"
							></div>
						{/each}
					</div>
				</div>

				<div class="flex gap-2">
					<button
						disabled
						class="flex-1 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 rounded-lg cursor-not-allowed"
					>
						View Roster
					</button>
					<button
						disabled
						class="flex-1 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 rounded-lg cursor-not-allowed"
					>
						Meeting History
					</button>
				</div>
			</div>
		{/each}
	</div>

	<!-- Participation Summary -->
	<div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
		<h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-4">
			Participation Overview
		</h3>
		<div class="grid grid-cols-2 md:grid-cols-4 gap-6">
			<div>
				<div class="text-3xl font-bold text-slate-900 dark:text-white">127</div>
				<div class="text-sm text-slate-500 dark:text-slate-400">Total Participants</div>
			</div>
			<div>
				<div class="text-3xl font-bold text-emerald-600 dark:text-emerald-400">78%</div>
				<div class="text-sm text-slate-500 dark:text-slate-400">Avg Attendance</div>
			</div>
			<div>
				<div class="text-3xl font-bold text-blue-600 dark:text-blue-400">30</div>
				<div class="text-sm text-slate-500 dark:text-slate-400">Meetings This Month</div>
			</div>
			<div>
				<div class="text-3xl font-bold text-purple-600 dark:text-purple-400">4</div>
				<div class="text-sm text-slate-500 dark:text-slate-400">Active Groups</div>
			</div>
		</div>
	</div>
</div>
