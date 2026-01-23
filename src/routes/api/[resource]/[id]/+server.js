/**
 * Item-level API endpoints
 * GET /api/[resource]/[id] - Get single item
 * PUT /api/[resource]/[id] - Replace item
 * PATCH /api/[resource]/[id] - Partial update
 * DELETE /api/[resource]/[id] - Remove item
 */

import { json } from '@sveltejs/kit';
import { getById, replace, update, remove, isValidResource, isSingleton } from '$lib/server/db.js';

/** @type {import('./$types').RequestHandler} */
export async function GET({ params }) {
	const { resource, id } = params;

	if (!isValidResource(resource)) {
		return json({ error: `Unknown resource: ${resource}` }, { status: 400 });
	}

	if (isSingleton(resource)) {
		return json({ error: `Cannot access singleton by id: ${resource}` }, { status: 400 });
	}

	const item = getById(resource, id);

	if (!item) {
		return json({ error: 'Not found' }, { status: 404 });
	}

	return json(item);
}

/** @type {import('./$types').RequestHandler} */
export async function PUT({ params, request }) {
	const { resource, id } = params;

	if (!isValidResource(resource)) {
		return json({ error: `Unknown resource: ${resource}` }, { status: 400 });
	}

	if (isSingleton(resource)) {
		return json({ error: `Cannot PUT singleton resource: ${resource}` }, { status: 405 });
	}

	try {
		const body = await request.json();
		const replaced = replace(resource, id, body);

		if (!replaced) {
			return json({ error: 'Not found' }, { status: 404 });
		}

		return json(replaced);
	} catch {
		return json({ error: 'Invalid JSON body' }, { status: 400 });
	}
}

/** @type {import('./$types').RequestHandler} */
export async function PATCH({ params, request }) {
	const { resource, id } = params;

	if (!isValidResource(resource)) {
		return json({ error: `Unknown resource: ${resource}` }, { status: 400 });
	}

	if (isSingleton(resource)) {
		return json({ error: `Cannot PATCH singleton resource: ${resource}` }, { status: 405 });
	}

	try {
		const body = await request.json();
		const updated = update(resource, id, body);

		if (!updated) {
			return json({ error: 'Not found' }, { status: 404 });
		}

		return json(updated);
	} catch {
		return json({ error: 'Invalid JSON body' }, { status: 400 });
	}
}

/** @type {import('./$types').RequestHandler} */
export async function DELETE({ params }) {
	const { resource, id } = params;

	if (!isValidResource(resource)) {
		return json({ error: `Unknown resource: ${resource}` }, { status: 400 });
	}

	if (isSingleton(resource)) {
		return json({ error: `Cannot DELETE singleton resource: ${resource}` }, { status: 405 });
	}

	const deleted = remove(resource, id);

	if (!deleted) {
		return json({ error: 'Not found' }, { status: 404 });
	}

	return new Response(null, { status: 204 });
}
