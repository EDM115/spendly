<template>
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
          icon="mdi-wallet-bifold-outline"
          class="mr-2"
          color="primary"
        />
        <span class="font-weight-bold">{{ t("app.budget-tracker.title") }}</span>
      </v-expansion-panel-title>
      <v-expansion-panel-text class="pa-4">
        <v-row align="center">
          <v-col
            cols="12"
            sm="6"
          >
            <v-select
              v-model="selectedTrackerId"
              :items="budgetTrackerItems"
              item-title="name"
              item-value="id"
              :label="t('app.budget-tracker.select')"
              variant="outlined"
              hide-details
              rounded="lg"
              bg-color="transparent"
              @update:model-value="onTrackerChange"
            >
              <template #no-data>
                <v-list-item>
                  <v-list-item-title>{{ t("app.budget-tracker.no-tracker") }}</v-list-item-title>
                </v-list-item>
              </template>
              <template #item="{ item, props: itemProps }">
                <v-list-item v-bind="itemProps">
                  <template #append>
                    <v-chip
                      size="x-small"
                      :color="getRoleColor(item.raw.role)"
                      variant="flat"
                      class="elevation-2"
                    >
                      {{ t(`app.budget-tracker.roles.${item.raw.role}`) }}
                    </v-chip>
                    <v-chip
                      v-if="item.raw.owner_name"
                      size="x-small"
                      color="primary"
                      class="ml-2 elevation-1"
                      variant="tonal"
                      prepend-icon="mdi-account-multiple-outline"
                    >
                      {{ item.raw.owner_name }}
                    </v-chip>
                  </template>
                </v-list-item>
              </template>
              <template #selection="{ item }">
                <span class="text-high-emphasis font-weight-medium">{{ item.raw.name }}</span>
                <v-spacer />
                <v-chip
                  size="x-small"
                  :color="getRoleColor(selectedTrackerRole)"
                  class="elevation-1"
                  variant="flat"
                >
                  {{ t(`app.budget-tracker.roles.${selectedTrackerRole}`) }}
                </v-chip>
                <v-chip
                  v-if="selectedTrackerOwnerName"
                  size="x-small"
                  color="primary"
                  class="ml-2 elevation-1"
                  variant="tonal"
                  prepend-icon="mdi-account-multiple-outline"
                >
                  {{ selectedTrackerOwnerName }}
                </v-chip>
              </template>
            </v-select>
          </v-col>
          <v-col
            cols="12"
            sm="6"
            :class="['tracker-actions', smAndUp ? 'tracker-actions--inline' : 'tracker-actions--stack']"
          >
            <v-btn
              color="primary"
              :class="[smAndUp ? 'ma-2' : 'ma-1']"
              rounded="lg"
              prepend-icon="mdi-plus"
              :block="!smAndUp"
              :disabled="isDemo"
              @click="showAddDialog = true"
            >
              {{ t("app.budget-tracker.add") }}
            </v-btn>
            <v-btn
              v-if="selectedTrackerId"
              color="secondary"
              :class="[smAndUp ? 'ma-2' : 'ma-1']"
              rounded="lg"
              prepend-icon="mdi-pencil-outline"
              :block="!smAndUp"
              :disabled="isDemo || !canEdit"
              @click="openEditDialog"
            >
              {{ t("app.budget-tracker.edit") }}
            </v-btn>
            <v-btn
              v-if="selectedTrackerId"
              color="warning"
              :class="[smAndUp ? 'ma-2' : 'ma-1']"
              rounded="lg"
              prepend-icon="mdi-account-multiple-outline"
              :block="!smAndUp"
              :disabled="isDemo || !canManageUsers"
              @click="showShareDialog = true"
            >
              {{ t("app.budget-tracker.share") }}
            </v-btn>
            <v-btn
              v-if="selectedTrackerId"
              color="error"
              :class="[smAndUp ? 'ma-2' : 'ma-1']"
              rounded="lg"
              prepend-icon="mdi-delete-outline"
              :block="!smAndUp"
              :disabled="isDemo || !canDelete"
              @click="showDeleteDialog = true"
            >
              {{ t("app.budget-tracker.delete") }}
            </v-btn>
          </v-col>
        </v-row>
      </v-expansion-panel-text>
    </v-expansion-panel>
  </v-expansion-panels>

  <v-dialog
    v-model="showAddDialog"
    max-width="500"
    persistent
  >
    <v-card class="glass-card pa-1 border-thin">
      <v-card-title class="text-h6 font-weight-bold">
        {{ t("app.budget-tracker.add-title") }}
      </v-card-title>
      <v-card-text>
        <v-text-field
          v-model="newTrackerName"
          :label="t('app.budget-tracker.name')"
          variant="outlined"
          rounded="lg"
          autofocus
          autocomplete="suppress"
          bg-color="transparent"
          @keyup.enter="addTracker"
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          color="secondary"
          rounded="lg"
          variant="text"
          @click="showAddDialog = false"
        >
          {{ t("app.budget-tracker.cancel") }}
        </v-btn>
        <v-btn
          color="primary"
          rounded="lg"
          variant="elevated"
          :disabled="!newTrackerName.trim()"
          @click="addTracker"
        >
          {{ t("app.budget-tracker.add") }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog
    v-model="showEditDialog"
    max-width="500"
    persistent
  >
    <v-card class="glass-card pa-1 border-thin">
      <v-card-title class="text-h6 font-weight-bold">
        {{ t("app.budget-tracker.edit-title") }}
      </v-card-title>
      <v-card-text>
        <v-text-field
          v-model="editTrackerName"
          :label="t('app.budget-tracker.name')"
          variant="outlined"
          rounded="lg"
          autofocus
          autocomplete="suppress"
          bg-color="transparent"
          @keyup.enter="updateTracker"
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          color="secondary"
          rounded="lg"
          variant="text"
          @click="showEditDialog = false"
        >
          {{ t("app.budget-tracker.cancel") }}
        </v-btn>
        <v-btn
          color="primary"
          rounded="lg"
          variant="elevated"
          :disabled="!editTrackerName.trim()"
          @click="updateTracker"
        >
          {{ t("app.budget-tracker.edit") }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog
    v-model="showDeleteDialog"
    max-width="500"
    persistent
  >
    <v-card class="glass-card pa-1 border-thin">
      <v-card-title class="text-h5 text-error font-weight-bold">
        {{ t("app.budget-tracker.delete-title") }}
      </v-card-title>
      <v-card-text>
        {{ t("app.budget-tracker.delete-description") }}
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          color="secondary"
          rounded="lg"
          variant="text"
          @click="showDeleteDialog = false"
        >
          {{ t("app.budget-tracker.cancel") }}
        </v-btn>
        <v-btn
          color="error"
          rounded="lg"
          variant="elevated"
          @click="deleteTracker"
        >
          {{ t("app.budget-tracker.delete") }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog
    v-model="showShareDialog"
    max-width="600"
    persistent
  >
    <v-card class="glass-card pa-1 border-thin">
      <v-card-title class="text-h6 font-weight-bold">
        {{ t("app.budget-tracker.users") }}
      </v-card-title>
      <v-card-text>
        <v-list
          v-if="sortedSharedUsers.length > 0"
          bg-color="transparent"
        >
          <v-list-item
            v-for="user in sortedSharedUsers"
            :key="user.user_id"
            class="mb-1"
            rounded="lg"
            style="background: rgba(var(--v-theme-surface), 0.3)"
          >
            <template #prepend>
              <v-icon
                class="mr-2"
                :color="getRoleColor(user.role)"
                :icon="user.role === 'owner'
                  ? 'mdi-account-check-outline'
                  : user.role === 'admin'
                    ? 'mdi-account-wrench-outline'
                    : user.role === 'editor'
                      ? 'mdi-account-edit-outline'
                      : 'mdi-account-eye-outline'"
              />
            </template>
            <v-list-item-title class="font-weight-medium">
              {{ user.username }}
            </v-list-item-title>
            <v-list-item-subtitle>
              <v-chip
                size="x-small"
                :color="getRoleColor(user.role)"
                variant="flat"
                class="elevation-1"
              >
                {{ t(`app.budget-tracker.roles.${user.role}`) }}
              </v-chip>
            </v-list-item-subtitle>
            <template #append>
              <v-select
                v-if="canEditSharedRole(user)"
                v-model="user.role"
                :items="availableRoles"
                item-title="title"
                item-value="value"
                density="compact"
                variant="outlined"
                hide-details
                class="mr-2"
                rounded="lg"
                bg-color="transparent"
                style="max-width: 140px;"
                @update:model-value="updateUserRole(user.user_id, $event)"
              />
              <v-tooltip
                v-if="canTransferOwnership && user.user_id !== store.getUserId && user.role !== 'owner'"
                location="top"
                :text="t('app.budget-tracker.transfer-action')"
              >
                <template #activator="{ props: tooltipProps }">
                  <v-btn
                    v-bind="tooltipProps"
                    icon="mdi-account-arrow-right-outline"
                    color="warning"
                    variant="text"
                    size="small"
                    class="ml-1"
                    @click="openTransferDialog(user)"
                  />
                </template>
              </v-tooltip>
              <v-tooltip
                location="top"
                :text="t('app.budget-tracker.remove-user')"
              >
                <template #activator="{ props: tooltipProps }">
                  <v-btn
                    v-if="user.user_id !== store.getUserId && user.role !== 'owner'"
                    v-bind="tooltipProps"
                    icon="mdi-delete-outline"
                    color="error"
                    variant="text"
                    size="small"
                    class="ml-1"
                    @click="openRemoveShareDialog(user)"
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
              :label="t('app.budget-tracker.username')"
              variant="outlined"
              density="compact"
              rounded="lg"
              hide-details
              autocomplete="suppress"
              bg-color="transparent"
            />
          </v-col>
          <v-col cols="4">
            <v-select
              v-model="newUserRole"
              :items="availableRoles"
              item-title="title"
              item-value="value"
              :label="t('app.budget-tracker.role')"
              variant="outlined"
              density="compact"
              rounded="lg"
              hide-details
              bg-color="transparent"
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
          rounded="lg"
          variant="text"
          @click="showShareDialog = false"
        >
          {{ t("app.budget-tracker.share-close") }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog
    v-model="showTransferDialog"
    max-width="520"
    persistent
  >
    <v-card class="glass-card pa-1 border-thin">
      <v-card-title class="text-h5 text-warning font-weight-bold">
        {{ t("app.budget-tracker.transfer-title") }}
      </v-card-title>
      <v-card-text>
        {{ t("app.budget-tracker.transfer-description", { username: transferTarget?.username ?? "" }) }}
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          color="secondary"
          rounded="lg"
          variant="text"
          @click="showTransferDialog = false"
        >
          {{ t("app.budget-tracker.transfer-cancel") }}
        </v-btn>
        <v-btn
          color="warning"
          rounded="lg"
          variant="elevated"
          @click="confirmTransferOwnership"
        >
          {{ t("app.budget-tracker.transfer-confirm") }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog
    v-model="showRemoveShareDialog"
    max-width="520"
    persistent
  >
    <v-card class="glass-card pa-1 border-thin">
      <v-card-title class="text-h5 text-error font-weight-bold">
        {{ t("app.budget-tracker.remove-user-title") }}
      </v-card-title>
      <v-card-text>
        {{ t("app.budget-tracker.remove-user-description", { username: removeShareTarget?.username ?? "" }) }}
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          color="secondary"
          rounded="lg"
          variant="text"
          @click="showRemoveShareDialog = false"
        >
          {{ t("app.budget-tracker.remove-user-cancel") }}
        </v-btn>
        <v-btn
          color="error"
          rounded="lg"
          variant="elevated"
          @click="confirmRemoveSharedUser"
        >
          {{ t("app.budget-tracker.remove-user-confirm") }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
const props = defineProps<{
  budgetTrackers: BudgetTracker[];
  modelValue: string | null;
}>()

const emit = defineEmits<{
  "update:modelValue": [value: string | null];
  "refresh": [];
}>()

const {
  locale,
  t,
} = useI18n()
const store = useMainStore()
const { smAndUp } = useVDisplay()
const { logUiEvent } = useUiEventLogger()
const isDemo = computed(() => store.getIsDemo)

const selectedTrackerId = computed<string | null>({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
})
const showAddDialog = ref(false)
const showEditDialog = ref(false)
const showDeleteDialog = ref(false)
const showShareDialog = ref(false)
const showTransferDialog = ref(false)
const showRemoveShareDialog = ref(false)

const newTrackerName = ref("")
const editTrackerName = ref("")
const newUsername = ref("")
const newUserRole = ref("viewer")
const sharedUsers = ref<SharedUser[]>([])
const transferTarget = ref<SharedUser | null>(null)
const removeShareTarget = ref<SharedUser | null>(null)
const trackerRoleOverrides = ref<Record<string, BudgetTrackerRole>>({})

const trackerById = computed(() => new Map(props.budgetTrackers.map((tracker) => [ tracker.id, tracker ])))

const getEffectiveRole = (id: string | null): BudgetTrackerRole => {
  if (!id) {
    return "viewer"
  }

  const override = trackerRoleOverrides.value[id]

  if (override) {
    return override
  }

  return trackerById.value.get(id)?.role ?? "viewer"
}

const budgetTrackerItems = computed(() => props.budgetTrackers.map((tracker) => {
  const override = trackerRoleOverrides.value[tracker.id]

  if (!override || override === tracker.role) {
    return tracker
  }

  return Object.assign({}, tracker, { role: override })
})
  .toSorted((a, b) => a.name.localeCompare(b.name, locale.value, {
    sensitivity: "base",
  })))

const selectedTrackerRole = computed<BudgetTrackerRole>(() => getEffectiveRole(selectedTrackerId.value))
const selectedTrackerOwnerName = computed<string>(() => {
  if (!selectedTrackerId.value) {
    return ""
  }

  const tracker = budgetTrackerItems.value.find((item) => item.id === selectedTrackerId.value)

  return tracker?.owner_name ?? ""
})

const canEdit = computed(() => !isDemo.value && Boolean(selectedTrackerId.value)
  && [ "owner", "admin" ].includes(selectedTrackerRole.value))
const canDelete = computed(() => !isDemo.value && Boolean(selectedTrackerId.value)
  && selectedTrackerRole.value === "owner")
const canManageUsers = computed(() => !isDemo.value && Boolean(selectedTrackerId.value)
  && [ "owner", "admin" ].includes(selectedTrackerRole.value))
const canTransferOwnership = computed(() => Boolean(selectedTrackerId.value)
  && selectedTrackerRole.value === "owner")

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

const sortedSharedUsers = computed(() => {
  const rolePriority: Record<string, number> = {
    owner: 0,
    admin: 1,
    editor: 2,
    viewer: 3,
  }

  return [...sharedUsers.value]
    .toSorted((a, b) => {
      const roleDiff = (rolePriority[a.role] ?? 99) - (rolePriority[b.role] ?? 99)

      if (roleDiff !== 0) {
        return roleDiff
      }

      return a.username.localeCompare(b.username, locale.value, {
        sensitivity: "base",
      })
    })
})

const getRoleColor = (role: string) => {
  switch (role) {
    case "owner":
      return "primary"
    case "admin":
      return "secondary"
    case "editor":
      return "info"
    case "viewer":
      return "accent"
    default:
      return "accent"
  }
}

const canChangeUserRole = (targetRole: string) => {
  if (selectedTrackerRole.value === "owner") {
    return true
  }

  if (selectedTrackerRole.value === "admin") {
    return targetRole !== "owner"
  }

  return false
}

const canEditSharedRole = (user: SharedUser) => user.user_id !== store.getUserId
  && user.role !== "owner"
  && canChangeUserRole(user.role)

watchEffect(() => {
  if (!selectedTrackerId.value) {
    if (store.getSelectedBudgetTrackerId) {
      store.setSelectedBudgetTracker(null, null)
    }

    return
  }

  const role = selectedTrackerRole.value

  if (store.getSelectedBudgetTrackerId !== selectedTrackerId.value
    || store.getCurrentBudgetTrackerRole !== role) {
    store.setSelectedBudgetTracker(selectedTrackerId.value, role)
  }
})

watch(() => props.budgetTrackers, (trackers) => {
  const nextOverrides: Record<string, BudgetTrackerRole> = {}

  trackers.forEach((tracker) => {
    const override = trackerRoleOverrides.value[tracker.id]

    if (override && override !== tracker.role) {
      nextOverrides[tracker.id] = override
    }
  })

  trackerRoleOverrides.value = nextOverrides
})

watch(() => props.budgetTrackers, (trackers) => {
  if (!selectedTrackerId.value) {
    return
  }

  const stillExists = trackers.some((tracker) => tracker.id === selectedTrackerId.value)

  if (!stillExists) {
    selectedTrackerId.value = null
  }
})

const onTrackerChange = (value: string | null) => {
  selectedTrackerId.value = value
}

const openEditDialog = () => {
  if (isDemo.value) {
    return
  }

  const tracker = props.budgetTrackers.find((track) => track.id === selectedTrackerId.value)

  if (tracker) {
    editTrackerName.value = tracker.name
    showEditDialog.value = true
  }
}

const addTracker = async () => {
  if (isDemo.value) {
    return
  }

  if (!newTrackerName.value.trim()) {
    return
  }

  const start = performance.now()

  try {
    const response = await $fetch("/api/budgetTracker", {
      method: "POST",
      body: { name: newTrackerName.value },
    })

    newTrackerName.value = ""
    showAddDialog.value = false
    emit("refresh")

    if ("id" in response.body && response.body.id) {
      const newId = String(response.body.id)

      trackerRoleOverrides.value = Object.assign({}, trackerRoleOverrides.value, {
        [newId]: "owner",
      })
      selectedTrackerId.value = newId
    }

    void logUiEvent({
      action: "budgetTracker.create",
      duration_ms: Math.round(performance.now() - start),
      outcome: "success",
    })
  } catch (error) {
    void logUiEvent({
      action: "budgetTracker.create",
      duration_ms: Math.round(performance.now() - start),
      outcome: "error",
    })
  }
}

const updateTracker = async () => {
  if (isDemo.value) {
    return
  }

  if (!editTrackerName.value.trim() || !selectedTrackerId.value) {
    return
  }

  const start = performance.now()

  try {
    await $fetch("/api/budgetTracker", {
      method: "PUT",
      body: {
        id: selectedTrackerId.value,
        name: editTrackerName.value,
      },
    })
    showEditDialog.value = false
    emit("refresh")

    void logUiEvent({
      action: "budgetTracker.update",
      duration_ms: Math.round(performance.now() - start),
      outcome: "success",
      meta: {
        budget_tracker_id: selectedTrackerId.value,
      },
    })
  } catch (error) {
    void logUiEvent({
      action: "budgetTracker.update",
      duration_ms: Math.round(performance.now() - start),
      outcome: "error",
      meta: {
        budget_tracker_id: selectedTrackerId.value,
      },
    })
  }
}

const deleteTracker = async () => {
  if (isDemo.value) {
    return
  }

  if (!selectedTrackerId.value) {
    return
  }

  const start = performance.now()

  try {
    await $fetch("/api/budgetTracker", {
      method: "DELETE",
      body: { id: selectedTrackerId.value },
    })
    showDeleteDialog.value = false
    selectedTrackerId.value = null
    emit("refresh")

    void logUiEvent({
      action: "budgetTracker.delete",
      duration_ms: Math.round(performance.now() - start),
      outcome: "success",
    })
  } catch (error) {
    void logUiEvent({
      action: "budgetTracker.delete",
      duration_ms: Math.round(performance.now() - start),
      outcome: "error",
    })
  }
}

const fetchSharedUsers = async () => {
  if (!selectedTrackerId.value) {
    return
  }

  try {
    const response = await $fetch("/api/budgetTracker/users", {
      params: { budget_tracker_id: selectedTrackerId.value },
    })

    if ("users" in response.body) {
      sharedUsers.value = response.body.users
    }
  } catch (error) {
    void 0
  }
}

const addUser = async () => {
  if (isDemo.value) {
    return
  }

  if (!newUsername.value.trim() || !selectedTrackerId.value) {
    return
  }

  const start = performance.now()

  try {
    await $fetch("/api/budgetTracker/users", {
      method: "POST",
      body: {
        budget_tracker_id: selectedTrackerId.value,
        username: newUsername.value,
        role: newUserRole.value,
      },
    })
    newUsername.value = ""
    newUserRole.value = "viewer"
    await fetchSharedUsers()

    void logUiEvent({
      action: "budgetTracker.users.add",
      duration_ms: Math.round(performance.now() - start),
      outcome: "success",
      meta: {
        budget_tracker_id: selectedTrackerId.value,
      },
    })
  } catch (error) {
    void logUiEvent({
      action: "budgetTracker.users.add",
      duration_ms: Math.round(performance.now() - start),
      outcome: "error",
      meta: {
        budget_tracker_id: selectedTrackerId.value,
      },
    })
  }
}

const updateUserRole = async (userId: string, role: string) => {
  if (isDemo.value) {
    return
  }

  if (!selectedTrackerId.value) {
    return
  }

  const start = performance.now()

  try {
    await $fetch("/api/budgetTracker/users", {
      method: "PUT",
      body: {
        budget_tracker_id: selectedTrackerId.value,
        target_user_id: userId,
        role,
      },
    })
    await fetchSharedUsers()

    void logUiEvent({
      action: "budgetTracker.users.update",
      duration_ms: Math.round(performance.now() - start),
      outcome: "success",
      meta: {
        budget_tracker_id: selectedTrackerId.value,
        target_user_id: userId,
      },
    })
  } catch (error) {
    void logUiEvent({
      action: "budgetTracker.users.update",
      duration_ms: Math.round(performance.now() - start),
      outcome: "error",
      meta: {
        budget_tracker_id: selectedTrackerId.value,
        target_user_id: userId,
      },
    })
  }
}

const removeUser = async (userId: string) => {
  if (isDemo.value) {
    return
  }

  if (!selectedTrackerId.value) {
    return
  }

  const start = performance.now()

  try {
    await $fetch("/api/budgetTracker/users", {
      method: "DELETE",
      body: {
        budget_tracker_id: selectedTrackerId.value,
        target_user_id: userId,
      },
    })
    await fetchSharedUsers()

    void logUiEvent({
      action: "budgetTracker.users.remove",
      duration_ms: Math.round(performance.now() - start),
      outcome: "success",
      meta: {
        budget_tracker_id: selectedTrackerId.value,
        target_user_id: userId,
      },
    })
  } catch (error) {
    void logUiEvent({
      action: "budgetTracker.users.remove",
      duration_ms: Math.round(performance.now() - start),
      outcome: "error",
      meta: {
        budget_tracker_id: selectedTrackerId.value,
        target_user_id: userId,
      },
    })
  }
}

const openRemoveShareDialog = (user: SharedUser) => {
  removeShareTarget.value = user
  showRemoveShareDialog.value = true
}

const confirmRemoveSharedUser = async () => {
  if (!removeShareTarget.value) {
    return
  }

  await removeUser(removeShareTarget.value.user_id)
  showRemoveShareDialog.value = false
  removeShareTarget.value = null
}

const openTransferDialog = (user: SharedUser) => {
  if (!canTransferOwnership.value) {
    return
  }

  transferTarget.value = user
  showTransferDialog.value = true
}

const confirmTransferOwnership = async () => {
  if (!transferTarget.value || !selectedTrackerId.value) {
    return
  }

  const start = performance.now()

  try {
    showTransferDialog.value = false
    await $fetch("/api/budgetTracker/transferOwnership", {
      method: "POST",
      body: {
        budget_tracker_id: selectedTrackerId.value,
        target_user_id: transferTarget.value.user_id,
      },
    })
    trackerRoleOverrides.value = Object.assign({}, trackerRoleOverrides.value, {
      [selectedTrackerId.value]: "admin",
    })
    sharedUsers.value = sharedUsers.value.map((entry) => {
      if (entry.user_id === transferTarget.value?.user_id) {
        return Object.assign({}, entry, { role: "owner" })
      }

      if (entry.user_id === store.getUserId) {
        return Object.assign({}, entry, { role: "admin" })
      }

      return entry
    })
    emit("refresh")
    await fetchSharedUsers()

    void logUiEvent({
      action: "budgetTracker.transferOwnership",
      duration_ms: Math.round(performance.now() - start),
      outcome: "success",
      meta: {
        budget_tracker_id: selectedTrackerId.value,
        target_user_id: transferTarget.value.user_id,
      },
    })
  } catch (_error) {
    void logUiEvent({
      action: "budgetTracker.transferOwnership",
      duration_ms: Math.round(performance.now() - start),
      outcome: "error",
      meta: {
        budget_tracker_id: selectedTrackerId.value,
        target_user_id: transferTarget.value?.user_id,
      },
    })
  } finally {
    showTransferDialog.value = false
    transferTarget.value = null
  }
}

watch(showShareDialog, async (val) => {
  if (val) {
    await fetchSharedUsers()
  }
})

watch(showTransferDialog, (val) => {
  if (!val && showShareDialog.value) {
    void fetchSharedUsers()
  }
})
</script>

<style lang="scss" scoped>
.tracker-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tracker-actions--stack {
  display: grid;
  grid-template-columns: 50% 50%;
  gap: 8px;
  align-content: center;
  justify-content: center;
  align-items: center;
  justify-items: center;
}

:deep(.v-select__selection) {
  width: 100%;
}
</style>
