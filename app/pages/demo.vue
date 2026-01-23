<template>
  <v-container
    :class="['app-container', smAndUp ? 'app-container--desktop' : 'app-container--mobile', selectedBudgetTrackerId && !smAndUp ? 'app-container--with-bottom-nav' : '']"
    fluid
  >
    <div v-if="!hasLoaded">
      <v-row v-if="smAndUp">
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

      <v-col
        v-else
        cols="12"
      >
        <v-row>
          <v-skeleton-loader
            type="heading,table-thead,table-tbody"
            class="mb-4"
          />
        </v-row>
        <v-row>
          <v-skeleton-loader
            type="heading,image"
            class="mb-4"
          />
        </v-row>
      </v-col>
    </div>

    <template v-else>
      <v-row :class="['mb-4', smAndUp ? 'pa-1' : 'pa-0']">
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
          v-if="smAndUp"
          v-model="selectedTab"
          fixed-tabs
          show-arrows
          color="primary"
          class="mb-6 glass-tabs"
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

        <v-divider :class="smAndUp ? 'mt-2 mb-6' : 'mt-1 mb-5'" />

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
              :budget-tracker-id="selectedBudgetTrackerId"
              @refresh="refreshCategoriesAndSpendings"
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

        <v-bottom-navigation
          v-if="!smAndUp"
          v-model="selectedTab"
          grow
          mode="shift"
          class="glass-panel app-bottom-nav"
        >
          <v-btn value="spendings">
            <v-icon icon="mdi-format-list-bulleted" />
            <span class="nav-label">{{ $t("app.spending.title") }}</span>
          </v-btn>
          <v-btn value="categories">
            <v-icon icon="mdi-shape-outline" />
            <span class="nav-label">{{ $t("app.category.title") }}</span>
          </v-btn>
          <v-btn value="charts">
            <v-icon icon="mdi-chart-box-multiple-outline" />
            <span class="nav-label">{{ $t("app.charts.title").split(" ")[2] }}</span>
          </v-btn>
        </v-bottom-navigation>
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

<script lang="ts" setup>
const store = useMainStore()
const { smAndUp } = useVDisplay()
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

const demoCredentials = {
  username: "demo",
  password: "!Demo_User0§",
}

const fetchBudgetTrackers = async () => {
  try {
    const response = await $fetch("/api/budgetTracker", {
      headers: { Authorization: `Bearer ${store.getUser?.token}` },
    })

    if ("budgetTrackers" in response.body) {
      budgetTrackers.value = response.body.budgetTrackers
    }

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
    console.error("Failed to fetch budget trackers :", error)
  }
}

const fetchCategories = async () => {
  if (!selectedBudgetTrackerId.value) {
    categories.value = []

    return
  }

  try {
    const response = await $fetch("/api/category", {
      params: { budget_tracker_id: selectedBudgetTrackerId.value },
      headers: { Authorization: `Bearer ${store.getUser?.token}` },
    })

    if ("categories" in response.body) {
      categories.value = response.body.categories
    }
  } catch (error) {
    console.error("Failed to fetch categories :", error)
    categories.value = []
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
    console.error("Failed to fetch spendings :", error)
    spendings.value = []
  }
}

const refreshCategoriesAndSpendings = async () => {
  await Promise.all([
    fetchCategories(),
    fetchSpendings(),
  ])
}

const authenticateDemo = async () => {
  try {
    const response = await $fetch<{
      status: number;
      body: {
        token?: string;
        user?: {
          id: string;
          username: string;
          token?: string;
        };
      };
    }>("/api/login", {
      method: "POST",
      body: demoCredentials,
    })

    const body = "body" in response
      ? response.body
      : response

    const token = body?.user?.token ?? body?.token

    if (!token || !body?.user) {
      throw new Error("Missing demo login payload")
    }

    store.setUser({
      ...body.user,
      token,
      role: "viewer",
    })
  } catch (error) {
    console.error("Failed to authenticate demo user :", error)
    await navigateTo("/", { redirectCode: 401 })
  }
}

watch(selectedBudgetTrackerId, async () => {
  await Promise.all([
    fetchSpendings(),
    fetchCategories(),
  ])
})

onMounted(async () => {
  hasLoaded.value = false

  await authenticateDemo()

  if (store.getUser === null) {
    return
  }

  const isValid = await store.validateToken()

  if (!isValid) {
    await navigateTo("/", { redirectCode: 401 })

    return
  }

  await fetchBudgetTrackers()

  hasLoaded.value = true
})
</script>

<style lang="scss" scoped>
.app-container {
  padding-left: 16px;
  padding-right: 16px;
}

.app-container--desktop {
  padding-top: 32px;
  padding-bottom: 32px;
}

.app-container--mobile {
  padding-top: 16px;
  padding-bottom: 16px;
  padding-left: 10px;
  padding-right: 10px;
}

.app-container--with-bottom-nav {
  padding-bottom: calc(104px + env(safe-area-inset-bottom));
}

.app-bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  margin: 0 8px 8px;
  width: calc(100% - 16px) !important;
  border-radius: 18px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  z-index: 1007;
}

.app-bottom-nav :deep(.v-btn__content) {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-label {
  display: block;
  line-height: 1.1;
  text-align: center;
}

.v-skeleton-loader__image {
  height: 47.5vh;

  @media (max-width: 600px) {
    width: 90vw;
  }
}
</style>
