<template>
  <div class="d-flex align-center mb-6">
    <v-icon
      icon="mdi-shield-account-outline"
      size="32"
      color="primary"
      class="mr-3"
    />
    <h1 class="text-h4 font-weight-bold gradient-text pb-0">
      {{ t("admin.title") }}
    </h1>
  </div>

  <v-expansion-panels
    variant="accordion"
    class="glass-accordion mb-6"
  >
    <v-expansion-panel
      class="glass-panel rounded-xl overflow-hidden transparent-panel"
      elevation="0"
    >
      <v-expansion-panel-title class="font-weight-bold text-h6 py-4">
        <v-icon
          icon="mdi-account-group-outline"
          class="mr-3"
          color="primary"
        />
        {{ t("admin.users.title") }}
        <v-spacer />
        <v-btn
          color="primary"
          class="mr-4 text-none"
          rounded="lg"
          variant="tonal"
          prepend-icon="mdi-account-plus-outline"
          :text="t('admin.users.create')"
          @click.stop="openCreateDialog"
        />
      </v-expansion-panel-title>
      <v-expansion-panel-text class="pt-4">
        <v-expand-transition>
          <v-alert
            v-if="feedback.message"
            :type="feedback.color"
            variant="tonal"
            class="mb-4 mx-4"
            border
          >
            <div class="font-weight-medium">
              {{ feedback.message }}
            </div>
            <div
              v-if="feedback.issue"
              class="text-body-2"
            >
              {{ feedback.issue }}
            </div>
          </v-alert>
        </v-expand-transition>

        <v-list class="bg-transparent">
          <v-list-item
            v-for="userItem in users"
            :key="userItem.id"
            class="mb-2 glass-list-item rounded-lg px-2 mx-4"
          >
            <v-container class="pa-0">
              <v-row
                align="center"
                no-gutters
              >
                <v-col
                  cols="12"
                  md="4"
                  class="pa-2"
                >
                  <v-list-item-title class="font-weight-medium mb-1">
                    <v-icon
                      icon="mdi-account-circle-outline"
                      size="small"
                      class="mr-1 opacity-70"
                    />
                    {{ formatUserLabel(userItem) }}
                  </v-list-item-title>
                  <v-list-item-subtitle class="text-body-2">
                    {{ userItem.email || t("admin.users.no-email") }}
                  </v-list-item-subtitle>
                </v-col>
                <v-col
                  cols="12"
                  md="3"
                  class="pa-2"
                >
                  <v-chip
                    color="secondary"
                    variant="tonal"
                    class="text-uppercase"
                  >
                    {{ formatRole(userItem.role) }}
                  </v-chip>
                </v-col>
                <v-col
                  cols="12"
                  md="5"
                  class="pa-2 d-flex flex-wrap justify-end gap-2"
                >
                  <v-tooltip
                    location="top"
                    :text="t('admin.users.edit-action')"
                  >
                    <template #activator="{ props: tooltipProps }">
                      <v-btn
                        v-bind="tooltipProps"
                        :disabled="userItem.id === store.getUserId"
                        color="primary"
                        icon="mdi-pencil-outline"
                        variant="tonal"
                        size="small"
                        :loading="isBusy(userItem.id, 'edit')"
                        @click="openEditDialog(userItem)"
                      />
                    </template>
                  </v-tooltip>
                  <v-tooltip
                    location="top"
                    :text="t('admin.users.impersonate-action')"
                  >
                    <template #activator="{ props: tooltipProps }">
                      <v-btn
                        v-bind="tooltipProps"
                        :disabled="userItem.id === store.getUserId"
                        color="warning"
                        class="ml-2"
                        icon="mdi-account-switch-outline"
                        variant="tonal"
                        size="small"
                        :loading="isBusy(userItem.id, 'impersonate')"
                        @click="impersonateUser(userItem)"
                      />
                    </template>
                  </v-tooltip>
                  <v-tooltip
                    location="top"
                    :text="t('admin.users.export-action')"
                  >
                    <template #activator="{ props: tooltipProps }">
                      <v-btn
                        v-bind="tooltipProps"
                        color="info"
                        class="ml-2"
                        icon="mdi-folder-zip-outline"
                        variant="tonal"
                        size="small"
                        :loading="isBusy(userItem.id, 'export')"
                        @click="downloadUserExport(userItem)"
                      />
                    </template>
                  </v-tooltip>
                  <v-tooltip
                    location="top"
                    :text="t('admin.users.delete-action')"
                  >
                    <template #activator="{ props: tooltipProps }">
                      <v-btn
                        v-bind="tooltipProps"
                        :disabled="userItem.id === store.getUserId"
                        icon="mdi-delete-outline"
                        color="error"
                        class="ml-2"
                        variant="tonal"
                        size="small"
                        :loading="isBusy(userItem.id, 'delete')"
                        @click="showUserDeleteDialog(userItem)"
                      />
                    </template>
                  </v-tooltip>
                </v-col>
              </v-row>
            </v-container>
          </v-list-item>
        </v-list>
      </v-expansion-panel-text>
    </v-expansion-panel>

    <v-expansion-panel
      class="glass-panel rounded-xl overflow-hidden transparent-panel"
      elevation="0"
    >
      <v-expansion-panel-title class="font-weight-bold text-h6 py-4">
        <v-icon
          icon="mdi-database-outline"
          color="secondary"
          class="mr-3"
        />
        {{ t("admin.backup.title") }}
      </v-expansion-panel-title>
      <v-expansion-panel-text class="px-8 pt-4 pb-6">
        <v-row>
          <v-col>
            <v-btn
              color="success"
              prepend-icon="mdi-file-delimited-outline"
              :loading="exporting"
              variant="tonal"
              block
              rounded
              class="h-auto py-4"
              @click="downloadBackup('csv')"
            >
              {{ t("admin.backup.export-csv") }}
            </v-btn>
          </v-col>
          <v-col>
            <v-btn
              color="success"
              prepend-icon="mdi-code-json"
              :loading="exporting"
              variant="tonal"
              block
              rounded
              class="h-auto py-4"
              @click="downloadBackup('json')"
            >
              {{ t("admin.backup.export-json") }}
            </v-btn>
          </v-col>
          <v-col>
            <v-btn
              color="success"
              prepend-icon="mdi-database-export-outline"
              :loading="exporting"
              variant="tonal"
              block
              rounded
              class="h-auto py-4"
              @click="downloadBackup('sql')"
            >
              {{ t("admin.backup.export-sql") }}
            </v-btn>
          </v-col>
          <v-col>
            <v-btn
              color="success"
              prepend-icon="mdi-database-arrow-down-outline"
              :loading="exporting"
              variant="tonal"
              block
              rounded
              class="h-auto py-4"
              @click="downloadBackup('sqlite')"
            >
              {{ t("admin.backup.export-sqlite") }}
            </v-btn>
          </v-col>
        </v-row>
      </v-expansion-panel-text>
    </v-expansion-panel>
  </v-expansion-panels>

  <v-dialog
    v-model="showUserDialog"
    max-width="600"
    persistent
  >
    <v-card class="glass-card pa-1 border-thin">
      <v-card-title class="text-h6 font-weight-bold">
        {{ isCreating ? t("admin.users.create-title") : t("admin.users.edit-title") }}
      </v-card-title>
      <v-card-text>
        <v-form
          ref="userFormRef"
          @submit.prevent="submitUser"
        >
          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="userForm.username"
                :label="t('admin.users.username')"
                variant="outlined"
                rounded="lg"
                autocomplete="suppress"
                prepend-inner-icon="mdi-account-circle-outline"
                hide-details="auto"
                :rules="usernameRules"
              />
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model="userForm.email"
                :label="t('admin.users.email')"
                variant="outlined"
                rounded="lg"
                autocomplete="suppress"
                prepend-inner-icon="mdi-email-outline"
                hide-details="auto"
                :rules="emailRules"
              />
            </v-col>
            <v-col cols="12">
              <v-select
                v-model="userForm.role"
                :items="roleItems"
                :label="t('admin.users.role')"
                variant="outlined"
                prepend-inner-icon="mdi-account-hard-hat-outline"
                hide-details="auto"
                rounded="lg"
              />
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model="userForm.password"
                :label="t('admin.users.password')"
                :type="showPassword ? 'text' : 'password'"
                variant="outlined"
                rounded="lg"
                autocomplete="new-password"
                hide-details="auto"
                prepend-inner-icon="mdi-key-outline"
                :rules="passwordFieldRules"
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
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model="userForm.confirmPassword"
                :label="t('admin.users.confirm-password')"
                :type="showPassword ? 'text' : 'password'"
                variant="outlined"
                rounded="lg"
                autocomplete="new-password"
                hide-details="auto"
                prepend-inner-icon="mdi-key-outline"
                :rules="confirmPasswordRules"
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
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          color="secondary"
          rounded="lg"
          variant="text"
          :text="isCreating ? t('admin.users.create-cancel') : t('admin.users.edit-cancel')"
          @click="closeUserDialog"
        />
        <v-btn
          color="primary"
          rounded="lg"
          variant="elevated"
          :text="isCreating ? t('admin.users.create-confirm') : t('admin.users.edit-confirm')"
          :loading="dialogLoading"
          @click="submitUser"
        />
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog
    v-model="showDeleteDialog"
    persistent
    max-width="500"
  >
    <v-card class="glass-card pa-1 border-thin">
      <v-card-title class="text-h5 text-error font-weight-bold">
        {{ t("admin.users.delete-title") }}
      </v-card-title>
      <v-card-text>
        {{ t("admin.users.delete-description") }}
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          color="secondary"
          rounded="lg"
          variant="text"
          :text="t('admin.users.delete-cancel')"
          @click="showDeleteDialog = false"
        />
        <v-btn
          color="error"
          rounded="lg"
          variant="elevated"
          :text="t('admin.users.delete-confirm')"
          :loading="deleteLoading"
          @click="deleteUser"
        />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import type {
  ComponentInternalInstance,
  Raw,
} from "vue"
import type { UserWithRole } from "better-auth/plugins"

import { authClient } from "~/utils/authClient"

type AdminUser = UserWithRole & {
  username: string;
  displayUsername: string;
}

const store = useMainStore()
const { t } = useI18n()

const users = ref<AdminUser[]>([])
const exporting = ref(false)
const dialogLoading = ref(false)
const deleteLoading = ref(false)
const busyAction = ref<{
  id: string; action: string;
} | null>(null)

const feedback = reactive({
  message: "",
  issue: "",
  color: "info" as "info" | "error" | "success" | "warning",
})

const showUserDialog = ref(false)
const showDeleteDialog = ref(false)
const showPassword = ref(false)
const dialogMode = ref<"create" | "edit">("create")

const userFormRef = ref<{
  validate: () => Promise<string[]>;
  reset: () => Promise<void>;
  resetValidation: () => Promise<void>;
  vm: Raw<ComponentInternalInstance>;
  isValid: boolean | null;
  errorMessages: string[];
}>()

const selectedUser = ref<AdminUser | null>(null)

const userForm = reactive({
  username: "",
  email: "",
  role: "user" as UserType,
  password: "",
  confirmPassword: "",
})

const roleItems: UserType[] = [ "user", "admin" ]

const isCreating = computed(() => dialogMode.value === "create")

const emailRules = [
  (v: unknown) => !!v || t("rules.email.required"),
  (v: string) => (v && (/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/).test(v)) || t("rules.email.valid"),
]

const usernameRules = [
  (v: unknown) => !!v || t("rules.username.required"),
  (v: string) => (v && v.length >= 3) || t("rules.username.min", { min: 3 }),
  (v: string) => (v && v.length <= 128) || t("rules.username.max", { max: 128 }),
]

const passwordRules = [
  (v: unknown) => !!v || t("rules.password.required"),
  (v: string) => (v && v.length >= 8) || t("rules.password.min", { min: 8 }),
  (v: string) => (v && v.length <= 16384) || t("rules.password.max", { max: 16384 }),
  (v: string) => (v && (/[a-z]/).test(v)) || t("rules.password.lowercase"),
  (v: string) => (v && (/[A-Z]/).test(v)) || t("rules.password.uppercase"),
  (v: string) => (v && (/\d/).test(v)) || t("rules.password.number"),
  (v: string) => (v && (/[^a-zA-Z0-9]/).test(v)) || t("rules.password.special"),
]

const optionalPasswordRules = [
  (v: string) => (!v || v.length >= 8) || t("rules.password.min", { min: 8 }),
  (v: string) => (!v || v.length <= 16384) || t("rules.password.max", { max: 16384 }),
  (v: string) => (!v || (/[a-z]/).test(v)) || t("rules.password.lowercase"),
  (v: string) => (!v || (/[A-Z]/).test(v)) || t("rules.password.uppercase"),
  (v: string) => (!v || (/\d/).test(v)) || t("rules.password.number"),
  (v: string) => (!v || (/[^a-zA-Z0-9]/).test(v)) || t("rules.password.special"),
]

const passwordFieldRules = computed(() => (isCreating.value
  ? passwordRules
  : optionalPasswordRules))

const confirmPasswordRules = computed(() => (isCreating.value
  ? [
      (v: string) => !!v || t("rules.password.required"),
      (v: string) => v === userForm.password || t("rules.password.match"),
    ]
  : [(v: string) => (!userForm.password || v === userForm.password) || t("rules.password.match")]))

const resetFeedback = () => {
  feedback.message = ""
  feedback.issue = ""
  feedback.color = "info"
}

const applyError = (error: {
  message?: string; statusText?: string; code?: string;
}) => {
  feedback.color = "error"
  feedback.message = error.message ?? error.code ?? t("error.unknown")
  feedback.issue = error.statusText ?? ""
}

const applySuccess = (message: string) => {
  feedback.color = "success"
  feedback.message = message
  feedback.issue = ""
}

const isBusy = (id: string, action: string) => busyAction.value?.id === id
  && busyAction.value?.action === action

const formatUserLabel = (userItem: AdminUser) => userItem.displayUsername
  || userItem.username
  || userItem.name
  || userItem.id

const formatRole = (role: AdminUser["role"]) => {
  if (!role) {
    return "user"
  }

  if (Array.isArray(role)) {
    return role.join(", ")
  }

  return role
}

const coerceRole = (role: AdminUser["role"]): UserType => {
  if (Array.isArray(role)) {
    return role.includes("admin")
      ? "admin"
      : "user"
  }

  return role === "admin"
    ? "admin"
    : "user"
}

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

const resetUserForm = () => {
  userForm.username = ""
  userForm.email = ""
  userForm.role = "user"
  userForm.password = ""
  userForm.confirmPassword = ""
}

const fetchUsers = async () => {
  resetFeedback()

  const {
    data, error,
  } = await authClient.admin.listUsers({
    query: {
      limit: 200,
      sortBy: "name",
      sortDirection: "asc",
    },
  })

  if (error) {
    applyError(error)
    users.value = []

    return
  }

  const mutatedUsers = (data?.users ?? []).map((user) => Object.assign(user, {
    username: user.name,
    displayUsername: user.name,
  }))

  users.value = mutatedUsers
}

const openCreateDialog = () => {
  resetFeedback()
  selectedUser.value = null
  dialogMode.value = "create"
  resetUserForm()
  showUserDialog.value = true
}

const openEditDialog = (userItem: AdminUser) => {
  resetFeedback()
  selectedUser.value = userItem
  dialogMode.value = "edit"
  userForm.username = userItem.displayUsername || userItem.username || userItem.name || ""
  userForm.email = userItem.email ?? ""
  userForm.role = coerceRole(userItem.role)
  userForm.password = ""
  userForm.confirmPassword = ""
  showUserDialog.value = true
}

const closeUserDialog = async () => {
  showUserDialog.value = false
  resetUserForm()
  await userFormRef.value?.reset()
  await userFormRef.value?.resetValidation()
}

const submitUser = async () => {
  resetFeedback()
  dialogLoading.value = true

  await userFormRef.value?.validate()

  if (userFormRef.value?.isValid === false) {
    dialogLoading.value = false

    return
  }

  try {
    if (isCreating.value) {
      const {
        error, data,
      } = await authClient.admin.createUser({
        email: userForm.email.trim(),
        password: userForm.password,
        name: userForm.username.trim(),
        role: userForm.role,
        data: {
          username: userForm.username.trim(),
          displayUsername: userForm.username.trim(),
          emailVerified: true,
        },
      })

      if (error) {
        applyError(error)

        return
      }

      let createdUserId = (data as { user?: { id?: string } } | null)?.user?.id ?? null

      if (!createdUserId) {
        await fetchUsers()
        createdUserId = users.value.find((entry) => entry.email === userForm.email.trim())?.id ?? null
      }

      if (createdUserId) {
        await authClient.admin.updateUser({
          userId: createdUserId,
          data: {
            username: userForm.username.trim(),
            displayUsername: userForm.username.trim(),
            name: userForm.username.trim(),
            email: userForm.email.trim(),
          },
        })
      }

      applySuccess(t("admin.users.create-success"))
    } else if (selectedUser.value) {
      const updatePayload = {
        username: userForm.username.trim(),
        displayUsername: userForm.username.trim(),
        name: userForm.username.trim(),
        email: userForm.email.trim(),
      }

      const { error: updateError } = await authClient.admin.updateUser({
        userId: selectedUser.value.id,
        data: updatePayload,
      })

      if (updateError) {
        applyError(updateError)

        return
      }

      const { error: roleError } = await authClient.admin.setRole({
        userId: selectedUser.value.id,
        role: userForm.role,
      })

      if (roleError) {
        applyError(roleError)

        return
      }

      if (userForm.password.trim()) {
        const { error: passwordError } = await authClient.admin.setUserPassword({
          userId: selectedUser.value.id,
          newPassword: userForm.password,
        })

        if (passwordError) {
          applyError(passwordError)

          return
        }
      }

      applySuccess(t("admin.users.edit-success"))
    }

    await fetchUsers()
    await closeUserDialog()
  } catch (error) {
    applyError(error as {
      message?: string; statusText?: string;
    })
  } finally {
    dialogLoading.value = false
  }
}

const showUserDeleteDialog = (userItem: AdminUser) => {
  selectedUser.value = userItem
  showDeleteDialog.value = true
}

const deleteUser = async () => {
  if (!selectedUser.value) {
    return
  }

  resetFeedback()
  deleteLoading.value = true

  try {
    const { error } = await authClient.admin.removeUser({
      userId: selectedUser.value.id,
    })

    if (error) {
      applyError(error)

      return
    }

    applySuccess(t("admin.users.delete-success"))
    await fetchUsers()
    showDeleteDialog.value = false
    selectedUser.value = null
  } catch (error) {
    applyError(error as {
      message?: string; statusText?: string;
    })
  } finally {
    deleteLoading.value = false
  }
}

const impersonateUser = async (userItem: AdminUser) => {
  resetFeedback()
  busyAction.value = {
    id: userItem.id, action: "impersonate",
  }

  try {
    const { error } = await authClient.admin.impersonateUser({
      userId: userItem.id,
    })

    if (error) {
      applyError(error)

      return
    }

    applySuccess(t("admin.users.impersonate-success", { username: formatUserLabel(userItem) }))
    await authClient.getSession({
      query: { disableCookieCache: true },
    })
    setTimeout(async () => {
      await navigateTo("/account", { external: true })
    }, 5000)
  } catch (error) {
    applyError(error as {
      message?: string; statusText?: string;
    })
  } finally {
    busyAction.value = null
  }
}

const downloadUserExport = async (userItem: AdminUser) => {
  resetFeedback()
  busyAction.value = {
    id: userItem.id, action: "export",
  }

  try {
    const response = await $fetch<{
      body: string; filename: string;
    }>("/api/admin/userExport", {
      params: {
        userId: userItem.id,
      },
    })

    const binaryString = atob(response.body)
    const len = binaryString.length
    const bytes = new Uint8Array(len)

    for (let i = 0; i < len; i += 1) {
      bytes[i] = binaryString.charCodeAt(i)
    }

    const blob = new Blob([bytes], { type: "application/zip" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")

    a.href = url
    a.download = response.filename
    a.click()
    window.URL.revokeObjectURL(url)
    applySuccess(t("admin.users.export-success", { username: formatUserLabel(userItem) }))
  } catch (error) {
    applyError(error as {
      message?: string; statusText?: string;
    })
  } finally {
    busyAction.value = null
  }
}

const downloadBackup = async (format: ExportFormat) => {
  try {
    exporting.value = true
    const response = await $fetch("/api/admin/dbExport", {
      params: { format },
    })

    const binaryString = atob(response.body)
    const len = binaryString.length
    const bytes = new Uint8Array(len)

    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }

    const blob = new Blob([bytes])

    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")

    a.href = url
    a.download = response.filename
    a.click()
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error("Export failed :", error)
  } finally {
    exporting.value = false
  }
}

onMounted(async () => {
  await fetchUsers()
})
</script>

<style lang="scss" scoped>
.glass-accordion :deep(.v-expansion-panel-text__wrapper) {
  padding: 0 !important;
}

.transparent-panel {
  background: rgba(var(--v-theme-surface), 0.6) !important;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(var(--v-theme-on-surface), 0.05);
}

.glass-list-item {
  border: 1px solid transparent;
  transition: all 0.2s ease;

  &:hover {
    border-color: rgba(var(--v-theme-primary), 0.2);
  }
}
</style>
