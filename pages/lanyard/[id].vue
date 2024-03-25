<script setup lang="ts">
  import Lanyard, { type ActivityData, type Timestamps } from "~/src/lanyard";
  const lanyard = ref<ActivityData>();
  const route = useRoute();
  onMounted(async () => {
    const LanyardSocket = await Lanyard(route.params.id as string, true);
    LanyardSocket.addEventListener("message", ({ data }: { data: any }) => {
      const { d: status } = JSON.parse(data);
      lanyard.value = status;
    });
  });

  const ActivityType: { [key: number]: string } = {
    0: "Playing",
    1: "Streaming",
    2: "Listening to",
    3: "Watching",
    5: "Competing in",
  };
  function getActivityType(key: number): string {
    return ActivityType[key] || "";
  }
  function getAssetImageUrl(applicationId: string, asset: string) {
    if (asset.startsWith("mp:external/")) {
      const externalUrl = asset.replace("mp:external/", "");
      const discordCdnUrl = `https://media.discordapp.net/external/${externalUrl}`;
      return discordCdnUrl;
    }

    if (asset.startsWith("spotify:")) {
      const externalUrl = asset.replace("spotify:", "");
      const discordCdnUrl = `https://i.scdn.co/image/${externalUrl}`;
      return discordCdnUrl;
    }

    const baseUrl = "https://cdn.discordapp.com/app-assets/";
    const imageUrl = `${baseUrl}${applicationId}/${asset}.png`;
    return imageUrl;
  }

  const currentTime = ref(Date.now());
  const updateTimer = () => {
    currentTime.value = Date.now();
  };
  let timerInterval: NodeJS.Timeout;

  onMounted(() => {
    timerInterval = setInterval(updateTimer, 1000);
  });

  onUnmounted(() => {
    clearInterval(timerInterval);
  });
  const getActivityTime = computed(() => (timestamps: Timestamps): string => {
    const { start, end } = timestamps;

    let elapsedTime = new Date(currentTime.value - start);
    let text = "elapsed";
    if (end) (elapsedTime = new Date(end - currentTime.value)), (text = "left");
    const hours = elapsedTime.getUTCHours();
    return `${hours ? hours.toString().padStart(2, "0") + ":" : ""}${elapsedTime
      .getUTCMinutes()
      .toString()
      .padStart(2, "0")}:${elapsedTime
      .getUTCSeconds()
      .toString()
      .padStart(2, "0")} ${text}`;
  });

  // const width = 100;
  // const height = 100;
  // const holeX = 50;
  // const holeY = 30;
  // const holeSize = 60;

  // const holePath = `M ${holeX} ${holeY} L ${holeX + holeSize} ${holeY} L ${
  //   holeX + holeSize
  // } ${holeY + holeSize} L ${holeX} ${holeY + holeSize}  L ${holeX} ${holeY}`;

  // // const path = `M 0 0 L 0 ${height} L ${width} ${height} L ${width} 0 L 0 0 ${holePath} Z`;

  // const clipPath = `path('${path}')`;
</script>

<template>
  <main
    class="text-white bg-#171717 flex flex-col justify-center items-center h-screen bg-gradient-to-br from-#0d0822/5 to-#1a0a2a/10"
  >
    <!-- {{ lanyard }} -->
    <div
      v-if="lanyard?.activities"
      class="space-y-10 bg-statsfm-primary rounded-md p-5 m-5"
    >
      <div v-for="activity in lanyard.activities">
        <div class="flex text-gray-200 font-sans items-center space-x-4">
          <div class="size-25">
            <NuxtImg
              svg="true"
              width="100"
              height="100"
              v-if="activity.assets?.large_image"
              :src="
                getAssetImageUrl(
                  activity.application_id,
                  activity.assets?.large_image ??
                    activity.assets?.small_image ??
                    ''
                )
              "
              class="rounded-md"
            >
            </NuxtImg>
            <svg width="0" height="0">
              <defs>
                <clipPath id="myClip">
                  <circle cx="100" cy="100" r="20" />
                </clipPath>
              </defs>
            </svg>
            <!-- <div class="w-110% flex justify-end">
              <div
                class="bg-statsfm-primary -translate-y-6.4 size-8 flex justify-center items-center rounded-full"
              >
                <NuxtImg
                  width="25"
                  height="25"
                  v-if="activity.assets?.large_image"
                  :src="
                    getAssetImageUrl(
                      activity.application_id,
                      activity.assets?.small_image ?? ''
                    )
                  "
                  class="size-6 rounded-full"
                ></NuxtImg>
              </div>
            </div> -->
          </div>
          <div class="space-y-1">
            <h1 class="font-semibold">
              {{ getActivityType(activity.type) }} {{ activity.name }}
            </h1>
            <p class="">{{ activity.state }}</p>
            <p class="">{{ activity.details }}</p>
            <div v-if="activity.timestamps" class="time-progress">
              <div class="time">{{ getActivityTime(activity.timestamps) }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>
