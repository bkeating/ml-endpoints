/**
 * In-memory database module that mirrors json-server behavior.
 * Loads data from static/db.json on server startup.
 * Changes persist in memory until server restart.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

/** @type {Record<string, unknown[] | Record<string, unknown>>} */
let data = {};

// Load initial data from db.json
try {
	const dbPath = join(process.cwd(), 'static', 'db.json');
	const raw = readFileSync(dbPath, 'utf-8');
	data = JSON.parse(raw);
} catch (err) {
	console.error('Failed to load db.json:', err);
	data = {};
}

/** List of valid resource names */
const RESOURCES = Object.keys(data);

/** Resources that are objects (singletons) rather than arrays */
const SINGLETON_RESOURCES = ['paretoViewModes', 'vendorColors'];

/**
 * Check if a resource name is valid
 * @param {string} resource
 * @returns {boolean}
 */
export function isValidResource(resource) {
	return RESOURCES.includes(resource);
}

/**
 * Check if a resource is a singleton (object) vs collection (array)
 * @param {string} resource
 * @returns {boolean}
 */
export function isSingleton(resource) {
	return SINGLETON_RESOURCES.includes(resource);
}

/**
 * Get all items from a collection with optional filtering, sorting, and pagination
 * @param {string} resource - Resource name
 * @param {URLSearchParams} [searchParams] - Query parameters for filtering
 * @returns {{ data: unknown[] | Record<string, unknown>, total?: number } | null}
 */
export function getAll(resource, searchParams) {
	if (!isValidResource(resource)) return null;

	const collection = data[resource];

	// Return singleton objects directly
	if (isSingleton(resource)) {
		return { data: collection };
	}

	if (!Array.isArray(collection)) return null;

	let result = [...collection];

	if (searchParams) {
		// Extract special params
		const sort = searchParams.get('_sort');
		const order = searchParams.get('_order') || 'asc';
		const page = searchParams.get('_page');
		const limit = searchParams.get('_limit');

		// Remove special params for filtering
		const filterParams = new URLSearchParams(searchParams);
		['_sort', '_order', '_page', '_limit'].forEach((p) => filterParams.delete(p));

		// Apply filters
		for (const [key, value] of filterParams.entries()) {
			result = result.filter((item) => {
				const itemValue = getNestedValue(item, key);
				if (itemValue === undefined) return false;
				return String(itemValue) === value;
			});
		}

		// Apply sorting
		if (sort) {
			result.sort((a, b) => {
				const aVal = getNestedValue(a, sort);
				const bVal = getNestedValue(b, sort);
				if (aVal < bVal) return order === 'asc' ? -1 : 1;
				if (aVal > bVal) return order === 'asc' ? 1 : -1;
				return 0;
			});
		}

		// Store total before pagination
		const total = result.length;

		// Apply pagination
		if (page && limit) {
			const pageNum = parseInt(page, 10);
			const limitNum = parseInt(limit, 10);
			const start = (pageNum - 1) * limitNum;
			result = result.slice(start, start + limitNum);
			return { data: result, total };
		}
	}

	return { data: result };
}

/**
 * Get a single item by id
 * @param {string} resource - Resource name
 * @param {string} id - Item id
 * @returns {unknown | null}
 */
export function getById(resource, id) {
	if (!isValidResource(resource)) return null;
	if (isSingleton(resource)) return null;

	const collection = data[resource];
	if (!Array.isArray(collection)) return null;

	return collection.find((item) => item.id === id) || null;
}

/**
 * Create a new item in a collection
 * @param {string} resource - Resource name
 * @param {Record<string, unknown>} item - Item to create
 * @returns {Record<string, unknown> | null}
 */
export function create(resource, item) {
	if (!isValidResource(resource)) return null;
	if (isSingleton(resource)) return null;

	const collection = data[resource];
	if (!Array.isArray(collection)) return null;

	// Auto-generate id if not provided
	if (!item.id) {
		item.id = generateId(resource);
	}

	collection.push(item);
	return item;
}

/**
 * Replace an item entirely (PUT)
 * @param {string} resource - Resource name
 * @param {string} id - Item id
 * @param {Record<string, unknown>} item - New item data
 * @returns {Record<string, unknown> | null}
 */
export function replace(resource, id, item) {
	if (!isValidResource(resource)) return null;
	if (isSingleton(resource)) return null;

	const collection = data[resource];
	if (!Array.isArray(collection)) return null;

	const index = collection.findIndex((i) => i.id === id);
	if (index === -1) return null;

	// Ensure id matches
	item.id = id;
	collection[index] = item;
	return item;
}

/**
 * Update an item partially (PATCH)
 * @param {string} resource - Resource name
 * @param {string} id - Item id
 * @param {Record<string, unknown>} updates - Partial updates
 * @returns {Record<string, unknown> | null}
 */
export function update(resource, id, updates) {
	if (!isValidResource(resource)) return null;
	if (isSingleton(resource)) return null;

	const collection = data[resource];
	if (!Array.isArray(collection)) return null;

	const index = collection.findIndex((i) => i.id === id);
	if (index === -1) return null;

	// Merge updates, preserving id
	const updated = { ...collection[index], ...updates, id };
	collection[index] = updated;
	return updated;
}

/**
 * Remove an item from a collection
 * @param {string} resource - Resource name
 * @param {string} id - Item id
 * @returns {boolean}
 */
export function remove(resource, id) {
	if (!isValidResource(resource)) return false;
	if (isSingleton(resource)) return false;

	const collection = data[resource];
	if (!Array.isArray(collection)) return false;

	const index = collection.findIndex((i) => i.id === id);
	if (index === -1) return false;

	collection.splice(index, 1);
	return true;
}

/**
 * Get nested value from object using dot notation
 * @param {unknown} obj
 * @param {string} path
 * @returns {unknown}
 */
function getNestedValue(obj, path) {
	return path.split('.').reduce((current, key) => {
		if (current && typeof current === 'object' && key in current) {
			return /** @type {Record<string, unknown>} */ (current)[key];
		}
		return undefined;
	}, obj);
}

/**
 * Generate a unique id for a resource
 * @param {string} resource
 * @returns {string}
 */
function generateId(resource) {
	const collection = data[resource];
	if (!Array.isArray(collection)) return crypto.randomUUID();

	const prefix = resource.slice(0, 3);
	const maxNum = collection.reduce((max, item) => {
		const match = String(item.id).match(/\d+$/);
		return match ? Math.max(max, parseInt(match[0], 10)) : max;
	}, 0);

	return `${prefix}-${String(maxNum + 1).padStart(3, '0')}`;
}
