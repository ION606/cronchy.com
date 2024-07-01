<script setup lang="ts">
  const moved = ref(false);
  const cursor = ref();
  const cursorSmall = ref();
  const main = ref();
  let width = 0;
  type HoverSnapEl = {
    rect: DOMRect;
    size?: string;
    distance?: number;
    radius?: string;
  };

  onMounted(async () => {
    // const initUserTheme = this.getMediaPreference();
    // document.setTheme(initUserTheme);
    let rects: HoverSnapEl[] = [];
    let cursorSmallShown = false;
    let lastMouseX = -1;
    let lastMouseY = -1;
    let size = 300;
    const radius = 80;

    const loadInterval = setInterval(() => {
      load();
    }, 0);
    setTimeout(() => {
      main.value.style.opacity = 1;
    }, 800);

    updateRects();
    setInterval(() => {
      updateRects();
    }, 1000);

    setTimeout(() => {
      document.body.onscroll = (e) => {
        cursor.value.animate(
          {
            height: `${size}px`,
            width: `${size}px`,
          },
          {
            duration: 500,
            fill: "forwards",
          }
        );
      };
      document.body.onmousemove = (e) => move(e.pageX, e.pageY);
      document.body.ontouchmove = (e) => {
        const touch = e.touches[0] || e.changedTouches[0];
        move(touch.pageX, touch.pageY);
      };
      const move = (x: number, y: number) => {
        console.log(lastMouseY, window.scrollY);

        clearInterval(loadInterval);
        lastMouseX = x;
        lastMouseY = y;
        let closestRect = null;
        let closestDistance = Infinity;

        for (let e of rects) {
          const { rect, distance } = e;
          let centerX = rect.x + rect.width / 2;
          let centerY = rect.y + window.scrollY + rect.height / 2;
          let d = getDistance(x, y, centerX, centerY);
          const radius = distance || 80;

          if (
            x > centerX - radius &&
            x < centerX + radius &&
            y > centerY - radius &&
            y < centerY + radius &&
            d < closestDistance
          ) {
            closestDistance = d;
            closestRect = e;
          }
        }

        if (closestRect) {
          small(x, y);
          snap(closestRect);
          return;
        }

        cursorSmall.value.style.animation = "spin infinite 200s linear";
        cursorSmall.value.style.opacity = 0;
        cursorSmallShown = false;
        size = 70;

        cursor.value.animate(
          {
            height: `${size}px`,
            width: `${size}px`,
            left: `${x}px`,
            top: `${y - window.scrollY}px`,
            borderRadius: "50%",
          },
          {
            duration: 1500,
            fill: "forwards",
          }
        );

        moved.value = true;
      };
    }, 2000);

    function snap(e: HoverSnapEl) {
      if (!e.size) e.size = `${Math.max(e.rect.width, e.rect.height) + 100}px`;

      cursor.value.animate(
        {
          height: e.size,
          width: e.size,
          left: `${e.rect.x + e.rect.width / 2}px`,
          top: `${e.rect.y + e.rect.height / 2}px`,
          borderRadius: e.radius,
        },
        {
          duration: 500,
          fill: "forwards",
        }
      );
    }
    function load() {
      const loadFocus = document.getElementsByClassName("load-focus")[0];

      snap(getHSEl(loadFocus));
    }
    function small(x: number, y: number) {
      cursorSmall.value.animate(
        {
          left: `${x}px`,
          top: `${y - window.scrollY}px`,
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
              "spin infinite 200s linear, blink infinite 5s linear"),
          500
        );
      }
    }

    window.addEventListener("scroll", updateRects);
    function getHSEl(el: Element): HoverSnapEl {
      return {
        rect: el.getBoundingClientRect(),
        size: el.getAttribute("hs-size") ?? undefined,
        distance: Number(el.getAttribute("hs-dist")) ?? undefined,
        radius: el.getAttribute("hs-br") ?? "50%",
      };
    }
    function updateRects() {
      // Force reflow to get updated rects
      const hovers = document.getElementsByClassName("hover");
      let newRects: HoverSnapEl[] = [];
      for (let hover of hovers) {
        newRects.push(getHSEl(hover));
      }
      rects = newRects;
    }
    function getDistance(x1: number, y1: number, x2: number, y2: number) {
      return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    }
  });
</script>
<template>
  <div class="grain fixed pointer-events-none"></div>

  <div class="fixed w-100% h-100% z--1 pointer-events-none">
    <div ref="cursorSmall" id="cursorSmall" class="text-4xl z-50">⋆</div>
    <div ref="cursor" id="cursor"></div>
  </div>
  <main
    ref="main"
    class="flex justify-center flex-col space-y-20 items-center min-h-100vh py-10 opacity-0 transition-opacity-500"
  >
    <h2
      hs-size="93vw"
      hs-br="30%"
      :hs-dist="32"
      class="hover absolute right-10 top-5 py-5 text-black hover:text-white transition-color-500"
    >
      THEME
    </h2>
    <div class="flex flex-col items-center">
      <h2 hs-size="300px" class="hover load-focus">W.I.P</h2>
      <p class="text-purple-100 op-50 text-center">
        Enjoy this small prototype ♥
      </p>
    </div>
    <div class="text-center">
      <h2 class="hover">Cursor</h2>
      <h2 class="hover">Snaps</h2>
      <h2 class="hover">To</h2>
      <h2 class="hover">Closest</h2>
      <h2 class="hover">Element</h2>
    </div>
    <h2 class="hover">CURSOR SCALES BASED ON ELEMENT SIZE</h2>
    <h2 hs-size="110vw" hs-br="0" class="hover">
      ELEMENTS CAN MODIFY THE CURSOR IN NUMEROUS WAYS
    </h2>
  </main>
</template>

<style>
  @import url("https://fonts.cdnfonts.com/css/impact");
  :root {
    --primary: #6a5674;
    --opposite: black;
    cursor: none;
  }
  :root.dark-theme {
    --primary: black;
    --opposite: #6a5674;
  }

  ::selection {
    background: rgb(69, 48, 95);
    color: rgb(208, 141, 255);
  }

  body {
    background: linear-gradient(
      45deg,
      rgba(107, 86, 116, 0.78),
      rgba(157, 132, 164, 0.78)
    );
  }

  .grain {
    background: url(/grain.svg);
    background-repeat: repeat;
    width: 100%;
    height: 100%;
    opacity: 0.5;
  }

  h2,
  p {
    font-family: impact;
    color: var(--primary);
    /* user-select: none; */
  }
  h2 {
    font-size: 1.5rem;
  }

  p {
    font-size: 1rem;
  }

  @media (max-width: 1000px) {
    h2 {
      font-size: 1rem;
    }
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
    width: calc(90vw + 90vw);
    height: calc(90vh + 90vh);
    top: 50vh;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: var(--opposite);
    border-radius: 50%;
    overflow: hidden;
    filter: blur(10px);
    z-index: -5;
  }
</style>
