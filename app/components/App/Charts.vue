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
        <div :class="['chart-actions', !smAndUp ? 'chart-actions--inline' : '']">
          <v-btn
            :color="simplifiedMode ? 'primary' : 'info'"
            variant="tonal"
            prepend-icon="mdi-auto-fix"
            @click="toggleSimplified"
          >
            {{ $t("app.charts.simplified") }} {{ simplifiedMode ? '✅' : '❌' }}
          </v-btn>

          <v-menu
            content-class="glass-menu-content"
          >
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
              <v-list-item>
                <v-list-item-title>{{ $t("app.charts.show-title") }}</v-list-item-title>
                <template #append>
                  <v-switch
                    v-model="showTitle"
                    density="compact"
                    color="primary"
                    hide-details
                    inset
                    :disabled="simplifiedMode"
                  />
                </template>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>{{ $t("app.charts.show-legend") }}</v-list-item-title>
                <template #append>
                  <v-switch
                    v-model="showLegend"
                    density="compact"
                    color="primary"
                    hide-details
                    inset
                    :disabled="simplifiedMode"
                  />
                </template>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>{{ $t("app.charts.show-axes") }}</v-list-item-title>
                <template #append>
                  <v-switch
                    v-model="showAxes"
                    density="compact"
                    color="primary"
                    hide-details
                    inset
                    :disabled="simplifiedMode"
                  />
                </template>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>{{ $t("app.charts.show-grid") }}</v-list-item-title>
                <template #append>
                  <v-switch
                    v-model="showGrid"
                    density="compact"
                    color="primary"
                    hide-details
                    inset
                    :disabled="simplifiedMode"
                  />
                </template>
              </v-list-item>
              <v-divider
                v-if="activeTab === 'area'"
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
            </v-list>
          </v-menu>

          <v-menu
            v-if="spendings.length > 0"
            content-class="glass-menu-content"
          >
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
                @click="exportSVG"
              >
                <template #prepend>
                  <v-icon
                    icon="mdi-svg"
                    color="secondary"
                  />
                </template>
                <v-list-item-title>{{ $t("app.charts.export-svg") }}</v-list-item-title>
              </v-list-item>
              <v-list-item
                class="glass-list-item mb-1 rounded-lg ma-1"
                @click="exportPNG"
              >
                <template #prepend>
                  <v-icon
                    icon="mdi-file-image-outline"
                    color="secondary"
                  />
                </template>
                <v-list-item-title>{{ $t("app.charts.export-png") }}</v-list-item-title>
              </v-list-item>
              <v-list-item
                class="glass-list-item rounded-lg ma-1"
                @click="exportPDF"
              >
                <template #prepend>
                  <v-icon
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
          <div
            ref="pieChartRef"
            :class="['chart-container', 'mt-4', 'glass-panel', smAndUp ? 'pa-4' : 'pa-3', 'rounded-xl', 'border-thin', 'bg-transparent']"
          >
            <Pie
              ref="pieChartInstance"
              :data="pieChartData"
              :options="pieChartOptions"
            />
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

const { t } = useI18n()
const store = useMainStore()
const { smAndUp } = useVDisplay()
const activeTab = ref("area")
const simplifiedMode = ref(!smAndUp.value)
const showTitle = ref(true)
const showLegend = ref(true)
const showAxes = ref(true)
const showGrid = ref(true)
const showBalance = ref(true)
const showIncome = ref(true)
const showExpense = ref(true)
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
const pieChartInstance = ref<InstanceType<typeof Pie> | null>(null)
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
const effectiveShowAxes = computed(() => (simplifiedMode.value
  ? false
  : showAxes.value))
const effectiveShowGrid = computed(() => (simplifiedMode.value
  ? false
  : showGrid.value))

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

  if (showBalance.value) {
    datasets.push({
      label: t("app.charts.balance"),
      data: balanceData,
      borderColor: "#3b82f6",
      backgroundColor: "rgba(59, 130, 246, 0.2)",
      fill: true,
      tension: 0.4,
    })
  }

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
  scales: {
    x: {
      display: effectiveShowAxes.value,
      ticks: { color: textColor.value },
      grid: {
        color: gridColor.value,
        display: effectiveShowGrid.value,
      },
    },
    y: {
      display: effectiveShowAxes.value,
      ticks: { color: textColor.value },
      grid: {
        color: gridColor.value,
        display: effectiveShowGrid.value,
      },
    },
  },
}))

// Pie Chart Data - Category distribution for expenses
const pieChartData = computed(() => {
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

const pieChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  animation: pieAnimation.value,
  plugins: {
    legend: {
      display: effectiveShowLegend.value,
      position: smAndUp.value
        ? ("right" as const)
        : ("bottom" as const),
      labels: {
        color: textColor.value,
        usePointStyle: true,
      },
    },
    title: {
      display: effectiveShowTitle.value,
      text: t("app.charts.pie"),
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
          const total = (ctx.dataset.data as number[]).reduce((a, b) => a + Number(b), 0) || 1
          const pct = (value / total) * 100

          return `${label} : ${value.toFixed(2)} (${pct.toFixed(1)}%)`
        },
      },
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
      display: effectiveShowAxes.value,
      ticks: { color: textColor.value },
      grid: {
        color: gridColor.value,
        display: effectiveShowGrid.value,
      },
    },
    y: {
      display: effectiveShowAxes.value,
      ticks: { color: textColor.value },
      grid: {
        color: gridColor.value,
        display: effectiveShowGrid.value,
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
      // OUTER ring: income vs expense
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

      // INNER ring: savings/deficit percent wedge + transparent remainder
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
      position: smAndUp.value
        ? ("right" as const)
        : ("bottom" as const),
      labels: {
        color: textColor.value,
        usePointStyle: true,
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
      return pieChartInstance.value as ChartComponentRef
    case "bar":
      return barChartInstance.value as ChartComponentRef
    case "doughnut":
      return doughnutChartInstance.value as ChartComponentRef
    default:
      return null
  }
}

const getChartCanvas = (): HTMLCanvasElement | null => {
  const chartInstance = getCurrentChartInstance()

  return chartInstance?.chart?.canvas ?? null
}

const exportPNG = () => {
  const canvas = getChartCanvas()

  if (!canvas) {
    return
  }

  const link = document.createElement("a")

  link.download = `chart-${activeTab.value}-${anchorDateModel.value}.png`
  link.href = canvas.toDataURL("image/png")
  link.click()
}

const exportSVG = () => {
  const canvas = getChartCanvas()

  if (!canvas) {
    return
  }

  const svgNS = "http://www.w3.org/2000/svg"
  const svg = document.createElementNS(svgNS, "svg")

  svg.setAttribute("width", canvas.width.toString())
  svg.setAttribute("height", canvas.height.toString())
  svg.setAttribute("xmlns", svgNS)

  const image = document.createElementNS(svgNS, "image")

  image.setAttribute("width", canvas.width.toString())
  image.setAttribute("height", canvas.height.toString())
  image.setAttribute("href", canvas.toDataURL("image/png"))
  svg.appendChild(image)

  const svgData = new XMLSerializer()
    .serializeToString(svg)
  const blob = new Blob([svgData], { type: "image/svg+xml" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")

  link.download = `chart-${activeTab.value}-${anchorDateModel.value}.svg`
  link.href = url
  link.click()
  URL.revokeObjectURL(url)
}

const exportPDF = async () => {
  const canvas = getChartCanvas()

  if (!canvas) {
    return
  }

  const { jsPDF } = await import("jspdf")
  const imgData = canvas.toDataURL("image/png")
  const pdf = new jsPDF({
    orientation: canvas.width > canvas.height
      ? "landscape"
      : "portrait",
    unit: "px",
    format: [ canvas.width, canvas.height ],
  })

  pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height)
  pdf.save(`chart-${activeTab.value}-${anchorDateModel.value}.pdf`)
}
</script>

<style lang="scss" scoped>
.chart-container {
  height: 400px;
  position: relative;
}

@media (max-width: 600px) {
  .chart-container {
    height: 280px;
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
