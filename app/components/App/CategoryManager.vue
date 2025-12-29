<template>
  <v-card class="mb-4">
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
    <v-card-text>
      <v-list v-if="categories.length > 0">
        <v-list-item
          v-for="category in categories"
          :key="category.id"
        >
          <template #prepend>
            <v-icon
              :icon="category.icon"
              :color="category.icon_color"
            />
          </template>
          <v-list-item-title>{{ category.name }}</v-list-item-title>
          <v-list-item-subtitle>{{ category.icon_name }}</v-list-item-subtitle>
          <template #append>
            <v-btn
              v-if="canEdit"
              icon="mdi-pencil"
              variant="text"
              size="small"
              color="primary"
              @click="openEditDialog(category)"
            />
            <v-btn
              v-if="canEdit"
              icon="mdi-delete"
              variant="text"
              size="small"
              color="error"
              @click="openDeleteDialog(category)"
            />
          </template>
        </v-list-item>
      </v-list>
      <v-alert
        v-else
        type="info"
        variant="tonal"
      >
        {{ $t("app.category.select") }}
      </v-alert>
    </v-card-text>
  </v-card>

  <!-- Add/Edit Dialog -->
  <v-dialog
    v-model="showAddDialog"
    max-width="500"
    persistent
  >
    <v-card>
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
        <v-select
          v-model="categoryForm.icon_id"
          :items="icons"
          item-title="name"
          item-value="id"
          :label="$t('app.category.icon')"
          variant="outlined"
        >
          <template #item="{ item, props: itemProps }">
            <v-list-item v-bind="itemProps">
              <template #prepend>
                <v-icon
                  :icon="item.raw.icon"
                  :color="item.raw.color"
                />
              </template>
            </v-list-item>
          </template>
          <template #selection="{ item }">
            <v-icon
              :icon="item.raw.icon"
              :color="item.raw.color"
              class="mr-2"
            />
            {{ item.raw.name }}
          </template>
        </v-select>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          color="secondary"
          @click="closeDialog"
        >
          {{ $t("app.category.delete-cancel") }}
        </v-btn>
        <v-btn
          color="primary"
          :disabled="!categoryForm.name.trim() || !categoryForm.icon_id"
          @click="saveCategory"
        >
          {{ editingCategory ? $t("app.category.edit") : $t("app.category.add") }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Delete Dialog -->
  <v-dialog
    v-model="showDeleteDialog"
    max-width="500"
    persistent
  >
    <v-card>
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
          {{ $t("app.category.delete-cancel") }}
        </v-btn>
        <v-btn
          color="error"
          @click="deleteCategory"
        >
          {{ $t("app.category.delete-confirm") }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
type Category = {
  id: number;
  name: string;
  icon_id: number;
  icon_name: string;
  icon_color: string;
  icon: string;
}

type Icon = {
  id: number;
  name: string;
  color: string;
  icon: string;
}

const props = defineProps<{
  categories: Category[];
  icons: Icon[];
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
  icon_id: null as number | null,
})

const openEditDialog = (category: Category) => {
  editingCategory.value = category
  categoryForm.value = {
    name: category.name,
    icon_id: category.icon_id,
  }
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
    icon_id: null,
  }
}

const saveCategory = async () => {
  if (!categoryForm.value.name.trim() || !categoryForm.value.icon_id) {
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
        body: categoryForm.value,
        headers: { Authorization: `Bearer ${store.getUser?.token}` },
      })
    }

    closeDialog()
    emit("refresh")
  } catch (error) {
    console.error("Failed to save category:", error)
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
    console.error("Failed to delete category:", error)
  }
}
</script>
