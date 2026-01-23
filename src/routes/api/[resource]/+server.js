/**
 * Collection-level API endpoints
 * GET /api/[resource] - List all items (with filtering, sorting, pagination)
 * POST /api/[resource] - Create new item
 */

import { json } from '@sveltejs/kit';
import { getAll, create, isValidResource, isSingleton } from '$lib/server/db.js';

/** @type {import('./$types').RequestHandler} */
export async function GET({ params, url }) {
	const { resource } = params;

	if (!isValidResource(resource)) {
		return json({ error: `Unknown resource: ${resource}` }, { status: 400 });
	}

	const result = getAll(resource, url.searchParams);

	if (!result) {
		return json({ error: 'Failed to fetch data' }, { status: 500 });
	}

	// Include total count header for pagination
	const headers = result.total !== undefined ? { 'X-Total-Count': String(result.total) } : {};

	return json(result.data, { headers });
}

/** @type {import('./$types').RequestHandler} */
export async function POST({ params, request }) {
	const { resource } = params;

	if (!isValidResource(resource)) {
		return json({ error: `Unknown resource: ${resource}` }, { status: 400 });
	}

	if (isSingleton(resource)) {
		return json({ error: `Cannot POST to singleton resource: ${resource}` }, { status: 405 });
	}

	try {
		const body = await request.json();
		const created = create(resource, body);

		if (!created) {
			return json({ error: 'Failed to create item' }, { status: 500 });
		}

		return json(created, { status: 201 });
	} catch {
		return json({ error: 'Invalid JSON body' }, { status: 400 });
	}
}
