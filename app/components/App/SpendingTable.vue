<template>
  <v-card class="glass-card mb-4 pa-1 rounded-lg">
    <v-card-title class="d-flex align-center justify-space-between flex-wrap gap-2">
      <div class="d-flex align-center">
        <v-icon
          icon="mdi-format-list-bulleted"
          class="mr-2"
          color="primary"
        />
        <span class="font-weight-bold">{{ $t("app.spending.title") }}</span>
      </div>

      <div :class="['d-flex', 'gap-2', 'flex-wrap', 'align-center', !smAndUp && 'mt-4', !smAndUp && 'flex-grow-1']">
        <AppDateRangeFilter
          v-model:time-range="timeRangeModel"
          v-model:anchor-date="anchorDateModel"
        />

        <div
          v-if="!smAndUp"
          class="flex-grow-1"
        />

        <v-btn
          v-if="canEdit"
          color="primary"
          class="mr-4 glow-button"
          prepend-icon="mdi-plus"
          rounded="lg"
          @click="showAddDialog = true"
        >
          {{ $t("app.spending.add") }}
        </v-btn>
        <v-menu>
          <template #activator="{ props: menuProps }">
            <v-btn
              v-bind="menuProps"
              color="info"
              variant="tonal"
              prepend-icon="mdi-download-outline"
              rounded="lg"
            >
              {{ $t("app.spending.export") }}
            </v-btn>
          </template>
          <v-list class="glass-panel">
            <v-list-item @click="exportJSON">
              <template #prepend>
                <v-icon
                  icon="mdi-code-json"
                  color="secondary"
                />
              </template>
              <v-list-item-title>{{ $t("app.spending.export-json") }}</v-list-item-title>
            </v-list-item>
            <v-list-item @click="exportCSV">
              <template #prepend>
                <v-icon
                  icon="mdi-file-delimited-outline"
                  color="secondary"
                />
              </template>
              <v-list-item-title>{{ $t("app.spending.export-csv") }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>
    </v-card-title>
    <v-card-text class="pt-4 px-6">
      <v-row class="mb-6">
        <v-col
          cols="12"
          sm="4"
        >
          <v-card
            class="summary-card"
            rounded="xl"
            elevation="0"
          >
            <div class="summary-bg bg-success" />
            <v-card-text class="text-center position-relative z-10">
              <div class="text-caption font-weight-bold text-uppercase mb-1 opacity-70">
                {{ $t("app.spending.total-income") }}
              </div>
              <div class="text-h4 font-weight-black text-code text-success">
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
            class="summary-card"
            rounded="xl"
            elevation="0"
          >
            <div class="summary-bg bg-error" />
            <v-card-text class="text-center position-relative z-10">
              <div class="text-caption font-weight-bold text-uppercase mb-1 opacity-70">
                {{ $t("app.spending.total-expense") }}
              </div>
              <div class="text-h4 font-weight-black text-code text-error">
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
            class="summary-card"
            rounded="xl"
            elevation="0"
          >
            <div :class="['summary-bg', balance >= 0 ? 'bg-info' : 'bg-warning']" />
            <v-card-text class="text-center position-relative z-10">
              <div class="text-caption font-weight-bold text-uppercase mb-1 opacity-70">
                {{ $t("app.spending.balance") }}
              </div>
              <div :class="['text-h4', 'font-weight-black', 'text-code', balance >= 0 ? 'text-info' : 'text-warning']">
                {{ formatCurrency(balance) }}
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-text-field
        v-model="search"
        :label="$t('app.spending.search')"
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
        hide-details
        class="mb-6 search-field"
        rounded="pill"
        density="comfortable"
      />

      <v-data-table-virtual
        :headers
        :items="filteredSpendings"
        :sort-by="sortBy"
        :height="Math.min((filteredSpendings.length + 1) * 56, 11 * 56)"
        :search
        hover
        class="bg-transparent spending-table"
        :no-data-text="$t('app.spending.no-spending')"
      >
        <template #[`item.category`]="{ item }">
          <v-chip
            :prepend-icon="item.icon"
            :color="item.icon_color"
            label
            variant="tonal"
            class="font-weight-medium rounded-lg"
          >
            {{ item.category_name }}
          </v-chip>
        </template>
        <template #[`item.value`]="{ item }">
          <span :class="['text-code', 'font-weight-bold', item.is_spending ? 'text-error' : 'text-success']">
            {{ item.is_spending ? "-" : "+" }}{{ formatCurrency(item.value) }}
          </span>
        </template>
        <template #[`item.date`]="{ item }">
          <span class="text-medium-emphasis text-body-2">{{ formatDate(item.date) }}</span>
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
                color="error"
                @click="openDeleteDialog(item)"
              />
            </template>
          </v-tooltip>
        </template>
      </v-data-table-virtual>
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
                  @update:model-value="(val) => {
                    const v = Array.isArray(val)
                      ? val[0]
                      : val

                    if (!v) {
                      return
                    }

                    if (typeof v === 'string') {
                      spendingForm.date = v.split('T')[0] ?? ''
                    } else {
                      const d = v instanceof Date ? v : new Date(v)

                      spendingForm.date = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
                    }

                    dateMenu = false
                  }"
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
          variant="elevated"
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
          variant="elevated"
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
  timeRange: string;
  anchorDate: string;
}>()

const emit = defineEmits<{
  "refresh": [];
  "update:time-range": [value: string];
  "update:anchor-date": [value: string];
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

const search = ref("")
const sortBy = ref<{
  key: string; order: "asc" | "desc";
}[]>([
  {
    key: "date", order: "desc",
  },
])
const canEdit = computed(() => store.canEditData)
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
const timeRangeModel = computed({
  get: () => props.timeRange,
  set: (v: string) => emit("update:time-range", v),
})
const anchorDateModel = computed({
  get: () => props.anchorDate,
  set: (v: string) => emit("update:anchor-date", v),
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
  const win = getDateWindow(timeRangeModel.value, anchorDateModel.value)

  if (!win) {
    return props.spendings
  }

  return props.spendings.filter((s) => s.date >= win.start && s.date < win.end)
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

  const date = new Date(`${dateStr}T00:00:00Z`)

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
    console.error("Failed to save spending :", error)
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
    console.error("Failed to delete spending :", error)
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
  a.download = `transactions-${props.timeRange}-${anchorDateModel.value}.json`
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
  a.download = `transactions-${props.timeRange}-${anchorDateModel.value}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<style lang="scss" scoped>
.summary-card {
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.05);
  background: rgba(var(--v-theme-surface), 0.4) !important;
  backdrop-filter: blur(10px);
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-2px);
  }
}

.summary-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0.15;
  mask-image: linear-gradient(to right, black, transparent);
  -webkit-mask-image: linear-gradient(to right, black, transparent);
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

.spending-table :deep(tr) {
  transition: background-color 0.2s ease;

  &:hover {
    background: rgba(var(--v-theme-on-surface), 0.03) !important;
  }
}
</style>
