<script>
    import { onMount } from "svelte";
    import { authState } from "$lib/shared/authStore.svelte.js";
    import ContainerCard from "$lib/components/containerCard.svelte";

    let containers = $state([]);
    let errorMessage = $state("");

    onMount(async () => {
        try {
            const res = await fetch("http://localhost:3000/api/container", {
                method: "GET", // GET is the default, but good to be explicit
                headers: {
                    Authorization: `Bearer ${authState.token}`,
                    "Content-Type": "application/json",
                },
            });
            if (res.ok) {
                const rawContainers = await res.json();

                containers = rawContainers.map((c) => ({
                    ...c,
                    cpu: "...",
                    ram: "...",
                }));
                console.log(containers);
            } else {
                errorMessage = "Failed to load containers from API.";
            }
        } catch (error) {
            errorMessage = "Connection error to API.";
        }

        const socket = new WebSocket("ws://localhost:3000/ws/stats");

        socket.onmessage = (event) => {
            const liveStats = JSON.parse(event.data);

            containers = containers.map((container) => {
                const freshStats = liveStats.find(
                    (stat) => stat.id === container.id,
                );

                if (freshStats) {
                    return {
                        ...container,
                        cpu: freshStats.cpu,
                        ram: freshStats.ram,
                    };
                }
                return container;
            });
        };
        socket.onerror = () => {
            console.error("WebSocket connection error");
        };
        return () => {
            if (socket) {
                console.log("Closing WebSocket...");
                socket.close();
            }
        };
    });
</script>

<p>{errorMessage}</p>

{#each containers as container}
    <ContainerCard {container}></ContainerCard>
{/each}
