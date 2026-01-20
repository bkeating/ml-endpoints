<script>
	import Icon from '$lib/components/Icon.svelte';
	import StatusBadge from '$lib/components/StatusBadge.svelte';
	import StatCard from '$lib/components/StatCard.svelte';

	/** Placeholder CRM contacts */
	const crmContacts = [
		{ name: 'Sarah Chen', org: 'NVIDIA', role: 'Technical Lead', status: 'active', lastContact: '2 days ago' },
		{ name: 'Marcus Johnson', org: 'Google', role: 'Program Manager', status: 'active', lastContact: '1 week ago' },
		{ name: 'Elena Rodriguez', org: 'Meta', role: 'Research Scientist', status: 'pending', lastContact: '3 weeks ago' },
		{ name: 'David Kim', org: 'Microsoft', role: 'Engineering Director', status: 'active', lastContact: '5 days ago' },
		{ name: 'Priya Patel', org: 'Amazon', role: 'ML Engineer', status: 'inactive', lastContact: '2 months ago' }
	];
</script>

<div class="space-y-6">
	<!-- Header with search -->
	<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
		<div>
			<h2 class="text-2xl font-bold text-slate-900 dark:text-white">Contact Management</h2>
			<p class="text-slate-600 dark:text-slate-400 mt-1">
				Manage relationships with member organizations and key contacts
			</p>
		</div>
		<div class="flex gap-2">
			<div class="relative">
				<Icon name="Search" class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
				<input
					type="text"
					placeholder="Search contacts..."
					disabled
					class="pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 w-64 cursor-not-allowed opacity-60"
				/>
			</div>
			<button
				disabled
				class="px-4 py-2 rounded-lg bg-[#CCEBD4] dark:bg-emerald-600 text-slate-900 dark:text-white font-medium cursor-not-allowed opacity-60"
			>
				Add Contact
			</button>
		</div>
	</div>

	<!-- Contact Cards -->
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
		{#each crmContacts as contact (contact.name)}
			<div
				class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 hover:shadow-md transition-shadow"
			>
				<div class="flex items-start justify-between mb-3">
					<div class="flex items-center gap-3">
						<div
							class="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 font-semibold"
						>
							{contact.name.split(' ').map((n) => n[0]).join('')}
						</div>
						<div>
							<h3 class="font-semibold text-slate-900 dark:text-white">{contact.name}</h3>
							<p class="text-sm text-slate-500 dark:text-slate-400">{contact.org}</p>
						</div>
					</div>
					<StatusBadge status={contact.status} />
				</div>
				<div class="space-y-2 text-sm">
					<div class="flex justify-between">
						<span class="text-slate-500 dark:text-slate-400">Role</span>
						<span class="text-slate-700 dark:text-slate-300">{contact.role}</span>
					</div>
					<div class="flex justify-between">
						<span class="text-slate-500 dark:text-slate-400">Last Contact</span>
						<span class="text-slate-700 dark:text-slate-300">{contact.lastContact}</span>
					</div>
				</div>
				<div class="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 flex gap-2">
					<button
						disabled
						class="flex-1 py-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 cursor-not-allowed"
					>
						View Profile
					</button>
					<button
						disabled
						class="flex-1 py-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 cursor-not-allowed"
					>
						Log Activity
					</button>
				</div>
			</div>
		{/each}
	</div>

	<!-- Quick Stats -->
	<div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
		<StatCard value="247" label="Total Contacts" />
		<StatCard value="189" label="Active" valueColor="text-emerald-600 dark:text-emerald-400" />
		<StatCard value="34" label="Pending Follow-up" valueColor="text-amber-600 dark:text-amber-400" />
		<StatCard value="58" label="Organizations" valueColor="text-blue-600 dark:text-blue-400" />
	</div>
</div>
