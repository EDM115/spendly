<template>
  <v-container
    class="py-8"
    fluid
  >
    <v-row v-if="!hasLoaded">
      <v-col cols="12">
        <v-skeleton-loader
          type="card"
          class="mb-4"
        />
        <v-skeleton-loader
          type="table"
          class="mb-4"
        />
        <v-skeleton-loader type="card" />
      </v-col>
    </v-row>

    <template v-else>
      <!-- Welcome Message -->
      <v-row class="mb-4">
        <v-col cols="12">
          <h1 class="text-h4">
            {{ $t("app.welcome") }}, {{ store.getUser?.username }} 👋
          </h1>
        </v-col>
      </v-row>

      <!-- Budget Tracker Selector -->
      <v-row>
        <v-col cols="12">
          <AppBudgetTrackerSelector
            v-model="selectedBudgetTrackerId"
            :budget-trackers="budgetTrackers"
            @refresh="fetchBudgetTrackers"
          />
        </v-col>
      </v-row>

      <!-- Main Content (only when a budget tracker is selected) -->
      <template v-if="selectedBudgetTrackerId">
        <v-row>
          <v-col
            cols="12"
            lg="8"
          >
            <!-- Spending Table -->
            <AppSpendingTable
              :spendings="spendings"
              :categories="categories"
              :budget-tracker-id="selectedBudgetTrackerId"
              @refresh="fetchSpendings"
              @update:time-range="timeRange = $event"
            />
          </v-col>
          <v-col
            cols="12"
            lg="4"
          >
            <!-- Category Manager -->
            <AppCategoryManager
              :categories="categories"
              :icons="icons"
              @refresh="fetchCategories"
            />
          </v-col>
        </v-row>

        <!-- Charts -->
        <v-row>
          <v-col cols="12">
            <AppCharts
              :spendings="spendings"
              :time-range="timeRange"
            />
          </v-col>
        </v-row>
      </template>

      <!-- No Budget Tracker Selected -->
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
type BudgetTracker = {
  id: number;
  name: string;
  role: string;
}

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

type Spending = {
  id: number;
  name: string;
  budget_tracker_id: number;
  value: number;
  is_spending: number;
  category_id: number;
  date: string;
  category_name: string;
  icon_name: string;
  icon_color: string;
  icon: string;
}

const store = useMainStore()
const hasLoaded = ref(false)

const selectedBudgetTrackerId = ref<number | null>(store.getSelectedBudgetTrackerId)
const budgetTrackers = ref<BudgetTracker[]>([])
const categories = ref<Category[]>([])
const icons = ref<Icon[]>([])
const spendings = ref<Spending[]>([])
const timeRange = ref("month")

const fetchBudgetTrackers = async () => {
  try {
    const response = await $fetch("/api/budgetTracker", {
      headers: { Authorization: `Bearer ${store.getUser?.token}` },
    })

    if ("budgetTrackers" in response.body) {
      budgetTrackers.value = response.body.budgetTrackers
    }

    // Restore from store or select first tracker
    if (budgetTrackers.value.length > 0) {
      const storedId = store.getSelectedBudgetTrackerId
      const trackerExists = budgetTrackers.value.some((t) => t.id === storedId)

      if (storedId && trackerExists) {
        selectedBudgetTrackerId.value = storedId
        const tracker = budgetTrackers.value.find((t) => t.id === storedId)
        // oxlint-disable-next-line no-unsafe-type-assertion
        const role = (tracker?.role ?? null) as "owner" | "admin" | "editor" | "viewer" | null

        store.setSelectedBudgetTracker(storedId, role)
      } else if (!selectedBudgetTrackerId.value) {
        const firstTracker = budgetTrackers.value[0]

        selectedBudgetTrackerId.value = firstTracker?.id ?? null
        // oxlint-disable-next-line no-unsafe-type-assertion
        const role = (firstTracker?.role ?? null) as "owner" | "admin" | "editor" | "viewer" | null

        store.setSelectedBudgetTracker(firstTracker?.id ?? null, role)
      }
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

const fetchIcons = async () => {
  try {
    const response = await $fetch("/api/icon", {
      headers: { Authorization: `Bearer ${store.getUser?.token}` },
    })

    icons.value = response.body.icons
  } catch (error) {
    console.error("Failed to fetch icons:", error)
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

  // Validate the token before fetching data
  const isValid = await store.validateToken()

  if (!isValid) {
    await navigateTo("/", { redirectCode: 401 })

    return
  }

  await Promise.all([
    fetchBudgetTrackers(),
    fetchCategories(),
    fetchIcons(),
  ])

  hasLoaded.value = true
})
</script>

<style>
.v-skeleton-loader__image {
  height: 80% !important;
  border-radius: 32px !important;
  margin: 1em !important;
}
</style>
