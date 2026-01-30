<template>
  <v-container
    :class="['app-container', smAndUp ? 'app-container--desktop' : 'app-container--mobile', selectedBudgetTrackerId]"
    fluid
  >
    <div v-if="!hasLoaded">
      <v-col cols="12">
        <v-row>
          <v-skeleton-loader
            type="heading,image"
            class="mb-4 w-100"
          />
        </v-row>
        <v-row>
          <v-skeleton-loader
            type="heading,table-thead,table-tbody"
            class="mb-4 w-100"
          />
        </v-row>
      </v-col>
    </div>

    <template v-else>
      <v-row>
        <v-col cols="12">
          <AppBudgetTrackerSelector
            v-model="selectedBudgetTrackerId"
            :budget-trackers="budgetTrackers"
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
            />
          </v-tabs-window-item>
          <v-tabs-window-item value="categories">
            <AppCategoryManager
              :categories="categories"
              :budget-tracker-id="selectedBudgetTrackerId"
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
          color="primary"
          grow
          mandatory="force"
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
const { locale } = useI18n()

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

const demoBudgetTrackers = computed<BudgetTracker[]>(() => [
  {
    id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Démo de Spendly"
      : "Spendly Demo",
    role: "viewer",
  },
])

const demoCategories = computed<Category[]>(() => [
  {
    id: "aaaaaaaa-1000-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Salaire"
      : "Salary",
    icon: "mdi-cash-multiple",
    color: "#2E7D32",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
  },
  {
    id: "aaaaaaaa-1001-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Revenu secondaire"
      : "Side income",
    icon: "mdi-cash-plus",
    color: "#26A69A",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
  },
  {
    id: "aaaaaaaa-1002-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Loyer"
      : "Rent",
    icon: "mdi-home-city-outline",
    color: "#7E57C2",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
  },
  {
    id: "aaaaaaaa-1003-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Courses"
      : "Groceries",
    icon: "mdi-cart-variant",
    color: "#43A047",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
  },
  {
    id: "aaaaaaaa-1004-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Services publics"
      : "Utilities",
    icon: "mdi-flash",
    color: "#FB8C00",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
  },
  {
    id: "aaaaaaaa-1005-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Transport"
      : "Transport",
    icon: "mdi-train-car",
    color: "#1E88E5",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
  },
  {
    id: "aaaaaaaa-1006-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Sorties"
      : "Dining out",
    icon: "mdi-silverware-fork-knife",
    color: "#E53935",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
  },
  {
    id: "aaaaaaaa-1007-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Santé et forme"
      : "Health & fitness",
    icon: "mdi-heart-pulse",
    color: "#D81B60",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
  },
  {
    id: "aaaaaaaa-1008-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Divertissement"
      : "Entertainment",
    icon: "mdi-movie-open-outline",
    color: "#8E24AA",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
  },
  {
    id: "aaaaaaaa-1009-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Abonnements"
      : "Subscriptions",
    icon: "mdi-receipt-text-outline",
    color: "#546E7A",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
  },
  {
    id: "aaaaaaaa-1010-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Éducation"
      : "Education",
    icon: "mdi-school-outline",
    color: "#5E35B1",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
  },
  {
    id: "aaaaaaaa-1011-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Shopping"
      : "Shopping",
    icon: "mdi-shopping-outline",
    color: "#F4511E",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
  },
  {
    id: "aaaaaaaa-1012-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Voyage"
      : "Travel",
    icon: "mdi-airplane",
    color: "#00ACC1",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
  },
  {
    id: "aaaaaaaa-1013-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Assurance"
      : "Insurance",
    icon: "mdi-shield-check-outline",
    color: "#3949AB",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
  },
  {
    id: "aaaaaaaa-1014-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Entretien de la maison"
      : "Home maintenance",
    icon: "mdi-hammer-wrench",
    color: "#8D6E63",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
  },
  {
    id: "aaaaaaaa-1015-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Cadeaux et charité"
      : "Gifts & charity",
    icon: "mdi-gift-outline",
    color: "#EC407A",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
  },
  {
    id: "aaaaaaaa-1016-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Animaux de compagnie"
      : "Pets",
    icon: "mdi-paw-outline",
    color: "#6D4C41",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
  },
])

const demoSpendings = computed<Spending[]>(() => [
  {
    id: "aaaaaaaa-2000-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Paiement du salaire"
      : "Salary payment",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 1950,
    is_spending: false,
    date: "2025-11-02",
    category_id: "aaaaaaaa-1000-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1000-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#2E7D32",
    icon: "mdi-cash-multiple",
  },
  {
    id: "aaaaaaaa-2001-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Paiement du salaire"
      : "Salary payment",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 1950,
    is_spending: false,
    date: "2025-12-02",
    category_id: "aaaaaaaa-1000-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1000-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#2E7D32",
    icon: "mdi-cash-multiple",
  },
  {
    id: "aaaaaaaa-2002-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Paiement du salaire"
      : "Salary payment",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 1950,
    is_spending: false,
    date: "2026-01-02",
    category_id: "aaaaaaaa-1000-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1000-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#2E7D32",
    icon: "mdi-cash-multiple",
  },
  {
    id: "aaaaaaaa-2003-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Paiement du salaire"
      : "Salary payment",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 2150,
    is_spending: false,
    date: "2026-02-02",
    category_id: "aaaaaaaa-1000-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1000-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#2E7D32",
    icon: "mdi-cash-multiple",
  },
  {
    id: "aaaaaaaa-2004-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Paiement du salaire"
      : "Salary payment",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 2150,
    is_spending: false,
    date: "2026-03-02",
    category_id: "aaaaaaaa-1000-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1000-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#2E7D32",
    icon: "mdi-cash-multiple",
  },
  {
    id: "aaaaaaaa-2005-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Paiement du salaire"
      : "Salary payment",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 2150,
    is_spending: false,
    date: "2026-04-02",
    category_id: "aaaaaaaa-1000-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1000-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#2E7D32",
    icon: "mdi-cash-multiple",
  },
  {
    id: "aaaaaaaa-2006-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Paiement du salaire"
      : "Salary payment",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 2150,
    is_spending: false,
    date: "2026-05-02",
    category_id: "aaaaaaaa-1000-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1000-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#2E7D32",
    icon: "mdi-cash-multiple",
  },
  {
    id: "aaaaaaaa-2007-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Paiement du salaire"
      : "Salary payment",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 2150,
    is_spending: false,
    date: "2026-06-02",
    category_id: "aaaaaaaa-1000-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1000-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#2E7D32",
    icon: "mdi-cash-multiple",
  },
  {
    id: "aaaaaaaa-2008-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Paiement du salaire"
      : "Salary payment",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 2150,
    is_spending: false,
    date: "2026-07-02",
    category_id: "aaaaaaaa-1000-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1000-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#2E7D32",
    icon: "mdi-cash-multiple",
  },
  {
    id: "aaaaaaaa-2009-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Paiement du salaire"
      : "Salary payment",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 2150,
    is_spending: false,
    date: "2026-08-02",
    category_id: "aaaaaaaa-1000-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1000-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#2E7D32",
    icon: "mdi-cash-multiple",
  },
  {
    id: "aaaaaaaa-2010-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Cadeau de Noël"
      : "Santa gift",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 200,
    is_spending: false,
    date: "2025-12-25",
    category_id: "aaaaaaaa-1001-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1001-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#26A69A",
    icon: "mdi-cash-plus",
  },
  {
    id: "aaaaaaaa-2011-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Prime annuelle"
      : "Yearly bonus",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 800,
    is_spending: false,
    date: "2026-01-01",
    category_id: "aaaaaaaa-1001-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1001-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#26A69A",
    icon: "mdi-cash-plus",
  },
  {
    id: "aaaaaaaa-2012-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Gain à la loterie"
      : "Lottery win",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 50,
    is_spending: false,
    date: "2026-03-11",
    category_id: "aaaaaaaa-1001-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1001-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#26A69A",
    icon: "mdi-cash-plus",
  },
  {
    id: "aaaaaaaa-2013-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Vente d'occasion"
      : "Second-hand sale",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 75,
    is_spending: false,
    date: "2026-04-18",
    category_id: "aaaaaaaa-1001-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1001-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#26A69A",
    icon: "mdi-cash-plus",
  },
  {
    id: "aaaaaaaa-2014-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Vente d'occasion"
      : "Second-hand sale",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 120,
    is_spending: false,
    date: "2026-06-09",
    category_id: "aaaaaaaa-1001-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1001-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#26A69A",
    icon: "mdi-cash-plus",
  },
  {
    id: "aaaaaaaa-2015-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Loyer de novembre"
      : "November rent",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 1200,
    is_spending: true,
    date: "2025-11-03",
    category_id: "aaaaaaaa-1002-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1002-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#7E57C2",
    icon: "mdi-home-city-outline",
  },
  {
    id: "aaaaaaaa-2016-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Loyer de décembre"
      : "December rent",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 1200,
    is_spending: true,
    date: "2025-12-03",
    category_id: "aaaaaaaa-1002-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1002-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#7E57C2",
    icon: "mdi-home-city-outline",
  },
  {
    id: "aaaaaaaa-2017-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Loyer de janvier"
      : "January rent",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 1210,
    is_spending: true,
    date: "2026-01-03",
    category_id: "aaaaaaaa-1002-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1002-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#7E57C2",
    icon: "mdi-home-city-outline",
  },
  {
    id: "aaaaaaaa-2018-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Loyer de février"
      : "February rent",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 1210,
    is_spending: true,
    date: "2026-02-03",
    category_id: "aaaaaaaa-1002-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1002-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#7E57C2",
    icon: "mdi-home-city-outline",
  },
  {
    id: "aaaaaaaa-2019-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Loyer de mars"
      : "March rent",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 1220,
    is_spending: true,
    date: "2026-03-03",
    category_id: "aaaaaaaa-1002-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1002-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#7E57C2",
    icon: "mdi-home-city-outline",
  },
  {
    id: "aaaaaaaa-2020-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Loyer d'avril"
      : "April rent",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 1220,
    is_spending: true,
    date: "2026-04-03",
    category_id: "aaaaaaaa-1002-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1002-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#7E57C2",
    icon: "mdi-home-city-outline",
  },
  {
    id: "aaaaaaaa-2021-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Loyer de mai"
      : "May rent",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 1230,
    is_spending: true,
    date: "2026-05-03",
    category_id: "aaaaaaaa-1002-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1002-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#7E57C2",
    icon: "mdi-home-city-outline",
  },
  {
    id: "aaaaaaaa-2022-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Loyer de juin"
      : "June rent",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 1230,
    is_spending: true,
    date: "2026-06-03",
    category_id: "aaaaaaaa-1002-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1002-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#7E57C2",
    icon: "mdi-home-city-outline",
  },
  {
    id: "aaaaaaaa-2023-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Loyer de juillet"
      : "July rent",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 1240,
    is_spending: true,
    date: "2026-07-03",
    category_id: "aaaaaaaa-1002-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1002-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#7E57C2",
    icon: "mdi-home-city-outline",
  },
  {
    id: "aaaaaaaa-2024-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Loyer d'août"
      : "August rent",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 1240,
    is_spending: true,
    date: "2026-08-03",
    category_id: "aaaaaaaa-1002-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1002-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#7E57C2",
    icon: "mdi-home-city-outline",
  },
  {
    id: "aaaaaaaa-2025-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Courses hebdomadaires"
      : "Weekly groceries",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 95,
    is_spending: true,
    date: "2025-11-10",
    category_id: "aaaaaaaa-1003-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1003-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#43A047",
    icon: "mdi-cart-variant",
  },
  {
    id: "aaaaaaaa-2026-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Réapprovisionnement du marché"
      : "Market restock",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 88,
    is_spending: true,
    date: "2025-11-24",
    category_id: "aaaaaaaa-1003-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1003-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#43A047",
    icon: "mdi-cart-variant",
  },
  {
    id: "aaaaaaaa-2027-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Courses de vacances"
      : "Holiday groceries",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 110,
    is_spending: true,
    date: "2025-12-08",
    category_id: "aaaaaaaa-1003-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1003-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#43A047",
    icon: "mdi-cart-variant",
  },
  {
    id: "aaaaaaaa-2028-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Remplissage du garde-manger"
      : "Pantry fill",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 102,
    is_spending: true,
    date: "2025-12-22",
    category_id: "aaaaaaaa-1003-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1003-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#43A047",
    icon: "mdi-cart-variant",
  },
  {
    id: "aaaaaaaa-2029-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Réapprovisionnement du garde-manger"
      : "Pantry restock",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 98,
    is_spending: true,
    date: "2026-01-12",
    category_id: "aaaaaaaa-1003-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1003-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#43A047",
    icon: "mdi-cart-variant",
  },
  {
    id: "aaaaaaaa-2030-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Courses hebdomadaires"
      : "Weekly groceries",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 90,
    is_spending: true,
    date: "2026-01-26",
    category_id: "aaaaaaaa-1003-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1003-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#43A047",
    icon: "mdi-cart-variant",
  },
  {
    id: "aaaaaaaa-2031-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Courses hebdomadaires"
      : "Weekly groceries",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 97,
    is_spending: true,
    date: "2026-02-09",
    category_id: "aaaaaaaa-1003-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1003-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#43A047",
    icon: "mdi-cart-variant",
  },
  {
    id: "aaaaaaaa-2032-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Courses en vrac"
      : "Bulk groceries",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 120,
    is_spending: true,
    date: "2026-03-09",
    category_id: "aaaaaaaa-1003-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1003-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#43A047",
    icon: "mdi-cart-variant",
  },
  {
    id: "aaaaaaaa-2033-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Produits frais"
      : "Fresh produce",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 104,
    is_spending: true,
    date: "2026-04-13",
    category_id: "aaaaaaaa-1003-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1003-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#43A047",
    icon: "mdi-cart-variant",
  },
  {
    id: "aaaaaaaa-2034-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Marché fermier"
      : "Farmers market",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 105,
    is_spending: true,
    date: "2026-05-14",
    category_id: "aaaaaaaa-1003-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1003-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#43A047",
    icon: "mdi-cart-variant",
  },
  {
    id: "aaaaaaaa-2035-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Courses familiales"
      : "Family groceries",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 112,
    is_spending: true,
    date: "2026-06-12",
    category_id: "aaaaaaaa-1003-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1003-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#43A047",
    icon: "mdi-cart-variant",
  },
  {
    id: "aaaaaaaa-2036-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Courses d'été"
      : "Summer groceries",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 108,
    is_spending: true,
    date: "2026-07-16",
    category_id: "aaaaaaaa-1003-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1003-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#43A047",
    icon: "mdi-cart-variant",
  },
  {
    id: "aaaaaaaa-2037-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Courses d'été"
      : "Summer groceries",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 115,
    is_spending: true,
    date: "2026-08-11",
    category_id: "aaaaaaaa-1003-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1003-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#43A047",
    icon: "mdi-cart-variant",
  },
  {
    id: "aaaaaaaa-2038-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Facture d'électricité"
      : "Electricity bill",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 140,
    is_spending: true,
    date: "2025-11-15",
    category_id: "aaaaaaaa-1004-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1004-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#FB8C00",
    icon: "mdi-flash",
  },
  {
    id: "aaaaaaaa-2039-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Facture Internet"
      : "Internet bill",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 55,
    is_spending: true,
    date: "2025-11-28",
    category_id: "aaaaaaaa-1004-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1004-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#FB8C00",
    icon: "mdi-flash",
  },
  {
    id: "aaaaaaaa-2040-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Facture d'électricité"
      : "Electricity bill",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 150,
    is_spending: true,
    date: "2025-12-15",
    category_id: "aaaaaaaa-1004-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1004-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#FB8C00",
    icon: "mdi-flash",
  },
  {
    id: "aaaaaaaa-2041-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Facture d'électricité"
      : "Electricity bill",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 142,
    is_spending: true,
    date: "2026-01-15",
    category_id: "aaaaaaaa-1004-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1004-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#FB8C00",
    icon: "mdi-flash",
  },
  {
    id: "aaaaaaaa-2042-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Facture d'électricité"
      : "Electricity bill",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 135,
    is_spending: true,
    date: "2026-02-15",
    category_id: "aaaaaaaa-1004-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1004-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#FB8C00",
    icon: "mdi-flash",
  },
  {
    id: "aaaaaaaa-2043-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Facture d'eau"
      : "Water bill",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 48,
    is_spending: true,
    date: "2026-02-28",
    category_id: "aaaaaaaa-1004-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1004-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#FB8C00",
    icon: "mdi-flash",
  },
  {
    id: "aaaaaaaa-2044-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Facture d'électricité"
      : "Electricity bill",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 145,
    is_spending: true,
    date: "2026-03-15",
    category_id: "aaaaaaaa-1004-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1004-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#FB8C00",
    icon: "mdi-flash",
  },
  {
    id: "aaaaaaaa-2045-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Facture d'électricité"
      : "Electricity bill",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 148,
    is_spending: true,
    date: "2026-04-15",
    category_id: "aaaaaaaa-1004-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1004-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#FB8C00",
    icon: "mdi-flash",
  },
  {
    id: "aaaaaaaa-2046-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Facture d'électricité"
      : "Electricity bill",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 152,
    is_spending: true,
    date: "2026-05-15",
    category_id: "aaaaaaaa-1004-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1004-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#FB8C00",
    icon: "mdi-flash",
  },
  {
    id: "aaaaaaaa-2047-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Facture d'électricité"
      : "Electricity bill",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 160,
    is_spending: true,
    date: "2026-06-15",
    category_id: "aaaaaaaa-1004-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1004-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#FB8C00",
    icon: "mdi-flash",
  },
  {
    id: "aaaaaaaa-2048-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Facture d'électricité"
      : "Electricity bill",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 155,
    is_spending: true,
    date: "2026-07-15",
    category_id: "aaaaaaaa-1004-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1004-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#FB8C00",
    icon: "mdi-flash",
  },
  {
    id: "aaaaaaaa-2049-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Facture d'électricité"
      : "Electricity bill",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 158,
    is_spending: true,
    date: "2026-08-15",
    category_id: "aaaaaaaa-1004-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1004-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#FB8C00",
    icon: "mdi-flash",
  },
  {
    id: "aaaaaaaa-2050-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Pass de transports"
      : "Transit pass",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 60,
    is_spending: true,
    date: "2025-11-20",
    category_id: "aaaaaaaa-1005-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1005-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#1E88E5",
    icon: "mdi-train-car",
  },
  {
    id: "aaaaaaaa-2051-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Pass de transports"
      : "Transit pass",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 65,
    is_spending: true,
    date: "2025-12-20",
    category_id: "aaaaaaaa-1005-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1005-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#1E88E5",
    icon: "mdi-train-car",
  },
  {
    id: "aaaaaaaa-2052-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Plein d'essence"
      : "Fuel refill",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 45,
    is_spending: true,
    date: "2026-01-08",
    category_id: "aaaaaaaa-1005-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1005-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#1E88E5",
    icon: "mdi-train-car",
  },
  {
    id: "aaaaaaaa-2053-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Pass de transports"
      : "Transit pass",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 58,
    is_spending: true,
    date: "2026-02-20",
    category_id: "aaaaaaaa-1005-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1005-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#1E88E5",
    icon: "mdi-train-car",
  },
  {
    id: "aaaaaaaa-2054-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Réparation de vélo"
      : "Bike repair",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 80,
    is_spending: true,
    date: "2026-03-05",
    category_id: "aaaaaaaa-1005-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1005-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#1E88E5",
    icon: "mdi-train-car",
  },
  {
    id: "aaaaaaaa-2055-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Pass de transports"
      : "Transit pass",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 70,
    is_spending: true,
    date: "2026-04-20",
    category_id: "aaaaaaaa-1005-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1005-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#1E88E5",
    icon: "mdi-train-car",
  },
  {
    id: "aaaaaaaa-2056-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Covoiturage"
      : "Ride share",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 22,
    is_spending: true,
    date: "2026-05-09",
    category_id: "aaaaaaaa-1005-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1005-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#1E88E5",
    icon: "mdi-train-car",
  },
  {
    id: "aaaaaaaa-2057-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Billets de train"
      : "Train tickets",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 48,
    is_spending: true,
    date: "2026-06-18",
    category_id: "aaaaaaaa-1005-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1005-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#1E88E5",
    icon: "mdi-train-car",
  },
  {
    id: "aaaaaaaa-2058-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Pass de transports"
      : "Transit pass",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 64,
    is_spending: true,
    date: "2026-07-21",
    category_id: "aaaaaaaa-1005-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1005-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#1E88E5",
    icon: "mdi-train-car",
  },
  {
    id: "aaaaaaaa-2059-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Pass de transports"
      : "Transit pass",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 64,
    is_spending: true,
    date: "2026-08-20",
    category_id: "aaaaaaaa-1005-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1005-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#1E88E5",
    icon: "mdi-train-car",
  },
  {
    id: "aaaaaaaa-2060-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Déjeuner au café"
      : "Cafe lunch",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 45,
    is_spending: true,
    date: "2025-11-22",
    category_id: "aaaaaaaa-1006-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1006-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#E53935",
    icon: "mdi-silverware-fork-knife",
  },
  {
    id: "aaaaaaaa-2061-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Dîner entre amis"
      : "Dinner with friends",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 52,
    is_spending: true,
    date: "2025-12-05",
    category_id: "aaaaaaaa-1006-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1006-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#E53935",
    icon: "mdi-silverware-fork-knife",
  },
  {
    id: "aaaaaaaa-2062-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Soirée pizza"
      : "Pizza night",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 35,
    is_spending: true,
    date: "2025-12-19",
    category_id: "aaaaaaaa-1006-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1006-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#E53935",
    icon: "mdi-silverware-fork-knife",
  },
  {
    id: "aaaaaaaa-2063-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Brunch du week-end"
      : "Weekend brunch",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 60,
    is_spending: true,
    date: "2026-01-18",
    category_id: "aaaaaaaa-1006-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1006-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#E53935",
    icon: "mdi-silverware-fork-knife",
  },
  {
    id: "aaaaaaaa-2064-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Dîner de la Saint-Valentin"
      : "Valentine dinner",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 70,
    is_spending: true,
    date: "2026-02-14",
    category_id: "aaaaaaaa-1006-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1006-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#E53935",
    icon: "mdi-silverware-fork-knife",
  },
  {
    id: "aaaaaaaa-2065-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Mardi tacos"
      : "Taco Tuesday",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 42,
    is_spending: true,
    date: "2026-03-27",
    category_id: "aaaaaaaa-1006-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1006-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#E53935",
    icon: "mdi-silverware-fork-knife",
  },
  {
    id: "aaaaaaaa-2066-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "En-cas nocturne"
      : "Late-night snack",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 48,
    is_spending: true,
    date: "2026-04-02",
    category_id: "aaaaaaaa-1006-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1006-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#E53935",
    icon: "mdi-silverware-fork-knife",
  },
  {
    id: "aaaaaaaa-2067-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Bol de ramen"
      : "Ramen bowl",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 58,
    is_spending: true,
    date: "2026-05-23",
    category_id: "aaaaaaaa-1006-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1006-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#E53935",
    icon: "mdi-silverware-fork-knife",
  },
  {
    id: "aaaaaaaa-2068-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Dîner au bistro"
      : "Bistro dinner",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 46,
    is_spending: true,
    date: "2026-06-30",
    category_id: "aaaaaaaa-1006-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1006-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#E53935",
    icon: "mdi-silverware-fork-knife",
  },
  {
    id: "aaaaaaaa-2069-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Soirée sushi"
      : "Sushi night",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 55,
    is_spending: true,
    date: "2026-07-26",
    category_id: "aaaaaaaa-1006-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1006-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#E53935",
    icon: "mdi-silverware-fork-knife",
  },
  {
    id: "aaaaaaaa-2070-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Arrêt au glacier"
      : "Gelato stop",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 40,
    is_spending: true,
    date: "2026-08-12",
    category_id: "aaaaaaaa-1006-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1006-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#E53935",
    icon: "mdi-silverware-fork-knife",
  },
  {
    id: "aaaaaaaa-2071-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Abonnement à la salle de sport"
      : "Gym membership",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 35,
    is_spending: true,
    date: "2025-11-12",
    category_id: "aaaaaaaa-1007-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1007-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#D81B60",
    icon: "mdi-heart-pulse",
  },
  {
    id: "aaaaaaaa-2072-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Abonnement à la salle de sport"
      : "Gym membership",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 35,
    is_spending: true,
    date: "2025-12-12",
    category_id: "aaaaaaaa-1007-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1007-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#D81B60",
    icon: "mdi-heart-pulse",
  },
  {
    id: "aaaaaaaa-2073-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Pharmacie"
      : "Pharmacy",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 24,
    is_spending: true,
    date: "2026-01-10",
    category_id: "aaaaaaaa-1007-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1007-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#D81B60",
    icon: "mdi-heart-pulse",
  },
  {
    id: "aaaaaaaa-2074-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Abonnement à la salle de sport"
      : "Gym membership",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 35,
    is_spending: true,
    date: "2026-02-12",
    category_id: "aaaaaaaa-1007-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1007-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#D81B60",
    icon: "mdi-heart-pulse",
  },
  {
    id: "aaaaaaaa-2075-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Contrôle dentaire"
      : "Dental check",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 85,
    is_spending: true,
    date: "2026-03-06",
    category_id: "aaaaaaaa-1007-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1007-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#D81B60",
    icon: "mdi-heart-pulse",
  },
  {
    id: "aaaaaaaa-2076-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Abonnement à la salle de sport"
      : "Gym membership",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 35,
    is_spending: true,
    date: "2026-04-12",
    category_id: "aaaaaaaa-1007-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1007-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#D81B60",
    icon: "mdi-heart-pulse",
  },
  {
    id: "aaaaaaaa-2077-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Abonnement à la salle de sport"
      : "Gym membership",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 35,
    is_spending: true,
    date: "2026-05-12",
    category_id: "aaaaaaaa-1007-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1007-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#D81B60",
    icon: "mdi-heart-pulse",
  },
  {
    id: "aaaaaaaa-2078-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Bilan de santé"
      : "Health checkup",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 60,
    is_spending: true,
    date: "2026-06-04",
    category_id: "aaaaaaaa-1007-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1007-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#D81B60",
    icon: "mdi-heart-pulse",
  },
  {
    id: "aaaaaaaa-2079-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Abonnement à la salle de sport"
      : "Gym membership",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 35,
    is_spending: true,
    date: "2026-07-12",
    category_id: "aaaaaaaa-1007-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1007-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#D81B60",
    icon: "mdi-heart-pulse",
  },
  {
    id: "aaaaaaaa-2080-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Abonnement à la salle de sport"
      : "Gym membership",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 35,
    is_spending: true,
    date: "2026-08-12",
    category_id: "aaaaaaaa-1007-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1007-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#D81B60",
    icon: "mdi-heart-pulse",
  },
  {
    id: "aaaaaaaa-2081-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Location de streaming"
      : "Streaming rental",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 30,
    is_spending: true,
    date: "2025-11-28",
    category_id: "aaaaaaaa-1008-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1008-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#8E24AA",
    icon: "mdi-movie-open-outline",
  },
  {
    id: "aaaaaaaa-2082-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Concert de vacances"
      : "Holiday concert",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 75,
    is_spending: true,
    date: "2025-12-26",
    category_id: "aaaaaaaa-1008-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1008-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#8E24AA",
    icon: "mdi-movie-open-outline",
  },
  {
    id: "aaaaaaaa-2083-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Jeux de société"
      : "Board games",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 28,
    is_spending: true,
    date: "2026-01-25",
    category_id: "aaaaaaaa-1008-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1008-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#8E24AA",
    icon: "mdi-movie-open-outline",
  },
  {
    id: "aaaaaaaa-2084-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Soirée cinéma"
      : "Movie night",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 28,
    is_spending: true,
    date: "2026-02-05",
    category_id: "aaaaaaaa-1008-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1008-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#8E24AA",
    icon: "mdi-movie-open-outline",
  },
  {
    id: "aaaaaaaa-2085-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Entrée au musée"
      : "Museum entry",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 22,
    is_spending: true,
    date: "2026-03-20",
    category_id: "aaaaaaaa-1008-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1008-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#8E24AA",
    icon: "mdi-movie-open-outline",
  },
  {
    id: "aaaaaaaa-2086-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Spectacle de comédie"
      : "Comedy show",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 50,
    is_spending: true,
    date: "2026-04-20",
    category_id: "aaaaaaaa-1008-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1008-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#8E24AA",
    icon: "mdi-movie-open-outline",
  },
  {
    id: "aaaaaaaa-2087-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Festival local"
      : "Local festival",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 45,
    is_spending: true,
    date: "2026-05-06",
    category_id: "aaaaaaaa-1008-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1008-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#8E24AA",
    icon: "mdi-movie-open-outline",
  },
  {
    id: "aaaaaaaa-2088-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Escape room"
      : "Escape room",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 40,
    is_spending: true,
    date: "2026-06-17",
    category_id: "aaaaaaaa-1008-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1008-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#8E24AA",
    icon: "mdi-movie-open-outline",
  },
  {
    id: "aaaaaaaa-2089-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Soirée arcade"
      : "Arcade night",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 35,
    is_spending: true,
    date: "2026-07-10",
    category_id: "aaaaaaaa-1008-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1008-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#8E24AA",
    icon: "mdi-movie-open-outline",
  },
  {
    id: "aaaaaaaa-2090-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Journée à la plage"
      : "Beach day",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 18,
    is_spending: true,
    date: "2026-08-06",
    category_id: "aaaaaaaa-1008-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1008-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#8E24AA",
    icon: "mdi-movie-open-outline",
  },
  {
    id: "aaaaaaaa-2091-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Abonnement musical"
      : "Music subscription",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 19.99,
    is_spending: true,
    date: "2025-11-05",
    category_id: "aaaaaaaa-1009-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1009-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#546E7A",
    icon: "mdi-receipt-text-outline",
  },
  {
    id: "aaaaaaaa-2092-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Abonnement musical"
      : "Music subscription",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 19.99,
    is_spending: true,
    date: "2025-12-05",
    category_id: "aaaaaaaa-1009-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1009-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#546E7A",
    icon: "mdi-receipt-text-outline",
  },
  {
    id: "aaaaaaaa-2093-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Abonnement musical"
      : "Music subscription",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 19.99,
    is_spending: true,
    date: "2026-01-05",
    category_id: "aaaaaaaa-1009-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1009-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#546E7A",
    icon: "mdi-receipt-text-outline",
  },
  {
    id: "aaaaaaaa-2094-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Abonnement musical"
      : "Music subscription",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 19.99,
    is_spending: true,
    date: "2026-02-05",
    category_id: "aaaaaaaa-1009-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1009-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#546E7A",
    icon: "mdi-receipt-text-outline",
  },
  {
    id: "aaaaaaaa-2095-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Abonnement musical"
      : "Music subscription",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 19.99,
    is_spending: true,
    date: "2026-03-05",
    category_id: "aaaaaaaa-1009-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1009-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#546E7A",
    icon: "mdi-receipt-text-outline",
  },
  {
    id: "aaaaaaaa-2096-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Abonnement musical"
      : "Music subscription",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 19.99,
    is_spending: true,
    date: "2026-04-05",
    category_id: "aaaaaaaa-1009-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1009-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#546E7A",
    icon: "mdi-receipt-text-outline",
  },
  {
    id: "aaaaaaaa-2097-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Abonnement musical"
      : "Music subscription",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 19.99,
    is_spending: true,
    date: "2026-05-05",
    category_id: "aaaaaaaa-1009-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1009-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#546E7A",
    icon: "mdi-receipt-text-outline",
  },
  {
    id: "aaaaaaaa-2098-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Abonnement musical"
      : "Music subscription",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 19.99,
    is_spending: true,
    date: "2026-06-05",
    category_id: "aaaaaaaa-1009-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1009-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#546E7A",
    icon: "mdi-receipt-text-outline",
  },
  {
    id: "aaaaaaaa-2099-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Abonnement musical"
      : "Music subscription",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 19.99,
    is_spending: true,
    date: "2026-07-05",
    category_id: "aaaaaaaa-1009-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1009-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#546E7A",
    icon: "mdi-receipt-text-outline",
  },
  {
    id: "aaaaaaaa-2100-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Abonnement musical"
      : "Music subscription",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 19.99,
    is_spending: true,
    date: "2026-08-05",
    category_id: "aaaaaaaa-1009-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1009-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#546E7A",
    icon: "mdi-receipt-text-outline",
  },
  {
    id: "aaaaaaaa-2101-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Cours en ligne"
      : "Online course",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 120,
    is_spending: true,
    date: "2025-11-07",
    category_id: "aaaaaaaa-1010-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1010-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#5E35B1",
    icon: "mdi-school-outline",
  },
  {
    id: "aaaaaaaa-2102-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Pack de livres"
      : "Book bundle",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 45,
    is_spending: true,
    date: "2025-12-02",
    category_id: "aaaaaaaa-1010-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1010-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#5E35B1",
    icon: "mdi-school-outline",
  },
  {
    id: "aaaaaaaa-2103-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Atelier"
      : "Workshop",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 220,
    is_spending: true,
    date: "2026-01-07",
    category_id: "aaaaaaaa-1010-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1010-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#5E35B1",
    icon: "mdi-school-outline",
  },
  {
    id: "aaaaaaaa-2104-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Application linguistique"
      : "Language app",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 60,
    is_spending: true,
    date: "2026-02-22",
    category_id: "aaaaaaaa-1010-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1010-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#5E35B1",
    icon: "mdi-school-outline",
  },
  {
    id: "aaaaaaaa-2105-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Pack de livres électroniques"
      : "E-book bundle",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 80,
    is_spending: true,
    date: "2026-03-07",
    category_id: "aaaaaaaa-1010-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1010-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#5E35B1",
    icon: "mdi-school-outline",
  },
  {
    id: "aaaaaaaa-2106-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Pass pour webinaire"
      : "Webinar pass",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 40,
    is_spending: true,
    date: "2026-04-11",
    category_id: "aaaaaaaa-1010-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1010-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#5E35B1",
    icon: "mdi-school-outline",
  },
  {
    id: "aaaaaaaa-2107-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Frais de certification"
      : "Certification fee",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 140,
    is_spending: true,
    date: "2026-06-07",
    category_id: "aaaaaaaa-1010-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1010-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#5E35B1",
    icon: "mdi-school-outline",
  },
  {
    id: "aaaaaaaa-2108-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Billet de conférence"
      : "Conference ticket",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 60,
    is_spending: true,
    date: "2026-08-07",
    category_id: "aaaaaaaa-1010-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1010-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#5E35B1",
    icon: "mdi-school-outline",
  },
  {
    id: "aaaaaaaa-2109-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Manteau d'hiver"
      : "Winter coat",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 160,
    is_spending: true,
    date: "2025-11-30",
    category_id: "aaaaaaaa-1011-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1011-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#F4511E",
    icon: "mdi-shopping-outline",
  },
  {
    id: "aaaaaaaa-2110-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Cadeaux de vacances"
      : "Holiday gifts",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 90,
    is_spending: true,
    date: "2025-12-12",
    category_id: "aaaaaaaa-1011-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1011-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#F4511E",
    icon: "mdi-shopping-outline",
  },
  {
    id: "aaaaaaaa-2111-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Accessoire tech"
      : "Tech accessory",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 210,
    is_spending: true,
    date: "2026-01-30",
    category_id: "aaaaaaaa-1011-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1011-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#F4511E",
    icon: "mdi-shopping-outline",
  },
  {
    id: "aaaaaaaa-2112-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Ensemble de soins de la peau"
      : "Skincare set",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 55,
    is_spending: true,
    date: "2026-02-18",
    category_id: "aaaaaaaa-1011-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1011-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#F4511E",
    icon: "mdi-shopping-outline",
  },
  {
    id: "aaaaaaaa-2113-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Décoration intérieure"
      : "Home decor",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 130,
    is_spending: true,
    date: "2026-03-30",
    category_id: "aaaaaaaa-1011-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1011-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#F4511E",
    icon: "mdi-shopping-outline",
  },
  {
    id: "aaaaaaaa-2114-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Ustensiles de cuisine"
      : "Kitchen tools",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 48,
    is_spending: true,
    date: "2026-04-16",
    category_id: "aaaaaaaa-1011-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1011-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#F4511E",
    icon: "mdi-shopping-outline",
  },
  {
    id: "aaaaaaaa-2115-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Chaise de bureau"
      : "Office chair",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 190,
    is_spending: true,
    date: "2026-05-28",
    category_id: "aaaaaaaa-1011-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1011-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#F4511E",
    icon: "mdi-shopping-outline",
  },
  {
    id: "aaaaaaaa-2116-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Chaussures d'été"
      : "Summer shoes",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 180,
    is_spending: true,
    date: "2026-06-30",
    category_id: "aaaaaaaa-1011-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1011-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#F4511E",
    icon: "mdi-shopping-outline",
  },
  {
    id: "aaaaaaaa-2117-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Sac à dos"
      : "Backpack",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 75,
    is_spending: true,
    date: "2026-07-22",
    category_id: "aaaaaaaa-1011-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1011-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#F4511E",
    icon: "mdi-shopping-outline",
  },
  {
    id: "aaaaaaaa-2118-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Rentrée scolaire"
      : "Back-to-school",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 95,
    is_spending: true,
    date: "2026-08-30",
    category_id: "aaaaaaaa-1011-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1011-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#F4511E",
    icon: "mdi-shopping-outline",
  },
  {
    id: "aaaaaaaa-2119-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Voyage de week-end"
      : "Weekend trip",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 220,
    is_spending: true,
    date: "2025-12-18",
    category_id: "aaaaaaaa-1012-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1012-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#00ACC1",
    icon: "mdi-airplane",
  },
  {
    id: "aaaaaaaa-2120-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Dépôt d'hôtel"
      : "Hotel deposit",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 120,
    is_spending: true,
    date: "2026-02-10",
    category_id: "aaaaaaaa-1012-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1012-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#00ACC1",
    icon: "mdi-airplane",
  },
  {
    id: "aaaaaaaa-2121-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Escapade de printemps"
      : "Spring getaway",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 450,
    is_spending: true,
    date: "2026-03-15",
    category_id: "aaaaaaaa-1012-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1012-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#00ACC1",
    icon: "mdi-airplane",
  },
  {
    id: "aaaaaaaa-2122-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "City break"
      : "City break",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 380,
    is_spending: true,
    date: "2026-05-02",
    category_id: "aaaaaaaa-1012-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1012-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#00ACC1",
    icon: "mdi-airplane",
  },
  {
    id: "aaaaaaaa-2123-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Vacances d'été"
      : "Summer vacation",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 520,
    is_spending: true,
    date: "2026-07-04",
    category_id: "aaaaaaaa-1012-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1012-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#00ACC1",
    icon: "mdi-airplane",
  },
  {
    id: "aaaaaaaa-2124-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Visite de la famille"
      : "Family visit",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 260,
    is_spending: true,
    date: "2026-08-16",
    category_id: "aaaaaaaa-1012-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1012-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#00ACC1",
    icon: "mdi-airplane",
  },
  {
    id: "aaaaaaaa-2125-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Excursion d'une journée"
      : "Day trip",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 95,
    is_spending: true,
    date: "2026-08-24",
    category_id: "aaaaaaaa-1012-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1012-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#00ACC1",
    icon: "mdi-airplane",
  },
  {
    id: "aaaaaaaa-2126-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Assurance locataire"
      : "Renters insurance",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 110,
    is_spending: true,
    date: "2025-11-18",
    category_id: "aaaaaaaa-1013-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1013-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#3949AB",
    icon: "mdi-shield-check-outline",
  },
  {
    id: "aaaaaaaa-2127-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Assurance locataire"
      : "Renters insurance",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 115,
    is_spending: true,
    date: "2026-01-18",
    category_id: "aaaaaaaa-1013-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1013-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#3949AB",
    icon: "mdi-shield-check-outline",
  },
  {
    id: "aaaaaaaa-2128-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Assurance locataire"
      : "Renters insurance",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 120,
    is_spending: true,
    date: "2026-03-18",
    category_id: "aaaaaaaa-1013-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1013-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#3949AB",
    icon: "mdi-shield-check-outline",
  },
  {
    id: "aaaaaaaa-2129-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Assurance locataire"
      : "Renters insurance",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 125,
    is_spending: true,
    date: "2026-05-18",
    category_id: "aaaaaaaa-1013-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1013-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#3949AB",
    icon: "mdi-shield-check-outline",
  },
  {
    id: "aaaaaaaa-2130-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Assurance locataire"
      : "Renters insurance",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 130,
    is_spending: true,
    date: "2026-07-18",
    category_id: "aaaaaaaa-1013-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1013-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#3949AB",
    icon: "mdi-shield-check-outline",
  },
  {
    id: "aaaaaaaa-2131-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Assurance locataire"
      : "Renters insurance",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 125,
    is_spending: true,
    date: "2026-08-18",
    category_id: "aaaaaaaa-1013-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1013-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#3949AB",
    icon: "mdi-shield-check-outline",
  },
  {
    id: "aaaaaaaa-2132-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Ampoules"
      : "Light bulbs",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 18,
    is_spending: true,
    date: "2025-11-16",
    category_id: "aaaaaaaa-1014-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1014-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#8D6E63",
    icon: "mdi-hammer-wrench",
  },
  {
    id: "aaaaaaaa-2133-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Visite du plombier"
      : "Plumber visit",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 85,
    is_spending: true,
    date: "2025-12-14",
    category_id: "aaaaaaaa-1014-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1014-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#8D6E63",
    icon: "mdi-hammer-wrench",
  },
  {
    id: "aaaaaaaa-2134-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Fournitures de nettoyage"
      : "Cleaning supplies",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 32,
    is_spending: true,
    date: "2026-02-08",
    category_id: "aaaaaaaa-1014-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1014-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#8D6E63",
    icon: "mdi-hammer-wrench",
  },
  {
    id: "aaaaaaaa-2135-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Outils de jardin"
      : "Garden tools",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 45,
    is_spending: true,
    date: "2026-04-09",
    category_id: "aaaaaaaa-1014-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1014-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#8D6E63",
    icon: "mdi-hammer-wrench",
  },
  {
    id: "aaaaaaaa-2136-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Réparation de la climatisation"
      : "AC service",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 110,
    is_spending: true,
    date: "2026-06-21",
    category_id: "aaaaaaaa-1014-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1014-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#8D6E63",
    icon: "mdi-hammer-wrench",
  },
  {
    id: "aaaaaaaa-2137-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Retouche de peinture"
      : "Paint touch-up",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 60,
    is_spending: true,
    date: "2026-08-08",
    category_id: "aaaaaaaa-1014-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1014-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#8D6E63",
    icon: "mdi-hammer-wrench",
  },
  {
    id: "aaaaaaaa-2138-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Don local"
      : "Local donation",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 25,
    is_spending: true,
    date: "2025-11-26",
    category_id: "aaaaaaaa-1015-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1015-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#EC407A",
    icon: "mdi-gift-outline",
  },
  {
    id: "aaaaaaaa-2139-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Cadeaux de vacances"
      : "Holiday gifts",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 120,
    is_spending: true,
    date: "2025-12-24",
    category_id: "aaaaaaaa-1015-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1015-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#EC407A",
    icon: "mdi-gift-outline",
  },
  {
    id: "aaaaaaaa-2140-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Cadeau d'anniversaire"
      : "Birthday gift",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 35,
    is_spending: true,
    date: "2026-02-01",
    category_id: "aaaaaaaa-1015-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1015-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#EC407A",
    icon: "mdi-gift-outline",
  },
  {
    id: "aaaaaaaa-2141-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Collecte de fonds"
      : "Fundraiser",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 40,
    is_spending: true,
    date: "2026-03-30",
    category_id: "aaaaaaaa-1015-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1015-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#EC407A",
    icon: "mdi-gift-outline",
  },
  {
    id: "aaaaaaaa-2142-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Course caritative"
      : "Charity run",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 30,
    is_spending: true,
    date: "2026-05-05",
    category_id: "aaaaaaaa-1015-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1015-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#EC407A",
    icon: "mdi-gift-outline",
  },
  {
    id: "aaaaaaaa-2143-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Cadeau de mariage"
      : "Wedding gift",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 80,
    is_spending: true,
    date: "2026-07-08",
    category_id: "aaaaaaaa-1015-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1015-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#EC407A",
    icon: "mdi-gift-outline",
  },
  {
    id: "aaaaaaaa-2144-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Nourriture pour animaux"
      : "Pet food",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 35,
    is_spending: true,
    date: "2025-11-11",
    category_id: "aaaaaaaa-1016-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1016-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#6D4C41",
    icon: "mdi-paw-outline",
  },
  {
    id: "aaaaaaaa-2145-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Visite chez le vétérinaire"
      : "Vet visit",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 75,
    is_spending: true,
    date: "2025-12-09",
    category_id: "aaaaaaaa-1016-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1016-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#6D4C41",
    icon: "mdi-paw-outline",
  },
  {
    id: "aaaaaaaa-2146-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Nourriture pour animaux"
      : "Pet food",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 34,
    is_spending: true,
    date: "2026-01-14",
    category_id: "aaaaaaaa-1016-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1016-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#6D4C41",
    icon: "mdi-paw-outline",
  },
  {
    id: "aaaaaaaa-2147-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Toilettage"
      : "Grooming",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 45,
    is_spending: true,
    date: "2026-03-12",
    category_id: "aaaaaaaa-1016-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1016-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#6D4C41",
    icon: "mdi-paw-outline",
  },
  {
    id: "aaaaaaaa-2148-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Jouets pour animaux"
      : "Pet toys",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 22,
    is_spending: true,
    date: "2026-05-19",
    category_id: "aaaaaaaa-1016-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1016-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#6D4C41",
    icon: "mdi-paw-outline",
  },
  {
    id: "aaaaaaaa-2149-0000-0000-zzzzzzzzzzzz",
    name: locale.value === "fr"
      ? "Nourriture pour animaux"
      : "Pet food",
    budget_tracker_id: "aaaaaaaa-0000-0000-0000-zzzzzzzzzzzz",
    value: 36,
    is_spending: true,
    date: "2026-07-15",
    category_id: "aaaaaaaa-1016-0000-0000-zzzzzzzzzzzz",
    category_name: demoCategories.value.find((cat) => cat.id === "aaaaaaaa-1016-0000-0000-zzzzzzzzzzzz")?.name || "",
    icon_color: "#6D4C41",
    icon: "mdi-paw-outline",
  },
])

watch(selectedBudgetTrackerId, async () => {
  if (selectedBudgetTrackerId.value) {
    categories.value = demoCategories.value
    spendings.value = demoSpendings.value
  } else {
    categories.value = []
    spendings.value = []
  }
})

watch(locale, async () => {
  if (selectedBudgetTrackerId.value) {
    categories.value = demoCategories.value
    spendings.value = demoSpendings.value
  } else {
    categories.value = []
    spendings.value = []
  }
})

onMounted(async () => {
  hasLoaded.value = false

  budgetTrackers.value = demoBudgetTrackers.value
  selectedBudgetTrackerId.value = demoBudgetTrackers.value[0]?.id ?? null
  store.setUser({
    id: "aaaaaaaa-3000-0000-0000-zzzzzzzzzzzz",
    ...demoCredentials,
    token: "eyJhbGciOiJIUzI1NiJ9.eyJpZCI6ImFhYWFhYWFhLTMwMDAtMDAwMC0wMDAwLXp6enp6enp6enp6eiIsInVzZXJuYW1lIjoiZGVtbyJ9.C8UEF3dy_s7CHMz9lIrGRBqMtFAuFCJ37FVGt36H90o",
    role: "user",
  })
  store.setSelectedBudgetTracker(selectedBudgetTrackerId.value, "viewer")

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
