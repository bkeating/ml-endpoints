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

/** Organization colors (for benchmarks) - ML Commons palette */
export const orgColors = {
	RedHat: '#D49681',
	NVIDIA: '#62826C',
	Intel: '#4E6BA1',
	Dell: '#3D455A',
	Qualcomm: '#535869'
};

/**
 * Chart and system color palette (ML Commons palette)
 * Used for labels, charts, and system series
 */
export const systemChartPalette = [
	'#535869',
	'#BED3FB',
	'#F7CB84',
	'#F4B6A1',
	'#62826C',
	'#CCEBD4',
	'#4E6BA1',
	'#3D455A',
	'#A0B5DD',
	'#E8B460',
	'#D49681',
	'#44644E',
	'#B3CEBA',
	'#37548A'
];

/** Vendor-specific colors for chart labels (ML Commons palette) */
export const vendorChartColors = {
	NVIDIA: '#62826C',
	AMD: '#D49681',
	Intel: '#4E6BA1',
	Google: '#37548A',
	AWS: '#E8B460',
	Microsoft: '#A0B5DD',
	Cerebras: '#535869',
	Qualcomm: '#3D455A',
	SambaNova: '#44644E',
	Meta: '#4E6BA1'
};

/**
 * Get organization color with fallback
 * @param {string} org - Organization name
 * @returns {string} Hex color code
 */
export function getOrgColor(org) {
	return orgColors[org] || '#535869';
}
