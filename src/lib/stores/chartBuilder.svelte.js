/**
 * Chart Builder State Management
 * 
 * Manages the state for the Phaneros chart builder including:
 * - Chart type selection (bar/line)
 * - Data layers with endpoint and property mappings
 * - Chart configuration (title, axis labels)
 * 
 * @module chartBuilder
 */

/**
 * @typedef {Object} LayerMapping
 * @property {string} dataPath - JSON path to the data array (e.g., "data.items" or "" for root array)
 * @property {string} xProp - Property name for x-axis values
 * @property {string} yProp - Property name for y-axis values
 * @property {string} labelProp - Property name for labels
 * @property {string} color - Hex color for this layer
 */

/**
 * @typedef {Object} DataLayer
 * @property {string} id - Unique layer identifier
 * @property {string} name - Display name for the layer
 * @property {string} endpoint - API endpoint URL
 * @property {object | null} response - Raw API response
 * @property {LayerMapping} mapping - Property mapping configuration
 * @property {boolean} visible - Whether layer is visible in preview
 * @property {boolean} isLoading - Whether layer is currently fetching data
 * @property {string | null} error - Error message if fetch failed
 */

/**
 * @typedef {Object} ChartConfig
 * @property {string} title - Chart title
 * @property {string} xAxisLabel - X-axis label
 * @property {string} yAxisLabel - Y-axis label
 */

/**
 * @typedef {'bar' | 'line'} ChartType
 */

// Default color palette for layers
const LAYER_COLORS = [
	'#22c55e', // green-500
	'#3b82f6', // blue-500
	'#f59e0b', // amber-500
	'#ec4899', // pink-500
	'#8b5cf6', // violet-500
	'#06b6d4', // cyan-500
	'#ef4444', // red-500
	'#84cc16'  // lime-500
];

/**
 * Generate a unique ID
 * @returns {string}
 */
const generateId = () => Math.random().toString(36).slice(2, 11);

/**
 * Get next available color from palette
 * @param {DataLayer[]} layers
 * @returns {string}
 */
const getNextColor = (layers) => {
	const usedColors = new Set(layers.map((l) => l.mapping.color));
	return LAYER_COLORS.find((c) => !usedColors.has(c)) ?? LAYER_COLORS[layers.length % LAYER_COLORS.length];
};

/**
 * Create a new empty layer
 * @param {DataLayer[]} existingLayers
 * @returns {DataLayer}
 */
const createEmptyLayer = (existingLayers) => ({
	id: generateId(),
	name: `Layer ${existingLayers.length + 1}`,
	endpoint: '',
	response: null,
	mapping: {
		dataPath: '',
		xProp: '',
		yProp: '',
		labelProp: '',
		color: getNextColor(existingLayers)
	},
	visible: true,
	isLoading: false,
	error: null
});

// ============================================================================
// STATE
// ============================================================================

/** @type {ChartType} */
let chartType = $state('bar');

/** @type {DataLayer[]} */
let layers = $state([createEmptyLayer([])]);

/** @type {ChartConfig} */
let chartConfig = $state({
	title: 'New Chart',
	xAxisLabel: 'X Axis',
	yAxisLabel: 'Y Axis'
});

// ============================================================================
// GETTERS
// ============================================================================

/**
 * Get current chart type
 * @returns {ChartType}
 */
export function getChartType() {
	return chartType;
}

/**
 * Get all layers
 * @returns {DataLayer[]}
 */
export function getLayers() {
	return layers;
}

/**
 * Get visible layers only
 * @returns {DataLayer[]}
 */
export function getVisibleLayers() {
	return layers.filter((l) => l.visible);
}

/**
 * Get a specific layer by ID
 * @param {string} layerId
 * @returns {DataLayer | undefined}
 */
export function getLayer(layerId) {
	return layers.find((l) => l.id === layerId);
}

/**
 * Get chart configuration
 * @returns {ChartConfig}
 */
export function getChartConfig() {
	return chartConfig;
}

/**
 * Get available color palette
 * @returns {string[]}
 */
export function getColorPalette() {
	return [...LAYER_COLORS];
}

// ============================================================================
// SETTERS
// ============================================================================

/**
 * Set chart type
 * @param {ChartType} type
 */
export function setChartType(type) {
	chartType = type;
}

/**
 * Set chart configuration
 * @param {Partial<ChartConfig>} config
 */
export function setChartConfig(config) {
	chartConfig = { ...chartConfig, ...config };
}

// ============================================================================
// LAYER MANAGEMENT
// ============================================================================

/**
 * Add a new empty layer
 * @returns {string} The new layer's ID
 */
export function addLayer() {
	const newLayer = createEmptyLayer(layers);
	layers = [...layers, newLayer];
	return newLayer.id;
}

/**
 * Remove a layer by ID
 * @param {string} layerId
 */
export function removeLayer(layerId) {
	if (layers.length <= 1) return; // Keep at least one layer
	layers = layers.filter((l) => l.id !== layerId);
}

/**
 * Update a layer's properties
 * @param {string} layerId
 * @param {Partial<DataLayer>} updates
 */
export function updateLayer(layerId, updates) {
	layers = layers.map((l) => {
		if (l.id === layerId) {
			return { ...l, ...updates };
		}
		return l;
	});
}

/**
 * Update a layer's mapping
 * @param {string} layerId
 * @param {Partial<LayerMapping>} mappingUpdates
 */
export function updateLayerMapping(layerId, mappingUpdates) {
	layers = layers.map((l) => {
		if (l.id === layerId) {
			return {
				...l,
				mapping: { ...l.mapping, ...mappingUpdates }
			};
		}
		return l;
	});
}

/**
 * Toggle layer visibility
 * @param {string} layerId
 */
export function toggleLayerVisibility(layerId) {
	layers = layers.map((l) => {
		if (l.id === layerId) {
			return { ...l, visible: !l.visible };
		}
		return l;
	});
}

/**
 * Move a layer up or down in the stack
 * @param {string} layerId
 * @param {'up' | 'down'} direction
 */
export function moveLayer(layerId, direction) {
	const index = layers.findIndex((l) => l.id === layerId);
	if (index === -1) return;

	const newIndex = direction === 'up' ? index - 1 : index + 1;
	if (newIndex < 0 || newIndex >= layers.length) return;

	const newLayers = [...layers];
	[newLayers[index], newLayers[newIndex]] = [newLayers[newIndex], newLayers[index]];
	layers = newLayers;
}

// ============================================================================
// DATA FETCHING
// ============================================================================

/**
 * Fetch data from an endpoint for a layer
 * @param {string} layerId
 * @param {string} endpoint
 * @returns {Promise<void>}
 */
export async function fetchLayerData(layerId, endpoint) {
	updateLayer(layerId, { 
		endpoint, 
		isLoading: true, 
		error: null,
		response: null 
	});

	try {
		const response = await fetch(endpoint);
		
		if (!response.ok) {
			throw new Error(`HTTP ${response.status}: ${response.statusText}`);
		}

		const data = await response.json();
		
		updateLayer(layerId, {
			response: data,
			isLoading: false,
			error: null
		});
	} catch (err) {
		updateLayer(layerId, {
			isLoading: false,
			error: err instanceof Error ? err.message : 'Failed to fetch data'
		});
	}
}

// ============================================================================
// DATA EXTRACTION
// ============================================================================

/**
 * Get value at a nested path in an object
 * @param {object} obj
 * @param {string} path - Dot-separated path (e.g., "data.items")
 * @returns {any}
 */
export function getValueAtPath(obj, path) {
	if (!path || path === '') return obj;
	return path.split('.').reduce((acc, key) => acc?.[key], obj);
}

/**
 * Extract chart-ready data from a layer
 * @param {DataLayer} layer
 * @returns {{ x: any, y: number, label: string, color: string }[]}
 */
export function extractLayerData(layer) {
	if (!layer.response || !layer.mapping.xProp || !layer.mapping.yProp) {
		return [];
	}

	const dataArray = getValueAtPath(layer.response, layer.mapping.dataPath);
	
	if (!Array.isArray(dataArray)) {
		return [];
	}

	return dataArray.map((item) => ({
		x: item[layer.mapping.xProp],
		y: Number(item[layer.mapping.yProp]) || 0,
		label: layer.mapping.labelProp ? String(item[layer.mapping.labelProp]) : String(item[layer.mapping.xProp]),
		color: layer.mapping.color
	}));
}

/**
 * Get all chart data from visible layers
 * @returns {{ layerId: string, layerName: string, color: string, data: { x: any, y: number, label: string }[] }[]}
 */
export function getAllChartData() {
	return getVisibleLayers().map((layer) => ({
		layerId: layer.id,
		layerName: layer.name,
		color: layer.mapping.color,
		data: extractLayerData(layer)
	}));
}

// ============================================================================
// JSON ANALYSIS
// ============================================================================

/**
 * Analyze JSON structure and find arrays with their properties
 * @param {any} obj
 * @param {string} [path='']
 * @returns {{ path: string, properties: { name: string, type: string }[], sampleItem: object | null }[]}
 */
export function analyzeJsonStructure(obj, path = '') {
	const results = [];

	if (Array.isArray(obj) && obj.length > 0) {
		const sampleItem = obj[0];
		const properties = Object.entries(sampleItem || {}).map(([name, value]) => ({
			name,
			type: typeof value
		}));
		
		results.push({
			path: path || '(root)',
			properties,
			sampleItem
		});
	}

	if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
		for (const [key, value] of Object.entries(obj)) {
			const newPath = path ? `${path}.${key}` : key;
			results.push(...analyzeJsonStructure(value, newPath));
		}
	}

	return results;
}

// ============================================================================
// CHART EXPORT
// ============================================================================

/**
 * Build the chart configuration object for saving
 * @returns {object}
 */
export function buildChartPayload() {
	return {
		chartType,
		config: chartConfig,
		layers: layers.map((layer) => ({
			id: layer.id,
			name: layer.name,
			endpoint: layer.endpoint,
			mapping: layer.mapping,
			visible: layer.visible
		})),
		createdAt: new Date().toISOString()
	};
}

/**
 * Reset the chart builder to initial state
 */
export function resetChartBuilder() {
	chartType = 'bar';
	layers = [createEmptyLayer([])];
	chartConfig = {
		title: 'New Chart',
		xAxisLabel: 'X Axis',
		yAxisLabel: 'Y Axis'
	};
}
