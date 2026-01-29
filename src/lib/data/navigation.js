/**
 * Navigation configuration for the main header.
 * Centralized here for easy updates and potential future API integration.
 */

/**
 * @typedef {'exact' | 'startsWith'} MatchType
 * @typedef {{ label: string; href: string; match?: MatchType; disabled?: boolean }} NavItem
 */

/** @type {NavItem[]} */
export const navItems = [
	{ label: 'Home', href: '/', match: 'exact' },
	{ label: 'Test Manager', href: '/test-manager', match: 'startsWith', disabled: true },
	{ label: 'Benchmarks', href: '/benchmarks/gtc', match: 'startsWith' },
	{ label: 'Admin Tools', href: '/admin-tools', match: 'startsWith', disabled: true }
];

/**
 * Determines if a nav item is active based on the current pathname.
 * @param {NavItem} item - The navigation item to check.
 * @param {string} pathname - The current URL pathname.
 * @returns {boolean} Whether the item is active.
 */
export const isNavItemActive = (item, pathname) => {
	const match = item.match ?? 'startsWith';
	return match === 'exact' ? pathname === item.href : pathname.startsWith(item.href);
};
