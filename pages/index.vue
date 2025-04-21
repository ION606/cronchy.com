<script setup lang="ts">
  import { onMounted, ref } from "vue";
  import { gsap } from "gsap";

  const moved = ref(false);
  const cursor = ref<HTMLDivElement | null>(null);
  const cursorSmall = ref<HTMLDivElement | null>(null);
  const main = ref<HTMLDivElement | null>(null);
  const userTheme = useCookie<"dark" | "light">("user-theme", {
    watch: true,
  });

  type HoverSnapEl = {
    rect: DOMRect;
    size?: string;
    distance?: number;
    radius?: string;
    x?: string;
    y?: string;
  };

  function toggleTheme() {
    userTheme.value === "dark" ? setTheme("light") : setTheme("dark");
  }

  function setTheme(theme: "dark" | "light") {
    userTheme.value = theme;
    document.documentElement.className = theme;
  }

  onMounted(async () => {
    setTheme(userTheme.value || "dark");

    let rects: HoverSnapEl[] = [];
    let cursorSmallShown = false;
    let lastMouseX = -1;
    let lastMouseY = -1;
    let size = 300;

    load();

    setTimeout(() => {
      if (main.value) {
        gsap.to(main.value, { opacity: 1, duration: 0.5 });
      }
    }, 300);

    updateRects();

    window.onmousemove = (e) => small(e.pageX, e.pageY);
    window.ontouchmove = (e) => {
      const touch = e.touches[0] || e.changedTouches[0];
      small(touch.pageX, touch.pageY);
    };
    let inactiveTimeout: NodeJS.Timeout;
    setTimeout(() => {
      function update() {
        updateRects();
        move(lastMouseX, lastMouseY);
      }
      window.onscroll = update;
      window.onresize = update;

      window.onmousemove = (e) => move(e.clientX, e.clientY);
      window.ontouchmove = (e) => {
        const touch = e.touches[0] || e.changedTouches[0];
        move(touch.clientX, touch.clientY);
      };

      const move = (x: number, y: number) => {
        clearTimeout(inactiveTimeout);
        lastMouseX = x;
        lastMouseY = y;
        let closestRect = null;
        let closestDistance = Infinity;

        for (let e of rects) {
          const { rect, distance } = e;
          const centerX = rect.x + rect.width / 2;
          const centerY = rect.y + rect.height / 2;
          const d = getDistance(x, y, centerX, centerY);
          const radius = distance || 50;

          if (
            x > centerX - radius - rect.width / 2 &&
            x < centerX + radius + rect.width / 2 &&
            y > centerY - radius - rect.height &&
            y < centerY + radius + rect.height &&
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

        if (cursorSmall.value) {
          gsap.to(cursorSmall.value, {
            opacity: 0,
            duration: 0.5,
          });
          cursorSmall.value.style.top = `${y}px`;
          cursorSmall.value.style.left = `${x}px`;
          cursorSmall.value.style.animation = "spin infinite 200s linear";
        }
        cursorSmallShown = false;
        size = 70;

        if (cursor.value) {
          gsap.to(cursor.value, {
            height: size,
            width: size,
            left: x,
            top: y,
            borderRadius: "50%",
            duration: 0.5,
          });
        }

        moved.value = true;
        inactiveTimeout = setTimeout(load, 2000);
      };
    }, 1500);

    function snap(e: HoverSnapEl) {
      if (!e.size) e.size = `${Math.max(e.rect.width, e.rect.height) + 100}px`;
      let pos: { x: number | undefined; y: number | undefined } = {
        x: undefined,
        y: undefined,
      };
      if (e.x?.endsWith("%"))
        pos.x = window.innerWidth * (parseInt(e.x.replace("%", "")) * 0.01);
      if (e.y?.endsWith("%"))
        pos.y = window.innerHeight * (parseInt(e.y.replace("%", "")) * 0.01);
      if (cursor.value) {
        gsap.to(cursor.value, {
          height: e.size,
          width: e.size,
          left: pos.x ?? e.rect.x + e.rect.width / 2,
          top: pos.y ?? e.rect.y + e.rect.height / 2,
          borderRadius: e.radius,
          duration: 0.5,
        });
      }
    }

    function load() {
      const loadFocus = document.getElementsByClassName("load-focus")[0];
      if (loadFocus) {
        snap(getHSEl(loadFocus));
      }
    }

    function small(x: number, y: number) {
      if (cursorSmall.value) {
        gsap.to(cursorSmall.value, {
          left: x,
          top: y,
          duration: 0.4,
        });
        cursorSmall.value.style.opacity = "0.8";
        if (!cursorSmallShown) {
          if (cursorSmall.value) {
            cursorSmall.value.style.animation =
              "spin infinite 200s linear, blink infinite 5s linear";
          }
        }
      }
    }

    function getHSEl(el: Element): HoverSnapEl {
      return {
        rect: el.getBoundingClientRect(),
        size: el.getAttribute("hs-size") ?? undefined,
        distance: Number(el.getAttribute("hs-dist")) ?? undefined,
        radius: el.getAttribute("hs-br") ?? "50%",
        x: el.getAttribute("hs-x") ?? undefined,
        y: el.getAttribute("hs-y") ?? undefined,
      };
    }

    function updateRects() {
      const hovers = document.getElementsByClassName("hover");
      let newRects: HoverSnapEl[] = [];
      for (let hover of hovers) {
        newRects.push(getHSEl(hover));
      }
      rects = newRects;
    }

    function debounce<T extends unknown[], U>(
      callback: (...args: T) => PromiseLike<U> | U,
      wait: number
    ) {
      let timer: NodeJS.Timeout;

      return (...args: T): Promise<U> => {
        clearTimeout(timer);
        return new Promise((resolve) => {
          timer = setTimeout(() => resolve(callback(...args)), wait);
        });
      };
    }

    function getDistance(x1: number, y1: number, x2: number, y2: number) {
      return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    }
  });
</script>

<template>
  <div class="grain fixed pointer-events-none"></div>

  <div class="fixed size-100% z-10 pointer-events-none">
    <div
      ref="cursorSmall"
      id="cursorSmall"
      class="text-4xl pointer-events-none select-none"
    >
      ⋆
    </div>
  </div>
  <div class="fixed size-100% z--1 pointer-events-none">
    <div ref="cursor" id="cursor"></div>
  </div>
  <main
    ref="main"
    class="flex px-10 py30 text-center justify-center flex-col space-y-20 items-center min-h-100dvh py-10 opacity-0 transition-opacity-500"
  >
    <!-- <h2
      hs-size="93vw"
      hs-br="30%"
      hs-dist="32"
      @click="toggleTheme()"
      class="hover color fixed right-5 top-5 px-5 my-5 transition-color-500 select-none"
    >
      THEME
    </h2> -->
    <div class="flex flex-col gap-5 load-focus hover items-center">
      <img
        src="https://pfp.crun.zip/verycrunchy.com/home"
        class="min-w-100% w-80vw max-w-70 rounded-full"
      />
      <div>
        <h2 class=" ">veryCrunchy</h2>
        <p class="text-white op-70">Fullstack Developer</p>
      </div>
    </div>

    <SponsorsList class="hover" hs-dist="100" />
    <DonationOptions class="hover" hs-dist="100" />
  </main>
</template>

<style>
  @import url("https://fonts.cdnfonts.com/css/impact");

  :root {
    --primary: #c2a6ff;
    --opposite-light: -webkit-linear-gradient(
      135deg,
      oklch(0.17 0.0251 279.7),
      oklch(0.25 0.0571 266.71)
    );

    --opposite: var(--opposite-light);

    --bg-light: linear-gradient(135deg, #6c3b95, #8245b0);
    --opposite-dark: var(--bg-light);
    --bg-color: oklch(0.17 0.0251 279.7);
    cursor: none;
    transition: background 1s, color 1s;
    --bg: var(--bg-light);
    --neon-glow: 0 0 15px var(--primary), 0 0 30px var(--primary);
    --grain-overlay: url(/grain.svg);
  }

  :root.dark {
    --primary: #c2a6ff;
    --opposite: var(--opposite-dark);
    --opposite-other: var(--opposite-light);
    --bg-color: #0d0e1a;
    --bg: var(--opposite-light);
  }

  .color {
    transition: background 0.5s, color 0.5s;
    color: var(--primary);
    background: var(--opposite-other);
    background-clip: text;
    filter: drop-shadow(0 0 15px var(--primary));
    text-shadow: var(--neon-glow);
  }

  .color:hover {
    color: transparent;
    background: var(--primary);
    -webkit-background-clip: text;
    filter: drop-shadow(var(--neon-glow));
  }

  ::selection {
    background: rgb(69, 48, 95);
    color: rgb(208, 141, 255);
  }

  body {
    transition: background 5.5s, background-color 5.5s;
    background-color: var(--bg-color);
    background-blend-mode: overlay;
  }

  .grain {
    background: var(--grain-overlay);
    background-size: 150px 150px;
    opacity: 0.3;
    mix-blend-mode: soft-light;
    width: 100%;
    height: 100%;
  }

  h1,
  h2,
  span,
  h3,
  p {
    transition: color 0.5s;
    font-family: impact;
    color: var(--primary);
    text-shadow: 0 0 20px rgba(194, 166, 255, 0.2);
  }
  h1,
  h2 {
    color: var(--primary);
    text-shadow: 0 0 15px var(--primary), 0 0 30px var(--primary);
  }
  h2 {
    font-size: 2rem;
  }

  p {
    font-size: 1rem;
  }

  @media (max-width: 800px) {
    h2 {
      font-size: 1.5rem;
    }
  }

  #cursorSmall {
    position: absolute;
    transform: translate(-50%, -50%);
    border-radius: 50%;
    top: -100px;
    left: 50;
    color: var(--primary);
    filter: blur(1px) drop-shadow(var(--neon-glow));
    z-index: 50;
    opacity: 1;
    line-height: 0px;
    transition: transform 0.1s ease-out;
  }

  @keyframes spin {
    from {
      transform: translate(-50%, -50%) rotate(0deg) scale(1);
    }
    to {
      transform: translate(-50%, -50%) rotate(360deg) scale(1.1);
    }
  }

  @keyframes blink {
    0%,
    100% {
      opacity: 0.8;
    }
    50% {
      opacity: 0.4;
    }
  }

  #cursor {
    position: absolute;
    width: calc(100vw + 100vh);
    height: calc(100vw + 100vh);
    top: 50vh;
    left: 50%;
    transform: translate(-50%, -50%);
    background: radial-gradient(circle, var(--primary) 0%, transparent 70%);
    border-radius: 50%;
    overflow: hidden;
    filter: blur(100px) brightness(1.2);
    opacity: 0.5;
    z-index: -5;
    transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .hover {
    transition: transform 0.3s ease, filter 0.3s ease;
  }

  .hover:hover {
    transform: scale(1.05);
    filter: drop-shadow(var(--neon-glow));
  }
</style>
