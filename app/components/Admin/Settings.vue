<template>
  <div class="d-flex align-center mb-6">
    <v-icon
      icon="mdi-shield-account-outline"
      size="32"
      color="primary"
      class="mr-3"
    />
    <h1 class="text-h4 font-weight-bold gradient-text pb-0">
      {{ $t("admin.title") }}
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
        {{ $t("admin.users.title") }}
      </v-expansion-panel-title>
      <v-expansion-panel-text class="pt-4">
        <v-list class="bg-transparent">
          <v-list-item
            v-for="user in users"
            :key="user.id"
            class="mb-2 glass-list-item rounded-lg px-2"
          >
            <v-container class="pa-0">
              <v-row
                align="center"
                no-gutters
              >
                <v-col class="pa-2">
                  <v-list-item-title class="font-weight-medium">
                    <v-icon
                      icon="mdi-account"
                      size="small"
                      class="mr-2 opacity-50"
                    />
                    {{ user.username }}
                  </v-list-item-title>
                </v-col>
                <v-col class="pa-2">
                  <v-select
                    v-model="user.role"
                    hide-details
                    :disabled="user.id === store.getUser?.id"
                    :items="['user', 'admin']"
                    density="compact"
                    variant="solo"
                    bg-color="surface-light"
                    flat
                    :label="$t('admin.users.role')"
                    class="rounded-lg"
                  />
                </v-col>
                <v-col
                  class="pa-2 d-flex justify-end"
                >
                  <v-btn
                    :disabled="user.id === store.getUser?.id"
                    color="primary"
                    class="mr-2"
                    icon="mdi-pencil-outline"
                    variant="tonal"
                    size="small"
                    @click="updateUser(user.id, user.role)"
                  />
                  <v-btn
                    :disabled="user.id === store.getUser?.id"
                    icon="mdi-delete-outline"
                    color="error"
                    variant="tonal"
                    size="small"
                    @click="showUserDeleteDialog(user)"
                  />
                </v-col>
              </v-row>
            </v-container>
          </v-list-item>
        </v-list>

        <v-divider class="my-4 border-opacity-25" />

        <v-container class="pa-0">
          <div class="text-subtitle-2 font-weight-bold mb-3 d-flex align-center px-6">
            <v-icon
              icon="mdi-account-plus-outline"
              size="small"
              class="mr-2"
            />
            Add New User
          </div>
          <v-form
            class="pa-4 glass-form rounded-xl"
            @submit.prevent="addUser"
          >
            <v-row>
              <v-col
                cols="12"
                sm="4"
              >
                <v-text-field
                  v-model="newUser.username"
                  :label="$t('admin.users.username')"
                  required
                  variant="solo"
                  bg-color="surface"
                  flat
                  density="comfortable"
                  class="rounded-lg"
                  :error="!newUser.username.trim()"
                />
              </v-col>
              <v-col
                cols="12"
                sm="4"
              >
                <v-text-field
                  v-model="newUser.password"
                  :label="$t('admin.users.password')"
                  type="password"
                  required
                  variant="solo"
                  bg-color="surface"
                  flat
                  density="comfortable"
                  class="rounded-lg"
                  :error="!newUser.password.trim()"
                />
              </v-col>
              <v-col
                cols="12"
                sm="3"
              >
                <v-select
                  v-model="newUser.role"
                  :items="['user', 'admin']"
                  :label="$t('admin.users.role')"
                  required
                  variant="solo"
                  bg-color="surface"
                  flat
                  density="comfortable"
                  class="rounded-lg"
                />
              </v-col>
              <v-col
                cols="12"
                sm="1"
                class="d-flex justify-end align-center"
              >
                <v-btn
                  color="primary"
                  icon="mdi-account-plus-outline"
                  :disabled="!newUser.username.trim() || !newUser.password.trim()"
                  type="submit"
                  class="glow-button"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-container>
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
        {{ $t('admin.backup.title') }}
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
              {{ $t('admin.backup.export-csv') }}
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
              {{ $t('admin.backup.export-json') }}
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
              {{ $t('admin.backup.export-sql') }}
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
              {{ $t('admin.backup.export-sqlite') }}
            </v-btn>
          </v-col>
        </v-row>
      </v-expansion-panel-text>
    </v-expansion-panel>
  </v-expansion-panels>

  <v-dialog
    v-model="showDeleteDialog"
    persistent
    max-width="500"
  >
    <v-card class="glass-card pa-1 border-thin">
      <v-card-title class="text-h5 text-error font-weight-bold">
        {{ $t('admin.users.delete-title') }}
      </v-card-title>
      <v-card-text>
        {{ $t('admin.users.delete-description') }}
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          color="secondary"
          variant="text"
          :text="$t('admin.users.delete-cancel')"
          @click="showDeleteDialog = false"
        />
        <v-btn
          color="error"
          class="glow-button"
          variant="elevated"
          :text="$t('admin.users.delete-confirm')"
          @click="deleteUser"
        />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import type {
  ExportFormat,
  User,
} from "~/types"

const store = useMainStore()

const props = defineProps<{
  initialUsers?: User[];
}>()

const users = ref<User[]>(props.initialUsers ?? [])
const exporting = ref(false)

const showDeleteDialog = ref(false)

const userToDelete = ref<string | null>(null)

const newUser = ref({
  username: "", password: "", role: "user",
})

const resetNewUser = () => {
  const resetValue = {
    username: "", password: "", role: "user",
  }

  newUser.value = resetValue
}

const fetchData = async () => {
  const usersData = await $fetch("/api/admin/user", {
    headers: {
      Authorization: `Bearer ${store.getUser?.token}`,
    },
  })

  if ("users" in usersData.body) {
    users.value = usersData.body.users
  } else {
    users.value = []
  }
}

const addUser = async () => {
  await $fetch("/api/admin/user", {
    method: "POST",
    body: newUser.value,
    headers: {
      Authorization: `Bearer ${store.getUser?.token}`,
    },
  })
  resetNewUser()
  await fetchData()
}

const updateUser = async (userId: string, role: string) => {
  await $fetch("/api/admin/user", {
    method: "PUT",
    body: {
      id: userId, role,
    },
    headers: {
      Authorization: `Bearer ${store.getUser?.token}`,
    },
  })
  await fetchData()
}

const deleteUser = async () => {
  await $fetch("/api/admin/user", {
    method: "DELETE",
    body: {
      id: userToDelete.value,
    },
    headers: {
      Authorization: `Bearer ${store.getUser?.token}`,
    },
  })
  showDeleteDialog.value = false
  userToDelete.value = null
  await fetchData()
}

const showUserDeleteDialog = (user: User) => {
  userToDelete.value = user.id
  showDeleteDialog.value = true
}

const downloadBackup = async (format: ExportFormat) => {
  try {
    exporting.value = true
    const response = await $fetch("/api/admin/dbExport", {
      params: { format },
      headers: { Authorization: `Bearer ${store.getUser?.token}` },
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
  background: rgba(var(--v-theme-surface), 0.3) !important;
  border: 1px solid transparent;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(var(--v-theme-surface), 0.5) !important;
    border-color: rgba(var(--v-theme-primary), 0.2);
  }
}

.glass-form {
  background: rgba(var(--v-theme-surface), 0.3);
  border-radius: 16px;
}
</style>
