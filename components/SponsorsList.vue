<script setup lang="ts">
  import kofiSponsors from "../data/kofiSponsors.json";
  const { data: githubSponsors } = await useFetch("/api/sponsors/github");

  const githubSponsorsList = computed(() => {
    return (
      githubSponsors?.value?.sponsors?.map((sponsor) => ({
        ...sponsor,
        source: "GitHub",
      })) || []
    );
  });

  const kofiSponsorsList = computed(() => {
    return kofiSponsors.map((sponsor) => ({
      ...sponsor,
      source: "Ko-fi",
    }));
  });
</script>

<template>
  <div class="flex flex-col gap-8">
    <h2 class="sponsors-heading">{{ "My Beloved Sponsors<3" }}</h2>

    <!-- GitHub Sponsors -->
    <div class="flex gap-4">
      <span v-if="githubSponsorsList.length">
        <div class="flex gap-4 justify-center"></div>
      </span>
    </div>

    <!-- Ko-fi Sponsors -->
    <div v-if="kofiSponsorsList.length" class="flex gap-4">
      <div class="flex flex-wrap gap-4 justify-center">
        <h3 class="platform-separator github-separator text-xs px1">GitHub</h3>

        <div
          v-for="sponsor in githubSponsorsList"
          :key="sponsor.login"
          class="hover sponsor-card github-card flex items-center gap-3 p-3 rounded-xl"
        >
          <img
            :src="sponsor.avatarUrl"
            :alt="sponsor.login"
            class="w-8 h-8 rounded-full"
          />
          <div class="flex flex-col">
            <h3 class="text-sm font-bold">@{{ sponsor.login }}</h3>
            <p class="text-xs op-70">{{ sponsor.name }}</p>
          </div>
        </div>
        <h3 class="platform-separator kofi-separator">Ko-fi</h3>

        <div
          v-for="sponsor in kofiSponsorsList"
          :key="sponsor.name"
          class="hover sponsor-card kofi-card flex items-center gap-3 p-3 rounded-xl"
        >
          <div class="flex flex-col">
            <h3 class="text-sm font-bold">{{ sponsor.name }}</h3>
            <p class="text-xs op-70">Total: ${{ sponsor.total }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .sponsors-heading {
    font-size: 2rem;
    text-align: center;
    color: var(--primary);
    text-shadow: 0 0 15px var(--primary), 0 0 30px var(--primary);
    margin-bottom: 1rem;
  }

  .platform-separator {
    font-size: 1.5rem;
    text-align: center;
    border-radius: 0.2rem;
    padding-top: 0.2rem;
    padding-bottom: 0.2rem;
    writing-mode: sideways-lr;
    color: white;
  }

  .github-separator {
    background-color: #ea4aaa;
  }

  .kofi-separator {
    background-color: #29abe0;
  }

  .sponsor-card {
    border: 1px solid var(--primary);
    background: rgba(20, 20, 20, 0.8);
    transition: all 0.3s ease;
  }

  .active-sponsor {
    box-shadow: 0 0 15px var(--primary), 0 0 30px var(--primary);
    background: linear-gradient(
      135deg,
      rgba(30, 30, 30, 0.9),
      rgba(10, 10, 10, 0.8)
    );
  }

  .past-sponsor {
    opacity: 0.5;
    filter: grayscale(100%);
  }

  .sponsor-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 5px 15px -5px var(--primary);
  }
</style>
