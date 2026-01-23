<template>
  <v-card class="glass-card mb-4 pa-1 rounded-lg">
    <v-card-title class="d-flex align-center justify-space-between">
      <div class="d-flex align-center">
        <v-icon
          icon="mdi-shape-outline"
          class="mr-2"
          color="primary"
        />
        <span class="font-weight-bold">{{ $t("app.category.title") }}</span>
      </div>
      <v-btn
        :disabled="!canEdit"
        color="primary"
        prepend-icon="mdi-plus"
        class="glow-button"
        :block="false"
        @click="showAddDialog = true"
      >
        {{ $t("app.category.add") }}
      </v-btn>
    </v-card-title>
    <v-card-text class="pt-4">
      <v-row
        v-if="categories.length > 0"
        dense
      >
        <v-col
          v-for="category in categories"
          :key="category.id"
          cols="12"
          sm="6"
          md="4"
        >
          <v-card
            variant="outlined"
            class="glass-panel pa-3 transition-swing"
            :style="{ border: `thin solid ${category.color}` }"
            rounded="lg"
          >
            <div class="d-flex align-center justify-space-between">
              <div class="d-flex align-center ga-3">
                <v-avatar
                  :color="category.color"
                  variant="tonal"
                  size="small"
                >
                  <v-icon
                    :icon="category.icon"
                    :color="category.color"
                    size="small"
                  />
                </v-avatar>
                <div
                  class="text-body-1 font-weight-medium text-high-emphasis"
                  style="word-break: break-all;"
                >
                  {{ category.name }}
                </div>
              </div>

              <div class="d-flex align-center ga-1">
                <v-tooltip
                  location="top"
                  :text="$t('app.category.edit')"
                >
                  <template #activator="{ props: tooltipProps }">
                    <v-btn
                      v-if="canEdit"
                      v-bind="tooltipProps"
                      icon="mdi-pencil-outline"
                      variant="text"
                      size="small"
                      color="secondary"
                      @click="openEditDialog(category)"
                    />
                  </template>
                </v-tooltip>

                <v-tooltip
                  location="top"
                  :text="$t('app.category.delete')"
                >
                  <template #activator="{ props: tooltipProps }">
                    <v-btn
                      v-if="canEdit"
                      v-bind="tooltipProps"
                      icon="mdi-delete-outline"
                      variant="text"
                      size="small"
                      color="error"
                      @click="openDeleteDialog(category)"
                    />
                  </template>
                </v-tooltip>
              </div>
            </div>
          </v-card>
        </v-col>
      </v-row>

      <v-alert
        v-else
        type="info"
        variant="tonal"
        class="glass-panel border-thin"
      >
        {{ $t("app.category.empty") }}
      </v-alert>
    </v-card-text>
  </v-card>

  <v-dialog
    v-model="showAddDialog"
    max-width="500"
    persistent
  >
    <v-card class="glass-card pa-1 border-thin">
      <v-card-title class="text-h6 font-weight-bold">
        {{ editingCategory ? $t("app.category.edit") : $t("app.category.add") }}
      </v-card-title>
      <v-card-text>
        <v-text-field
          v-model="categoryForm.name"
          :label="$t('app.category.name')"
          variant="outlined"
          autocomplete="suppress"
          class="mb-4"
          bg-color="transparent"
        />
        <v-row class="align-center mb-4">
          <v-col cols="auto">
            <v-avatar
              :color="categoryForm.color"
              size="large"
              variant="tonal"
              class="elevation-2"
            >
              <v-icon
                ref="testIcon"
                :icon="categoryForm.icon"
                :color="categoryForm.color"
              />
            </v-avatar>
          </v-col>
          <v-col>
            <v-autocomplete
              v-model="iconInput"
              v-model:search="iconSearch"
              :items="filteredIconItems"
              item-title="name"
              item-value="name"
              :label="$t('app.category.icon')"
              variant="outlined"
              hide-details
              :error="!isValidIcon"
              bg-color="transparent"
              clearable
              autocomplete="suppress"
              auto-select-first
              :no-filter="true"
              :menu-props="{ maxHeight: 320 }"
            >
              <template #item="{ props: itemProps, item }">
                <v-list-item v-bind="itemProps">
                  <template #prepend>
                    <v-icon
                      :icon="`mdi-${item.raw.name}`"
                      class="mr-n4"
                    />
                  </template>
                  <v-list-item-subtitle
                    v-if="item.raw.aliases && item.raw.aliases.length > 0"
                    style="max-width: 250px;"
                  >
                    {{ item.raw.aliases.map(alias => alias.split("-").join(" ")).join(", ") }}
                  </v-list-item-subtitle>
                </v-list-item>
              </template>
            </v-autocomplete>
          </v-col>
        </v-row>
        <v-color-picker
          v-model="categoryForm.color"
          mode="hex"
          :modes="['hex']"
          class="mb-4 glass-panel border-thin w-100"
          elevation="0"
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          color="secondary"
          variant="text"
          @click="closeDialog"
        >
          {{ $t("app.category.cancel") }}
        </v-btn>
        <v-btn
          color="primary"
          class="glow-button"
          variant="elevated"
          :disabled="!categoryForm.name.trim() || !isValidIcon"
          @click="saveCategory"
        >
          {{ editingCategory ? $t("app.category.edit") : $t("app.category.add") }}
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
        {{ $t("app.category.delete-title") }}
      </v-card-title>
      <v-card-text>
        {{ $t("app.category.delete-description") }}
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          color="secondary"
          variant="text"
          @click="showDeleteDialog = false"
        >
          {{ $t("app.category.cancel") }}
        </v-btn>
        <v-btn
          color="error"
          class="glow-button"
          variant="elevated"
          @click="deleteCategory"
        >
          {{ $t("app.category.delete") }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import type { VIcon } from "vuetify/components"

const mdiMetaRaw = await import("@mdi/svg/meta.json")

const props = defineProps<{
  categories: Category[];
  budgetTrackerId: string;
}>()

const emit = defineEmits<{
  refresh: [];
}>()

const store = useMainStore()
const theme = useVTheme()

const canEdit = computed(() => store.canEditData && !store.isDemo)
const showAddDialog = ref(false)
const showDeleteDialog = ref(false)
const editingCategory = ref<Category | null>(null)
const deletingCategory = ref<Category | null>(null)
const categoryForm = ref({
  name: "",
  icon: "mdi-",
  color: computed(() => theme.current.value.colors.primary).value,
})
const isValidIcon = ref(false)
const testIcon = ref<InstanceType<typeof VIcon> | HTMLElement | null>(null)
const iconSearch = ref("")

const mdiMeta = mdiMetaRaw as MdiMetaItem[]

const iconInput = computed({
  get: () => categoryForm.value.icon.replace(/^mdi-/, ""),
  set: (value: string) => {
    const cleaned = value.trim()
      .replace(/^mdi-/, "")

    categoryForm.value.icon = cleaned
      ? `mdi-${cleaned}`
      : "mdi-"
    void validateIcon(categoryForm.value.icon)
  },
})

const normalizeQuery = (value: string) => value
  .toLowerCase()
  .replace(/\//g, " ")
  .trim()

const splitTokens = (value: string) => normalizeQuery(value)
  .split(/[\s-]+/)
  .filter(Boolean)

const tokenMatchScore = (fieldToken: string, queryToken: string) => {
  if (fieldToken === queryToken) {
    return 30
  }

  if (fieldToken.startsWith(queryToken)) {
    return 20
  }

  if (fieldToken.includes(queryToken)) {
    return 10
  }

  return 0
}

const tokensMatchScore = (fieldTokens: string[], queryTokens: string[]) => {
  if (queryTokens.length === 0) {
    return 0
  }

  let total = 0

  for (const queryToken of queryTokens) {
    const best = fieldTokens.reduce(
      (max, fieldToken) => Math.max(max, tokenMatchScore(fieldToken, queryToken)),
      0,
    )

    if (best === 0) {
      return 0
    }

    total += best
  }

  const extraTokens = Math.max(fieldTokens.length - queryTokens.length, 0)

  return total - extraTokens * 2
}

const scoreTokens = (
  fieldValue: string,
  query: string,
  queryTokens: string[],
  splitPattern: RegExp,
  exactScore: number,
  tokenScore: number,
) => {
  if (!fieldValue) {
    return 0
  }

  const normalized = normalizeQuery(fieldValue)

  if (normalized === query) {
    return exactScore
  }

  const fieldTokens = normalized.split(splitPattern).filter(Boolean)

  const matchScore = tokensMatchScore(fieldTokens, queryTokens)

  if (matchScore > 0) {
    return tokenScore + matchScore
  }

  return 0
}

const filteredIconItems = computed(() => {
  const query = normalizeQuery(iconSearch.value)

  if (!query) {
    return [] as MdiMetaItem[]
  }

  const queryTokens = splitTokens(query)

  const scoredMatches = mdiMeta
    .map((item) => {
      const nameScore = scoreTokens(item.name, query, queryTokens, /-/, 100, 80)
      const aliasScore = item.aliases?.reduce((best, alias) => Math.max(
        best,
        scoreTokens(alias, query, queryTokens, /-/, 70, 60),
      ), 0) ?? 0
      const tagScore = item.tags?.reduce((best, tag) => Math.max(
        best,
        scoreTokens(tag, query, queryTokens, /\s+/, 40, 30),
      ), 0) ?? 0
      const score = Math.max(nameScore, aliasScore, tagScore)

      return score > 0 ? { item, score } : null
    })
    .filter((match): match is { item: MdiMetaItem; score: number } => Boolean(match))

  return scoredMatches
    .sort((a, b) => b.score - a.score || a.item.name.localeCompare(b.item.name))
    .map((match) => match.item)
    .slice(0, 100)
})

const validateIcon = async (iconName: string) => {
  const okBasic = iconName.startsWith("mdi-") && iconName.length >= 5

  if (!okBasic) {
    isValidIcon.value = false

    return
  }

  const el = testIcon.value instanceof HTMLElement
    ? testIcon.value
    : testIcon.value?.$el

  await nextTick()

  if (!el) {
    isValidIcon.value = false

    return
  }

  await nextTick()

  const content = window
    .getComputedStyle(el, "::before")
    .getPropertyValue("content")
    .replace(/"/g, "")

  isValidIcon.value = Boolean(content) && content !== "none" && content !== "normal"
}

const openEditDialog = (category: Category) => {
  if (!canEdit.value) {
    return
  }

  editingCategory.value = category
  categoryForm.value = {
    name: category.name,
    icon: category.icon,
    color: category.color,
  }
  isValidIcon.value = true
  iconSearch.value = iconInput.value
  showAddDialog.value = true
}

const openDeleteDialog = (category: Category) => {
  if (!canEdit.value) {
    return
  }

  deletingCategory.value = category
  showDeleteDialog.value = true
}

const closeDialog = () => {
  showAddDialog.value = false
  editingCategory.value = null
  categoryForm.value = {
    name: "",
    icon: "mdi-",
    color: "#4ADE80",
  }
  isValidIcon.value = false
  iconSearch.value = ""
}

watch(showAddDialog, (isOpen) => {
  if (isOpen) {
    iconSearch.value = iconInput.value
  }
})

const saveCategory = async () => {
  if (!canEdit.value) {
    return
  }

  if (!categoryForm.value.name.trim() || !isValidIcon.value) {
    return
  }

  try {
    if (editingCategory.value) {
      await $fetch("/api/category", {
        method: "PUT",
        body: {
          id: editingCategory.value.id,
          ...categoryForm.value,
        },
        headers: { Authorization: `Bearer ${store.getUser?.token}` },
      })
    } else {
      await $fetch("/api/category", {
        method: "POST",
        body: {
          budget_tracker_id: props.budgetTrackerId,
          ...categoryForm.value,
        },
        headers: { Authorization: `Bearer ${store.getUser?.token}` },
      })
    }

    closeDialog()
    emit("refresh")
  } catch (error) {
    console.error("Failed to save category :", error)
  }
}

const deleteCategory = async () => {
  if (!canEdit.value) {
    return
  }

  if (!deletingCategory.value) {
    return
  }

  try {
    await $fetch("/api/category", {
      method: "DELETE",
      body: { id: deletingCategory.value.id },
      headers: { Authorization: `Bearer ${store.getUser?.token}` },
    })
    showDeleteDialog.value = false
    deletingCategory.value = null
    emit("refresh")
  } catch (error) {
    console.error("Failed to delete category :", error)
  }
}
</script>

<style lang="scss" scoped>
.v-color-picker {
  width: auto;
}

:deep(.v-color-picker-canvas) {
  min-height: 150px !important;
}
</style>
