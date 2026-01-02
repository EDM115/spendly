<template>
  <v-container
    class="py-8"
    fluid
  >
    <v-row v-if="!hasLoaded">
      <v-col cols="6">
        <v-skeleton-loader
          type="heading,table-thead,table-tbody"
          class="mb-4"
        />
      </v-col>
      <v-col cols="6">
        <v-skeleton-loader
          type="heading,image"
          class="mb-4"
        />
      </v-col>
    </v-row>

    <template v-else>
      <v-row class="mb-4 pa-1">
        <v-col cols="12">
          <h1 class="text-h4">
            {{ $t("app.welcome") }}, {{ store.getUser?.username }} 👋
          </h1>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12">
          <AppBudgetTrackerSelector
            v-model="selectedBudgetTrackerId"
            :budget-trackers="budgetTrackers"
            @refresh="fetchBudgetTrackers"
          />
        </v-col>
      </v-row>

      <template v-if="selectedBudgetTrackerId">
        <v-tabs
          v-model="selectedTab"
          fixed-tabs
          color="primary"
        >
          <v-tab value="spendings">
            <v-icon
              icon="mdi-format-list-bulleted"
              class="mr-2"
            />
            {{ $t("app.spending.title") }}
          </v-tab>
          <v-tab value="categories">
            <v-icon
              icon="mdi-shape-outline"
              class="mr-2"
            />
            {{ $t("app.category.title") }}
          </v-tab>
          <v-tab value="charts">
            <v-icon
              icon="mdi-chart-box-multiple-outline"
              class="mr-2"
            />
            {{ $t("app.charts.title") }}
          </v-tab>
        </v-tabs>

        <v-divider class="my-2" />

        <v-tabs-window v-model="selectedTab">
          <v-tabs-window-item value="spendings">
            <AppSpendingTable
              v-model:time-range="timeRange"
              v-model:anchor-date="anchorDate"
              :spendings="spendings"
              :categories="categories"
              :budget-tracker-id="selectedBudgetTrackerId"
              @refresh="fetchSpendings"
            />
          </v-tabs-window-item>
          <v-tabs-window-item value="categories">
            <AppCategoryManager
              :categories="categories"
              @refresh="fetchCategories"
            />
          </v-tabs-window-item>
          <v-tabs-window-item value="charts">
            <AppCharts
              v-model:time-range="timeRange"
              v-model:anchor-date="anchorDate"
              :spendings="spendings"
            />
          </v-tabs-window-item>
        </v-tabs-window>
      </template>

      <v-row v-else>
        <v-col cols="12">
          <v-card>
            <v-card-text class="text-center py-12">
              <v-icon
                icon="mdi-wallet-plus-outline"
                size="64"
                color="primary"
                class="mb-4"
              />
              <h2 class="text-h5 mb-2">
                {{ $t("app.budget-tracker.no-tracker") }}
              </h2>
              <p class="text-body-1 text-medium-emphasis">
                {{ $t("app.budget-tracker.select") }}
              </p>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </template>
  </v-container>
</template>

<script setup lang="ts">
import type {
  BudgetTracker,
  Category,
  Spending,
} from "~/types"

const store = useMainStore()
const hasLoaded = ref(false)

const selectedBudgetTrackerId = ref<string | null>(null)
const budgetTrackers = ref<BudgetTracker[]>([])
const categories = ref<Category[]>([])
const spendings = ref<Spending[]>([])
const timeRange = ref("month")
const now0 = new Date()
const anchorDate = ref(`${now0.getFullYear()}-${String(now0.getMonth() + 1)
  .padStart(2, "0")}-${String(now0.getDate())
  .padStart(2, "0")}`)
const selectedTab = ref<string | null>(null)

const fetchBudgetTrackers = async () => {
  try {
    const response = await $fetch("/api/budgetTracker", {
      headers: { Authorization: `Bearer ${store.getUser?.token}` },
    })

    if ("budgetTrackers" in response.body) {
      budgetTrackers.value = response.body.budgetTrackers
    }

    // Restore from store or select first tracker
    const storedId = store.getSelectedBudgetTrackerId
    const trackerExists = budgetTrackers.value.some((t) => t.id === storedId)

    if (budgetTrackers.value.length > 0) {
      if (storedId && trackerExists) {
        selectedBudgetTrackerId.value = storedId
        const tracker = budgetTrackers.value.find((t) => t.id === storedId)
        const role = (tracker?.role ?? null) as "owner" | "admin" | "editor" | "viewer" | null

        store.setSelectedBudgetTracker(storedId, role)
      } else {
        const firstTracker = budgetTrackers.value[0]

        selectedBudgetTrackerId.value = firstTracker?.id ?? null
        const role = (firstTracker?.role ?? null) as "owner" | "admin" | "editor" | "viewer" | null

        store.setSelectedBudgetTracker(firstTracker?.id ?? null, role)
      }
    } else {
      selectedBudgetTrackerId.value = null
      store.setSelectedBudgetTracker(null, null)
    }
  } catch (error) {
    console.error("Failed to fetch budget trackers:", error)
  }
}

const fetchCategories = async () => {
  try {
    const response = await $fetch("/api/category", {
      headers: { Authorization: `Bearer ${store.getUser?.token}` },
    })

    if ("categories" in response.body) {
      categories.value = response.body.categories
    }
  } catch (error) {
    console.error("Failed to fetch categories:", error)
  }
}

const fetchSpendings = async () => {
  if (!selectedBudgetTrackerId.value) {
    spendings.value = []

    return
  }

  try {
    const response = await $fetch("/api/spending", {
      params: { budget_tracker_id: selectedBudgetTrackerId.value },
      headers: { Authorization: `Bearer ${store.getUser?.token}` },
    })

    if ("spendings" in response.body) {
      spendings.value = response.body.spendings
    }
  } catch (error) {
    console.error("Failed to fetch spendings:", error)
    spendings.value = []
  }
}

watch(selectedBudgetTrackerId, async () => {
  await fetchSpendings()
})

onMounted(async () => {
  if (store.getUser === null) {
    await navigateTo("/", { redirectCode: 401 })

    return
  }

  const isValid = await store.validateToken()

  if (!isValid) {
    await navigateTo("/", { redirectCode: 401 })

    return
  }

  await Promise.all([
    fetchBudgetTrackers(),
    fetchCategories(),
  ])

  hasLoaded.value = true
})
</script>

<style>
.v-skeleton-loader__image {
  height: 47.5vh;
}
</style>
