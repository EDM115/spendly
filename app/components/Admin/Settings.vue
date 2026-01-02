<template>
  <h1 class="mb-4">
    {{ $t("admin.title") }}
  </h1>

  <v-expansion-panels>
    <v-expansion-panel>
      <v-expansion-panel-title>{{ $t("admin.users.title") }}</v-expansion-panel-title>
      <v-expansion-panel-text>
        <v-list>
          <v-list-item
            v-for="user in users"
            :key="user.id"
          >
            <v-container>
              <v-row>
                <v-col cols="12">
                  <v-list-item-title>{{ user.username }}</v-list-item-title>
                </v-col>
                <v-col cols="12">
                  <v-select
                    v-model="user.role"
                    :disabled="user.id === store.getUser?.id"
                    :items="['user', 'admin']"
                    density="compact"
                    :label="$t('admin.users.role')"
                  />
                </v-col>
              </v-row>
            </v-container>
            <template #append>
              <div class="d-flex gap-2">
                <v-btn
                  color="primary"
                  size="small"
                  icon="mdi-pencil"
                  @click="updateUser(user.id, user.role)"
                />
                <v-btn
                  :disabled="user.id === store.getUser?.id"
                  icon="mdi-delete"
                  color="error"
                  variant="text"
                  @click="showUserDeleteDialog(user)"
                />
              </div>
            </template>
          </v-list-item>
        </v-list>
        <v-divider class="my-2" />
        <v-container>
          <v-form
            class="pl-4 pb-4"
            @submit.prevent="addUser"
          >
            <v-row>
              <v-col
                cols="12"
                :sm="3"
              >
                <v-text-field
                  v-model="newUser.username"
                  :label="$t('admin.users.username')"
                  required
                  :error="!newUser.username.trim()"
                />
              </v-col>
              <v-col
                cols="12"
                :sm="3"
              >
                <v-text-field
                  v-model="newUser.password"
                  :label="$t('admin.users.password')"
                  type="password"
                  required
                  :error="!newUser.password.trim()"
                />
              </v-col>
              <v-col
                cols="12"
                :sm="2"
              >
                <v-select
                  v-model="newUser.role"
                  :items="['user', 'admin']"
                  :label="$t('admin.users.role')"
                  required
                />
              </v-col>
              <v-col
                cols="12"
                :sm="2"
              >
                <v-btn
                  color="primary"
                  icon="mdi-account-plus-outline"
                  :disabled="!newUser.username.trim() || !newUser.password.trim()"
                  type="submit"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-container>
      </v-expansion-panel-text>
    </v-expansion-panel>
  </v-expansion-panels>

  <v-card class="mt-4">
    <v-card-title>{{ $t('admin.backup.title') }}</v-card-title>
    <v-card-text>
      <v-row>
        <v-col>
          <v-btn
            color="success"
            prepend-icon="mdi-file-delimited-outline"
            :loading="exporting"
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
            @click="downloadBackup('sqlite')"
          >
            {{ $t('admin.backup.export-sqlite') }}
          </v-btn>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>

  <v-dialog
    v-model="showDeleteDialog"
    persistent
  >
    <v-card>
      <v-card-title class="text-h5">
        {{ $t('admin.users.delete-title') }}
      </v-card-title>
      <v-card-text>
        {{ $t('admin.users.delete-description') }}
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          color="error"
          :text="$t('admin.users.delete-confirm')"
          @click="deleteUser"
        />
        <v-btn
          color="secondary"
          :text="$t('admin.users.delete-cancel')"
          @click="showDeleteDialog = false"
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
