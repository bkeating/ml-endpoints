<script>
	import Icon from '$lib/components/Icon.svelte';
	import StatusBadge from '$lib/components/StatusBadge.svelte';
	import StatCard from '$lib/components/StatCard.svelte';

	/** Placeholder AIRR test suites */
	const airrTestSuites = [
		{
			id: 'AIRR-001',
			name: 'Safety Evaluation Suite',
			description: 'Comprehensive safety testing for harmful content generation',
			tests: 156,
			lastRun: 'Jan 18, 2026',
			passRate: 94.2,
			status: 'active'
		},
		{
			id: 'AIRR-002',
			name: 'Fairness & Bias Detection',
			description: 'Evaluate model outputs for demographic bias patterns',
			tests: 89,
			lastRun: 'Jan 17, 2026',
			passRate: 87.6,
			status: 'active'
		},
		{
			id: 'AIRR-003',
			name: 'Robustness Testing',
			description: 'Adversarial input testing and edge case handling',
			tests: 234,
			lastRun: 'Jan 16, 2026',
			passRate: 91.3,
			status: 'active'
		},
		{
			id: 'AIRR-004',
			name: 'Privacy Compliance',
			description: 'Test for PII leakage and data memorization',
			tests: 67,
			lastRun: 'Jan 15, 2026',
			passRate: 98.5,
			status: 'active'
		}
	];
</script>

<div class="space-y-6">
	<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
		<div>
			<h2 class="text-2xl font-bold text-slate-900 dark:text-white">AIRR Testing</h2>
			<p class="text-slate-600 dark:text-slate-400 mt-1">
				AI Risk & Reliability testing suites for safety, fairness, and robustness evaluation
			</p>
		</div>
		<button
			disabled
			class="px-4 py-2 rounded-lg bg-[#CCEBD4] dark:bg-emerald-600 text-slate-900 dark:text-white font-medium cursor-not-allowed opacity-60 flex items-center gap-2"
		>
			<Icon name="Play" class="h-4 w-4" />
			Run Test Suite
		</button>
	</div>

	<!-- AIRR Overview Stats -->
	<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
		<StatCard value="546" label="Total Tests" />
		<StatCard value="92.9%" label="Avg Pass Rate" valueColor="text-emerald-600 dark:text-emerald-400" />
		<StatCard value="4" label="Test Suites" valueColor="text-blue-600 dark:text-blue-400" />
		<StatCard value="23" label="Models Tested" valueColor="text-purple-600 dark:text-purple-400" />
	</div>

	<!-- Test Suite Cards -->
	<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
		{#each airrTestSuites as suite (suite.id)}
			<div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
				<div class="flex items-start justify-between mb-4">
					<div>
						<div class="flex items-center gap-2 mb-1">
							<h3 class="text-lg font-semibold text-slate-900 dark:text-white">{suite.name}</h3>
							<StatusBadge status={suite.status} />
						</div>
						<p class="text-sm text-slate-500 dark:text-slate-400">{suite.description}</p>
					</div>
				</div>

				<!-- Pass Rate Visualization -->
				<div class="mb-4">
					<div class="flex items-center justify-between text-sm mb-2">
						<span class="text-slate-600 dark:text-slate-400">Pass Rate</span>
						<span class="font-semibold text-slate-900 dark:text-white">{suite.passRate}%</span>
					</div>
					<div class="h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
						<div
							class="h-full rounded-full transition-all duration-500 {suite.passRate >= 95 ? 'bg-emerald-500' : suite.passRate >= 85 ? 'bg-amber-500' : 'bg-red-500'}"
							style="width: {suite.passRate}%"
						></div>
					</div>
				</div>

				<!-- Suite Stats -->
				<div class="grid grid-cols-2 gap-4 mb-4">
					<div class="text-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
						<div class="text-xl font-bold text-slate-900 dark:text-white">{suite.tests}</div>
						<div class="text-xs text-slate-500 dark:text-slate-400">Tests</div>
					</div>
					<div class="text-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
						<div class="text-sm font-semibold text-slate-900 dark:text-white">{suite.lastRun}</div>
						<div class="text-xs text-slate-500 dark:text-slate-400">Last Run</div>
					</div>
				</div>

				<div class="flex gap-2">
					<button
						disabled
						class="flex-1 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 rounded-lg cursor-not-allowed opacity-60"
					>
						View Results
					</button>
					<button
						disabled
						class="flex-1 py-2 text-sm font-medium text-white bg-[#CCEBD4] dark:bg-emerald-600 text-slate-900 rounded-lg cursor-not-allowed opacity-60"
					>
						Run Tests
					</button>
				</div>
			</div>
		{/each}
	</div>

	<!-- Recent Test Runs -->
	<div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
		<h3 class="font-semibold text-slate-900 dark:text-white mb-4">Recent Test Runs</h3>
		<div class="space-y-3">
			{#each [
				{ model: 'GPT-4-Turbo', suite: 'Safety Evaluation', time: '2 hours ago', passed: 147, failed: 9 },
				{ model: 'Claude-3-Opus', suite: 'Fairness & Bias', time: '5 hours ago', passed: 82, failed: 7 },
				{ model: 'LLaMA-3-70B', suite: 'Robustness Testing', time: '1 day ago', passed: 218, failed: 16 }
			] as run (run.model + run.suite)}
				<div class="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/30 rounded-lg">
					<div class="flex items-center gap-4">
						<div>
							<div class="font-medium text-slate-900 dark:text-white">{run.model}</div>
							<div class="text-xs text-slate-500 dark:text-slate-400">{run.suite}</div>
						</div>
					</div>
					<div class="flex items-center gap-6">
						<div class="text-right">
							<span class="text-emerald-600 dark:text-emerald-400 font-medium">{run.passed}</span>
							<span class="text-slate-400 mx-1">/</span>
							<span class="text-red-600 dark:text-red-400 font-medium">{run.failed}</span>
						</div>
						<div class="text-xs text-slate-500 dark:text-slate-400 w-20 text-right">{run.time}</div>
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>
