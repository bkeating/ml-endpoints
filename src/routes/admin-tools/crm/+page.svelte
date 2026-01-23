<script>
	import Icon from '$lib/components/Icon.svelte';
	import StatusBadge from '$lib/components/StatusBadge.svelte';
	import StatCard from '$lib/components/StatCard.svelte';

	/** Placeholder CRM contacts */
	const crmContacts = [
		{
			name: 'Sarah Chen',
			org: 'NVIDIA',
			role: 'Technical Lead',
			status: 'active',
			lastContact: '2 days ago'
		},
		{
			name: 'Marcus Johnson',
			org: 'Google',
			role: 'Program Manager',
			status: 'active',
			lastContact: '1 week ago'
		},
		{
			name: 'Elena Rodriguez',
			org: 'Meta',
			role: 'Research Scientist',
			status: 'pending',
			lastContact: '3 weeks ago'
		},
		{
			name: 'David Kim',
			org: 'Microsoft',
			role: 'Engineering Director',
			status: 'active',
			lastContact: '5 days ago'
		},
		{
			name: 'Priya Patel',
			org: 'Amazon',
			role: 'ML Engineer',
			status: 'inactive',
			lastContact: '2 months ago'
		}
	];
</script>

<div class="space-y-6">
	<!-- Header with search -->
	<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<div>
			<h2 class="text-2xl font-bold text-slate-900 dark:text-white">Contact Management</h2>
			<p class="mt-1 text-slate-600 dark:text-slate-400">
				Manage relationships with member organizations and key contacts
			</p>
		</div>
		<div class="flex gap-2">
			<div class="relative">
				<Icon
					name="Search"
					class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400"
				/>
				<input
					type="text"
					placeholder="Search contacts..."
					disabled
					class="w-64 cursor-not-allowed rounded-lg border border-slate-200 bg-white py-2 pr-4 pl-10 text-slate-900 opacity-60 placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
				/>
			</div>
			<button
				disabled
				class="cursor-not-allowed rounded-lg bg-[#CCEBD4] px-4 py-2 font-medium text-slate-900 opacity-60 dark:bg-emerald-600 dark:text-white"
			>
				Add Contact
			</button>
		</div>
	</div>

	<!-- Quick Stats -->
	<div class="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
		<StatCard value="247" label="Total Contacts" />
		<StatCard value="189" label="Active" valueColor="text-emerald-600 dark:text-emerald-400" />
		<StatCard
			value="34"
			label="Pending Follow-up"
			valueColor="text-amber-600 dark:text-amber-400"
		/>
		<StatCard value="58" label="Organizations" valueColor="text-blue-600 dark:text-blue-400" />
	</div>

	<!-- Contact Cards -->
	<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
		{#each crmContacts as contact (contact.name)}
			<div
				class="rounded-xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-md dark:border-slate-700 dark:bg-slate-800"
			>
				<div class="mb-3 flex items-start justify-between">
					<div class="flex items-center gap-3">
						<div
							class="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 font-semibold text-slate-600 dark:bg-slate-700 dark:text-slate-300"
						>
							{contact.name
								.split(' ')
								.map((n) => n[0])
								.join('')}
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
				<div class="mt-4 flex gap-2 border-t border-slate-100 pt-3 dark:border-slate-700">
					<button
						disabled
						class="flex-1 cursor-not-allowed py-1.5 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
					>
						View Profile
					</button>
					<button
						disabled
						class="flex-1 cursor-not-allowed py-1.5 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
					>
						Log Activity
					</button>
				</div>
			</div>
		{/each}
	</div>
</div>
