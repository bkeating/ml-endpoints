/**
 * LLM Benchmark placeholder data
 * Each model has points with x (latency in seconds) and y (throughput in tok/s/gpu)
 * Data trends upward from near zero as latency increases
 */

export const models = [
	{
		id: 'h100-vllm',
		name: 'H100 (vLLM)',
		color: '#22c55e', // green-500
		points: [
			{ x: 5, y: 800 },
			{ x: 15, y: 1800 },
			{ x: 30, y: 2900 },
			{ x: 50, y: 4200 },
			{ x: 75, y: 5100 },
			{ x: 100, y: 5800 },
			{ x: 130, y: 6300 },
			{ x: 160, y: 6600 },
			{ x: 185, y: 6800 }
		]
	},
	{
		id: 'h200-vllm',
		name: 'H200 (vLLM)',
		color: '#3b82f6', // blue-500
		points: [
			{ x: 5, y: 1200 },
			{ x: 15, y: 2600 },
			{ x: 30, y: 4100 },
			{ x: 50, y: 5600 },
			{ x: 75, y: 6900 },
			{ x: 100, y: 7800 },
			{ x: 130, y: 8400 },
			{ x: 160, y: 8800 },
			{ x: 185, y: 9000 }
		]
	},
	{
		id: 'h200-trt',
		name: 'H200 (TRT)',
		color: '#f59e0b', // amber-500
		points: [
			{ x: 5, y: 1500 },
			{ x: 15, y: 3200 },
			{ x: 30, y: 4800 },
			{ x: 50, y: 6400 },
			{ x: 75, y: 7700 },
			{ x: 100, y: 8600 },
			{ x: 130, y: 9200 },
			{ x: 160, y: 9600 },
			{ x: 185, y: 9900 }
		]
	},
	{
		id: 'b200-trt',
		name: 'B200 (TRT)',
		color: '#ec4899', // pink-500
		points: [
			{ x: 5, y: 2000 },
			{ x: 15, y: 4200 },
			{ x: 30, y: 6200 },
			{ x: 50, y: 8000 },
			{ x: 75, y: 9400 },
			{ x: 100, y: 10200 },
			{ x: 130, y: 10800 },
			{ x: 160, y: 11200 },
			{ x: 185, y: 11500 }
		]
	}
];

/**
 * Get model IDs as an array
 * @returns {string[]}
 */
export const getModelIds = () => models.map((m) => m.id);

/**
 * Get a model by its ID
 * @param {string} id
 * @returns {typeof models[0] | undefined}
 */
export const getModelById = (id) => models.find((m) => m.id === id);
