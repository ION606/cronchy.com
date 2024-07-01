<script setup lang="ts">
  type artists = {
    id: number;
    name: string;
  }[];

  interface Track {
    streams: number;
    playedMs: number;
    track: {
      id: number;
      name: string;
      artists: artists;
      albums: {
        image: string;
      }[];
    };
  }
  interface Album {
    id: number;
    streams: number;
    playedMs: number;
    album: {
      id: number;
      name: string;
      artists: artists;
      image: string;
    };
  }
  interface Artist {
    id: number;
    streams: number;
    playedMs: number;
    artist: {
      id: number;
      name: string;
      image: string;
    };
  }
  interface User {
    displayName: string;
    image: string;
  }

  const rangeModes = [
    { id: "today", name: "today", desc: "from" },
    { id: "weeks", name: "4 weeks", desc: "from the past" },
    { id: "months", name: "6 months", desc: "from the past" },
    { id: "lifetime", name: "lifetime", desc: "" },
  ];
  const statModes = [
    { id: "genres", name: "genres" },
    { id: "tracks", name: "tracks" },
    { id: "artists", name: "artists" },
    { id: "albums", name: "albums" },
  ];

  const route = useRoute();
  const range = ref(rangeModes[2].id);
  const stats = ref(statModes[1].id);
  const setActiveTab = (newRange: string) => {
    range.value = newRange;
  };
  const setActiveStats = (newStats: string) => {
    stats.value = newStats;
  };
  const { data: user } = await useFetch<{ item: User }>(
    `https://api.stats.fm/api/v1/users/${route.params.user[0]}/`
  );

  const url = "https://stats.fm";

  useHead({
    title: user.value
      ? `${user.value.item.displayName}'s better stats.fm stats`
      : "User not found",
    meta: [
      user.value
        ? {
            name: "description",
            content: `View ${user.value.item.displayName}'s weight based stats.fm stats!`,
          }
        : {},
      user.value ? { name: "og:image", content: user.value?.item.image } : {},
      { name: "theme-color", content: "rgb(30 215 96)" },
    ],

    link: [{ rel: "icon", type: "image/x-icon", href: "/statsfm.webp" }],
  });
  const {
    data: tracks,
    execute: fetchTracks,
    status: trackStatus,
  } = await useFetch<{
    items: Track[];
  }>(`https://api.stats.fm/api/v1/users/${route.params.user[0]}/top/tracks`, {
    query: { range },
    lazy: true,
    server: false,
  });
  const {
    data: artists,
    execute: fetchArtists,
    status: artistStatus,
  } = await useFetch<{
    items: Artist[];
  }>(`https://api.stats.fm/api/v1/users/${route.params.user[0]}/top/artists`, {
    query: { range },
    lazy: true,
    server: false,
    immediate: false,
  });
  const {
    data: albums,
    execute: fetchAlbums,
    status: albumStatus,
  } = await useFetch<{
    items: Album[];
  }>(`https://api.stats.fm/api/v1/users/${route.params.user[0]}/top/albums`, {
    query: { range },
    lazy: true,
    server: false,
    immediate: false,
  });
  function filterTracks() {
    if (trackStatus.value == "idle") fetchTracks();
    return tracks.value?.items.sort((a, b) => {
      return (
        calculateCombinedScore(b.streams, b.playedMs) -
        calculateCombinedScore(a.streams, a.playedMs)
      );
    });
  }
  function filterAlbums() {
    if (albumStatus.value == "idle") fetchAlbums();
    return albums.value?.items.sort((a, b) => {
      return (
        calculateCombinedScore(b.streams, b.playedMs) -
        calculateCombinedScore(a.streams, a.playedMs)
      );
    });
  }
  function filterArtists() {
    if (artistStatus.value == "idle") fetchArtists();

    return artists.value?.items.sort((a: any, b: any) => {
      return (
        calculateCombinedScore(b.streams, b.playedMs) -
        calculateCombinedScore(a.streams, a.playedMs)
      );
    });
  }
  function calculateCombinedScore(streams: number, totalTime: number) {
    const streamWeight = 0.7 * streams;
    const timeWeight = 0.3 * (totalTime / 60000 / 2);

    return streamWeight + timeWeight;
  }

  function formatTime(ms: number) {
    const minutes = Math.floor(ms / 60000);
    return `${minutes} minutes`;
  }
</script>

<template>
  <div class="bg-statsfm-primary flex flex-col font-sans h-screen text-white">
    <div
      v-if="user"
      class="flex lt-md:flex-col items-center m-5 justify-center gap-5"
    >
      <div class="flex sm:space-x-3 bg-statsfm-secondary p-2 rounded-xl">
        <button
          v-for="(tab, index) in statModes"
          :key="index"
          :class="{
            'bg-statsfm-accent-secondary text-statsfm-accent-primary':
              stats === tab.id,
            'bg-transparent text-white': stats !== tab.id,
          }"
          @click="setActiveStats(tab.id)"
          class="px-3 lg:px-4 py-1.5 text-nowrap hover:bg-statsfm-accent-secondary/3 transition-colors transition-400 border-none rounded-lg cursor-pointer focus:outline-none"
        >
          {{ tab.name }}
        </button>
      </div>
      <div class="flex items-center">
        <a :href="`${url}/${route.params.user}`">
          <img
            :src="user?.item.image"
            alt="User Profile Picture"
            class="w-10 h-10 rounded-full object-cover"
        /></a>
      </div>
      <div class="flex sm:space-x-3 p-2 bg-statsfm-secondary rounded-xl">
        <button
          v-for="(tab, index) in rangeModes"
          :key="index"
          :class="{
            'bg-statsfm-accent-secondary text-statsfm-accent-primary':
              range === tab.id,
            'bg-transparent text-white': range !== tab.id,
          }"
          @click="setActiveTab(tab.id)"
          class="px-3 lg:px-4 py-1.5 text-nowrap hover:bg-statsfm-accent-secondary/3 transition-colors transition-400 border-none rounded-lg cursor-pointer focus:outline-none"
        >
          {{ tab.name }}
        </button>
      </div>
    </div>
    <div
      class="flex justify-center text-xs sm:text-lg mb-5 font-semibold text-dim mx-5"
    >
      <p v-if="user">
        <a class="hover:text-white" :href="`${url}/${route.params.user}`">
          {{ user?.item.displayName }} </a
        >'s top {{ stats }}
        {{ rangeModes.find((r) => r.id === range)?.desc }}
        <span v-if="range !== rangeModes[3].id">
          {{ rangeModes.find((r) => r.id === range)?.name }}
        </span>
      </p>
      <p v-else>This page doesn't exist</p>
    </div>

    <div
      v-if="user"
      :class="{ 'overflow-scroll': stats !== statModes[0].id }"
      class="flex w-full h-fit flex-wrap mb-5 overflow-x-hidden snap-mandatory snap-y justify-center gap-4 max-w-8/9 2xl:max-w-6/9 mx-auto"
    >
      <div class="h30 overflow-hidden" v-if="stats == statModes[0].id">
        being worked on
      </div>
      <div
        v-if="stats == statModes[1].id && !tracks"
        v-for="index in 30"
        :key="index"
        class="max-w-40 rounded-md snap-end"
      >
        <div class="skeleton w-40 h-40 object-cover mb-4"></div>
        <div class="p-1">
          <h2 class="text-sm font-semibold line-clamp-2 h-4 skeleton mb-2"></h2>
          <div class="h-8 skeleton"></div>
        </div>
      </div>
      <div
        v-if="stats == statModes[1].id"
        v-for="(item, index) in filterTracks()"
        :key="index"
        class="max-w-30 md:max-w-40 rounded-md snap-end"
      >
        <a class="hover:text-white" :href="`${url}/track/${item.track.id}`">
          <img
            :src="item.track.albums[0].image"
            :alt="item.track.albums[0].name"
            class="w-30 h-30 md:(w-40 h-40) object-cover mb-4"
          />
        </a>
        <div class="p-1">
          <a class="hover:text-white" :href="`${url}/track/${item.track.id}`">
            <h2 class="text-sm font-semibold line-clamp-2">
              {{ index + 1 }}. {{ item.track.name }}
            </h2>
          </a>

          <p class="text-xs text-#a3a3a3">
            {{ item.streams }} streams • {{ formatTime(item.playedMs) }} •
            <a
              class="hover:text-white"
              :href="`${url}/artist/${item.track.artists[0]?.id}`"
            >
              {{ item.track.artists[0]?.name ?? "NONAME" }}</a
            >
            •
            {{ calculateCombinedScore(item.streams, item.playedMs).toFixed(2) }}
            weight
          </p>
        </div>
      </div>
      <div
        v-if="stats == statModes[3].id"
        v-for="(item, index) in filterAlbums()"
        :key="index"
        class="max-w-30 md:max-w-40 rounded-md snap-end"
      >
        <a class="hover:text-white" :href="`${url}/album/${item.album.id}`">
          <img
            :src="item.album.image"
            :alt="item.album.name"
            class="w-30 h-30 md:(w-40 h-40) object-cover mb-4"
        /></a>
        <div class="p-1">
          <a class="hover:text-white" :href="`${url}/album/${item.album.id}`">
            <h2 class="text-sm font-semibold line-clamp-2">
              {{ index + 1 }}. {{ item.album.name }}
            </h2>
          </a>
          <p class="text-xs text-#a3a3a3">
            {{ item.streams }} streams • {{ formatTime(item.playedMs) }} •
            {{ calculateCombinedScore(item.streams, item.playedMs).toFixed(2) }}
            weight
          </p>
        </div>
      </div>
      <div
        v-if="stats == statModes[2].id"
        v-for="(item, index) in filterArtists()"
        :key="index"
        class="max-w-30 md:max-w-40 rounded-md snap-end"
      >
        <a class="hover:text-white" :href="`${url}/artist/${item.artist.id}`">
          <img
            :src="item.artist.image"
            :alt="item.artist.name"
            class="w-30 h-30 md:(w-40 h-40) object-cover mb-4"
          />
        </a>
        <div class="p-1">
          <a class="hover:text-white" :href="`${url}/artist/${item.artist.id}`">
            <h2 class="text-sm font-semibold line-clamp-2">
              {{ index + 1 }}. {{ item.artist.name }}
            </h2></a
          >

          <p class="text-xs text-dim">
            {{ item.streams }} streams • {{ formatTime(item.playedMs) }} •
            {{ calculateCombinedScore(item.streams, item.playedMs).toFixed(2) }}
            weight
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
<style>
  ::-webkit-scrollbar {
    width: 10px;
  }

  /* Track */
  ::-webkit-scrollbar-track {
    background: rgb(24, 24, 28);
    border-radius: 5px;
  }

  h2,
  p {
    color: var(--primary);
  }

  /* Handle */
  ::-webkit-scrollbar-thumb {
    background: rgba(30, 215, 96, 0.1);
    border-radius: 5px;
  }
  .skeleton {
    background: #eee;
    background: linear-gradient(
      110deg,
      #ececec0e 8%,
      #f5f5f50e 18%,
      #ececec0e 33%
    );
    background-size: 200% 100%;
    animation: 1.5s shine linear infinite;
  }

  @keyframes shine {
    to {
      background-position-x: -200%;
    }
  }
</style>
