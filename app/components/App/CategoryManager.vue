<template>
  <v-card class="mb-4 pa-1 rounded-lg">
    <v-card-title class="d-flex align-center justify-space-between">
      <div class="d-flex align-center">
        <v-icon
          icon="mdi-shape-outline"
          class="mr-2"
        />
        {{ $t("app.category.title") }}
      </div>
      <v-btn
        v-if="canEdit"
        color="primary"
        prepend-icon="mdi-plus"
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
            :style="{ border: `thin solid ${category.color}` }"
            rounded="lg"
            class="pa-3"
          >
            <div class="d-flex align-center justify-space-between">
              <div class="d-flex align-center ga-3">
                <v-icon
                  :icon="category.icon"
                  :color="category.color"
                />
                <div class="text-body-1">
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
    <v-card class="pa-1">
      <v-card-title>
        {{ editingCategory ? $t("app.category.edit") : $t("app.category.add") }}
      </v-card-title>
      <v-card-text>
        <v-text-field
          v-model="categoryForm.name"
          :label="$t('app.category.name')"
          variant="outlined"
          class="mb-4"
        />
        <v-row class="align-center mb-4">
          <v-col cols="auto">
            <v-icon
              ref="testIcon"
              :icon="categoryForm.icon"
              :color="categoryForm.color"
              size="large"
            />
          </v-col>
          <v-col>
            <v-text-field
              v-model="categoryForm.icon"
              :label="$t('app.category.icon')"
              variant="outlined"
              hide-details
              :error="!isValidIcon"
              @update:model-value="validateIcon"
            />
          </v-col>
        </v-row>
        <v-color-picker
          v-model="categoryForm.color"
          mode="hex"
          :modes="['hex']"
          class="mb-4"
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          color="secondary"
          @click="closeDialog"
        >
          {{ $t("app.category.cancel") }}
        </v-btn>
        <v-btn
          color="primary"
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
    <v-card class="pa-1">
      <v-card-title class="text-h5">
        {{ $t("app.category.delete-title") }}
      </v-card-title>
      <v-card-text>
        {{ $t("app.category.delete-description") }}
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          color="secondary"
          @click="showDeleteDialog = false"
        >
          {{ $t("app.category.cancel") }}
        </v-btn>
        <v-btn
          color="error"
          @click="deleteCategory"
        >
          {{ $t("app.category.delete") }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import type { Category } from "~/types"
import type { VIcon } from "vuetify/components"

const props = defineProps<{
  categories: Category[];
  budgetTrackerId: string;
}>()

const emit = defineEmits<{
  refresh: [];
}>()

const store = useMainStore()

const canEdit = computed(() => store.canEditData)
const showAddDialog = ref(false)
const showDeleteDialog = ref(false)
const editingCategory = ref<Category | null>(null)
const deletingCategory = ref<Category | null>(null)
const categoryForm = ref({
  name: "",
  icon: "mdi-",
  color: "#4ADE80",
})
const isValidIcon = ref(false)
const testIcon = ref<InstanceType<typeof VIcon> | HTMLElement | null>(null)

const validateIcon = async (iconName: string) => {
  const okBasic = iconName.startsWith("mdi-") && iconName.length >= 5

  if (!okBasic) {
    isValidIcon.value = false

    if (!iconName.startsWith("mdi-")) {
      if (iconName.length >= 4) {
        categoryForm.value.icon = "mdi-" + iconName
      } else {
        categoryForm.value.icon = "mdi-"
      }
    }

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
  editingCategory.value = category
  categoryForm.value = {
    name: category.name,
    icon: category.icon,
    color: category.color,
  }
  isValidIcon.value = true
  showAddDialog.value = true
}

const openDeleteDialog = (category: Category) => {
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
}

const saveCategory = async () => {
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
</style>
