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
  const token = store.getUser?.token
  const adminId = store.getUser?.id

  if (!token || !adminId) {
    throw createError({
      status: 401,
      statusText: "Unauthorized",
    })
  }

  const usersData = await $fetch<{ body: { users?: User[] } }>("/api/admin/user", {
    params: { admin_id: adminId },
    headers: { Authorization: `Bearer ${token}` },
  })

  return {
    users: usersData.body.users ?? [],
  }
})

onMounted(async () => {
  if (store.getUser === null || store.getUser.role !== "admin") {
    await navigateTo("/", { redirectCode: 403 })

    return
  }

  const isValid = await store.validateToken()

  if (!isValid) {
    await navigateTo("/", { redirectCode: 401 })
  }
})
</script>
