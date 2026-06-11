<script>
    import { onMount } from "svelte";
    import Chart from "chart.js/auto";

    // Erwartet Arrays mit Objekten: { time: string, cpu: number, ram: number }
    let { historyData = [] } = $props();

    let canvasRef;
    let chartInstance;

    $effect(() => {
        // Wenn sich historyData ändert, Chart updaten
        if (chartInstance && historyData.length > 0) {
            chartInstance.data.labels = historyData.map((d) => d.time);
            chartInstance.data.datasets[0].data = historyData.map((d) => d.cpu);
            chartInstance.data.datasets[1].data = historyData.map((d) => d.ram);
            chartInstance.update("none"); // 'none' verhindert Flackern bei Live-Updates
        }
    });

    onMount(() => {
        const ctx = canvasRef.getContext("2d");
        chartInstance = new Chart(ctx, {
            type: "line",
            data: {
                labels: [],
                datasets: [
                    {
                        label: "CPU (%)",
                        data: [],
                        borderColor: "#10b981", // emerald-500
                        backgroundColor: "rgba(16, 185, 129, 0.1)",
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 0,
                    },
                    {
                        label: "RAM (MB)",
                        data: [],
                        borderColor: "#3b82f6", // blue-500
                        backgroundColor: "rgba(59, 130, 246, 0.1)",
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 0,
                        yAxisID: "y1",
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: false,
                interaction: {
                    mode: "index",
                    intersect: false,
                },
                scales: {
                    x: {
                        display: true,
                        grid: { color: "rgba(255, 255, 255, 0.05)" },
                        ticks: { color: "#a1a1aa", maxTicksLimit: 10 },
                    },
                    y: {
                        type: "linear",
                        display: true,
                        position: "left",
                        grid: { color: "rgba(255, 255, 255, 0.05)" },
                        ticks: { color: "#a1a1aa" },
                        title: {
                            display: true,
                            text: "CPU %",
                            color: "#10b981",
                        },
                    },
                    y1: {
                        type: "linear",
                        display: true,
                        position: "right",
                        grid: { drawOnChartArea: false },
                        ticks: { color: "#a1a1aa" },
                        title: {
                            display: true,
                            text: "RAM MB",
                            color: "#3b82f6",
                        },
                    },
                },
                plugins: {
                    legend: { labels: { color: "#e4e4e7" } },
                },
            },
        });

        return () => {
            if (chartInstance) chartInstance.destroy();
        };
    });
</script>

<div class="h-64 w-full">
    <canvas bind:this={canvasRef}></canvas>
</div>
