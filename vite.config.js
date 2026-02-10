import path from 'path';
import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	resolve: {
		alias: {
			'@app-css': path.resolve('./src/routes/app.css'),
		}
	},
	css: {
		preprocessorOptions: {
			css: {
				importLoaders: 1
			}
		}
	}
});
