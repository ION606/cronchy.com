<script setup lang="ts">
  const moved = ref(false);
  const cursor = ref();
  const cursorSmall = ref();
  const main = ref();

  onMounted(async () => {
    let cursorSmallShown = false;
    let lastMouseX = -1;
    let lastMouseY = -1;
    let scale = 300;
    const radius = 80;
    center();
    setTimeout(() => {
      main.value.style.opacity = 1;
    }, 800);
    setTimeout(() => {
      document.body.onpointermove = (e) => move(e.clientX, e.clientY);
      document.body.ontouchmove = (e) => {
        const touch = e.touches[0] || e.changedTouches[0];
        move(touch.clientX, touch.clientY);
      };
      const move = (x: number, y: number) => {
        console.log(x, y);

        if (
          x > window.innerWidth / 2 - radius &&
          x < window.innerWidth / 2 + radius &&
          y > window.innerHeight / 2 - radius &&
          y < window.innerHeight / 2 + radius
        )
          return small(x, y), center();

        cursorSmall.value.style.animation = "";
        cursorSmall.value.style.opacity = 0;
        cursorSmallShown = false;
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

        lastMouseX = x;
        lastMouseY = y;

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
          duration: 500,
          fill: "forwards",
        }
      );
    }
    function small(x: number, y: number) {
      cursorSmall.value.animate(
        {
          left: `${x}px`,
          top: `${y}px`,
        },
        {
          duration: 500,
          fill: "forwards",
        }
      );
      //TODO: fix animation
      cursorSmall.value.style.opacity = 0.8;
      if (!cursorSmallShown) {
        setTimeout(
          () =>
            (cursorSmall.value.style.animation =
              "spin infinite 200s linear, blink infinite 10s linear"),
          500
        );
      }
    }
  });
</script>
<template>
  <div class="grain absolute h-screen pointer-events-none"></div>
  <div ref="cursorSmall" id="cursorSmall" class="text-4xl">⋆</div>
  <div ref="cursor" id="cursor"></div>
  <main
    ref="main"
    class="flex justify-center items-center h-100dvh opacity-0 transition-opacity-500 select-none"
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
    /* user-select: none; */
  }

  #cursorSmall {
    position: absolute;
    transform: translate(-50%, -50%);
    border-radius: 50%;
    color: var(--primary);
    filter: blur(1px);
    z-index: -3;
    opacity: 0;
    line-height: 0px;
    transition: opacity 300ms;
  }
  @keyframes spin {
    from {
      transform: translate(-50%, -50%) rotate(0deg);
    }
    to {
      transform: translate(-50%, -50%) rotate(360deg);
    }
  }
  @keyframes blink {
    25% {
      opacity: 0.75;
    }
    50% {
      opacity: 0.5;
    }
    75% {
      opacity: 0.8;
    }
  }
  #cursor {
    position: absolute;
    width: calc(90dvw + 90dvh);
    height: calc(90dvw + 90dvh);
    top: 50dvh;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: black;
    border-radius: 50%;
    filter: blur(10px);
    z-index: -5;
  }
</style>
