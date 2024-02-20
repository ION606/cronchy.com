<script setup lang="ts">
  type artists = {
    name: string;
  }[];

  interface Track {
    id: number;
    streams: number;
    playedMs: number;
    track: {
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
  const range = ref(rangeModes[1].id);
  const stats = ref(statModes[1].id);
  const setActiveTab = (newRange: string) => {
    range.value = newRange;
  };
  const setActiveStats = (newStats: string) => {
    stats.value = newStats;
  };
  console.log(route.params);
  const { data: user } = await useFetch<{ item: User }>(
    `https://beta-api.stats.fm/api/v1/users/${route.params.user[0]}/`,
    {
      lazy: true,
    }
  );
  useHead({
    title: `Better stats.fm stats`,
    link: [{ rel: "icon", type: "image/x-icon", href: "/statsfm.webp" }],
  });
  const { data: tracks } = await useFetch<{
    items: Track[];
  }>(
    `https://beta-api.stats.fm/api/v1/users/${route.params.user[0]}/top/tracks`,
    {
      query: { range },
      lazy: true,
    }
  );
  const { data: artists } = await useFetch<{
    items: Artist[];
  }>(
    `https://beta-api.stats.fm/api/v1/users/${route.params.user[0]}/top/artists`,
    {
      query: { range },
      lazy: true,
    }
  );
  const { data: albums } = await useFetch<{
    items: Album[];
  }>(`https://beta-api.stats.fm/api/v1/users/${route.params.user}/top/albums`, {
    query: { range },
    lazy: true,
  });
  function filterTracks() {
    return tracks.value?.items.sort((a, b) => {
      return (
        calculateCombinedScore(b.streams, b.playedMs) -
        calculateCombinedScore(a.streams, a.playedMs)
      );
    });
  }
  function filterAlbums() {
    return albums.value?.items.sort((a, b) => {
      return (
        calculateCombinedScore(b.streams, b.playedMs) -
        calculateCombinedScore(a.streams, a.playedMs)
      );
    });
  }
  function filterArtists() {
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
    <div class="flex items-center m-5 justify-center gap-5">
      <div class="flex space-x-3 bg-statsfm-secondary p-2 rounded-xl">
        <button
          v-for="(tab, index) in statModes"
          :key="index"
          :class="{
            'bg-statsfm-accent-secondary text-statsfm-accent-primary':
              stats === tab.id,
            'bg-transparent text-white': stats !== tab.id,
          }"
          @click="setActiveStats(tab.id)"
          class="px-4 py-1.5 text-nowrap hover:bg-statsfm-accent-secondary/3 transition-colors transition-400 border-none rounded-lg cursor-pointer focus:outline-none"
        >
          {{ tab.name }}
        </button>
      </div>
      <div class="flex items-center">
        <a :href="`https://stats.fm/${route.params.user}`">
          <img
            :src="user?.item.image"
            alt="User Profile Picture"
            class="w-10 h-10 rounded-full object-cover"
        /></a>
      </div>
      <div class="flex space-x-3 p-2 bg-statsfm-secondary rounded-xl">
        <button
          v-for="(tab, index) in rangeModes"
          :key="index"
          :class="{
            'bg-statsfm-accent-secondary text-statsfm-accent-primary':
              range === tab.id,
            'bg-transparent text-white': range !== tab.id,
          }"
          @click="setActiveTab(tab.id)"
          class="px-4 py-1.5 text-nowrap hover:bg-statsfm-accent-secondary/3 transition-colors transition-400 border-none rounded-lg cursor-pointer focus:outline-none"
        >
          {{ tab.name }}
        </button>
      </div>
    </div>
    <div class="flex justify-center mb-5 font-semibold text-dim">
      {{ user?.item.displayName }}'s top {{ stats }}
      {{ rangeModes.find((r) => r.id === range)?.desc }}
      <span v-if="range !== rangeModes[3].id">
        &nbsp;{{ rangeModes.find((r) => r.id === range)?.name }}
      </span>
    </div>
    <div
      :class="{ 'overflow-scroll': stats !== statModes[0].id }"
      class="flex flex-wrap mb-5 overflow-x-hidden snap-mandatory snap-y justify-center gap-4 max-w-6/9 mx-auto"
    >
      <div class="h30 overflow-hidden" v-if="stats == statModes[0].id">
        being worked on
      </div>
      <div
        v-if="stats == statModes[1].id"
        v-for="(item, index) in filterTracks()"
        :key="index"
        class="max-w-40 rounded-md snap-end"
      >
        <img
          :src="item.track.albums[0].image"
          alt="Album Cover"
          class="w-40 h-40 object-cover mb-4"
        />
        <div class="p-1">
          <h2 class="text-sm font-semibold line-clamp-2">
            {{ index + 1 }}. {{ item.track.name }}
          </h2>

          <p class="text-xs text-#a3a3a3">
            {{ item.streams }} streams • {{ formatTime(item.playedMs) }} •
            {{ item.track.artists[0].name }} •
            {{ calculateCombinedScore(item.streams, item.playedMs).toFixed(2) }}
            weight
          </p>
        </div>
      </div>
      <div
        v-if="stats == statModes[3].id"
        v-for="(item, index) in filterAlbums()"
        :key="index"
        class="max-w-40 rounded-md snap-end"
      >
        <img
          :src="item.album.image"
          alt="Artist Image"
          class="w-40 h-40 object-cover mb-4"
        />
        <div class="p-1">
          <h2 class="text-sm font-semibold line-clamp-2">
            {{ index + 1 }}. {{ item.album.name }}
          </h2>

          <p class="text-xs text-#a3a3a3">
            {{ item.streams }} streams • {{ formatTime(item.playedMs) }} •
            {{ calculateCombinedScore(item.streams, item.playedMs).toFixed(2) }}
            weight
          </p>
        </div>
      </div>
      <div
        v-if="stats == statModes[2].id"
        v-for="(artist, index) in filterArtists()"
        :key="index"
        class="max-w-40 rounded-md snap-end"
      >
        <img
          :src="artist.artist.image"
          alt="Artist Image"
          class="w-40 h-40 object-cover mb-4"
        />
        <div class="p-1">
          <h2 class="text-sm font-semibold line-clamp-2">
            {{ index + 1 }}. {{ artist.artist.name }}
          </h2>

          <p class="text-xs text-dim">
            {{ artist.streams }} streams • {{ formatTime(artist.playedMs) }} •
            {{
              calculateCombinedScore(artist.streams, artist.playedMs).toFixed(2)
            }}
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

  /* Handle */
  ::-webkit-scrollbar-thumb {
    background: rgba(30, 215, 96, 0.1);
    border-radius: 5px;
  }
</style>
