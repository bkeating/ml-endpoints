/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
	// Read theme cookie
	const theme = event.cookies.get('theme');
	event.locals.theme = theme || null;

	return resolve(event);
}
