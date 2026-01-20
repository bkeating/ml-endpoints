<script>
	/**
	 * Reusable status badge component with color-coded styling
	 *
	 * @typedef {Object} Props
	 * @property {string} status - Status value (e.g., 'active', 'pending')
	 * @property {Record<string, string>} [colorMap] - Optional custom color map
	 */

	import { statusColors } from '$lib/constants/colors.js';

	/** @type {Props} */
	let { status, colorMap = statusColors } = $props();

	let badgeClass = $derived(colorMap[status] || statusColors.inactive);
</script>

<span class="px-2 py-1 rounded-full text-xs font-medium {badgeClass}">
	{status}
</span>
