<template>
  <v-container class="flex-column justify-center h-100 py-8">
    <div class="ambient-bg" />
    <v-row
      align="start"
      justify="center"
      class="h-100"
    >
      <v-col
        cols="12"
        lg="10"
        xl="8"
      >
        <AdminSettings
          v-if="data"
          :initial-users="data.users"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts" setup>
const store = useMainStore()

const { data } = await useAsyncData<{
  users: User[];
}>("admin-page-data", async () => {
  const adminId = store.getUser?.data?.user.id

  if (!adminId) {
    throw createError({
      status: 401,
      statusText: "Unauthorized",
    })
  }

  // ! TODO, redo the route
  const usersData = await $fetch("/api/admin/user", {
    params: { admin_id: adminId },
  })

  return {
    users: usersData.body.users ?? [],
  }
})

onMounted(async () => {
  if (!store.getUser?.data || store.getUser?.data.user.role !== "admin") {
    await navigateTo("/", { redirectCode: 403 })

    return
  }
})
</script>
