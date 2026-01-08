<script>
	let { name, class: className = '', title = '', style = '' } = $props();

	let IconComponent = $state(null);

	// Use import.meta.glob for Vite-compatible dynamic imports
	const iconModules = import.meta.glob('./icons/*.svelte');

	const loadIcon = async (iconName) => {
		const path = `./icons/${iconName}.svelte`;
		if (iconModules[path]) {
			try {
				const module = await iconModules[path]();
				return module.default;
			} catch (error) {
				console.error(`Error loading icon: ${iconName}`, error);
				return null;
			}
		} else {
			console.error(`Icon not found: ${iconName}`);
			return null;
		}
	};

	// $effect() runs side effects when dependencies change (similar to useEffect)
	$effect(() => {
		loadIcon(name).then((component) => {
			IconComponent = component;
		});
	});
</script>

{#if IconComponent}
	<span {title} {style}>
		<IconComponent class={className} />
	</span>
{:else}
	<!-- Placeholder while loading to prevent layout shift -->
	<span class={`${className} flex h-4 w-4 items-center justify-center`} aria-hidden="true" {title}
		>&nbsp;</span
	>
{/if}
