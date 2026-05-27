<script>
    import { onMount } from "svelte";
    import { containerStore } from "$lib/shared/containerStore.svelte.js";
    import ContainerCard from "$lib/components/containerCard.svelte";

    onMount(() => {
        containerStore.init();

        return () => {
            containerStore.disconnect();
        };
    });
</script>

{#if containerStore.errorMessage}
    <p>{containerStore.errorMessage}</p>
{/if}

<div>
    {#each containerStore.containers as container (container.id)}
        <ContainerCard {container} />
    {/each}
</div>
