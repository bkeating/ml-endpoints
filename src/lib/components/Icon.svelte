<script>
	let { name, class: className = '', title = '', style = '' } = $props();

	let IconComponent = $state(null);

	const dynamicImport = async (iconName) => {
		try {
			const module = await import(`$lib/components/icons/${iconName}.svelte`);
			return module.default;
		} catch (error) {
			console.error(`Error loading icon: ${iconName}`, error);
			return null;
		}
	};

	// $effect() runs side effects when dependencies change (similar to useEffect)
	$effect(() => {
		dynamicImport(name).then((component) => {
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
