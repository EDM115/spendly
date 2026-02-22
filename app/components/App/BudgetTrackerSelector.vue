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
            <v-autocomplete
              v-model="selectedTrackerId"
              :items="budgetTrackerItems"
              item-title="name"
              item-value="id"
              class="budget-tracker-ac"
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
                    <div :class="smAndUp ? undefined : 'd-flex flex-column'">
                      <v-chip
                        size="x-small"
                        :color="getRoleColor(item.raw.role)"
                        class="elevation-1"
                        variant="flat"
                      >
                        {{ t(`app.budget-tracker.roles.${item.raw.role}`) }}
                      </v-chip>
                      <v-chip
                        v-if="item.raw.owner_name"
                        size="x-small"
                        color="primary"
                        class="ml-2 elevation-1 mt-1 mt-sm-0"
                        variant="tonal"
                        prepend-icon="mdi-account-multiple-outline"
                      >
                        {{ item.raw.owner_name }}
                      </v-chip>
                    </div>
                  </template>
                </v-list-item>
              </template>
              <template #selection="{ item }">
                <span class="text-high-emphasis font-weight-medium">{{ item.raw.name }}</span>
              </template>

              <template #append-inner>
                <div
                  v-if="selectedTrackerId"
                  class="budget-tracker-chips"
                  :class="smAndUp ? 'budget-tracker-chips--row' : 'budget-tracker-chips--col'"
                  aria-hidden="true"
                >
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
                    class="elevation-1"
                    variant="tonal"
                    prepend-icon="mdi-account-multiple-outline"
                  >
                    {{ selectedTrackerOwnerName }}
                  </v-chip>
                </div>
              </template>
            </v-autocomplete>
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
            <template
              v-if="smAndUp"
              #prepend
            >
              <v-icon
                class="mr-2"
                :color="getRoleColor(user.role)"
                :icon="getRoleIcon(user.role)"
              />
            </template>
            <v-list-item-title
              v-if="smAndUp"
              class="font-weight-medium"
            >
              {{ user.username }}
            </v-list-item-title>
            <v-list-item-subtitle v-if="smAndUp">
              <v-chip
                size="x-small"
                :color="getRoleColor(user.role)"
                variant="flat"
                class="elevation-1"
              >
                {{ t(`app.budget-tracker.roles.${user.role}`) }}
              </v-chip>
            </v-list-item-subtitle>
            <template
              v-if="smAndUp"
              #append
            >
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

            <div
              v-if="!smAndUp"
              class="shared-user-mobile"
            >
              <div class="shared-user-mobile__icon">
                <v-icon
                  :color="getRoleColor(user.role)"
                  :icon="getRoleIcon(user.role)"
                />
              </div>

              <div class="shared-user-mobile__content">
                <div class="shared-user-mobile__identity">
                  <span class="font-weight-medium shared-user-mobile__username">{{ user.username }}</span>
                  <v-chip
                    size="x-small"
                    :color="getRoleColor(user.role)"
                    variant="flat"
                    class="elevation-1"
                  >
                    {{ t(`app.budget-tracker.roles.${user.role}`) }}
                  </v-chip>
                </div>

                <div
                  v-if="user.role !== 'owner' && (canEditSharedRole(user) || canTransferOwnership)"
                  class="shared-user-mobile__actions"
                >
                  <v-select
                    v-if="canEditSharedRole(user)"
                    v-model="user.role"
                    :items="availableRoles"
                    item-title="title"
                    item-value="value"
                    density="compact"
                    variant="outlined"
                    hide-details
                    rounded="lg"
                    bg-color="transparent"
                    class="shared-user-mobile__select"
                    @update:model-value="updateUserRole(user.user_id, $event)"
                  />
                  <v-tooltip
                    v-if="canTransferOwnership && user.user_id !== store.getUserId"
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
                        @click="openTransferDialog(user)"
                      />
                    </template>
                  </v-tooltip>
                  <v-tooltip
                    v-if="user.user_id !== store.getUserId"
                    location="top"
                    :text="t('app.budget-tracker.remove-user')"
                  >
                    <template #activator="{ props: tooltipProps }">
                      <v-btn
                        v-bind="tooltipProps"
                        icon="mdi-delete-outline"
                        color="error"
                        variant="text"
                        size="small"
                        @click="openRemoveShareDialog(user)"
                      />
                    </template>
                  </v-tooltip>
                </div>
              </div>
            </div>
          </v-list-item>
        </v-list>
        <v-divider class="my-4" />
        <v-row
          v-if="smAndUp"
          align="center"
        >
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

        <div
          v-else
          class="shared-user-add-mobile"
        >
          <div class="shared-user-add-mobile__fields">
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
            <v-select
              v-model="newUserRole"
              :items="availableRoles"
              item-title="title"
              item-value="value"
              :label="t('app.budget-tracker.role')"
              variant="outlined"
              density="compact"
              class="mt-2"
              rounded="lg"
              hide-details
              bg-color="transparent"
            />
          </div>
          <div class="shared-user-add-mobile__button-wrap">
            <v-btn
              color="primary"
              icon="mdi-account-plus-outline"
              :disabled="!newUsername.trim()"
              @click="addUser"
            />
          </div>
        </div>
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

function getEffectiveRole(id: string | null): BudgetTrackerRole {
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

function getRoleColor(role: string) {
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

function getRoleIcon(role: string) {
  switch (role) {
    case "owner":
      return "mdi-account-check-outline"
    case "admin":
      return "mdi-account-wrench-outline"
    case "editor":
      return "mdi-account-edit-outline"
    case "viewer":
      return "mdi-account-eye-outline"
    default:
      return "mdi-account-eye-outline"
  }
}

function canChangeUserRole(targetRole: string) {
  if (selectedTrackerRole.value === "owner") {
    return true
  }

  if (selectedTrackerRole.value === "admin") {
    return targetRole !== "owner"
  }

  return false
}

function canEditSharedRole(user: SharedUser) {
  return user.user_id !== store.getUserId
    && user.role !== "owner"
    && canChangeUserRole(user.role)
}

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

function onTrackerChange(value: string | null) {
  selectedTrackerId.value = value
}

function openEditDialog() {
  if (isDemo.value) {
    return
  }

  const tracker = props.budgetTrackers.find((track) => track.id === selectedTrackerId.value)

  if (tracker) {
    editTrackerName.value = tracker.name
    showEditDialog.value = true
  }
}

async function addTracker() {
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

async function updateTracker() {
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

async function deleteTracker() {
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

async function fetchSharedUsers() {
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

async function addUser() {
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

async function updateUserRole(userId: string, role: string) {
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

async function removeUser(userId: string) {
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

function openRemoveShareDialog(user: SharedUser) {
  removeShareTarget.value = user
  showRemoveShareDialog.value = true
}

async function confirmRemoveSharedUser() {
  if (!removeShareTarget.value) {
    return
  }

  await removeUser(removeShareTarget.value.user_id)
  showRemoveShareDialog.value = false
  removeShareTarget.value = null
}

function openTransferDialog(user: SharedUser) {
  if (!canTransferOwnership.value) {
    return
  }

  transferTarget.value = user
  showTransferDialog.value = true
}

async function confirmTransferOwnership() {
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

:deep(.budget-tracker-ac .v-field__append-inner) {
  align-items: center;
}

.budget-tracker-chips {
  display: flex;
  gap: 8px;
}

.budget-tracker-chips--col {
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.budget-tracker-chips--row {
  flex-direction: row;
  align-items: center;
}

.shared-user-mobile {
  width: 100%;
  display: grid;
  grid-template-columns: auto 1fr;
  column-gap: 8px;
  align-items: center;
}

.shared-user-mobile__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  align-self: center;
}

.shared-user-mobile__content {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.shared-user-mobile__identity {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.shared-user-mobile__username {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.shared-user-mobile__actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.shared-user-mobile__select {
  max-width: 140px;
}

.shared-user-add-mobile {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px;
  align-items: center;
}

.shared-user-add-mobile__fields {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.shared-user-add-mobile__button-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}
</style>
