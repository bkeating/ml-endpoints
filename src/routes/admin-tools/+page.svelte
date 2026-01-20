<script>
	/**
	 * Admin Tools page with tabbed navigation for placeholder sections.
	 * Supports deep linking via GET params (?tab=crm, ?tab=workgroup, etc.)
	 */
	import { page } from '$app/state';
	import Icon from '$lib/components/Icon.svelte';

	/** Tab configuration */
	const tabs = [
		{ id: 'crm', label: 'CRM', icon: 'FileAnalytics' },
		{ id: 'workgroup', label: 'Workgroups', icon: 'ReportAnalytics' },
		{ id: 'cla', label: 'Contract CLA', icon: 'Link' },
		{ id: 'finance', label: 'Finance', icon: 'Download' },
		{ id: 'membership', label: 'Membership', icon: 'Settings' }
	];

	/** Get active tab from URL params, default to 'crm' */
	let activeTabId = $derived(page.url?.searchParams?.get('tab') || 'crm');

	/** Placeholder CRM contacts */
	const crmContacts = [
		{ name: 'Sarah Chen', org: 'NVIDIA', role: 'Technical Lead', status: 'active', lastContact: '2 days ago' },
		{ name: 'Marcus Johnson', org: 'Google', role: 'Program Manager', status: 'active', lastContact: '1 week ago' },
		{ name: 'Elena Rodriguez', org: 'Meta', role: 'Research Scientist', status: 'pending', lastContact: '3 weeks ago' },
		{ name: 'David Kim', org: 'Microsoft', role: 'Engineering Director', status: 'active', lastContact: '5 days ago' },
		{ name: 'Priya Patel', org: 'Amazon', role: 'ML Engineer', status: 'inactive', lastContact: '2 months ago' }
	];

	/** Placeholder workgroups */
	const workgroups = [
		{ name: 'Inference Working Group', members: 47, meetings: 12, nextMeeting: 'Jan 24, 2026', status: 'active' },
		{ name: 'Training Working Group', members: 38, meetings: 8, nextMeeting: 'Jan 28, 2026', status: 'active' },
		{ name: 'Storage Working Group', members: 23, meetings: 6, nextMeeting: 'Feb 3, 2026', status: 'active' },
		{ name: 'Power Working Group', members: 19, meetings: 4, nextMeeting: 'TBD', status: 'forming' }
	];

	/** Placeholder CLAs */
	const claAgreements = [
		{ company: 'NVIDIA Corporation', type: 'Corporate CLA', signedDate: 'Dec 15, 2025', status: 'signed', signatories: 12 },
		{ company: 'Google LLC', type: 'Corporate CLA', signedDate: 'Nov 20, 2025', status: 'signed', signatories: 8 },
		{ company: 'Startup AI Inc.', type: 'Individual CLA', signedDate: null, status: 'pending', signatories: 1 },
		{ company: 'Meta Platforms', type: 'Corporate CLA', signedDate: 'Oct 5, 2025', status: 'signed', signatories: 15 },
		{ company: 'OpenAI', type: 'Corporate CLA', signedDate: null, status: 'review', signatories: 0 }
	];

	/** Placeholder invoices */
	const invoices = [
		{ id: 'INV-2026-001', company: 'NVIDIA', amount: 250000, dueDate: 'Feb 15, 2026', status: 'pending', tier: 'Premier' },
		{ id: 'INV-2026-002', company: 'Google', amount: 250000, dueDate: 'Feb 15, 2026', status: 'paid', tier: 'Premier' },
		{ id: 'INV-2026-003', company: 'Startup AI', amount: 15000, dueDate: 'Jan 30, 2026', status: 'overdue', tier: 'Associate' },
		{ id: 'INV-2026-004', company: 'Meta', amount: 250000, dueDate: 'Mar 1, 2026', status: 'draft', tier: 'Premier' },
		{ id: 'INV-2025-089', company: 'AMD', amount: 100000, dueDate: 'Dec 15, 2025', status: 'paid', tier: 'General' }
	];

	/** Placeholder members */
	const members = [
		{ company: 'NVIDIA', tier: 'Premier', since: '2018', contacts: 12, status: 'active', renewal: 'Mar 2026' },
		{ company: 'Google', tier: 'Premier', since: '2018', contacts: 8, status: 'active', renewal: 'Apr 2026' },
		{ company: 'Intel', tier: 'General', since: '2019', contacts: 6, status: 'active', renewal: 'Feb 2026' },
		{ company: 'Startup AI', tier: 'Associate', since: '2025', contacts: 2, status: 'pending', renewal: 'Jan 2027' },
		{ company: 'Microsoft', tier: 'Premier', since: '2018', contacts: 10, status: 'active', renewal: 'May 2026' }
	];

	/** Status badge colors */
	const statusColors = {
		active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
		pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
		inactive: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400',
		signed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
		review: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
		paid: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
		overdue: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
		draft: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400',
		forming: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
	};

	/** Tier badge colors */
	const tierColors = {
		Premier: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
		General: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
		Associate: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
	};
</script>

<!-- Tab Navigation -->
<div
	class="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 sticky top-[80px] z-30"
>
	<div class="max-w-7xl mx-auto px-4">
		<nav class="flex gap-1 overflow-x-auto scrollbar-hide -mb-px" aria-label="Admin tools navigation">
			{#each tabs as tab (tab.id)}
				<a
					href="/admin-tools?tab={tab.id}"
					class="flex items-center gap-2 px-4 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors duration-200
						{activeTabId === tab.id
						? 'border-[#CCEBD4] dark:border-emerald-500 text-slate-900 dark:text-white'
						: 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'}"
					aria-current={activeTabId === tab.id ? 'page' : undefined}
				>
					<Icon name={tab.icon} class="h-4 w-4" />
					<span>{tab.label}</span>
				</a>
			{/each}
		</nav>
	</div>
</div>

<!-- Content Area -->
<div class="bg-slate-50 dark:bg-slate-900 min-h-[60vh]">
	<div class="max-w-7xl mx-auto px-4 py-8 md:py-12">
		<!-- CRM Section -->
		{#if activeTabId === 'crm'}
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
								<span class="px-2 py-1 rounded-full text-xs font-medium {statusColors[contact.status]}">
									{contact.status}
								</span>
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
					<div class="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
						<div class="text-2xl font-bold text-slate-900 dark:text-white">247</div>
						<div class="text-sm text-slate-500 dark:text-slate-400">Total Contacts</div>
					</div>
					<div class="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
						<div class="text-2xl font-bold text-emerald-600 dark:text-emerald-400">189</div>
						<div class="text-sm text-slate-500 dark:text-slate-400">Active</div>
					</div>
					<div class="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
						<div class="text-2xl font-bold text-amber-600 dark:text-amber-400">34</div>
						<div class="text-sm text-slate-500 dark:text-slate-400">Pending Follow-up</div>
					</div>
					<div class="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
						<div class="text-2xl font-bold text-blue-600 dark:text-blue-400">58</div>
						<div class="text-sm text-slate-500 dark:text-slate-400">Organizations</div>
					</div>
				</div>
			</div>

		<!-- Workgroups Section -->
		{:else if activeTabId === 'workgroup'}
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
									<span class="px-2 py-1 rounded-full text-xs font-medium {statusColors[group.status]}">
										{group.status}
									</span>
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

		<!-- CLA Section -->
		{:else if activeTabId === 'cla'}
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
											<span class="px-2 py-1 rounded-full text-xs font-medium {statusColors[cla.status]}">
												{cla.status}
											</span>
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

		<!-- Finance Section -->
		{:else if activeTabId === 'finance'}
			<div class="space-y-6">
				<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
					<div>
						<h2 class="text-2xl font-bold text-slate-900 dark:text-white">Finance & Invoicing</h2>
						<p class="text-slate-600 dark:text-slate-400 mt-1">
							Manage membership dues, invoices, and payment tracking
						</p>
					</div>
					<div class="flex gap-2">
						<button
							disabled
							class="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium cursor-not-allowed opacity-60"
						>
							Export Report
						</button>
						<button
							disabled
							class="px-4 py-2 rounded-lg bg-[#CCEBD4] dark:bg-emerald-600 text-slate-900 dark:text-white font-medium cursor-not-allowed opacity-60"
						>
							Create Invoice
						</button>
					</div>
				</div>

				<!-- Revenue Summary -->
				<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
					<div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
						<div class="text-sm text-slate-500 dark:text-slate-400 mb-1">Total Revenue YTD</div>
						<div class="text-3xl font-bold text-slate-900 dark:text-white">$2,450,000</div>
						<div class="text-sm text-emerald-600 dark:text-emerald-400 mt-1">+12% from last year</div>
					</div>
					<div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
						<div class="text-sm text-slate-500 dark:text-slate-400 mb-1">Outstanding</div>
						<div class="text-3xl font-bold text-amber-600 dark:text-amber-400">$515,000</div>
						<div class="text-sm text-slate-500 dark:text-slate-400 mt-1">8 pending invoices</div>
					</div>
					<div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
						<div class="text-sm text-slate-500 dark:text-slate-400 mb-1">Overdue</div>
						<div class="text-3xl font-bold text-red-600 dark:text-red-400">$15,000</div>
						<div class="text-sm text-slate-500 dark:text-slate-400 mt-1">1 invoice overdue</div>
					</div>
				</div>

				<!-- Invoice Table -->
				<div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
					<div class="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
						<h3 class="font-semibold text-slate-900 dark:text-white">Recent Invoices</h3>
					</div>
					<div class="overflow-x-auto">
						<table class="w-full">
							<thead class="bg-slate-50 dark:bg-slate-700/50">
								<tr>
									<th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
										Invoice
									</th>
									<th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
										Company
									</th>
									<th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
										Tier
									</th>
									<th class="px-6 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
										Amount
									</th>
									<th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
										Due Date
									</th>
									<th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
										Status
									</th>
								</tr>
							</thead>
							<tbody class="divide-y divide-slate-200 dark:divide-slate-700">
								{#each invoices as invoice (invoice.id)}
									<tr class="hover:bg-slate-50 dark:hover:bg-slate-700/30">
										<td class="px-6 py-4">
											<div class="font-mono text-sm text-slate-900 dark:text-white">{invoice.id}</div>
										</td>
										<td class="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">
											{invoice.company}
										</td>
										<td class="px-6 py-4">
											<span class="px-2 py-1 rounded-full text-xs font-medium {tierColors[invoice.tier]}">
												{invoice.tier}
											</span>
										</td>
										<td class="px-6 py-4 text-right font-mono text-sm text-slate-900 dark:text-white">
											${invoice.amount.toLocaleString()}
										</td>
										<td class="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
											{invoice.dueDate}
										</td>
										<td class="px-6 py-4">
											<span class="px-2 py-1 rounded-full text-xs font-medium {statusColors[invoice.status]}">
												{invoice.status}
											</span>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</div>
			</div>

		<!-- Membership Section -->
		{:else if activeTabId === 'membership'}
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
											<span class="px-2 py-1 rounded-full text-xs font-medium {tierColors[member.tier]}">
												{member.tier}
											</span>
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
											<span class="px-2 py-1 rounded-full text-xs font-medium {statusColors[member.status]}">
												{member.status}
											</span>
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
		{/if}

	</div>
</div>
