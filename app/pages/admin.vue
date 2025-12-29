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
          :initial-icons="data.icons"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts" setup>
type User = {
  id: number;
  username: string;
  role: string;
}

type Icon = {
  id: number;
  name: string;
  color: string;
  icon: string;
}

const store = useMainStore()
const { smAndUp } = useVDisplay()

const { data } = await useAsyncData<{
  users: User[];
  icons: Icon[];
}>("admin-page-data", async () => {
  const token = store.getUser?.token
  const adminId = store.getUser?.id

  if (!token || !adminId) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
    })
  }

  const [ usersData, iconsData ] = await Promise.all([
    $fetch<{ body: { users?: User[] } }>("/api/admin/user", {
      params: { admin_id: adminId },
      headers: { Authorization: `Bearer ${token}` },
    }),
    $fetch<{ body: { icons?: Icon[] } }>("/api/admin/icon", {
      params: { admin_id: adminId },
      headers: { Authorization: `Bearer ${token}` },
    }),
  ])

  return {
    users: usersData.body.users ?? [],
    icons: iconsData.body.icons ?? [],
  }
})

onMounted(async () => {
  if (store.getUser === null || store.getUser.role !== "admin") {
    await navigateTo("/", { redirectCode: 403 })

    return
  }

  // Validate the token
  const isValid = await store.validateToken()

  if (!isValid) {
    await navigateTo("/", { redirectCode: 401 })
  }
})
</script>
