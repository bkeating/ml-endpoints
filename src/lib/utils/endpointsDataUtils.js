/**
 * Data transformation utilities for ML Endpoints benchmark data.
 * Builds Pareto curves, recent submissions, and lookup helpers.
 */

import { getTheme } from '$lib/stores/theme.svelte.js';

/**
 * Build Pareto curves from normalized endpoints data.
 * Joins submissions with their systems, models, and runs.
 * @param {Object} data - The endpoints benchmark data
 * @returns {Array<{id: string, systemId: string, name: string, color: string, system: Object, model: Object, runs: Array}>}
 */
export function buildParetoCurves(data) {
	return data.submissions.map((submission) => {
		const system = data.systems.find((s) => s.id === submission.system_id);
		const model = data.models.find((m) => m.model_id === submission.model_id);
		const runs = data.runs
			.filter((r) => r.submission_id === submission.submission_id)
			.sort((a, b) => a.concurrency - b.concurrency);

		return {
			id: submission.submission_id,
			systemId: submission.system_id,
			name: system?.system_name ?? submission.submission_id,
			color: system?.color ?? '#535869',
			system,
			model,
			runs
		};
	});
}

/**
 * Get the most recent submissions sorted by submission date.
 * @param {Object} data - The endpoints benchmark data
 * @param {number} limit - Maximum number of submissions to return
 * @returns {Array} - Recent submissions sorted by date descending
 */
export function getRecentSubmissions(data, limit = 10) {
	return [...data.submissions]
		.sort((a, b) => new Date(b.submission_date) - new Date(a.submission_date))
		.slice(0, limit);
}

/**
 * Get runs for a specific submission, sorted by concurrency.
 * @param {string} submissionId - The submission ID
 * @param {Array} runs - The runs array from endpoints data
 * @returns {Array}
 */
export function getRunsForSubmission(submissionId, runs) {
	return runs
		.filter((r) => r.submission_id === submissionId)
		.sort((a, b) => a.concurrency - b.concurrency);
}

/**
 * Get the logo URL for a submission based on its model.
 * @param {Object} submission - The submission object
 * @param {Array} models - The models array from endpoints data
 * @returns {string|null}
 */
export function getModelLogoUrl(submission, models) {
	const model = models.find((m) => m.model_id === submission.model_id);
	return model?.logo_url ?? null;
}

/**
 * Get the hardware logo URL for a submission based on its submitter organization.
 * @param {Object} submission - The submission object
 * @returns {string|null}
 */
export function getHardwareLogoUrl(submission) {
	const orgName = submission.submitter_org_names?.toLowerCase() ?? '';
	const isDarkTheme = getTheme() === 'dark';
	if (orgName.includes('nvidia')) {
		return isDarkTheme ? '/logos/logo-nvidia-dark.svg' : '/logos/logo-nvidia.svg';
	}
	if (orgName.includes('amd')) {
		return isDarkTheme ? '/logos/logo-amd-dark.svg' : '/logos/logo-amd.svg';
	}
	return null;
}
