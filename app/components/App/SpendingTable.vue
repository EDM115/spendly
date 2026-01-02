<template>
  <v-card class="mb-4 pa-1">
    <v-card-title class="d-flex align-center justify-space-between flex-wrap gap-2">
      <div class="d-flex align-center">
        <v-icon
          icon="mdi-format-list-bulleted"
          class="mr-2"
        />
        {{ $t("app.spending.title") }}
      </div>
      <div class="d-flex gap-2 flex-wrap">
        <v-btn-toggle
          v-model="timeRange"
          mandatory
          class="mr-4"
          color="primary"
          density="compact"
        >
          <v-btn
            value="day"
            size="small"
          >
            {{ $t("app.time-range.day") }}
          </v-btn>
          <v-btn
            value="week"
            size="small"
          >
            {{ $t("app.time-range.week") }}
          </v-btn>
          <v-btn
            value="month"
            size="small"
          >
            {{ $t("app.time-range.month") }}
          </v-btn>
          <v-btn
            value="year"
            size="small"
          >
            {{ $t("app.time-range.year") }}
          </v-btn>
          <v-btn
            value="all"
            size="small"
          >
            {{ $t("app.time-range.all") }}
          </v-btn>
        </v-btn-toggle>
        <v-btn
          v-if="canEdit"
          color="primary"
          class="mr-4"
          prepend-icon="mdi-plus"
          @click="showAddDialog = true"
        >
          {{ $t("app.spending.add") }}
        </v-btn>
        <v-menu>
          <template #activator="{ props: menuProps }">
            <v-btn
              v-bind="menuProps"
              color="info"
              prepend-icon="mdi-download-outline"
            >
              {{ $t("app.spending.export") }}
            </v-btn>
          </template>
          <v-list>
            <v-list-item @click="exportJSON">
              <template #prepend>
                <v-icon icon="mdi-code-json" />
              </template>
              <v-list-item-title>{{ $t("app.spending.export-json") }}</v-list-item-title>
            </v-list-item>
            <v-list-item @click="exportCSV">
              <template #prepend>
                <v-icon icon="mdi-file-delimited-outline" />
              </template>
              <v-list-item-title>{{ $t("app.spending.export-csv") }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>
    </v-card-title>
    <v-card-text class="pt-4">
      <v-row class="mb-4">
        <v-col
          cols="12"
          sm="4"
        >
          <v-card
            color="success"
            variant="tonal"
          >
            <v-card-text class="text-center">
              <div class="text-caption">
                {{ $t("app.spending.total-income") }}
              </div>
              <div class="text-h5 font-weight-bold text-code">
                {{ formatCurrency(totalIncome) }}
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col
          cols="12"
          sm="4"
        >
          <v-card
            color="error"
            variant="tonal"
          >
            <v-card-text class="text-center">
              <div class="text-caption">
                {{ $t("app.spending.total-expense") }}
              </div>
              <div class="text-h5 font-weight-bold text-code">
                {{ formatCurrency(totalExpense) }}
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col
          cols="12"
          sm="4"
        >
          <v-card
            :color="balance >= 0 ? 'info' : 'warning'"
            variant="tonal"
          >
            <v-card-text class="text-center">
              <div class="text-caption">
                {{ $t("app.spending.balance") }}
              </div>
              <div class="text-h5 font-weight-bold text-code">
                {{ formatCurrency(balance) }}
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-data-table
        :headers="headers"
        :items="filteredSpendings"
        :items-per-page="10"
        class="elevation-1"
        :no-data-text="$t('app.spending.no-spending')"
      >
        <template #[`item.category`]="{ item }">
          <v-tooltip
            :text="item.category_name"
            location="top"
          >
            <template #activator="{ props: activatorProps }">
              <v-icon
                v-bind="activatorProps"
                :icon="item.icon"
                :color="item.icon_color"
                size="24"
              />
            </template>
          </v-tooltip>
        </template>
        <template #[`item.value`]="{ item }">
          <v-chip
            :color="item.is_spending ? 'error' : 'success'"
            class="text-code"
            size="small"
          >
            {{ item.is_spending ? "-" : "+" }}{{ formatCurrency(item.value) }}
          </v-chip>
        </template>
        <template #[`item.date`]="{ item }">
          {{ formatDate(item.date) }}
        </template>
        <template #[`item.actions`]="{ item }">
          <v-tooltip
            location="top"
            :text="$t('app.spending.edit')"
          >
            <template #activator="{ props: tooltipProps }">
              <v-btn
                v-if="canEdit"
                v-bind="tooltipProps"
                icon="mdi-pencil-outline"
                variant="text"
                size="small"
                color="secondary"
                @click="openEditDialog(item)"
              />
            </template>
          </v-tooltip>

          <v-tooltip
            location="top"
            :text="$t('app.spending.delete')"
          >
            <template #activator="{ props: tooltipProps }">
              <v-btn
                v-if="canEdit"
                v-bind="tooltipProps"
                icon="mdi-delete-outline"
                variant="text"
                size="small"
                color="error"
                @click="openDeleteDialog(item)"
              />
            </template>
          </v-tooltip>
        </template>
      </v-data-table>
    </v-card-text>
  </v-card>

  <v-dialog
    v-model="showAddDialog"
    max-width="600"
    persistent
  >
    <v-card class="pa-1">
      <v-card-title>
        {{ editingSpending ? $t("app.spending.edit") : $t("app.spending.add") }}
      </v-card-title>
      <v-card-text>
        <v-form ref="formRef">
          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="spendingForm.name"
                :label="$t('app.spending.name')"
                variant="outlined"
                :rules="[v => !!v || 'Required']"
              />
            </v-col>
            <v-col
              cols="12"
              sm="6"
            >
              <v-number-input
                v-model="spendingForm.value"
                :label="$t('app.spending.amount')"
                inset
                variant="outlined"
                :min="0"
                :precision="2"
                :rules="[v => v > 0 || 'Must be positive']"
              />
            </v-col>
            <v-col
              cols="12"
              sm="6"
            >
              <v-select
                v-model="spendingForm.is_spending"
                :items="typeItems"
                :label="$t('app.spending.type')"
                variant="outlined"
              />
            </v-col>
            <v-col
              cols="12"
              sm="6"
            >
              <v-select
                v-model="spendingForm.category_id"
                :items="categories"
                item-title="name"
                item-value="id"
                :label="$t('app.spending.category')"
                variant="outlined"
                :rules="[v => !!v || 'Required']"
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
            </v-col>
            <v-col
              cols="12"
              sm="6"
            >
              <v-menu
                v-model="dateMenu"
                :close-on-content-click="false"
                location="top"
              >
                <template #activator="{ props: activatorProps }">
                  <v-text-field
                    v-model="spendingForm.date"
                    v-bind="activatorProps"
                    :label="$t('app.spending.date')"
                    variant="outlined"
                    readonly
                    append-inner-icon="mdi-calendar-outline"
                    :rules="[v => !!v || 'Required']"
                  />
                </template>

                <v-date-picker
                  v-model="tempDate"
                  control-variant="modal"
                  header-date-format="fullDateWithWeekday"
                  :landscape="smAndUp"
                  :location="lgAndUp ? 'top' : undefined"
                  show-adjacent-months
                  weekday-format="short"
                  weeks-in-month="dynamic"
                  @update:model-value="spendingForm.date = new Date(new Date(tempDate ?? '').getTime() + (24 * 60 * 60 * 1000)).toISOString().split('T')[0]; dateMenu = false"
                />
              </v-menu>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          color="secondary"
          @click="closeDialog"
        >
          {{ $t("app.spending.cancel") }}
        </v-btn>
        <v-btn
          color="primary"
          :disabled="!isFormValid"
          @click="saveSpending"
        >
          {{ editingSpending ? $t("app.spending.edit") : $t("app.spending.add") }}
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
        {{ $t("app.spending.delete-title") }}
      </v-card-title>
      <v-card-text>
        {{ $t("app.spending.delete-description") }}
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          color="secondary"
          @click="showDeleteDialog = false"
        >
          {{ $t("app.spending.cancel") }}
        </v-btn>
        <v-btn
          color="error"
          @click="deleteSpending"
        >
          {{ $t("app.spending.delete") }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import type {
  Category,
  Spending,
} from "~/types"

const props = defineProps<{
  spendings: Spending[];
  categories: Category[];
  budgetTrackerId: string;
}>()

const emit = defineEmits<{
  "refresh": [];
  "update:time-range": [value: string];
}>()

const {
  locale,
  t,
} = useI18n()
const store = useMainStore()
const {
  lgAndUp,
  smAndUp,
} = useVDisplay()

const canEdit = computed(() => store.canEditData)
const timeRange = ref("month")
const showAddDialog = ref(false)
const showDeleteDialog = ref(false)
const dateMenu = ref(false)
const tempDate = ref<string | null>(null)
const editingSpending = ref<Spending | null>(null)
const deletingSpending = ref<Spending | null>(null)
const spendingForm = ref({
  name: "",
  value: 0,
  is_spending: true,
  category_id: null as string | null,
  date: new Date()
    .toISOString()
    .split("T")[0],
})

const typeItems = computed(() => [
  {
    title: t("app.spending.expense"), value: true,
  },
  {
    title: t("app.spending.income"), value: false,
  },
])

const headers = computed(() => [
  {
    title: t("app.spending.category"), key: "category", sortable: false,
  },
  {
    title: t("app.spending.name"), key: "name", sortable: true,
  },
  {
    title: t("app.spending.amount"), key: "value", sortable: true,
  },
  {
    title: t("app.spending.date"), key: "date", sortable: true,
  },
  {
    title: t("app.spending.actions"), key: "actions", sortable: false,
  },
])

const filteredSpendings = computed(() => {
  const now = new Date()
  let startDate: Date
  let endDate: Date

  switch (timeRange.value) {
    case "day":
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)

      break
    case "week":
      startDate = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000))
      endDate = new Date(now.getTime() + (1 * 24 * 60 * 60 * 1000))

      break
    case "month":
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1)

      break
    case "year":
      startDate = new Date(now.getFullYear(), 0, 1)
      endDate = new Date(now.getFullYear() + 1, 0, 1)

      break
    default:
      return props.spendings
  }

  return props.spendings.filter((s) => {
    const spendingDate = new Date(s.date)

    return spendingDate >= startDate && spendingDate < endDate
  })
})

const totalIncome = computed(() => filteredSpendings.value
  .filter((s) => !s.is_spending)
  .reduce((acc, s) => acc + s.value, 0))

const totalExpense = computed(() => filteredSpendings.value
  .filter((s) => s.is_spending)
  .reduce((acc, s) => acc + s.value, 0))

const balance = computed(() => totalIncome.value - totalExpense.value)

const isFormValid = computed(() => Boolean(spendingForm.value.name.trim()
  && spendingForm.value.value > 0
  && spendingForm.value.category_id
  && spendingForm.value.date))

watch(timeRange, (newVal) => {
  emit("update:time-range", newVal)
})

const formatCurrency = (value: number) => new Intl.NumberFormat(locale.value === "fr"
    ? "fr-FR"
    : "en-US", {
  style: "currency",
  currency: locale.value === "fr"
    ? "EUR"
    : "USD",
  currencyDisplay: "narrowSymbol",
})
  .format(value)

const formatDate = (dateStr: string) => {
  if (!dateStr) {
    return ""
  }

  const date = new Date(dateStr)

  return date.toLocaleDateString(locale.value === "fr"
    ? "fr-FR"
    : "en-US", {
    day: "2-digit",
    weekday: "long",
    month: "long",
    year: "numeric",
  })
}

const openEditDialog = (spending: Spending) => {
  dateMenu.value = false
  editingSpending.value = spending
  spendingForm.value = {
    name: spending.name,
    value: spending.value,
    is_spending: Boolean(spending.is_spending),
    category_id: spending.category_id,
    date: spending.date.split("T")[0],
  }
  showAddDialog.value = true
}

const openDeleteDialog = (spending: Spending) => {
  deletingSpending.value = spending
  showDeleteDialog.value = true
}

const closeDialog = () => {
  showAddDialog.value = false
  dateMenu.value = false
  editingSpending.value = null
  spendingForm.value = {
    name: "",
    value: 0,
    is_spending: true,
    category_id: null,
    date: new Date()
      .toISOString()
      .split("T")[0],
  }
}

const saveSpending = async () => {
  if (!isFormValid.value) {
    return
  }

  try {
    if (editingSpending.value) {
      await $fetch("/api/spending", {
        method: "PUT",
        body: {
          id: editingSpending.value.id,
          budget_tracker_id: props.budgetTrackerId,
          ...spendingForm.value,
        },
        headers: { Authorization: `Bearer ${store.getUser?.token}` },
      })
    } else {
      await $fetch("/api/spending", {
        method: "POST",
        body: {
          budget_tracker_id: props.budgetTrackerId,
          ...spendingForm.value,
        },
        headers: { Authorization: `Bearer ${store.getUser?.token}` },
      })
    }

    closeDialog()
    emit("refresh")
  } catch (error) {
    console.error("Failed to save spending:", error)
  }
}

const deleteSpending = async () => {
  if (!deletingSpending.value) {
    return
  }

  try {
    await $fetch("/api/spending", {
      method: "DELETE",
      body: {
        id: deletingSpending.value.id,
        budget_tracker_id: props.budgetTrackerId,
      },
      headers: { Authorization: `Bearer ${store.getUser?.token}` },
    })
    showDeleteDialog.value = false
    deletingSpending.value = null
    emit("refresh")
  } catch (error) {
    console.error("Failed to delete spending:", error)
  }
}

const exportJSON = () => {
  const data = filteredSpendings.value.map((s) => ({
    name: s.name,
    amount: s.value,
    type: s.is_spending
      ? "expense"
      : "income",
    category: s.category_name,
    date: s.date,
  }))

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")

  a.href = url
  a.download = `transactions-${timeRange.value}-${new Date()
    .toISOString()
    .split("T")[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
}

const exportCSV = () => {
  const headers = [ "Name", "Amount", "Type", "Category", "Date" ]
  const rows = filteredSpendings.value.map((s) => [
    `"${s.name.replace(/"/g, "\"\"")}"`,
    s.value.toString(),
    s.is_spending
      ? "expense"
      : "income",
    `"${s.category_name.replace(/"/g, "\"\"")}"`,
    s.date,
  ])

  const csv = [ headers.join(","), ...rows.map((r) => r.join(",")) ].join("\n")
  const blob = new Blob([csv], { type: "text/csv" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")

  a.href = url
  a.download = `transactions-${timeRange.value}-${new Date()
    .toISOString()
    .split("T")[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<style lang="scss" scoped>
.v-btn-group--horizontal {
  overflow-x: clip;
}

:deep(.v-data-table__tr > .v-data-table__td:nth-child(2)) {
  max-width: 50vw;
}

:deep(.v-data-table-footer__items-per-page > .v-select) {
  width: auto;
}

.text-code {
  font-family: "Fira Code", monospace !important;
  font-feature-settings: "liga" 1, "calt" 1, "case" 0, "ccmp" 0, "cpsp" 0,
    "cv01" 0, "cv05" 0, "cv08" 0, "cv10" 0, "cv11" 0, "cv25" 1, "cv26" 1,
    "cv28" 1, "cv32" 1, "dlig" 0, "frac" 0, "ss01" 0, "ss02" 0, "ss03" 1,
    "ss05" 1, "ss06" 1, "ss07" 1, "ss08" 1, "ss09" 1, "zero" 0;
}
</style>
