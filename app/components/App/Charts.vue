<template>
  <v-card :class="['glass-card', 'mb-4', 'rounded-lg', smAndUp ? 'pa-1' : 'pa-0']">
    <v-card-title :class="['d-flex', 'align-center', 'justify-space-between', 'flex-wrap', 'gap-2', smAndUp ? '' : 'px-3 pt-3']">
      <div class="d-flex align-center">
        <v-icon
          icon="mdi-chart-box-multiple-outline"
          class="mr-2"
          color="primary"
        />
        <span class="font-weight-bold">{{ $t("app.charts.title") }}</span>
      </div>

      <div :class="['charts-header-actions', !smAndUp && 'charts-header-actions--mobile', !smAndUp && 'pt-2']">
        <AppDateRangeFilter
          v-model:time-range="timeRangeModel"
          v-model:anchor-date="anchorDateModel"
        />
        <div
          v-if="spendings.length > 0"
          :class="['chart-actions', !smAndUp ? 'chart-actions--inline' : '']"
        >
          <v-btn
            :color="simplifiedMode ? 'primary' : 'info'"
            variant="tonal"
            prepend-icon="mdi-auto-fix"
            @click="toggleSimplified"
          >
            {{ $t("app.charts.simplified") }} {{ simplifiedMode ? '✅' : '❌' }}
          </v-btn>

          <v-menu content-class="glass-menu-content">
            <template #activator="{ props: settingsProps }">
              <v-btn
                v-bind="settingsProps"
                variant="tonal"
                color="secondary"
                prepend-icon="mdi-tune-variant"
              >
                {{ $t("app.charts.controls") }}
              </v-btn>
            </template>
            <v-list class="glass-card pa-2 border-thin">
              <v-list-item v-if="!simplifiedMode">
                <v-list-item-title>{{ $t("app.charts.show-title") }}</v-list-item-title>
                <template #append>
                  <v-switch
                    v-model="showTitle"
                    density="compact"
                    color="secondary"
                    hide-details
                    inset
                    :disabled="simplifiedMode"
                  />
                </template>
              </v-list-item>
              <v-list-item v-if="!simplifiedMode">
                <v-list-item-title>{{ $t("app.charts.show-legend") }}</v-list-item-title>
                <template #append>
                  <v-switch
                    v-model="showLegend"
                    density="compact"
                    color="secondary"
                    hide-details
                    inset
                    :disabled="simplifiedMode"
                  />
                </template>
              </v-list-item>
              <v-list-item v-if="!simplifiedMode && ['area', 'bar'].includes(activeTab)">
                <v-list-item-title>{{ $t("app.charts.show-x-axis") }}</v-list-item-title>
                <template #append>
                  <v-switch
                    v-model="showXAxis"
                    density="compact"
                    color="secondary"
                    hide-details
                    inset
                    :disabled="simplifiedMode"
                  />
                </template>
              </v-list-item>
              <v-list-item v-if="!simplifiedMode && ['area', 'bar'].includes(activeTab)">
                <v-list-item-title>{{ $t("app.charts.show-y-axis") }}</v-list-item-title>
                <template #append>
                  <v-switch
                    v-model="showYAxis"
                    density="compact"
                    color="secondary"
                    hide-details
                    inset
                    :disabled="simplifiedMode"
                  />
                </template>
              </v-list-item>
              <v-list-item v-if="!simplifiedMode && ['area', 'bar'].includes(activeTab)">
                <v-list-item-title>{{ $t("app.charts.show-grid") }}</v-list-item-title>
                <template #append>
                  <v-switch
                    v-model="showGrid"
                    density="compact"
                    color="secondary"
                    hide-details
                    inset
                    :disabled="simplifiedMode"
                  />
                </template>
              </v-list-item>
              <v-list-item v-if="!simplifiedMode && activeTab === 'area'">
                <v-list-item-title>{{ $t("app.charts.show-points") }}</v-list-item-title>
                <template #append>
                  <v-switch
                    v-model="showPoints"
                    density="compact"
                    color="secondary"
                    hide-details
                    inset
                    :disabled="simplifiedMode"
                  />
                </template>
              </v-list-item>
              <v-divider
                v-if="['area', 'pie'].includes(activeTab) && !simplifiedMode"
                class="my-2"
              />
              <v-list-item v-if="activeTab === 'area'">
                <v-list-item-title>{{ $t("app.charts.show-balance") }}</v-list-item-title>
                <template #append>
                  <v-switch
                    v-model="showBalance"
                    density="compact"
                    color="info"
                    hide-details
                    inset
                  />
                </template>
              </v-list-item>
              <v-list-item v-if="activeTab === 'area'">
                <v-list-item-title>{{ $t("app.charts.show-income") }}</v-list-item-title>
                <template #append>
                  <v-switch
                    v-model="showIncome"
                    density="compact"
                    color="success"
                    hide-details
                    inset
                  />
                </template>
              </v-list-item>
              <v-list-item v-if="activeTab === 'area'">
                <v-list-item-title>{{ $t("app.charts.show-expense") }}</v-list-item-title>
                <template #append>
                  <v-switch
                    v-model="showExpense"
                    density="compact"
                    color="error"
                    hide-details
                    inset
                  />
                </template>
              </v-list-item>
              <v-list-item v-if="activeTab === 'pie'">
                <v-list-item-title>{{ $t("app.charts.show-expense") }}</v-list-item-title>
                <template #append>
                  <v-switch
                    v-model="showExpensePie"
                    density="compact"
                    color="error"
                    hide-details
                    inset
                  />
                </template>
              </v-list-item>
              <v-list-item v-if="activeTab === 'pie'">
                <v-list-item-title>{{ $t("app.charts.show-income") }}</v-list-item-title>
                <template #append>
                  <v-switch
                    v-model="showIncomePie"
                    density="compact"
                    color="success"
                    hide-details
                    inset
                  />
                </template>
              </v-list-item>
            </v-list>
          </v-menu>

          <v-menu content-class="glass-menu-content">
            <template #activator="{ props: menuProps }">
              <v-btn
                v-bind="menuProps"
                variant="tonal"
                color="info"
                prepend-icon="mdi-download-outline"
              >
                {{ $t("app.charts.export") }}
              </v-btn>
            </template>
            <v-list class="glass-card pa-0 border-thin">
              <v-list-item
                class="glass-list-item mb-1 rounded-lg ma-1"
                :disabled="isExporting"
                @click="exportSVG"
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
                    icon="mdi-svg"
                    color="secondary"
                  />
                </template>
                <v-list-item-title>{{ $t("app.charts.export-svg") }}</v-list-item-title>
              </v-list-item>
              <v-list-item
                class="glass-list-item mb-1 rounded-lg ma-1"
                :disabled="isExporting"
                @click="exportPNG"
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
                    icon="mdi-file-image-outline"
                    color="secondary"
                  />
                </template>
                <v-list-item-title>{{ $t("app.charts.export-png") }}</v-list-item-title>
              </v-list-item>
              <v-list-item
                class="glass-list-item rounded-lg ma-1"
                :disabled="isExporting"
                @click="exportPDF"
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
                    icon="mdi-file-pdf-box"
                    color="secondary"
                  />
                </template>
                <v-list-item-title>{{ $t("app.charts.export-pdf") }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </div>
      </div>
    </v-card-title>
    <v-card-text
      v-if="spendings.length === 0"
      :class="smAndUp ? 'pt-4' : 'pt-3 px-3'"
    >
      <v-alert
        type="info"
        variant="tonal"
        class="glass-panel border-thin"
      >
        {{ $t("app.charts.no-data") }}
      </v-alert>
    </v-card-text>

    <v-card-text
      v-else
      :class="smAndUp ? 'pt-4' : 'pt-3 px-3'"
    >
      <v-tabs
        v-model="activeTab"
        color="accent"
        show-arrows
        align-tabs="center"
        class="glass-tabs mb-4 rounded-lg"
      >
        <v-tab
          value="area"
          class="text-body-1"
        >
          <v-icon
            icon="mdi-chart-areaspline-variant"
            class="mr-2"
          />
          {{ $t("app.charts.area") }}
        </v-tab>
        <v-tab
          value="pie"
          class="text-body-1"
        >
          <v-icon
            icon="mdi-chart-pie-outline"
            class="mr-2"
          />
          {{ $t("app.charts.pie") }}
        </v-tab>
        <v-tab
          value="bar"
          class="text-body-1"
        >
          <v-icon
            icon="mdi-chart-bar"
            class="mr-2"
          />
          {{ $t("app.charts.bar") }}
        </v-tab>
        <v-tab
          value="doughnut"
          class="text-body-1"
        >
          <v-icon
            icon="mdi-chart-donut"
            class="mr-2"
          />
          {{ $t("app.charts.doughnut") }}
        </v-tab>
      </v-tabs>
      <v-tabs-window v-model="activeTab">
        <v-tabs-window-item value="area">
          <div
            ref="areaChartRef"
            :class="['chart-container', 'mt-4', 'glass-panel', smAndUp ? 'pa-4' : 'pa-3', 'rounded-xl', 'border-thin', 'bg-transparent']"
          >
            <Line
              ref="areaChartInstance"
              :data="areaChartData"
              :options="areaChartOptions"
            />
          </div>
        </v-tabs-window-item>
        <v-tabs-window-item value="pie">
          <div :class="['pie-grid', 'mt-4', !smAndUp ? 'pie-grid--stack' : '']">
            <div
              v-if="showExpensePie"
              ref="pieChartRef"
              :class="['chart-container', 'pie-chart', 'glass-panel', smAndUp ? 'pa-4' : 'pa-3', 'rounded-xl', 'border-thin', 'bg-transparent']"
            >
              <Pie
                ref="expensesPieChartInstance"
                :data="expensesPieChartData"
                :options="expensesPieChartOptions"
              />
            </div>
            <div
              v-if="showIncomePie"
              ref="incomePieChartRef"
              :class="['chart-container', 'pie-chart', 'glass-panel', smAndUp ? 'pa-4' : 'pa-3', 'rounded-xl', 'border-thin', 'bg-transparent']"
            >
              <Pie
                ref="incomePieChartInstance"
                :data="incomePieChartData"
                :options="incomePieChartOptions"
              />
            </div>
          </div>
        </v-tabs-window-item>
        <v-tabs-window-item value="bar">
          <div
            ref="barChartRef"
            :class="['chart-container', 'mt-4', 'glass-panel', smAndUp ? 'pa-4' : 'pa-3', 'rounded-xl', 'border-thin', 'bg-transparent']"
          >
            <Bar
              ref="barChartInstance"
              :data="barChartData"
              :options="barChartOptions"
            />
          </div>
        </v-tabs-window-item>
        <v-tabs-window-item value="doughnut">
          <div
            ref="doughnutChartRef"
            :class="['chart-container', 'mt-4', 'glass-panel', smAndUp ? 'pa-4' : 'pa-3', 'rounded-xl', 'border-thin', 'bg-transparent']"
          >
            <Doughnut
              ref="doughnutChartInstance"
              :data="doughnutChartData"
              :options="doughnutChartOptions"
            />
          </div>
        </v-tabs-window-item>
      </v-tabs-window>
    </v-card-text>
  </v-card>
</template>

<script lang="ts" setup>
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  type TooltipItem,
} from "chart.js"
import {
  Bar,
  Doughnut,
  Line,
  Pie,
} from "vue-chartjs"

type ChartComponentRef = {
  chart?: {
    canvas?: HTMLCanvasElement;
  };
} | null

type ChartInstanceRef = {
  chart?: ChartJS;
} | null

type C2SCtor = new (w: number, h: number) => CanvasRenderingContext2D

type ExportCanvasResult = {
  canvas: HTMLCanvasElement;
  cleanup: () => void;
}

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
)

ChartJS.defaults.font.family = "\"Inter\", sans-serif"
ChartJS.defaults.font.size = 14

const props = defineProps<{
  spendings: Spending[];
  timeRange: string;
  anchorDate: string;
}>()

const emit = defineEmits<{
  "update:time-range": [value: string];
  "update:anchor-date": [value: string];
}>()

const {
  t, locale,
} = useI18n()
const store = useMainStore()
const { smAndUp } = useVDisplay()
const activeTab = ref("area")
const simplifiedMode = ref(!smAndUp.value)
const showTitle = ref(true)
const showLegend = ref(true)
const showXAxis = ref(true)
const showYAxis = ref(true)
const showGrid = ref(true)
const showPoints = ref(true)
const showBalance = ref(true)
const showIncome = ref(true)
const showExpense = ref(true)
const showExpensePie = ref(true)
const showIncomePie = ref(true)
const isExporting = ref(false)
const timeRangeModel = computed({
  get: () => props.timeRange,
  set: (v: string) => emit("update:time-range", v),
})
const anchorDateModel = computed({
  get: () => props.anchorDate,
  set: (v: string) => emit("update:anchor-date", v),
})

const toggleSimplified = () => {
  simplifiedMode.value = !simplifiedMode.value
}

watch(smAndUp, (val, prev) => {
  if (val && !prev) {
    simplifiedMode.value = false
  }

  if (!val && prev) {
    simplifiedMode.value = true
  }
})

const areaChartInstance = ref<InstanceType<typeof Line> | null>(null)
const expensesPieChartInstance = ref<InstanceType<typeof Pie> | null>(null)
const incomePieChartInstance = ref<InstanceType<typeof Pie> | null>(null)
const barChartInstance = ref<InstanceType<typeof Bar> | null>(null)
const doughnutChartInstance = ref<InstanceType<typeof Doughnut> | null>(null)

const isDark = computed(() => store.getTheme === "dark")

const textColor = computed(() => (isDark.value
  ? "rgba(255, 255, 255, 0.9)"
  : "rgba(0, 0, 0, 0.87)"))
const gridColor = computed(() => (isDark.value
  ? "rgba(255, 255, 255, 0.1)"
  : "rgba(0, 0, 0, 0.1)"))
const effectiveShowTitle = computed(() => (simplifiedMode.value
  ? false
  : showTitle.value))
const effectiveShowLegend = computed(() => (simplifiedMode.value
  ? false
  : showLegend.value))
const effectiveShowXAxis = computed(() => (simplifiedMode.value
  ? false
  : showXAxis.value))
const effectiveShowYAxis = computed(() => (simplifiedMode.value
  ? false
  : showYAxis.value))
const effectiveShowGrid = computed(() => (simplifiedMode.value
  ? false
  : showGrid.value))
const effectiveShowPoints = computed(() => (simplifiedMode.value
  ? false
  : showPoints.value))

const formatAreaLabel = (rawLabel: unknown) => {
  const label = typeof rawLabel === "string"
    ? rawLabel
    : String(rawLabel ?? "")

  if (!label) {
    return ""
  }

  const [ y, m, d ] = label.split("-")
    .map(Number)

  if (!y || !m) {
    return label
  }

  const date = new Date(y, m - 1, d || 1)
  const range = timeRangeModel.value

  if (range === "day" || range === "all") {
    return new Intl.DateTimeFormat(locale.value, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
      .format(date)
  }

  return new Intl.DateTimeFormat(locale.value, {
    day: "2-digit",
    month: "short",
  })
    .format(date)
}

const getWeekStartAndEnd = (date: Date): {
  start: Date; end: Date;
} => {
  const day = date.getDay()
  const diffToMonday = (day + 6) % 7

  const start = new Date(date)

  start.setDate(date.getDate() - diffToMonday)

  const end = new Date(start)

  end.setDate(start.getDate() + 6)

  return {
    start, end,
  }
}

const formatBarLabel = (rawLabel: unknown) => {
  const label = typeof rawLabel === "string"
    ? rawLabel
    : String(rawLabel ?? "")

  if (!label) {
    return ""
  }

  const [ y, m, d ] = label.split("-")
    .map(Number)

  if (!y || !m) {
    return label
  }

  const date = new Date(y, m - 1, d || 1)
  const range = timeRangeModel.value
  const fmt = (dt: Date, options: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(locale.value, options)
    .format(dt)

  if (range === "day") {
    const [ ay, am, ad ] = (anchorDateModel.value || "").split("-")
      .map(Number)
    const anchor = ay && am && ad
      ? new Date(ay, am - 1, ad)
      : date

    return fmt(anchor, {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
  }

  if (range === "week") {
    const {
      start, end,
    } = getWeekStartAndEnd(date)

    const options: Intl.DateTimeFormatOptions = {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }

    return `${fmt(start, options)} - ${fmt(end, options)}`
  }

  if (range === "month") {
    return fmt(date, {
      month: "long",
    })
  }

  return fmt(date, {
    month: "long",
    year: "numeric",
  })
}

const pieAnimation = computed(() => ({
  duration: 650,
  easing: "easeOutQuart" as const,
  animateRotate: true,
  animateScale: true,
}))

const filteredSpendings = computed(() => {
  const win = getDateWindow(timeRangeModel.value, anchorDateModel.value)

  if (!win) {
    return props.spendings
  }

  return props.spendings.filter((s) => s.date >= win.start && s.date < win.end)
})

// Area/Line Chart Data - Balance evolution over time
const areaChartData = computed(() => {
  const sortedSpendings = [...filteredSpendings.value].toSorted((a, b) => new Date(a.date)
    .getTime() - new Date(b.date)
    .getTime())
  const dateMap = new Map<string, {
    income: number; expense: number;
  }>()

  for (const spending of sortedSpendings) {
    const dateKey = spending.date.split("T")[0] ?? ""
    const existing = dateMap.get(dateKey) || {
      income: 0, expense: 0,
    }

    if (spending.is_spending) {
      existing.expense += spending.value
    } else {
      existing.income += spending.value
    }

    dateMap.set(dateKey, existing)
  }

  const labels = Array.from(dateMap.keys())
  let runningBalance = 0
  const balanceData: number[] = []
  const incomeData: number[] = []
  const expenseData: number[] = []

  for (const [ , values ] of dateMap) {
    runningBalance += values.income - values.expense
    balanceData.push(runningBalance)
    incomeData.push(values.income)
    expenseData.push(values.expense)
  }

  const datasets = [] as {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    fill: boolean;
    tension: number;
  }[]

  if (showIncome.value) {
    datasets.push({
      label: t("app.spending.income"),
      data: incomeData,
      borderColor: "#22c55e",
      backgroundColor: "rgba(34, 197, 94, 0.2)",
      fill: true,
      tension: 0.4,
    })
  }

  if (showExpense.value) {
    datasets.push({
      label: t("app.spending.expense"),
      data: expenseData,
      borderColor: "#ef4444",
      backgroundColor: "rgba(239, 68, 68, 0.2)",
      fill: true,
      tension: 0.4,
    })
  }

  if (showBalance.value) {
    datasets.push({
      label: t("app.charts.balance")
        .split(" ")[0] ?? "",
      data: balanceData,
      borderColor: "#3b82f6",
      backgroundColor: "rgba(59, 130, 246, 0.2)",
      fill: true,
      tension: 0.4,
    })
  }

  if (datasets.length === 0) {
    datasets.push({
      label: t("app.charts.balance"),
      data: balanceData,
      borderColor: "#3b82f6",
      backgroundColor: "rgba(59, 130, 246, 0.2)",
      fill: true,
      tension: 0.4,
    })
  }

  return {
    labels,
    datasets,
  }
})

const areaChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: effectiveShowLegend.value,
      labels: {
        color: textColor.value,
        usePointStyle: true,
      },
    },
    title: {
      display: effectiveShowTitle.value,
      text: t("app.charts.balance"),
      color: textColor.value,
      font: {
        size: 16, weight: 700,
      },
    },
  },
  elements: {
    point: {
      radius: effectiveShowPoints.value
        ? 3
        : 0,
      hoverRadius: effectiveShowPoints.value
        ? 4
        : 0,
      pointStyle: effectiveShowPoints.value
        ? "circle"
        : "false",
    },
  },
  scales: {
    x: {
      display: effectiveShowXAxis.value,
      ticks: {
        color: textColor.value,
        callback: (value: string | number, index: number) => {
          const label = areaChartData.value.labels?.[index] ?? value

          return formatAreaLabel(label)
        },
      },
      grid: {
        color: gridColor.value,
        display: effectiveShowGrid.value && effectiveShowXAxis.value,
      },
    },
    y: {
      display: effectiveShowYAxis.value,
      ticks: { color: textColor.value },
      grid: {
        color: gridColor.value,
        display: effectiveShowGrid.value && effectiveShowYAxis.value,
      },
    },
  },
}))

// Pie Chart Data - Category distribution for expenses
const expensesPieChartData = computed(() => {
  const categoryTotals = new Map<string, {
    total: number; color: string;
  }>()

  for (const spending of filteredSpendings.value) {
    if (spending.is_spending) {
      const existing = categoryTotals.get(spending.category_name) || {
        total: 0,
        color: spending.icon_color,
      }

      existing.total += spending.value
      categoryTotals.set(spending.category_name, existing)
    }
  }

  const labels = Array.from(categoryTotals.keys())
  const data = Array.from(categoryTotals.values())
    .map((v) => v.total)
  const backgroundColors = Array.from(categoryTotals.values())
    .map((v) => v.color)

  return {
    labels,
    datasets: [
      {
        data,
        backgroundColor: backgroundColors,
        borderWidth: 2,
        borderColor: isDark.value
          ? "rgba(0,0,0,0.5)"
          : "#ffffff",
      },
    ],
  }
})

// Pie Chart Data - Category distribution for income
const incomePieChartData = computed(() => {
  const categoryTotals = new Map<string, {
    total: number; color: string;
  }>()

  for (const spending of filteredSpendings.value) {
    if (!spending.is_spending) {
      const existing = categoryTotals.get(spending.category_name) || {
        total: 0,
        color: spending.icon_color,
      }

      existing.total += spending.value
      categoryTotals.set(spending.category_name, existing)
    }
  }

  const labels = Array.from(categoryTotals.keys())
  const data = Array.from(categoryTotals.values())
    .map((v) => v.total)
  const backgroundColors = Array.from(categoryTotals.values())
    .map((v) => v.color)

  return {
    labels,
    datasets: [
      {
        data,
        backgroundColor: backgroundColors,
        borderWidth: 2,
        borderColor: isDark.value
          ? "rgba(0,0,0,0.5)"
          : "#ffffff",
      },
    ],
  }
})

const expensesPieChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  animation: pieAnimation.value,
  plugins: {
    legend: {
      display: effectiveShowLegend.value,
      position: "bottom" as const,
      align: "start" as const,
      labels: {
        color: textColor.value,
        usePointStyle: true,
        boxWidth: 10,
        padding: 12,
        font: {
          size: smAndUp.value
            ? 12
            : 11,
        },
      },
    },
    title: {
      display: effectiveShowTitle.value,
      text: t("app.charts.expense-repartition"),
      color: textColor.value,
      font: {
        size: 16, weight: 700,
      },
    },
    tooltip: {
      callbacks: {
        label: (ctx: TooltipItem<"pie">) => {
          const label = ctx.label ?? ""
          const value = Number(ctx.raw ?? 0)
          const total = ctx.dataset.data.reduce((a, b) => a + Number(b), 0) || 1
          const pct = (value / total) * 100

          return `${label} : ${value.toFixed(2)} (${pct.toFixed(1)}%)`
        },
      },
    },
  },
  layout: {
    padding: {
      top: 6,
      bottom: 6,
    },
  },
}))

const incomePieChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  animation: pieAnimation.value,
  plugins: {
    legend: {
      display: effectiveShowLegend.value,
      position: "bottom" as const,
      align: "start" as const,
      labels: {
        color: textColor.value,
        usePointStyle: true,
        boxWidth: 10,
        padding: 12,
        font: {
          size: smAndUp.value
            ? 12
            : 11,
        },
      },
    },
    title: {
      display: effectiveShowTitle.value,
      text: t("app.charts.income-repartition"),
      color: textColor.value,
      font: {
        size: 16, weight: 700,
      },
    },
    tooltip: {
      callbacks: {
        label: (ctx: TooltipItem<"pie">) => {
          const label = ctx.label ?? ""
          const value = Number(ctx.raw ?? 0)
          const total = ctx.dataset.data.reduce((a, b) => a + Number(b), 0) || 1
          const pct = (value / total) * 100

          return `${label} : ${value.toFixed(2)} (${pct.toFixed(1)}%)`
        },
      },
    },
  },
  layout: {
    padding: {
      top: 6,
      bottom: 6,
    },
  },
}))

// Bar Chart Data - Income vs Expense comparison by month
const barChartData = computed(() => {
  const monthlyData = new Map<string, {
    income: number; expense: number;
  }>()

  for (const spending of filteredSpendings.value) {
    const date = new Date(spending.date)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1)
      .padStart(2, "0")}`
    const existing = monthlyData.get(monthKey) || {
      income: 0, expense: 0,
    }

    if (spending.is_spending) {
      existing.expense += spending.value
    } else {
      existing.income += spending.value
    }

    monthlyData.set(monthKey, existing)
  }

  const sortedKeys = Array.from(monthlyData.keys())
    .toSorted()
  const incomeData = sortedKeys.map((k) => monthlyData.get(k)?.income ?? 0)
  const expenseData = sortedKeys.map((k) => monthlyData.get(k)?.expense ?? 0)

  return {
    labels: sortedKeys,
    datasets: [
      {
        label: t("app.spending.income"),
        data: incomeData,
        backgroundColor: "rgba(34, 197, 94, 0.8)",
        borderColor: "#22c55e",
        borderWidth: 1,
        borderRadius: 4,
      },
      {
        label: t("app.spending.expense"),
        data: expenseData,
        backgroundColor: "rgba(239, 68, 68, 0.8)",
        borderColor: "#ef4444",
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  }
})

const barChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: effectiveShowLegend.value,
      labels: {
        color: textColor.value,
        usePointStyle: true,
      },
    },
    title: {
      display: effectiveShowTitle.value,
      text: t("app.charts.income-vs-expense"),
      color: textColor.value,
      font: {
        size: 16, weight: 700,
      },
    },
  },
  scales: {
    x: {
      display: effectiveShowXAxis.value,
      ticks: {
        color: textColor.value,
        callback: (value: string | number, index: number) => {
          const label = barChartData.value.labels?.[index] ?? value

          return formatBarLabel(label)
        },
      },
      grid: {
        color: gridColor.value,
        display: effectiveShowGrid.value && effectiveShowXAxis.value,
      },
    },
    y: {
      display: effectiveShowYAxis.value,
      ticks: { color: textColor.value },
      grid: {
        color: gridColor.value,
        display: effectiveShowGrid.value && effectiveShowYAxis.value,
      },
    },
  },
}))

// Doughnut Chart Data - Cashflow overview
const doughnutChartData = computed(() => {
  let income = 0
  let expense = 0

  for (const s of filteredSpendings.value) {
    if (s.is_spending) {
      expense += s.value
    } else {
      income += s.value
    }
  }

  const net = income - expense
  const isPositive = net >= 0

  const netAbs = Math.abs(net)

  // percent base: savings vs income, deficit vs expense
  const base = isPositive
    ? income
    : expense
  const shown = base > 0
    ? Math.min(netAbs, base)
    : 0
  const remainder = base > 0
    ? Math.max(base - shown, 0)
    : 0

  return {
    labels: [
      t("app.spending.income"),
      t("app.spending.expense"),
    ],
    datasets: [
      // OUTER ring : income vs expense
      {
        data: [ income, expense ],
        backgroundColor: [
          "rgba(34,197,94,0.85)",
          "rgba(239,68,68,0.85)",
        ],
        borderWidth: 2,
        borderColor: isDark.value
          ? "rgba(0,0,0,0.5)"
          : "#ffffff",
        weight: 2,
      },

      // INNER ring : savings/deficit percent wedge + transparent remainder
      {
        data: [ shown, remainder ],
        backgroundColor: [
          isPositive
            ? "rgba(59,130,246,0.85)"
            : "rgba(217,119,6,0.85)",
          "rgba(0,0,0,0)",
        ],
        borderWidth: 0,
        hoverOffset: 0,
        weight: 1,
      },
    ],
  }
})

const doughnutChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  cutout: "45%",
  animation: pieAnimation.value,
  plugins: {
    legend: {
      display: effectiveShowLegend.value,
      position: "bottom" as const,
      labels: {
        color: textColor.value,
        usePointStyle: true,
        generateLabels: (chart: ChartJS) => {
          const legendLabelColor = chart.options.plugins?.legend?.labels?.color as string
            ?? textColor.value
          const labels = Array.isArray(chart.data.labels)
            ? chart.data.labels
            : []
          const dataset = chart.data.datasets?.[0]
          const background = dataset?.backgroundColor
          const border = dataset?.borderColor
          const items = labels.map((label, index) => {
            const fill = Array.isArray(background)
              ? background[index] ?? background[0]
              : background
            const stroke = Array.isArray(border)
              ? border[index] ?? border[0]
              : border

            return {
              text: String(label ?? ""),
              fillStyle: fill ?? "#9ca3af",
              strokeStyle: stroke ?? fill ?? "#9ca3af",
              lineWidth: 0,
              fontColor: legendLabelColor,
              hidden: !chart.getDataVisibility(index),
              index,
            }
          })

          const innerDataset = chart.data.datasets?.[1]
          const innerColor = Array.isArray(innerDataset?.backgroundColor)
            ? innerDataset?.backgroundColor?.[0]
            : innerDataset?.backgroundColor

          if (innerColor) {
            const outerData = chart.data.datasets?.[0]?.data
            const income = Array.isArray(outerData)
              ? Number(outerData[0] ?? 0)
              : 0
            const expense = Array.isArray(outerData)
              ? Number(outerData[1] ?? 0)
              : 0
            const isPositive = income - expense >= 0
            const innerLabel = isPositive
              ? t("app.charts.savings")
              : t("app.charts.deficit")

            items.push({
              text: innerLabel,
              fillStyle: innerColor as string,
              strokeStyle: innerColor as string,
              lineWidth: 0,
              fontColor: legendLabelColor,
              hidden: false,
              index: items.length,
            })
          }

          return items
        },
      },
    },
    title: {
      display: effectiveShowTitle.value,
      text: t("app.charts.cashflow"),
      color: textColor.value,
      font: {
        size: 16, weight: 700,
      },
    },
    tooltip: {
      callbacks: {
        label: (ctx: TooltipItem<"doughnut">) => {
          const datasetIndex = ctx.datasetIndex
          const dataIndex = ctx.dataIndex

          if (datasetIndex === 0) {
            const label = ctx.label ?? ""
            const value = Number(ctx.raw ?? 0)

            return `${label}: ${value.toFixed(2)}`
          }

          if (datasetIndex === 1) {
            if (dataIndex === 1 || !ctx.chart.data.datasets[0]) {
              return ""
            }

            const [ income, expense ] = ctx.chart.data.datasets[0].data as number[]

            if (income === undefined || expense === undefined) {
              return ""
            }

            const net = income - expense
            const isPositive = net >= 0
            const base = isPositive
              ? income
              : expense
            const shown = Number(ctx.raw ?? 0)
            const pct = base > 0
              ? (shown / base) * 100
              : 0

            const label = isPositive
              ? t("app.charts.savings")
              : t("app.charts.deficit")

            const ofText = isPositive
              ? t("app.charts.of-singular")
              : t("app.charts.of-plural")

            const ofWhat = isPositive
              ? t("app.spending.income")
              : `${t("app.spending.expense")}s`

            return `${label} : ${pct.toFixed(1)}% ${ofText} ${ofWhat}`
          }

          return ""
        },
      },
    },
  },
}))

const getCurrentChartInstance = (): ChartComponentRef => {
  switch (activeTab.value) {
    case "area":
      return areaChartInstance.value as ChartComponentRef
    case "pie":
      return expensesPieChartInstance.value as ChartComponentRef
    case "bar":
      return barChartInstance.value as ChartComponentRef
    case "doughnut":
      return doughnutChartInstance.value as ChartComponentRef
    default:
      return null
  }
}

const getChartInstanceFromRef = (refValue: unknown): ChartJS | null => {
  const maybe = refValue as ChartInstanceRef

  return maybe?.chart ?? null
}

const getCurrentChartInstanceRef = (): ChartJS | null => {
  const refValue = getCurrentChartInstance() as ChartInstanceRef

  return refValue?.chart ?? null
}

const clonePreserveFunctions = <T>(value: T, seen = new WeakMap<object, unknown>()): T => {
  if (value === null || value === undefined) {
    return value
  }

  if (typeof value !== "object") {
    return value
  }

  if (value instanceof Date) {
    return new Date(value.getTime()) as T
  }

  if (value instanceof RegExp) {
    return new RegExp(value.source, value.flags) as T
  }

  if (seen.has(value)) {
    return seen.get(value) as T
  }

  if (Array.isArray(value)) {
    const arr: unknown[] = []

    seen.set(value, arr)

    for (const item of value) {
      arr.push(clonePreserveFunctions(item, seen))
    }

    return arr as T
  }

  const out: Record<string, unknown> = {}

  seen.set(value, out)

  for (const [ key, entry ] of Object.entries(value)) {
    out[key] = clonePreserveFunctions(entry, seen)
  }

  return out as T
}

const normalizeChartOptions = (options: ChartJS["options"]) => {
  const raw = toRaw(options) as ChartJS["options"]

  return clonePreserveFunctions(raw)
}

const scaleNumber = (value: unknown, scale: number) => (typeof value === "number"
  ? value * scale
  : value)

const scaleFont = (value: unknown, scale: number) => {
  if (!value || typeof value !== "object") {
    return value
  }

  const font = value as { size?: number }

  return {
    ...font,
    size: typeof font.size === "number"
      ? Math.round(font.size * scale)
      : font.size,
  }
}

const scalePadding = (value: unknown, scale: number) => {
  if (typeof value === "number") {
    return Math.round(value * scale)
  }

  if (!value || typeof value !== "object") {
    return value
  }

  const padding = value as Record<string, unknown>

  return Object.fromEntries(Object.entries(padding)
    .map(([ key, entry ]) => [ key, scaleNumber(entry, scale) ]))
}

const getLightExportOptions = (
  options: ChartJS["options"],
  scale: number,
  chartType: string | undefined,
) => {
  const baseOptions = normalizeChartOptions(options)
  const lightText = "rgba(0, 0, 0, 0.87)"
  const lightGrid = "rgba(0, 0, 0, 0.1)"
  const visualScale = Math.max(1, scale)
  const datasetOptions = baseOptions?.datasets as Record<string, Record<string, unknown>> | undefined
  const isNonCartesian = chartType === "pie" || chartType === "doughnut"
  const rawScales = !isNonCartesian && baseOptions?.scales && typeof baseOptions.scales === "object"
    ? Object.fromEntries(Object.entries(baseOptions.scales)
        .filter(([ , value ]) => value && typeof value === "object"))
    : undefined

  return {
    ...baseOptions,
    responsive: false,
    animation: false as const,
    maintainAspectRatio: false,
    devicePixelRatio: 1,
    elements: {
      ...baseOptions?.elements,
      line: {
        ...baseOptions?.elements?.line,
        segment: baseOptions?.elements?.line?.segment ?? {},
        borderWidth: scaleNumber(baseOptions?.elements?.line?.borderWidth, visualScale),
      },
      point: {
        ...baseOptions?.elements?.point,
        radius: scaleNumber(baseOptions?.elements?.point?.radius, visualScale),
        hoverRadius: scaleNumber(baseOptions?.elements?.point?.hoverRadius, visualScale),
      },
      bar: {
        ...baseOptions?.elements?.bar,
        borderWidth: scaleNumber(baseOptions?.elements?.bar?.borderWidth, visualScale),
      },
      arc: {
        ...baseOptions?.elements?.arc,
        borderWidth: scaleNumber(baseOptions?.elements?.arc?.borderWidth, visualScale),
      },
    },
    datasets: {
      ...baseOptions?.datasets,
      line: {
        ...datasetOptions?.line,
        segment: datasetOptions?.line?.segment ?? {},
      },
      bar: {
        ...datasetOptions?.bar,
      },
      doughnut: {
        ...datasetOptions?.doughnut,
      },
      pie: {
        ...datasetOptions?.pie,
      },
    },
    plugins: {
      ...baseOptions?.plugins,
      legend: {
        ...baseOptions?.plugins?.legend,
        labels: {
          ...baseOptions?.plugins?.legend?.labels,
          color: lightText,
          boxWidth: scaleNumber(baseOptions?.plugins?.legend?.labels?.boxWidth, visualScale),
          padding: scaleNumber(baseOptions?.plugins?.legend?.labels?.padding, visualScale),
          font: scaleFont(baseOptions?.plugins?.legend?.labels?.font, visualScale),
        },
      },
      title: {
        ...baseOptions?.plugins?.title,
        color: lightText,
        font: scaleFont(baseOptions?.plugins?.title?.font, visualScale),
        padding: scalePadding(baseOptions?.plugins?.title?.padding, visualScale),
      },
    },
    layout: {
      ...baseOptions?.layout,
      padding: scalePadding(baseOptions?.layout?.padding, visualScale),
    },
    scales: rawScales
      ? {
          ...rawScales,
          x: (rawScales as typeof options.scales)?.x
            ? {
                ...(rawScales as typeof options.scales)?.x,
                ticks: {
                  ...(rawScales as typeof options.scales)?.x?.ticks,
                  color: lightText,
                  font: scaleFont((rawScales as typeof options.scales)?.x?.ticks?.font, visualScale),
                },
                grid: {
                  ...(rawScales as typeof options.scales)?.x?.grid,
                  color: lightGrid,
                  lineWidth: scaleNumber((rawScales as typeof options.scales)?.x?.grid?.lineWidth, visualScale),
                },
              }
            : (rawScales as typeof options.scales)?.x,
          y: (rawScales as typeof options.scales)?.y
            ? {
                ...(rawScales as typeof options.scales)?.y,
                ticks: {
                  ...(rawScales as typeof options.scales)?.y?.ticks,
                  color: lightText,
                  font: scaleFont((rawScales as typeof options.scales)?.y?.ticks?.font, visualScale),
                },
                grid: {
                  ...(rawScales as typeof options.scales)?.y?.grid,
                  color: lightGrid,
                  lineWidth: scaleNumber((rawScales as typeof options.scales)?.y?.grid?.lineWidth, visualScale),
                },
              }
            : (rawScales as typeof options.scales)?.y,
        }
      : undefined,
  }
}

const clampExportScaleToMaxSize = (width: number, height: number, scale: number) => {
  const maxDimension = 12000
  const scaleX = maxDimension / Math.max(width, 1)
  const scaleY = maxDimension / Math.max(height, 1)
  const maxScale = Math.min(scaleX, scaleY)

  return Math.max(1, Math.floor(Math.min(scale, maxScale)))
}

const nextFrame = () => new Promise<void>((resolve) => {
  requestAnimationFrame(() => resolve())
})

const hasRenderablePieData = (chart: ChartJS | null) => {
  if (!chart) {
    return false
  }

  const datasets = chart.data?.datasets ?? []
  let total = 0

  for (const dataset of datasets) {
    const values = Array.isArray(dataset.data)
      ? dataset.data
      : []

    for (const value of values) {
      const num = Number(value)

      if (Number.isFinite(num)) {
        total += num
      }
    }
  }

  return total > 0
}

const normalizePieDataForExport = (data: unknown) => {
  if (!data || typeof data !== "object") {
    return
  }

  const typed = data as {
    labels?: unknown[];
    datasets?: Array<Record<string, unknown>>;
  }

  if (!Array.isArray(typed.datasets) || typed.datasets.length === 0) {
    return
  }

  let total = 0

  for (const dataset of typed.datasets) {
    const values = Array.isArray(dataset.data)
      ? dataset.data
      : []

    const normalized = values.map((value) => {
      const num = Number(value)

      if (Number.isFinite(num)) {
        total += num

        return num
      }

      return 0
    })

    dataset.data = normalized
  }

  if (total > 0) {
    return
  }

  const first = typed.datasets[0]

  if (first) {
    first.data = [1]
    first.backgroundColor = ["#e5e7eb"]
    first.borderColor = "#ffffff"
    first.borderWidth = 1
  }

  typed.labels = [t("app.charts.no-data")]
}

const isValidPngDataUrl = (url: string) => url.startsWith("data:image/png")

const getPngDataUrlFromCanvas = (canvas: HTMLCanvasElement) => {
  try {
    const url = canvas.toDataURL("image/png")

    return isValidPngDataUrl(url)
      ? url
      : ""
  } catch {
    return ""
  }
}

const downloadDataUrl = (dataUrl: string, filename: string) => {
  const link = document.createElement("a")

  link.href = dataUrl
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
}

const renderChartToSvg = async (chart: ChartJS, scale: number): Promise<{
  svg: string; width: number; height: number; cleanup: () => void;
} | null> => {
  const rect = chart.canvas?.getBoundingClientRect?.()
  const width = chart.width || chart.canvas?.width || rect?.width || 0
  const height = chart.height || chart.canvas?.height || rect?.height || 0

  if (!width || !height) {
    return null
  }

  const svgWidth = Math.round(width * scale)
  const svgHeight = Math.round(height * scale)

  const { default: C2S } = (await import("canvas-to-svg")) as { "default": C2SCtor }
  const ctx = new C2S(svgWidth, svgHeight)
  const fakeCanvas = document.createElement("canvas") as HTMLCanvasElement & {
    getContext: (...args: unknown[]) => CanvasRenderingContext2D;
  }

  fakeCanvas.width = svgWidth
  fakeCanvas.height = svgHeight
  // override getContext for svg context rendering
  ;(fakeCanvas as unknown as { getContext: (...args: unknown[]) => CanvasRenderingContext2D }).getContext = () => ctx
  ;(ctx as unknown as { canvas: HTMLCanvasElement }).canvas = fakeCanvas

  if (!("setTransform" in ctx)) {
    (ctx as unknown as { setTransform?: (...args: number[]) => void }).setTransform = (
      a = 1,
      b = 0,
      c = 0,
      d = 1,
      e = 0,
      f = 0,
    ) => {
      if (typeof (ctx as CanvasRenderingContext2D).transform === "function") {
        (ctx as CanvasRenderingContext2D).transform(a, b, c, d, e, f)
      }
    }
  }

  if (!("resetTransform" in ctx)) {
    (ctx as unknown as { resetTransform?: () => void }).resetTransform = () => {
      if (typeof (ctx as CanvasRenderingContext2D).setTransform === "function") {
        (ctx as CanvasRenderingContext2D).setTransform(1, 0, 0, 1, 0, 0)
      }
    }
  }

  const chartType = (chart.config as { type?: unknown }).type as string | undefined
  const data = clonePreserveFunctions(toRaw(chart.config.data))

  if (chartType === "pie") {
    normalizePieDataForExport(data)
  }

  if (chartType === "line" && Array.isArray((data as unknown as { datasets?: unknown[] }).datasets)) {
    const datasets = (data as unknown as { datasets: Array<Record<string, unknown>> }).datasets

    ;(data as unknown as { datasets: Array<Record<string, unknown>> }).datasets = datasets.map((dataset) => Object.assign({}, dataset, {
      segment: dataset.segment ?? {},
    }))
  }

  const options = getLightExportOptions(chart.options, scale, chartType) as ChartJS["options"]

  const originalPath2D = (window as unknown as { Path2D?: unknown }).Path2D

  ;(window as unknown as { Path2D?: unknown }).Path2D = undefined

  const exportChart = new ChartJS(fakeCanvas, {
    type: chartType as never,
    data,
    options: options as never,
  } as never)

  exportChart.resize(svgWidth, svgHeight)
  exportChart.update("none")
  exportChart.draw()
  await nextFrame()

  const svg = (ctx as unknown as { getSerializedSvg: () => string }).getSerializedSvg()

  return {
    svg,
    width: svgWidth,
    height: svgHeight,
    cleanup: () => {
      exportChart.destroy()
      ;(window as unknown as { Path2D?: unknown }).Path2D = originalPath2D
    },
  }
}

const injectSvgPosition = (svg: string, x: number, y: number) => svg
  .replace("<svg", `<svg x="${x}" y="${y}"`)

const buildExportSvg = async (svgScale = 1) => {
  const chart = getCurrentChartInstanceRef()

  if (activeTab.value === "pie") {
    const expenseChart = getChartInstanceFromRef(expensesPieChartInstance.value)
    const incomeChart = getChartInstanceFromRef(incomePieChartInstance.value)
    const charts = [ expenseChart, incomeChart ]
      .filter((item): item is ChartJS => Boolean(item))
      .filter((item) => hasRenderablePieData(item))

    if (charts.length === 0) {
      return null
    }

    const rendered = (await Promise.all(charts.map((c) => renderChartToSvg(c, svgScale))))
      .filter((item): item is {
        svg: string; width: number; height: number; cleanup: () => void;
      } => Boolean(item))

    if (rendered.length === 0) {
      return null
    }

    if (rendered.length === 1) {
      const single = rendered[0]

      if (!single) {
        return null
      }

      const svgData = single.svg

      single.cleanup()

      return {
        svg: svgData,
        width: single.width,
        height: single.height,
      }
    }

    const [ left, right ] = rendered

    if (!left || !right) {
      return null
    }

    const isStacked = !smAndUp.value
    const gap = 12 * svgScale
    const width = isStacked
      ? Math.max(left.width, right.width)
      : (left.width + right.width + gap)
    const height = isStacked
      ? (left.height + right.height + gap)
      : Math.max(left.height, right.height)

    const leftSvg = injectSvgPosition(left.svg, 0, 0)
    const rightSvg = isStacked
      ? injectSvgPosition(right.svg, 0, left.height + gap)
      : injectSvgPosition(right.svg, left.width + gap, 0)

    const svgData = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
  <rect width="100%" height="100%" fill="#ffffff" />
  ${leftSvg}
  ${rightSvg}
</svg>`

    left.cleanup()
    right.cleanup()

    return {
      svg: svgData,
      width,
      height,
    }
  }

  if (!chart) {
    return null
  }

  const rendered = await renderChartToSvg(chart, svgScale)

  if (!rendered) {
    return null
  }

  const svgData = rendered.svg
  const width = rendered.width
  const height = rendered.height

  rendered.cleanup()

  return {
    svg: svgData,
    width,
    height,
  }
}

const svgToPngDataUrl = async (svg: string, width: number, height: number, scale: number) => {
  const finalScale = clampExportScaleToMaxSize(width, height, scale)
  const canvas = document.createElement("canvas")

  canvas.width = Math.round(width * finalScale)
  canvas.height = Math.round(height * finalScale)

  const ctx = canvas.getContext("2d")

  if (!ctx) {
    return ""
  }

  ctx.fillStyle = "#ffffff"
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  const svgBlob = new Blob([svg], { type: "image/svg+xml" })
  const url = URL.createObjectURL(svgBlob)
  const img = new Image()

  img.decoding = "async"

  const loaded = new Promise<void>((resolve, reject) => {
    const onLoad = () => {
      cleanup()
      resolve()
    }

    const onError = () => {
      cleanup()
      reject(new Error("Failed to load SVG"))
    }

    const cleanup = () => {
      img.removeEventListener("load", onLoad)
      img.removeEventListener("error", onError)
    }

    img.addEventListener("load", onLoad, { once: true })
    img.addEventListener("error", onError, { once: true })
  })

  img.src = url

  try {
    await loaded

    if (typeof img.decode === "function") {
      await img.decode()
    }
  } finally {
    URL.revokeObjectURL(url)
  }

  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

  return getPngDataUrlFromCanvas(canvas)
}

const exportPNG = async () => {
  if (isExporting.value) {
    return
  }

  isExporting.value = true
  await nextFrame()
  await new Promise((resolve) => setTimeout(resolve, 0))
  const svgResult = await buildExportSvg(1)

  if (!svgResult) {
    isExporting.value = false

    return
  }

  const filename = `chart-${activeTab.value}-${anchorDateModel.value}-${timeRangeModel.value}.png`
  const dataUrl = await svgToPngDataUrl(svgResult.svg, svgResult.width, svgResult.height, 6)

  if (!dataUrl) {
    isExporting.value = false

    return
  }

  downloadDataUrl(dataUrl, filename)

  isExporting.value = false
}

const exportSVG = async () => {
  if (isExporting.value) {
    return
  }

  isExporting.value = true
  await nextFrame()
  await new Promise((resolve) => setTimeout(resolve, 0))
  const svgResult = await buildExportSvg(1)

  if (!svgResult) {
    isExporting.value = false

    return
  }

  const svgData = svgResult.svg
  const blob = new Blob([svgData], { type: "image/svg+xml" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")

  link.download = `chart-${activeTab.value}-${anchorDateModel.value}-${timeRangeModel.value}.svg`
  link.href = url
  link.click()
  URL.revokeObjectURL(url)
  isExporting.value = false
}

const exportPDF = async () => {
  if (isExporting.value) {
    return
  }

  isExporting.value = true
  await nextFrame()
  await new Promise((resolve) => setTimeout(resolve, 0))
  const svgResult = await buildExportSvg(1)

  if (!svgResult) {
    isExporting.value = false

    return
  }

  const imgData = await svgToPngDataUrl(svgResult.svg, svgResult.width, svgResult.height, 6)

  if (!imgData) {
    isExporting.value = false

    return
  }

  const { jsPDF } = await import("jspdf")
  const pdf = new jsPDF({
    orientation: svgResult.width > svgResult.height
      ? "landscape"
      : "portrait",
    unit: "px",
    format: [ Math.round(svgResult.width * 6), Math.round(svgResult.height * 6) ],
  })

  pdf.addImage(imgData, "PNG", 0, 0, Math.round(svgResult.width * 6), Math.round(svgResult.height * 6))
  pdf.save(`chart-${activeTab.value}-${anchorDateModel.value}-${timeRangeModel.value}.pdf`)
  isExporting.value = false
}
</script>

<style lang="scss" scoped>
.chart-container {
  height: 400px;
  position: relative;
}

.pie-chart {
  height: 420px;
}

.pie-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.pie-grid--stack {
  grid-template-columns: 1fr;
}

@media (max-width: 600px) {
  .chart-container {
    height: 280px;
  }

  .pie-chart {
    height: 360px;
  }
}

.glass-tabs {
  background: rgba(var(--v-theme-surface), 0.3);
  border: 1px solid rgba(var(--v-theme-on-surface), 0.05);
}

.charts-header-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.charts-header-actions--mobile {
  width: 100%;
}

.chart-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.chart-actions--inline {
  flex-direction: row;
}

.chart-icon-btn {
  width: 36px;
  height: 36px;
}

.glass-list-item {
  background: rgba(var(--v-theme-surface), 0.3) !important;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(var(--v-theme-surface), 0.5) !important;
  }
}
</style>
