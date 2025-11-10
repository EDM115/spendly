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
const router = useRouter()
const hasLoaded = ref(false)

onMounted(async () => {
  await nextTick()

  if (store.isUserEmpty) {
    router.push("/")
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
