/**
 * Layout server load function for Phaneros admin panel.
 * Loads theme preference from cookies.
 */

/** @type {import('./$types').LayoutServerLoad} */
export function load({ cookies }) {
	return {
		theme: cookies.get('theme') ?? null
	};
}
