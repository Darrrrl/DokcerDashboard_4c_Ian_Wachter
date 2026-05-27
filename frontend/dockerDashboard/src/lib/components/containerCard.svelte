<script>
    const container = $props();
    console.log($state.snapshot(container));
</script>

<div>
    <p>{container.container.id}</p>

    <p>{container.container.name}</p>

    <p>{container.container.cpu}</p>

    <p>{container.container.ram}</p>

    <p>{container.container.status}</p>
    <img src={container.container.image} alt="" />
</div>
