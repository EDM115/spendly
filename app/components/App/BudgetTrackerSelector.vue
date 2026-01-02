<template>
  <v-card class="mb-4 pa-1">
    <v-card-title class="d-flex align-center">
      <v-icon
        icon="mdi-wallet-bifold-outline"
        class="mr-2"
      />
      {{ $t("app.budget-tracker.title") }}
    </v-card-title>
    <v-card-text class="pt-4">
      <v-row align="center">
        <v-col
          cols="12"
          sm="6"
        >
          <v-select
            v-model="selectedTracker"
            :items="budgetTrackers"
            item-title="name"
            item-value="id"
            :label="$t('app.budget-tracker.select')"
            variant="outlined"
            hide-details
            clearable
            @update:model-value="onTrackerChange"
          >
            <template #no-data>
              <v-list-item>
                <v-list-item-title>{{ $t("app.budget-tracker.no-tracker") }}</v-list-item-title>
              </v-list-item>
            </template>
            <template #item="{ item, props: itemProps }">
              <v-list-item v-bind="itemProps">
                <template #append>
                  <v-chip
                    size="x-small"
                    :color="getRoleColor(item.raw.role)"
                  >
                    {{ $t(`app.budget-tracker.roles.${item.raw.role}`) }}
                  </v-chip>
                </template>
              </v-list-item>
            </template>
            <template #selection="{ item }">
              {{ item.raw.name }}
              <v-chip
                size="x-small"
                :color="getRoleColor(item.raw.role)"
                class="ml-2"
              >
                {{ $t(`app.budget-tracker.roles.${item.raw.role}`) }}
              </v-chip>
            </template>
          </v-select>
        </v-col>
        <v-col
          cols="12"
          sm="6"
          class="d-flex gap-2 flex-wrap"
        >
          <v-btn
            color="primary"
            class="ma-2"
            prepend-icon="mdi-plus"
            @click="showAddDialog = true"
          >
            {{ $t("app.budget-tracker.add") }}
          </v-btn>
          <v-btn
            v-if="selectedTracker && canEdit"
            color="secondary"
            class="ma-2"
            prepend-icon="mdi-pencil-outline"
            @click="openEditDialog"
          >
            {{ $t("app.budget-tracker.edit") }}
          </v-btn>
          <v-btn
            v-if="selectedTracker && canManageUsers"
            color="warning"
            class="ma-2"
            prepend-icon="mdi-account-multiple-outline"
            @click="showShareDialog = true"
          >
            {{ $t("app.budget-tracker.share") }}
          </v-btn>
          <v-btn
            v-if="selectedTracker && canDelete"
            color="error"
            class="ma-2"
            prepend-icon="mdi-delete-outline"
            @click="showDeleteDialog = true"
          >
            {{ $t("app.budget-tracker.delete") }}
          </v-btn>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>

  <v-dialog
    v-model="showAddDialog"
    max-width="500"
    persistent
  >
    <v-card class="pa-1">
      <v-card-title>{{ $t("app.budget-tracker.add") }}</v-card-title>
      <v-card-text>
        <v-text-field
          v-model="newTrackerName"
          :label="$t('app.budget-tracker.name')"
          variant="outlined"
          autofocus
          @keyup.enter="addTracker"
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          color="secondary"
          @click="showAddDialog = false"
        >
          {{ $t("app.budget-tracker.cancel") }}
        </v-btn>
        <v-btn
          color="primary"
          :disabled="!newTrackerName.trim()"
          @click="addTracker"
        >
          {{ $t("app.budget-tracker.add") }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog
    v-model="showEditDialog"
    max-width="500"
    persistent
  >
    <v-card class="pa-1">
      <v-card-title>{{ $t("app.budget-tracker.edit") }}</v-card-title>
      <v-card-text>
        <v-text-field
          v-model="editTrackerName"
          :label="$t('app.budget-tracker.name')"
          variant="outlined"
          autofocus
          @keyup.enter="updateTracker"
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          color="secondary"
          @click="showEditDialog = false"
        >
          {{ $t("app.budget-tracker.cancel") }}
        </v-btn>
        <v-btn
          color="primary"
          :disabled="!editTrackerName.trim()"
          @click="updateTracker"
        >
          {{ $t("app.budget-tracker.edit") }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog
    v-model="showDeleteDialog"
    max-width="500"
    persistent
  >
    <v-card class="pa-1">
      <v-card-title class="text-h5">
        {{ $t("app.budget-tracker.delete-title") }}
      </v-card-title>
      <v-card-text>
        {{ $t("app.budget-tracker.delete-description") }}
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          color="secondary"
          @click="showDeleteDialog = false"
        >
          {{ $t("app.budget-tracker.cancel") }}
        </v-btn>
        <v-btn
          color="error"
          @click="deleteTracker"
        >
          {{ $t("app.budget-tracker.delete") }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog
    v-model="showShareDialog"
    max-width="600"
    persistent
  >
    <v-card class="pa-1">
      <v-card-title>{{ $t("app.budget-tracker.users") }}</v-card-title>
      <v-card-text>
        <v-list v-if="sharedUsers.length > 0">
          <v-list-item
            v-for="user in sharedUsers"
            :key="user.user_id"
          >
            <template #prepend>
              <v-icon
                :icon="user.role === 'owner'
                  ? 'mdi-account-check-outline'
                  : user.role === 'admin'
                    ? 'mdi-account-wrench-outline'
                    : user.role === 'editor'
                      ? 'mdi-account-edit-outline'
                      : 'mdi-account-eye-outline'"
              />
            </template>
            <v-list-item-title>{{ user.username }}</v-list-item-title>
            <v-list-item-subtitle>
              <v-chip
                size="x-small"
                :color="getRoleColor(user.role)"
              >
                {{ $t(`app.budget-tracker.roles.${user.role}`) }}
              </v-chip>
            </v-list-item-subtitle>
            <template #append>
              <v-select
                v-if="user.role !== 'owner' && canChangeUserRole(user.role)"
                v-model="user.role"
                :items="availableRoles"
                item-title="title"
                item-value="value"
                density="compact"
                variant="outlined"
                hide-details
                class="mr-2"
                style="max-width: 140px;"
                @update:model-value="updateUserRole(user.user_id, $event)"
              />
              <v-tooltip
                location="top"
                :text="$t('app.budget-tracker.remove-user')"
              >
                <template #activator="{ props: tooltipProps }">
                  <v-btn
                    v-if="user.user_id !== store.getUser?.id && user.role !== 'owner'"
                    v-bind="tooltipProps"
                    icon="mdi-delete-outline"
                    color="error"
                    variant="text"
                    size="small"
                    @click="removeUser(user.user_id)"
                  />
                </template>
              </v-tooltip>
            </template>
          </v-list-item>
        </v-list>
        <v-divider class="my-4" />
        <v-row align="center">
          <v-col cols="6">
            <v-text-field
              v-model="newUsername"
              :label="$t('app.budget-tracker.username')"
              variant="outlined"
              density="compact"
              hide-details
            />
          </v-col>
          <v-col cols="4">
            <v-select
              v-model="newUserRole"
              :items="availableRoles"
              item-title="title"
              item-value="value"
              :label="$t('app.budget-tracker.role')"
              variant="outlined"
              density="compact"
              hide-details
            />
          </v-col>
          <v-col cols="2">
            <v-btn
              color="primary"
              icon="mdi-account-plus-outline"
              :disabled="!newUsername.trim()"
              @click="addUser"
            />
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          color="secondary"
          @click="showShareDialog = false"
        >
          {{ $t("app.budget-tracker.share-close") }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import type {
  BudgetTracker,
  SharedUser,
} from "~/types"

const props = defineProps<{
  budgetTrackers: BudgetTracker[];
  modelValue: string | null;
}>()

const emit = defineEmits<{
  "update:modelValue": [value: string | null];
  "refresh": [];
}>()

const { t } = useI18n()
const store = useMainStore()

const selectedTracker = ref<string | null>(props.modelValue)
const showAddDialog = ref(false)
const showEditDialog = ref(false)
const showDeleteDialog = ref(false)
const showShareDialog = ref(false)

const newTrackerName = ref("")
const editTrackerName = ref("")
const newUsername = ref("")
const newUserRole = ref("viewer")
const sharedUsers = ref<SharedUser[]>([])

const currentTrackerRole = computed(() => {
  const tracker = props.budgetTrackers.find((t) => t.id === selectedTracker.value)

  return tracker?.role ?? "viewer"
})

const canEdit = computed(() => store.canEditTracker)
const canDelete = computed(() => store.canDeleteTracker)
const canManageUsers = computed(() => store.canManageUsers)

const availableRoles = computed(() => [
  {
    title: t("app.budget-tracker.roles.viewer"), value: "viewer",
  },
  {
    title: t("app.budget-tracker.roles.editor"), value: "editor",
  },
  {
    title: t("app.budget-tracker.roles.admin"), value: "admin",
  },
])

const getRoleColor = (role: string) => {
  switch (role) {
    case "owner":
      return "accent"
    case "admin":
      return "primary"
    case "editor":
      return "secondary"
    default:
      return "info"
  }
}

const canChangeUserRole = (targetRole: string) => {
  if (currentTrackerRole.value === "owner") {
    return true
  }

  if (currentTrackerRole.value === "admin") {
    return targetRole !== "owner"
  }

  return false
}

watch(() => props.modelValue, (newVal) => {
  selectedTracker.value = newVal
})

const onTrackerChange = (value: string | null) => {
  const tracker = props.budgetTrackers.find((t) => t.id === value)
  const role = (tracker?.role ?? null) as "owner" | "admin" | "editor" | "viewer" | null

  store.setSelectedBudgetTracker(value, role)
  emit("update:modelValue", value)
}

const openEditDialog = () => {
  const tracker = props.budgetTrackers.find((t) => t.id === selectedTracker.value)

  if (tracker) {
    editTrackerName.value = tracker.name
    showEditDialog.value = true
  }
}

const addTracker = async () => {
  if (!newTrackerName.value.trim()) {
    return
  }

  try {
    const response = await $fetch("/api/budgetTracker", {
      method: "POST",
      body: { name: newTrackerName.value },
      headers: { Authorization: `Bearer ${store.getUser?.token}` },
    })

    newTrackerName.value = ""
    showAddDialog.value = false
    emit("refresh")

    if ("id" in response.body && response.body.id) {
      const newId = String(response.body.id)

      store.setSelectedBudgetTracker(newId, "owner")
      emit("update:modelValue", newId)
    }
  } catch (error) {
    console.error("Failed to add tracker:", error)
  }
}

const updateTracker = async () => {
  if (!editTrackerName.value.trim() || !selectedTracker.value) {
    return
  }

  try {
    await $fetch("/api/budgetTracker", {
      method: "PUT",
      body: {
        id: selectedTracker.value,
        name: editTrackerName.value,
      },
      headers: { Authorization: `Bearer ${store.getUser?.token}` },
    })
    showEditDialog.value = false
    emit("refresh")
  } catch (error) {
    console.error("Failed to update tracker:", error)
  }
}

const deleteTracker = async () => {
  if (!selectedTracker.value) {
    return
  }

  try {
    await $fetch("/api/budgetTracker", {
      method: "DELETE",
      body: { id: selectedTracker.value },
      headers: { Authorization: `Bearer ${store.getUser?.token}` },
    })
    showDeleteDialog.value = false
    store.setSelectedBudgetTracker(null, null)
    emit("update:modelValue", null)
    emit("refresh")
  } catch (error) {
    console.error("Failed to delete tracker:", error)
  }
}

const fetchSharedUsers = async () => {
  if (!selectedTracker.value) {
    return
  }

  try {
    const response = await $fetch("/api/budgetTracker/users", {
      params: { budget_tracker_id: selectedTracker.value },
      headers: { Authorization: `Bearer ${store.getUser?.token}` },
    })

    if ("users" in response.body) {
      sharedUsers.value = response.body.users
    }
  } catch (error) {
    console.error("Failed to fetch shared users:", error)
  }
}

const addUser = async () => {
  if (!newUsername.value.trim() || !selectedTracker.value) {
    return
  }

  try {
    await $fetch("/api/budgetTracker/users", {
      method: "POST",
      body: {
        budget_tracker_id: selectedTracker.value,
        username: newUsername.value,
        role: newUserRole.value,
      },
      headers: { Authorization: `Bearer ${store.getUser?.token}` },
    })
    newUsername.value = ""
    newUserRole.value = "viewer"
    await fetchSharedUsers()
  } catch (error) {
    console.error("Failed to add user:", error)
  }
}

const updateUserRole = async (userId: string, role: string) => {
  if (!selectedTracker.value) {
    return
  }

  try {
    await $fetch("/api/budgetTracker/users", {
      method: "PUT",
      body: {
        budget_tracker_id: selectedTracker.value,
        target_user_id: userId,
        role,
      },
      headers: { Authorization: `Bearer ${store.getUser?.token}` },
    })
    await fetchSharedUsers()
  } catch (error) {
    console.error("Failed to update user role:", error)
  }
}

const removeUser = async (userId: string) => {
  if (!selectedTracker.value) {
    return
  }

  try {
    await $fetch("/api/budgetTracker/users", {
      method: "DELETE",
      body: {
        budget_tracker_id: selectedTracker.value,
        target_user_id: userId,
      },
      headers: { Authorization: `Bearer ${store.getUser?.token}` },
    })
    await fetchSharedUsers()
  } catch (error) {
    console.error("Failed to remove user:", error)
  }
}

watch(showShareDialog, async (val) => {
  if (val) {
    await fetchSharedUsers()
  }
})
</script>
