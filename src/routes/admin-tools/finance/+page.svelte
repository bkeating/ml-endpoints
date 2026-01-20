<script>
	import StatusBadge from '$lib/components/StatusBadge.svelte';
	import { tierColors } from '$lib/constants/colors.js';

	/** Placeholder invoices */
	const invoices = [
		{ id: 'INV-2026-001', company: 'NVIDIA', amount: 250000, dueDate: 'Feb 15, 2026', status: 'pending', tier: 'Premier' },
		{ id: 'INV-2026-002', company: 'Google', amount: 250000, dueDate: 'Feb 15, 2026', status: 'paid', tier: 'Premier' },
		{ id: 'INV-2026-003', company: 'Startup AI', amount: 15000, dueDate: 'Jan 30, 2026', status: 'overdue', tier: 'Associate' },
		{ id: 'INV-2026-004', company: 'Meta', amount: 250000, dueDate: 'Mar 1, 2026', status: 'draft', tier: 'Premier' },
		{ id: 'INV-2025-089', company: 'AMD', amount: 100000, dueDate: 'Dec 15, 2025', status: 'paid', tier: 'General' }
	];
</script>

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
								<StatusBadge status={invoice.tier} colorMap={tierColors} />
							</td>
							<td class="px-6 py-4 text-right font-mono text-sm text-slate-900 dark:text-white">
								${invoice.amount.toLocaleString()}
							</td>
							<td class="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
								{invoice.dueDate}
							</td>
							<td class="px-6 py-4">
								<StatusBadge status={invoice.status} />
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>
