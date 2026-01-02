<template>
  <v-container class="flex-column justify-center h-100">
    <v-row
      align="center"
      align-content="center"
      justify="center"
      :class="[smAndUp ? 'flex-row' : 'flex-column', 'h-100']"
    >
      <v-col
        align="center"
        class="align-content-center"
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
import type { User } from "~/types"

const store = useMainStore()
const { smAndUp } = useVDisplay()

const { data } = await useAsyncData<{
  users: User[];
}>("admin-page-data", async () => {
  const token = store.getUser?.token
  const adminId = store.getUser?.id

  if (!token || !adminId) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
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
