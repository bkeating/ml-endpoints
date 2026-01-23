<script>
	import Icon from '$lib/components/Icon.svelte';
	import StatusBadge from '$lib/components/StatusBadge.svelte';
	import StatCard from '$lib/components/StatCard.svelte';

	/** Placeholder model submissions */
	const submissions = [
		{
			id: 'SUB-2026-0042',
			model: 'LLaMA-3.1-70B',
			benchmark: 'MLPerf Inference v4.1',
			hardware: 'NVIDIA H100 x8',
			submitter: 'NVIDIA',
			submitted: 'Jan 18, 2026',
			status: 'running',
			progress: 67
		},
		{
			id: 'SUB-2026-0041',
			model: 'Mixtral-8x22B',
			benchmark: 'MLPerf Inference v4.1',
			hardware: 'AMD MI300X x8',
			submitter: 'AMD',
			submitted: 'Jan 17, 2026',
			status: 'queued',
			progress: 0
		},
		{
			id: 'SUB-2026-0040',
			model: 'GPT-4-Turbo',
			benchmark: 'MLPerf Inference v4.1',
			hardware: 'Custom TPU v5',
			submitter: 'Google',
			submitted: 'Jan 16, 2026',
			status: 'completed',
			progress: 100
		},
		{
			id: 'SUB-2026-0039',
			model: 'Claude-3-Opus',
			benchmark: 'MLPerf Inference v4.1',
			hardware: 'AWS Trainium2',
			submitter: 'Anthropic',
			submitted: 'Jan 15, 2026',
			status: 'completed',
			progress: 100
		},
		{
			id: 'SUB-2026-0038',
			model: 'Gemini-Ultra',
			benchmark: 'MLPerf Training v4.0',
			hardware: 'TPU v5p Pod',
			submitter: 'Google',
			submitted: 'Jan 14, 2026',
			status: 'failed',
			progress: 45
		}
	];
</script>

<div class="space-y-6">
	<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<div>
			<h2 class="text-2xl font-bold text-slate-900 dark:text-white">Model Submissions</h2>
			<p class="mt-1 text-slate-600 dark:text-slate-400">
				Submit and track your MLPerf benchmark submissions
			</p>
		</div>
		<button
			disabled
			class="flex cursor-not-allowed items-center gap-2 rounded-lg bg-[#CCEBD4] px-6 py-2.5 font-medium text-slate-900 opacity-60 dark:bg-emerald-600 dark:text-white"
		>
			<Icon name="Play" class="h-4 w-4" />
			Submit New Model
		</button>
	</div>

	<!-- Submission Stats -->
	<div class="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
		<StatCard value="2" label="Running" valueColor="text-blue-600 dark:text-blue-400" />
		<StatCard value="1" label="Queued" />
		<StatCard
			value="156"
			label="Completed"
			valueColor="text-emerald-600 dark:text-emerald-400"
		/>
		<StatCard value="3" label="Failed" valueColor="text-red-600 dark:text-red-400" />
	</div>

	<!-- Submissions Table -->
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
							Submission ID
						</th>
						<th
							class="px-6 py-3 text-left text-xs font-semibold tracking-wider text-slate-600 uppercase dark:text-slate-300"
						>
							Model
						</th>
						<th
							class="px-6 py-3 text-left text-xs font-semibold tracking-wider text-slate-600 uppercase dark:text-slate-300"
						>
							Hardware
						</th>
						<th
							class="px-6 py-3 text-left text-xs font-semibold tracking-wider text-slate-600 uppercase dark:text-slate-300"
						>
							Benchmark
						</th>
						<th
							class="px-6 py-3 text-left text-xs font-semibold tracking-wider text-slate-600 uppercase dark:text-slate-300"
						>
							Progress
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
					{#each submissions as submission (submission.id)}
						<tr class="hover:bg-slate-50 dark:hover:bg-slate-700/30">
							<td class="px-6 py-4">
								<div class="font-mono text-sm text-slate-900 dark:text-white">{submission.id}</div>
								<div class="text-xs text-slate-500 dark:text-slate-400">{submission.submitted}</div>
							</td>
							<td class="px-6 py-4">
								<div class="font-medium text-slate-900 dark:text-white">{submission.model}</div>
								<div class="text-xs text-slate-500 dark:text-slate-400">{submission.submitter}</div>
							</td>
							<td class="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
								{submission.hardware}
							</td>
							<td class="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
								{submission.benchmark}
							</td>
							<td class="px-6 py-4">
								<div class="flex items-center gap-2">
									<div
										class="h-2 w-24 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700"
									>
										<div
											class="h-full rounded-full transition-all duration-300 {submission.status ===
											'failed'
												? 'bg-red-500'
												: submission.status === 'completed'
													? 'bg-emerald-500'
													: 'bg-blue-500'}"
											style="width: {submission.progress}%"
										></div>
									</div>
									<span class="w-8 text-xs text-slate-500 dark:text-slate-400"
										>{submission.progress}%</span
									>
								</div>
							</td>
							<td class="px-6 py-4">
								<StatusBadge status={submission.status} />
							</td>
							<td class="px-6 py-4 text-right">
								<div class="flex items-center justify-end gap-2">
									<button
										disabled
										class="cursor-not-allowed text-sm text-blue-600 opacity-60 hover:underline dark:text-blue-400"
									>
										View
									</button>
									{#if submission.status === 'running' || submission.status === 'queued'}
										<button
											disabled
											class="cursor-not-allowed text-sm text-red-600 opacity-60 hover:underline dark:text-red-400"
										>
											Cancel
										</button>
									{/if}
									{#if submission.status === 'failed'}
										<button
											disabled
											class="cursor-not-allowed text-sm text-amber-600 opacity-60 hover:underline dark:text-amber-400"
										>
											Retry
										</button>
									{/if}
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>
