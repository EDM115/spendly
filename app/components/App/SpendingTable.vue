<template>
  <v-card :class="['glass-card', 'mb-4', 'rounded-lg', smAndUp ? 'pa-1' : 'pa-0']">
    <v-card-title :class="['d-flex', 'align-center', 'justify-space-between', 'flex-wrap', 'gap-2', smAndUp ? '' : 'px-3 pt-3']">
      <div class="d-flex align-center">
        <v-icon
          icon="mdi-format-list-bulleted"
          class="mr-2"
          color="primary"
        />
        <span class="font-weight-bold">{{ $t("app.spending.title") }}</span>
      </div>

      <div :class="['spending-header-actions', !smAndUp && 'spending-header-actions--mobile', !smAndUp && 'pt-2']">
        <AppDateRangeFilter
          v-model:time-range="timeRangeModel"
          v-model:anchor-date="anchorDateModel"
        />

        <div :class="['spending-actions', !smAndUp ? 'spending-actions--stack' : '']">
          <v-btn
            :disabled="!canEdit"
            color="primary"
            class="glow-button"
            prepend-icon="mdi-plus"
            rounded="lg"
            :block="false"
            @click="showAddDialog = true"
          >
            {{ $t("app.spending.add") }}
          </v-btn>
          <v-menu content-class="glass-menu-content">
            <template #activator="{ props: balanceMenuProps }">
              <v-btn
                v-bind="balanceMenuProps"
                color="secondary"
                variant="tonal"
                prepend-icon="mdi-tune-variant"
                rounded="lg"
                :block="false"
              >
                {{ $t("app.spending.balance-options") }}
              </v-btn>
            </template>
            <v-list
              class="glass-card pa-2 border-thin"
              :disabled="timeRangeModel === 'all'"
            >
              <v-list-item>
                <v-list-item-title>{{ $t("app.spending.use-total-balance") }}</v-list-item-title>
                <template #append>
                  <v-switch
                    v-model="useTotalBalance"
                    density="compact"
                    color="secondary"
                    class="pl-4"
                    hide-details
                    inset
                  />
                </template>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>{{ $t("app.spending.include-future") }}</v-list-item-title>
                <template #append>
                  <v-switch
                    v-model="includeFutureEntries"
                    density="compact"
                    color="secondary"
                    class="pl-4"
                    hide-details
                    inset
                  />
                </template>
              </v-list-item>
            </v-list>
          </v-menu>
          <v-menu
            v-if="filteredSpendings.length > 0"
            content-class="glass-menu-content"
          >
            <template #activator="{ props: menuProps }">
              <v-btn
                v-bind="menuProps"
                color="info"
                variant="tonal"
                prepend-icon="mdi-download-outline"
                rounded="lg"
                :block="false"
              >
                {{ $t("app.spending.export") }}
              </v-btn>
            </template>
            <v-list class="glass-panel">
              <v-list-item
                :disabled="isExporting"
                @click="exportJSON"
              >
                <template #prepend>
                  <v-progress-circular
                    v-if="isExporting"
                    indeterminate
                    size="18"
                    width="2"
                    color="secondary"
                    class="mr-4"
                  />
                  <v-icon
                    v-else
                    icon="mdi-code-json"
                    color="secondary"
                  />
                </template>
                <v-list-item-title>{{ $t("app.spending.export-json") }}</v-list-item-title>
              </v-list-item>
              <v-list-item
                :disabled="isExporting"
                @click="exportCSV"
              >
                <template #prepend>
                  <v-progress-circular
                    v-if="isExporting"
                    indeterminate
                    size="18"
                    width="2"
                    color="secondary"
                    class="mr-4"
                  />
                  <v-icon
                    v-else
                    icon="mdi-file-delimited-outline"
                    color="secondary"
                  />
                </template>
                <v-list-item-title>{{ $t("app.spending.export-csv") }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </div>
      </div>
    </v-card-title>
    <v-card-text :class="['pt-4', smAndUp ? 'px-6' : 'px-3']">
      <v-row :class="smAndUp ? 'mb-6' : 'mb-4'">
        <v-col
          cols="12"
          sm="4"
          :class="!smAndUp ? 'mobile-small-padding' : ''"
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
              <div :class="['font-weight-black', 'text-code', 'text-success', smAndUp ? 'text-h4' : 'text-h5']">
                {{ formatCurrency(totalIncome) }}
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col
          cols="12"
          sm="4"
          :class="!smAndUp ? 'mobile-small-padding' : ''"
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
              <div :class="['font-weight-black', 'text-code', 'text-error', smAndUp ? 'text-h4' : 'text-h5']">
                {{ formatCurrency(totalExpense) }}
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col
          cols="12"
          sm="4"
          :class="!smAndUp ? 'mobile-small-padding' : ''"
        >
          <v-card
            class="summary-card"
            rounded="xl"
            elevation="0"
          >
            <div :class="['summary-bg', balance >= 0 ? 'bg-info' : 'bg-warning']" />
            <v-card-text class="text-center position-relative z-10">
              <div class="text-caption font-weight-bold text-uppercase mb-1 opacity-70">
                {{ balanceLabel }}
              </div>
              <div :class="[smAndUp ? 'text-h4' : 'text-h5', 'font-weight-black', 'text-code', balance >= 0 ? 'text-info' : 'text-warning']">
                {{ formatCurrency(balance) }}
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-text-field
        v-model="search"
        :label="searchLabel"
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
        hide-details
        clearable
        max-width="600"
        :min-width="smAndUp ? 400 : 300"
        class="mb-6 search-field"
        rounded="pill"
        autocomplete="suppress"
        :density="smAndUp ? 'comfortable' : 'compact'"
        style="justify-self: center;"
        @click:clear="search = ''"
      />

      <v-data-table-virtual
        :headers
        :items="filteredSpendings"
        :sort-by="sortBy"
        :height="Math.min((filteredSpendings.length === 0 ? 2 : filteredSpendings.length + 1) * tableRowHeight, maxTableHeight)"
        :item-height="tableRowHeight"
        :search
        :custom-filter="searchFilter"
        hover
        :class="['bg-transparent', 'spending-table', !smAndUp ? 'spending-table--compact' : '']"
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
          <span class="text-medium-emphasis text-body-2 date-cell">{{ formatDate(item.date) }}</span>
        </template>
        <template #[`item.actions`]="{ item }">
          <v-tooltip
            location="top"
            :text="$t('app.spending.edit')"
          >
            <template #activator="{ props: tooltipProps }">
              <v-btn
                :disabled="!canEdit"
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
                :disabled="!canEdit"
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
                autocomplete="suppress"
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
                autocomplete="suppress"
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
                    autocomplete="suppress"
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

const tableRowHeight = computed(() => (smAndUp.value
  ? 56
  : 72))
const maxTableHeight = computed(() => (smAndUp.value
  ? 11
  : 8) * tableRowHeight.value)

const search = ref("")
const sortBy = ref<{
  key: string; order: "asc" | "desc";
}[]>([
  {
    key: "date", order: "desc",
  },
])
const canEdit = computed(() => store.canEditData && !store.isDemo)
const showAddDialog = ref(false)
const showDeleteDialog = ref(false)
const dateMenu = ref(false)
const tempDate = ref<string | null>(null)
const isExporting = ref(false)
const editingSpending = ref<Spending | null>(null)
const deletingSpending = ref<Spending | null>(null)
const useTotalBalance = ref(false)
const includeFutureEntries = ref(false)
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
    title: t("app.spending.date"),
    key: "date",
    sortable: true,
    minWidth: smAndUp.value
      ? 160
      : 190,
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

const searchFilter = (_value: string | number | boolean | null, query: string, item: unknown) => {
  if (!query) {
    return true
  }

  const row = (item as { raw?: Spending }).raw ?? item as Spending
  const haystack = [
    row.name,
    row.category_name,
    row.date,
    String(row.value),
  ]
    .join(" ")
    .toLowerCase()

  return haystack.includes(query.toLowerCase())
}

const searchLabel = computed(() => {
  const totalCount = filteredSpendings.value.length
  const term = search.value.trim()

  if (!term) {
    return `${t("app.spending.search")} (${totalCount}/${totalCount})`
  }

  const needle = term.toLowerCase()
  const visibleCount = filteredSpendings.value.filter((s) => [
    s.name,
    s.category_name,
    s.date,
    String(s.value),
  ]
    .join(" ")
    .toLowerCase()
    .includes(needle)).length

  return `${t("app.spending.search")} (${visibleCount}/${totalCount})`
})

const parseSpendingDate = (dateValue: string) => {
  if (!dateValue) {
    return null
  }

  if (dateValue.includes("T")) {
    return new Date(dateValue)
  }

  return new Date(`${dateValue}T00:00:00`)
}

const todayBounds = computed(() => {
  const start = new Date()
  const end = new Date()

  start.setHours(0, 0, 0, 0)
  end.setHours(23, 59, 59, 999)

  return {
    start,
    end,
  }
})

const balanceSpendings = computed(() => {
  if (includeFutureEntries.value) {
    return props.spendings
  }

  if (useTotalBalance.value) {
    const {
      end,
    } = todayBounds.value

    return props.spendings.filter((s) => {
      const date = parseSpendingDate(s.date)

      return date
        ? date <= end
        : false
    })
  }

  return filteredSpendings.value
})

const totalIncome = computed(() => filteredSpendings.value
  .filter((s) => !s.is_spending)
  .reduce((acc, s) => acc + s.value, 0))

const totalExpense = computed(() => filteredSpendings.value
  .filter((s) => s.is_spending)
  .reduce((acc, s) => acc + s.value, 0))

const balanceIncome = computed(() => balanceSpendings.value
  .filter((s) => !s.is_spending)
  .reduce((acc, s) => acc + s.value, 0))

const balanceExpense = computed(() => balanceSpendings.value
  .filter((s) => s.is_spending)
  .reduce((acc, s) => acc + s.value, 0))

const balance = computed(() => balanceIncome.value - balanceExpense.value)

const balanceLabel = computed(() => {
  if (timeRangeModel.value === "all") {
    return t("app.spending.balance-all-time")
  }

  if (includeFutureEntries.value) {
    return t("app.spending.balance-all-time")
  }

  if (useTotalBalance.value) {
    return t("app.spending.balance-until-now")
  }

  return t("app.spending.balance")
})

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
  if (!canEdit.value) {
    return
  }

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
  if (!canEdit.value) {
    return
  }

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
  if (!canEdit.value) {
    return
  }

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
  if (!canEdit.value) {
    return
  }

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

const exportJSON = async () => {
  if (isExporting.value) {
    return
  }

  isExporting.value = true


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
  a.download = `transactions-${props.timeRange}-${anchorDateModel.value}-${timeRangeModel.value}.json`
  a.click()
  URL.revokeObjectURL(url)

  isExporting.value = false
}

const exportCSV = async () => {
  if (isExporting.value) {
    return
  }

  isExporting.value = true

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
  a.download = `transactions-${props.timeRange}-${anchorDateModel.value}-${timeRangeModel.value}.csv`
  a.click()
  URL.revokeObjectURL(url)

  isExporting.value = false
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

.spending-table--compact :deep(.v-data-table__td),
.spending-table--compact :deep(.v-data-table__th) {
  padding: 8px 10px !important;
}

.date-cell {
  white-space: normal;
  line-height: 1.2;
}

.spending-header-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.spending-header-actions--mobile {
  width: 100%;
}

.spending-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
}

.spending-actions--stack {
  flex-direction: row;
}

.mobile-small-padding {
  padding: 6px 12px !important;
}
</style>
