<template>
  <div class="w-100">
    <v-expand-transition>
      <Error
        v-if="errorMessage"
        :message="errorMessage"
        :issue="issueMessage"
        :color="messageColor"
      />
    </v-expand-transition>

    <v-form
      ref="form"
      @submit.prevent="submit"
    >
      <div class="mb-4">
        <v-text-field
          v-model="state.username"
          variant="outlined"
          color="primary"
          bg-color="surface"
          :label="$t('login.username')"
          prepend-inner-icon="mdi-account-outline"
          hide-details="auto"
          class="rounded-lg"
        />
      </div>

      <div class="mb-6">
        <v-text-field
          v-model="state.password"
          :type="showPassword ? 'text' : 'password'"
          variant="outlined"
          color="primary"
          bg-color="surface"
          :label="$t('login.password')"
          prepend-inner-icon="mdi-key-outline"
          hide-details="auto"
          class="rounded-lg"
        >
          <template #append-inner>
            <v-btn
              icon
              variant="text"
              density="compact"
              @click="togglePasswordVisibility"
            >
              <v-icon size="small">
                {{ showPassword ? 'mdi-eye-outline' : 'mdi-eye-off-outline' }}
              </v-icon>
            </v-btn>
          </template>
        </v-text-field>
      </div>

      <v-btn
        block
        color="primary"
        size="large"
        type="submit"
        variant="flat"
        :loading="loading"
        class="text-none font-weight-bold rounded-lg"
        elevation="2"
      >
        {{ $t('login.login') }}
      </v-btn>
    </v-form>
  </div>
</template>

<script lang="ts" setup>
import type { ErrorType } from "~/types"

const store = useMainStore()

const errorMessage = ref("")
const issueMessage = ref("")
const messageColor = ref("error")
const showPassword = ref(false)
const loading = ref(false)

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

const initialState = {
  username: "",
  password: "",
}

const state = reactive({ ...initialState })

function clear() {
  Object.assign(state, initialState)
}

function handleError(error: ErrorType) {
  messageColor.value = "error"

  if (typeof error === "string") {
    errorMessage.value = error
    issueMessage.value = ""

    return
  }

  errorMessage.value = error.data?.message ?? "An unknown error occurred"
  issueMessage.value = error.data?.statusMessage ?? ""
}

async function login(event: typeof state) {
  errorMessage.value = ""
  loading.value = true

  try {
    const result = await $fetch("/api/login", {
      method: "POST",
      body: {
        username: event.username,
        password: event.password,
      },
    })

    store.setUser(result.body.user)
    await navigateTo("/app", { redirectCode: 302 })
  } catch (error) {
    handleError(error as ErrorType)
  } finally {
    loading.value = false
  }
}

async function submit() {
  await login(state)
  clear()
}
</script>
