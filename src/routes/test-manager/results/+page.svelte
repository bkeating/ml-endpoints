<script>
	import Icon from '$lib/components/Icon.svelte';

	/** Placeholder benchmark results */
	const benchmarkResults = [
		{
			id: 'RES-2026-0156',
			model: 'GPT-4-Turbo',
			benchmark: 'MLPerf Inference v4.1',
			hardware: 'Custom TPU v5',
			submitter: 'Google',
			tokensPerSec: 12450,
			latencyP99: '42ms',
			powerEfficiency: '2.8 tokens/W',
			score: 98.7,
			verified: true,
			publishedDate: 'Jan 17, 2026'
		},
		{
			id: 'RES-2026-0155',
			model: 'Claude-3-Opus',
			benchmark: 'MLPerf Inference v4.1',
			hardware: 'AWS Trainium2',
			submitter: 'Anthropic',
			tokensPerSec: 11200,
			latencyP99: '48ms',
			powerEfficiency: '3.1 tokens/W',
			score: 96.2,
			verified: true,
			publishedDate: 'Jan 16, 2026'
		},
		{
			id: 'RES-2026-0154',
			model: 'LLaMA-3-70B',
			benchmark: 'MLPerf Inference v4.1',
			hardware: 'NVIDIA H100 x8',
			submitter: 'Meta',
			tokensPerSec: 10800,
			latencyP99: '51ms',
			powerEfficiency: '2.4 tokens/W',
			score: 94.5,
			verified: true,
			publishedDate: 'Jan 15, 2026'
		},
		{
			id: 'RES-2026-0153',
			model: 'Mixtral-8x7B',
			benchmark: 'MLPerf Inference v4.1',
			hardware: 'AMD MI300X x4',
			submitter: 'AMD',
			tokensPerSec: 8900,
			latencyP99: '62ms',
			powerEfficiency: '3.5 tokens/W',
			score: 91.8,
			verified: false,
			publishedDate: 'Jan 14, 2026'
		}
	];
</script>

<div class="space-y-6">
	<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<div>
			<h2 class="text-2xl font-bold text-slate-900 dark:text-white">Benchmark Results</h2>
			<p class="mt-1 text-slate-600 dark:text-slate-400">
				View and compare MLPerf benchmark results across submissions
			</p>
		</div>
		<div class="flex gap-2">
			<select
				disabled
				class="cursor-not-allowed rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
			>
				<option>All Benchmarks</option>
			</select>
			<button
				disabled
				class="flex cursor-not-allowed items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 font-medium text-slate-700 opacity-60 dark:border-slate-700 dark:text-slate-300"
			>
				<Icon name="Download" class="h-4 w-4" />
				Export
			</button>
		</div>
	</div>

	<!-- Results Table -->
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
							Model / Submitter
						</th>
						<th
							class="px-6 py-3 text-left text-xs font-semibold tracking-wider text-slate-600 uppercase dark:text-slate-300"
						>
							Hardware
						</th>
						<th
							class="px-6 py-3 text-right text-xs font-semibold tracking-wider text-slate-600 uppercase dark:text-slate-300"
						>
							Tokens/sec
						</th>
						<th
							class="px-6 py-3 text-right text-xs font-semibold tracking-wider text-slate-600 uppercase dark:text-slate-300"
						>
							Latency P99
						</th>
						<th
							class="px-6 py-3 text-right text-xs font-semibold tracking-wider text-slate-600 uppercase dark:text-slate-300"
						>
							Efficiency
						</th>
						<th
							class="px-6 py-3 text-right text-xs font-semibold tracking-wider text-slate-600 uppercase dark:text-slate-300"
						>
							Score
						</th>
						<th
							class="px-6 py-3 text-center text-xs font-semibold tracking-wider text-slate-600 uppercase dark:text-slate-300"
						>
							Verified
						</th>
						<th
							class="px-6 py-3 text-right text-xs font-semibold tracking-wider text-slate-600 uppercase dark:text-slate-300"
						>
							Actions
						</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-200 dark:divide-slate-700">
					{#each benchmarkResults as result, index (result.id)}
						<tr class="hover:bg-slate-50 dark:hover:bg-slate-700/30">
							<td class="px-6 py-4">
								<div class="flex items-center gap-3">
									<div
										class="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600 dark:bg-slate-700 dark:text-slate-400"
									>
										{index + 1}
									</div>
									<div>
										<div class="font-medium text-slate-900 dark:text-white">{result.model}</div>
										<div class="text-xs text-slate-500 dark:text-slate-400">{result.submitter}</div>
									</div>
								</div>
							</td>
							<td class="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
								{result.hardware}
							</td>
							<td class="px-6 py-4 text-right font-mono text-sm text-slate-900 dark:text-white">
								{result.tokensPerSec.toLocaleString()}
							</td>
							<td class="px-6 py-4 text-right font-mono text-sm text-slate-600 dark:text-slate-400">
								{result.latencyP99}
							</td>
							<td class="px-6 py-4 text-right font-mono text-sm text-slate-600 dark:text-slate-400">
								{result.powerEfficiency}
							</td>
							<td class="px-6 py-4 text-right">
								<span class="text-lg font-bold text-slate-900 dark:text-white">{result.score}</span>
							</td>
							<td class="px-6 py-4 text-center">
								{#if result.verified}
									<span
										class="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30"
									>
										<svg
											class="h-4 w-4 text-emerald-600 dark:text-emerald-400"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M5 13l4 4L19 7"
											/>
										</svg>
									</span>
								{:else}
									<span
										class="inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30"
									>
										<svg
											class="h-4 w-4 text-amber-600 dark:text-amber-400"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
											/>
										</svg>
									</span>
								{/if}
							</td>
							<td class="px-6 py-4 text-right">
								<div class="flex items-center justify-end gap-2">
									<button
										disabled
										class="cursor-not-allowed text-sm text-blue-600 opacity-60 hover:underline dark:text-blue-400"
									>
										Details
									</button>
									<button
										disabled
										class="cursor-not-allowed text-sm text-slate-600 opacity-60 hover:underline dark:text-slate-400"
									>
										Compare
									</button>
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>

	<!-- Performance Chart Placeholder -->
	<div
		class="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800"
	>
		<h3 class="mb-4 font-semibold text-slate-900 dark:text-white">Performance Comparison</h3>
		<div class="flex h-64 items-end justify-around gap-4 px-8">
			{#each benchmarkResults as result (result.id)}
				<div class="flex flex-1 flex-col items-center gap-2">
					<div
						class="w-full rounded-t bg-[#CCEBD4] transition-all duration-500 dark:bg-emerald-600"
						style="height: {(result.score / 100) * 200}px"
					></div>
					<div class="w-full truncate text-center text-xs text-slate-500 dark:text-slate-400">
						{result.model.split('-')[0]}
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>
