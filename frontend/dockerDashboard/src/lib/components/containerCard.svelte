<script>
    import { authState } from "$lib/shared/authStore.svelte.js";

    let isProcessing = $state(false);

    let { container } = $props();
    console.log($state.snapshot(container));

    async function handleAction(action) {
        // Optional: Bestätigungsdialog (wie im Konzept gefordert!)
        if (
            action === "stop" &&
            !confirm(`Do you really want to stop ${container.name}?`)
        )
            elseif(
                action === "restart" &&
                    !confirm(
                        `Do you really want to resetart ${container.name}?`,
                    ),
            );
        {
            return;
        }

        isProcessing = true;

        try {
            const res = await fetch(
                `http://localhost:3000/api/container/${container.id}/${action}`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${authState.token}`,
                    },
                },
            );

            if (!res.ok) {
                alert(`Fehler beim ${action} von ${container.name}`);
            }
        } catch (error) {
            console.error(error);
            alert("Networkerror");
        } finally {
            isProcessing = false;
        }
    }
</script>

<div>
    <p>{container.id}</p>

    <p>{container.name}</p>

    <p>{container.cpu}</p>

    <p>{container.ram}</p>

    <p>{container.state}</p>
    <img src={container.image} alt="" />

    {#if container.state == "exited"}
        <button onclick={() => handleAction("start")} disabled={isProcessing}
            >Start</button
        >
    {:else if container.state == "running"}
        <button onclick={() => handleAction("stop")} disabled={isProcessing}
            >Stop</button
        >
        <button onclick={() => handleAction("restart")} disabled={isProcessing}
            >Restart</button
        >
    {:else if container.state == "created"}
        <button onclick={() => handleAction("start")} disabled={isProcessing}
            >Start</button
        >
    {/if}
</div>
