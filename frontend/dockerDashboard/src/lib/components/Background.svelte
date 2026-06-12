<!-- frontend/dockerDashboard/src/lib/components/Background.svelte -->
<div class="background-container">
    <div class="dots-layer"></div>
    <div class="glow-layer"></div>
</div>

<style>
    .background-container {
        position: fixed;
        inset: 0;
        z-index: 0;
        pointer-events: none;
        overflow: hidden;
        --dot-color-1: rgba(16, 185, 129, 0.05);
        --dot-color-2: rgba(99, 102, 241, 0.03);
        --glow-color-1: rgba(16, 185, 129, 0.03);
        --glow-color-2: rgba(99, 102, 241, 0.03);
    }

    :global(body:not(.dark-mode)) .background-container {
        --dot-color-1: rgba(16, 185, 129, 0.15);
        --dot-color-2: rgba(99, 102, 241, 0.1);
        --glow-color-1: rgba(16, 185, 129, 0.05);
        --glow-color-2: rgba(99, 102, 241, 0.05);
    }

    /* Floating Dots Pattern */
    .dots-layer {
        position: absolute;
        inset: -100px;
        background-image: radial-gradient(circle at 2px 2px, var(--dot-color-1) 1px, transparent 0);
        background-size: 40px 40px;
        animation: drift 120s linear infinite;
    }

    .dots-layer::after {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(circle at 5px 5px, var(--dot-color-2) 1px, transparent 0);
        background-size: 70px 70px;
        transform: rotate(15deg);
        animation: drift 180s linear reverse infinite;
    }

    /* Soft Glows */
    .glow-layer {
        position: absolute;
        inset: 0;
        background: 
            radial-gradient(circle at 20% 30%, var(--glow-color-1) 0%, transparent 40%),
            radial-gradient(circle at 80% 70%, var(--glow-color-2) 0%, transparent 40%);
        filter: blur(80px);
    }

    @keyframes drift {
        from {
            transform: translate(0, 0);
        }
        to {
            transform: translate(40px, 40px);
        }
    }
</style>
