<template>
  <v-card class="mb-4 pa-1">
    <v-card-title class="d-flex align-center justify-space-between flex-wrap gap-2">
      <div class="d-flex align-center">
        <v-icon
          icon="mdi-chart-box-multiple-outline"
          class="mr-2"
        />
        {{ $t("app.charts.title") }}
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

        <v-menu v-if="spendings.length > 0">
          <template #activator="{ props: menuProps }">
            <v-btn
              v-bind="menuProps"
              color="info"
              prepend-icon="mdi-download-outline"
            >
              {{ $t("app.charts.export") }}
            </v-btn>
          </template>
          <v-list>
            <v-list-item @click="exportSVG">
              <template #prepend>
                <v-icon icon="mdi-svg" />
              </template>
              <v-list-item-title>{{ $t("app.charts.export-svg") }}</v-list-item-title>
            </v-list-item>
            <v-list-item @click="exportPNG">
              <template #prepend>
                <v-icon icon="mdi-file-image-outline" />
              </template>
              <v-list-item-title>{{ $t("app.charts.export-png") }}</v-list-item-title>
            </v-list-item>
            <v-list-item @click="exportPDF">
              <template #prepend>
                <v-icon icon="mdi-file-pdf-box" />
              </template>
              <v-list-item-title>{{ $t("app.charts.export-pdf") }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>
    </v-card-title>
    <v-card-text
      v-if="spendings.length === 0"
      class="pt-4"
    >
      <v-alert
        type="info"
        variant="tonal"
      >
        {{ $t("app.charts.no-data") }}
      </v-alert>
    </v-card-text>
    <v-card-text
      v-else
      class="pt-4"
    >
      <v-tabs
        v-model="activeTab"
        color="secondary"
        show-arrows
        align-tabs="center"
      >
        <v-tab value="area">
          <v-icon
            icon="mdi-chart-areaspline-variant"
            class="mr-2"
          />
          {{ $t("app.charts.area") }}
        </v-tab>
        <v-tab value="pie">
          <v-icon
            icon="mdi-chart-pie-outline"
            class="mr-2"
          />
          {{ $t("app.charts.pie") }}
        </v-tab>
        <v-tab value="bar">
          <v-icon
            icon="mdi-chart-bar"
            class="mr-2"
          />
          {{ $t("app.charts.bar") }}
        </v-tab>
        <v-tab value="doughnut">
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
            class="chart-container mt-4"
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
            class="chart-container mt-4"
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
            class="chart-container mt-4"
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
            class="chart-container mt-4"
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
import type { Spending } from "~/types"

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

ChartJS.defaults.font.family = '"Inter", sans-serif'
ChartJS.defaults.font.size = 16

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
const timeRangeModel = computed({
  get: () => props.timeRange,
  set: (v: string) => emit("update:time-range", v),
})
const anchorDateModel = computed({
  get: () => props.anchorDate,
  set: (v: string) => emit("update:anchor-date", v),
})

const areaChartInstance = ref<InstanceType<typeof Line> | null>(null)
const pieChartInstance = ref<InstanceType<typeof Pie> | null>(null)
const barChartInstance = ref<InstanceType<typeof Bar> | null>(null)
const doughnutChartInstance = ref<InstanceType<typeof Doughnut> | null>(null)

const isDark = computed(() => store.getTheme === "dark")
const textColor = computed(() => (isDark.value
  ? "#f0fdf4"
  : "#022c22"))
const gridColor = computed(() => (isDark.value
  ? "rgba(240, 253, 244, 0.1)"
  : "rgba(2, 44, 34, 0.1)"))

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

  return {
    labels,
    datasets: [
      {
        label: t("app.charts.balance"),
        data: balanceData,
        borderColor: isDark.value
          ? "#3b82f6"
          : "#2563eb",
        backgroundColor: isDark.value
          ? "rgba(59, 130, 246, 0.2)"
          : "rgba(37, 99, 235, 0.2)",
        fill: true,
        tension: 0.4,
      },
      {
        label: t("app.spending.income"),
        data: incomeData,
        borderColor: isDark.value
          ? "#22c55e"
          : "#16a34a",
        backgroundColor: isDark.value
          ? "rgba(34, 197, 94, 0.2)"
          : "rgba(22, 163, 74, 0.2)",
        fill: true,
        tension: 0.4,
      },
      {
        label: t("app.spending.expense"),
        data: expenseData,
        borderColor: isDark.value
          ? "#ef4444"
          : "#dc2626",
        backgroundColor: isDark.value
          ? "rgba(239, 68, 68, 0.2)"
          : "rgba(220, 38, 38, 0.2)",
        fill: true,
        tension: 0.4,
      },
    ],
  }
})

const areaChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: textColor.value,
      },
    },
    title: {
      display: true,
      text: t("app.charts.balance"),
      color: textColor.value,
    },
  },
  scales: {
    x: {
      ticks: { color: textColor.value },
      grid: { color: gridColor.value },
    },
    y: {
      ticks: { color: textColor.value },
      grid: { color: gridColor.value },
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
          ? "#051e11"
          : "#f0fdf4",
      },
    ],
  }
})

const pieChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "right" as const,
      labels: {
        color: textColor.value,
      },
    },
    title: {
      display: true,
      text: t("app.charts.pie"),
      color: textColor.value,
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
        backgroundColor: isDark.value
          ? "rgba(34, 197, 94, 0.8)"
          : "rgba(22, 163, 74, 0.8)",
        borderColor: isDark.value
          ? "#22c55e"
          : "#16a34a",
        borderWidth: 1,
      },
      {
        label: t("app.spending.expense"),
        data: expenseData,
        backgroundColor: isDark.value
          ? "rgba(239, 68, 68, 0.8)"
          : "rgba(220, 38, 38, 0.8)",
        borderColor: isDark.value
          ? "#ef4444"
          : "#dc2626",
        borderWidth: 1,
      },
    ],
  }
})

const barChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: textColor.value,
      },
    },
    title: {
      display: true,
      text: t("app.charts.income-vs-expense"),
      color: textColor.value,
    },
  },
  scales: {
    x: {
      ticks: { color: textColor.value },
      grid: { color: gridColor.value },
    },
    y: {
      ticks: { color: textColor.value },
      grid: { color: gridColor.value },
    },
  },
}))

// Doughnut Chart Data - Cashflow overview
const doughnutChartData = computed(() => {
  let income = 0
  let expense = 0

  for (const s of filteredSpendings.value) {
    if (s.is_spending) {expense += s.value}
    else {income += s.value}
  }

  const net = income - expense
  const isPositive = net >= 0

  const netAbs = Math.abs(net)

  // percent base: savings vs income, deficit vs expense
  const base = isPositive ? income : expense
  const shown = base > 0 ? Math.min(netAbs, base) : 0
  const remainder = base > 0 ? Math.max(base - shown, 0) : 0

  return {
    // Labels are mainly for the OUTER ring (legend uses dataset 0 by default)
    labels: [
      t("app.spending.income"),
      t("app.spending.expense"),
    ],
    datasets: [
      // OUTER ring: income vs expense
      {
        data: [income, expense],
        backgroundColor: [
          isDark.value ? "rgba(34,197,94,0.85)" : "rgba(22,163,74,0.85)",
          isDark.value ? "rgba(239,68,68,0.85)" : "rgba(220,38,38,0.85)",
        ],
        borderWidth: 2,
        borderColor: isDark.value ? "#051e11" : "#f0fdf4",
        weight: 2, // thicker outer ring
      },

      // INNER ring: savings/deficit percent wedge + transparent remainder
      {
        data: [shown, remainder],
        backgroundColor: [
          isPositive
            ? (isDark.value ? "rgba(59,130,246,0.85)" : "rgba(37,99,235,0.85)") // savings color
            : (isDark.value ? "rgba(245,158,11,0.85)" : "rgba(217,119,6,0.85)"), // deficit color
          "rgba(0,0,0,0)", // transparent remainder
        ],
        borderWidth: 0,
        hoverOffset: 0,
        weight: 1, // thinner inner ring
      },
    ],
  }
})

const doughnutChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  cutout: "45%",
  plugins: {
    legend: {
      position: "right" as const,
      labels: { color: textColor.value },
    },
    title: {
      display: true,
      text: t("app.charts.cashflow"),
      color: textColor.value,
    },
    tooltip: {
      callbacks: {
        label: (ctx: TooltipItem<"doughnut">) => {
          const datasetIndex = ctx.datasetIndex
          const dataIndex = ctx.dataIndex

          // Outer ring (income/expense)
          if (datasetIndex === 0) {
            const label = ctx.label ?? ""
            const value = Number(ctx.raw ?? 0)
            return `${label}: ${value.toFixed(2)}`
          }

          // Inner ring: only show tooltip for the first slice (shown)
          if (datasetIndex === 1) {
            if (dataIndex === 1 || !ctx.chart.data.datasets[0]) {return ""} // ignore transparent remainder

            const [income, expense] = ctx.chart.data.datasets[0].data as number[]
            if (income === undefined || expense === undefined) {
              return ""
            }
            const net = income - expense
            const isPositive = net >= 0
            const base = isPositive ? income : expense
            const shown = Number(ctx.raw ?? 0)
            const pct = base > 0 ? (shown / base) * 100 : 0

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
</style>
