<template>
  <main
    class="w-screen bg-[#260c3a] min-h-dvh flex justify-center items-center"
  >
    <div class="flex flex-col w-xl">
      <div class="flex lt-sm:flex-col px-5 items-center justify-evenly gap-5">
        <img
          class="size-50 rounded-full border-4 border-purple-500"
          src="https://pfp.crun.zip/verycrunchy.com"
          alt=""
        />
        <div class="lt-sm:text-center">
          <h1 class="text-5xl text-purple-500">veryCrunchy</h1>
          <h2 class="text-(2xl purple-200)">Fullstack Developer</h2>
        </div>
      </div>
      <div class="mt-10 sm:w-lg mx-a p-4 bg-purple-700/20 text-purple-200/20 text-center rounded">
        <h3 class="text-xl text-purple-300">Work in Progress</h3>
        <p class="text-purple-400">This site is currently under construction.</p>
      </div>
    </div>
  </main>
</template>
<style>
  h1,
  h2,
  h3,
  p {
    transition: color 0.5s;
    font-family: impact;
    color: var(--primary);
  }
</style>