<script>
	import { authState } from "$lib/shared/authStore.svelte.js";
	import { goto } from "$app/navigation";
	import { page } from "$app/stores";

	let { children } = $props();

	$effect(() => {
		const currentPath = $page.url.pathname;

		if (typeof window !== "undefined") {
			if (!authState.isAuthenticated && currentPath !== "/login") {
				goto("/login");
			}

			if (authState.isAuthenticated && currentPath === "/login") {
				goto("/");
			}
		}
	});
</script>

{#if typeof window !== "undefined"}
	{#if authState.isAuthenticated || $page.url.pathname === "/login"}
		{@render children()}
	{:else}
		<div
			class="flex h-screen w-screen items-center justify-center bg-zinc-950 text-white"
		>
			<p>Wird geladen...</p>
		</div>
	{/if}
{/if}
