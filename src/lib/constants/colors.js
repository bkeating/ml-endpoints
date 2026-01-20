/**
 * Shared color definitions for status badges, tiers, and organizations
 * Used across admin-tools, test-manager, and benchmarks sections
 */

/** Status badge colors */
export const statusColors = {
	active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
	pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
	inactive: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400',
	signed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
	review: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
	paid: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
	overdue: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
	draft: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400',
	forming: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
	running: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
	queued: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400',
	completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
	failed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
};

/** Tier badge colors */
export const tierColors = {
	Premier: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
	General: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
	Associate: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
};

/** Organization colors (for benchmarks) */
export const orgColors = {
	RedHat: '#e61949',
	NVIDIA: '#76b900',
	Intel: '#0071c5',
	Dell: '#007db8',
	Qualcomm: '#3253dc'
};

/**
 * Get organization color with fallback
 * @param {string} org - Organization name
 * @returns {string} Hex color code
 */
export function getOrgColor(org) {
	return orgColors[org] || '#64748b';
}
