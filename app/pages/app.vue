<template>
  <div>
    <v-skeleton-loader
      v-if="!hasLoaded"
      type="image"
      class="h-100"
      style="background-color: rgb(var(--v-background-color));"
    />
  </div>
</template>

<script setup lang="ts">
const store = useMainStore()
const hasLoaded = ref(false)

onMounted(async () => {
  if (store.getUser === null) {
    await navigateTo("/", { redirectCode: 401 })
  }
})
</script>

<style>
.v-skeleton-loader__image {
  height: 80% !important;
  border-radius: 32px !important;
  margin: 1em !important;
}
</style>
