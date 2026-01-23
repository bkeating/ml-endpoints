/**
 * Theme state management using Svelte 5 runes
 * Handles light/dark mode with cookie persistence
 */

let theme = $state('light');

/**
 * Get the current theme value
 * @returns {'light' | 'dark'}
 */
export function getTheme() {
	return theme;
}

/**
 * Set the theme and persist to cookie
 * @param {'light' | 'dark'} value
 */
export function setTheme(value) {
	theme = value;
	// Set cookie with 1 year expiry
	if (typeof document !== 'undefined') {
		document.cookie = `theme=${value};path=/;max-age=${60 * 60 * 24 * 365};SameSite=Lax`;
	}
}

/**
 * Toggle between light and dark themes
 */
export function toggleTheme() {
	setTheme(theme === 'light' ? 'dark' : 'light');
}

/**
 * Initialize theme from server data or system preference
 * @param {string | null} cookieTheme - Theme from cookie (server-side)
 */
export function initTheme(cookieTheme) {
	if (cookieTheme === 'light' || cookieTheme === 'dark') {
		theme = cookieTheme;
	} else if (typeof window !== 'undefined') {
		// No cookie, check system preference
		const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
		theme = prefersDark ? 'dark' : 'light';
	}
}
