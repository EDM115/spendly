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
        <AdminSettings />
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts" setup>
const { t } = useI18n()

useHead({ title: t("main.admin") })

await useAsyncData("admin-page-guard", async () => {
  const event = useRequestEvent()
  const serverAuth = event?.context.auth ?? null
  const sessionState = serverAuth?.userId
    ? {
        isAuthenticated: true, isAdmin: serverAuth.role === "admin",
      }
    : null

  if (!sessionState) {
    const { data: session } = await authClient.useSession(useFetch)
    const userData = session.value ?? null

    if (!userData) {
      throw createError({
        status: 401,
        statusText: "Unauthorized",
      })
    }

    if (userData.user?.role !== "admin") {
      throw createError({
        status: 403,
        statusText: "Forbidden",
      })
    }
  } else if (!sessionState.isAdmin) {
    throw createError({
      status: 403,
      statusText: "Forbidden",
    })
  }

  return true
})

</script>
