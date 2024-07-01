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
    const radius = 80;

    const loadInterval = setInterval(() => {
      load();
    }, 0);

    setTimeout(() => {
      if (main.value) {
        gsap.to(main.value, { opacity: 1, duration: 0.5 });
      }
    }, 300);

    updateRects();
    setInterval(() => {
      updateRects();
    }, 1000);

    setTimeout(() => {
      document.body.onscroll = () => {
        if (cursor.value) {
          gsap.to(cursor.value, { height: size, width: size, duration: 0.5 });
        }
      };

      document.body.onmousemove = (e) => move(e.pageX, e.pageY);
      document.body.ontouchmove = (e) => {
        const touch = e.touches[0] || e.changedTouches[0];
        move(touch.pageX, touch.pageY);
      };

      const move = (x: number, y: number) => {
        clearInterval(loadInterval);
        lastMouseX = x;
        lastMouseY = y;
        let closestRect = null;
        let closestDistance = Infinity;

        for (let e of rects) {
          const { rect, distance } = e;
          const centerX = rect.x + rect.width / 2;
          const centerY = rect.y + window.scrollY + rect.height / 2;
          const d = getDistance(x, y, centerX, centerY);
          const radius = distance || 40;

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
          duration: 0.5,
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

    window.addEventListener("scroll", updateRects);

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

    function getDistance(x1: number, y1: number, x2: number, y2: number) {
      return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    }
  });
</script>

<template>
  <div class="grain fixed pointer-events-none"></div>

  <div
    ref="cursorSmall"
    id="cursorSmall"
    class="text-4xl pointer-events-none select-none"
  >
    ⋆
  </div>
  <div class="fixed w-100% h-100% z--1 pointer-events-none">
    <div ref="cursor" id="cursor"></div>
  </div>
  <main
    ref="main"
    class="flex px-10 text-center justify-center flex-col space-y-20 items-center min-h-100vh py-10 opacity-0 transition-opacity-500"
  >
    <h2
      hs-size="93vw"
      hs-br="30%"
      hs-dist="32"
      @click="toggleTheme()"
      class="hover color absolute right-10 top-5 my-5 transition-color-500 select-none"
    >
      THEME
    </h2>
    <div class="flex flex-col items-center">
      <h2 hs-size="300px" class="hover load-focus">W.I.P</h2>
      <p class="text-white op-70">Enjoy this small prototype ♥</p>
    </div>
    <div>
      <h2 class="hover">Cursor</h2>
      <h2 class="hover">Snaps</h2>
      <h2 class="hover">To</h2>
      <h2 class="hover">Closest</h2>
      <h2 class="hover">Element</h2>
    </div>
    <h2 class="hover">CURSOR SCALES BASED ON ELEMENT SIZE</h2>
    <h2 hs-size="calc(100vw + 100vh)" hs-y="50%" hs-br="0" class="hover">
      ELEMENTS CAN MODIFY THE CURSOR IN NUMEROUS WAYS
    </h2>
  </main>
</template>

<style>
  @import url("https://fonts.cdnfonts.com/css/impact");

  :root {
    --primary: #d7aceb;
    --opposite-other: var(--opposite-dark);
    --opposite: var(--opposite-light);
    --opposite-light: linear-gradient(45deg, rgba(7, 0, 8), rgba(11, 0, 13));
    --bg-light: linear-gradient(45deg, rgba(129, 89, 146), rgba(180, 119, 197));
    --opposite-dark: var(--bg-light);
    --bg-color: black;
    cursor: none;
    transition: background 1.5s, color 1.5s;

    --bg: var(--bg-light);
  }

  :root.dark {
    --primary: #d7aceb;
    --opposite: var(--opposite-dark);
    --opposite-other: var(--opposite-light);
    --bg-color: black;
    --bg: var(--opposite-light);
  }

  .color {
    transition: background 0.5s, color 0.5s;
    color: var(--primary);
    background: var(--opposite-other);
    background-clip: text;
  }

  .color:hover {
    color: transparent;
  }

  ::selection {
    background: rgb(69, 48, 95);
    color: rgb(208, 141, 255);
  }

  body {
    transition: background 5.5s, background-color 5.5s;
    background: var(--bg);
    background-color: var(--bg-color);
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
    transition: color 0.5s;
    font-family: impact;
    color: var(--primary);
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
    color: var(--primary);
    filter: blur(1px);
    z-index: 50;
    opacity: 0;
    line-height: 0px;
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
    width: calc(100vw + 100vh);
    height: calc(100vw + 100vh);
    top: 50vh;
    left: 50%;
    transform: translate(-50%, -50%);
    background: var(--opposite);
    border-radius: 50%;
    overflow: hidden;
    filter: blur(10px);
    z-index: -5;
    transition: background 1.5s;
  }
</style>
