<script setup lang="ts">
  const moved = ref(false);
  const cursor = ref();
  const main = ref();

  onMounted(async () => {
    let lastMouseX = -1;
    let lastMouseY = -1;
    let scale = 300;
    const radius = 80;
    center();
    setTimeout(() => {
      main.value.style.opacity = 1;
    }, 800);
    setTimeout(() => {
      document.body.onpointermove = (event) => {
        const { clientX, clientY } = event;
        console.log(clientX, clientY);
        if (
          clientX > window.innerWidth / 2 - radius &&
          clientX < window.innerWidth / 2 + radius &&
          clientY > window.innerHeight / 2 - radius &&
          clientY < window.innerHeight / 2 + radius
        )
          return center();
        scale = 70;
        cursor.value.animate(
          {
            height: `${scale}px`,
            width: `${scale}px`,
            left: `${lastMouseX}px`,
            top: `${lastMouseY}px`,
          },
          {
            duration: 1500,
            fill: "forwards",
          }
        );

        lastMouseX = clientX;
        lastMouseY = clientY;

        moved.value = true;
      };
    }, 2000);

    function center() {
      scale = 300;
      
      cursor.value.animate(
        {
          height: `${scale}px`,
          width: `${scale}px`,
          left: `50dvw`,
          top: `50dvh`,
        },
        {
          duration: 1000,
          fill: "forwards",
        }
      );
    }
  });
</script>
<template>
  <div class="grain absolute h-screen"></div>
  <div ref="cursor" id="cursor"></div>
  <main
    ref="main"
    class="flex justify-center items-center h-100dvh opacity-0 transition-opacity-500"
  >
    <h2>W.I.P</h2>
  </main>
</template>

<style>
  @import url("https://fonts.cdnfonts.com/css/impact");
  :root {
    --primary: #6a5674;
    cursor: none;
  }

  body {
    overflow: hidden;
    background: linear-gradient(
      45deg,
      rgba(107, 86, 116, 0.78),
      rgba(157, 132, 164, 0.78)
    );
  }

  .grain {
    background: url(/grain.svg);
    width: 100%;
    height: 100%;
    opacity: 0.5;
  }

  h2 {
    font: 900 1.5rem impact;
    color: var(--primary);
    user-select: none;
  }

  #cursor {
    position: absolute;
    width: calc(100dvw + 100dvh);
    height: calc(100dvw + 100dvh);
    top: 50dvh;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: black;
    border-radius: 50%;
    filter: blur(10px);
    z-index: -5;
  }
</style>
