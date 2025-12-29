<template>
  <v-card>
    <v-card-title class="d-flex align-center justify-space-between">
      <div class="d-flex align-center">
        <v-icon
          icon="mdi-chart-areaspline"
          class="mr-2"
        />
        {{ $t("app.charts.title") }}
      </div>
      <v-menu v-if="spendings.length > 0">
        <template #activator="{ props: menuProps }">
          <v-btn
            v-bind="menuProps"
            color="info"
            prepend-icon="mdi-download"
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
              <v-icon icon="mdi-file-image" />
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
    </v-card-title>
    <v-card-text v-if="spendings.length === 0">
      <v-alert
        type="info"
        variant="tonal"
      >
        {{ $t("app.charts.no-data") }}
      </v-alert>
    </v-card-text>
    <v-card-text v-else>
      <v-tabs
        v-model="activeTab"
        color="primary"
        align-tabs="center"
      >
        <v-tab value="area">
          <v-icon
            icon="mdi-chart-line"
            class="mr-2"
          />
          {{ $t("app.charts.area") }}
        </v-tab>
        <v-tab value="pie">
          <v-icon
            icon="mdi-chart-pie"
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

const props = defineProps<{
  spendings: Spending[];
  timeRange: string;
}>()

const { t } = useI18n()
const store = useMainStore()
const activeTab = ref("area")

const areaChartInstance = ref<InstanceType<typeof Line> | null>(null)
const pieChartInstance = ref<InstanceType<typeof Pie> | null>(null)
const barChartInstance = ref<InstanceType<typeof Bar> | null>(null)
const doughnutChartInstance = ref<InstanceType<typeof Doughnut> | null>(null)

const isDark = computed(() => store.getTheme === "dark")
const textColor = computed(() => (isDark.value
  ? "#F8F8F2"
  : "#070B1A"))
const gridColor = computed(() => (isDark.value
  ? "rgba(248, 248, 242, 0.1)"
  : "rgba(7, 11, 26, 0.1)"))

const filteredSpendings = computed(() => {
  const now = new Date()
  let startDate: Date

  switch (props.timeRange) {
    case "day":
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())

      break
    case "week":
      startDate = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000))

      break
    case "month":
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)

      break
    case "year":
      startDate = new Date(now.getFullYear(), 0, 1)

      break
    default:
      return props.spendings
  }

  return props.spendings.filter((s) => new Date(s.date) >= startDate)
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
        borderColor: "#53B9C8",
        backgroundColor: "rgba(83, 185, 200, 0.2)",
        fill: true,
        tension: 0.4,
      },
      {
        label: t("app.spending.income"),
        data: incomeData,
        borderColor: "#50FA7B",
        backgroundColor: "rgba(80, 250, 123, 0.2)",
        fill: true,
        tension: 0.4,
      },
      {
        label: t("app.spending.expense"),
        data: expenseData,
        borderColor: "#EE3124",
        backgroundColor: "rgba(238, 49, 36, 0.2)",
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
          ? "#020613"
          : "#DFDFD2",
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
        backgroundColor: "rgba(80, 250, 123, 0.8)",
        borderColor: "#50FA7B",
        borderWidth: 1,
      },
      {
        label: t("app.spending.expense"),
        data: expenseData,
        backgroundColor: "rgba(238, 49, 36, 0.8)",
        borderColor: "#EE3124",
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

// Doughnut Chart Data - Top spending categories
const doughnutChartData = computed(() => {
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

  const sorted = Array.from(categoryTotals.entries())
    .toSorted((a, b) => b[1].total - a[1].total)
    .slice(0, 5)
  const labels = sorted.map(([name]) => name)
  const data = sorted.map(([ , value ]) => value.total)
  const backgroundColors = sorted.map(([ , value ]) => value.color)

  return {
    labels,
    datasets: [
      {
        data,
        backgroundColor: backgroundColors,
        borderWidth: 2,
        borderColor: isDark.value
          ? "#020613"
          : "#DFDFD2",
      },
    ],
  }
})

const doughnutChartOptions = computed(() => ({
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
      text: t("app.charts.top-categories"),
      color: textColor.value,
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

  link.download = `chart-${activeTab.value}-${new Date()
    .toISOString()
    .split("T")[0]}.png`
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

  link.download = `chart-${activeTab.value}-${new Date()
    .toISOString()
    .split("T")[0]}.svg`
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
  pdf.save(`chart-${activeTab.value}-${new Date()
    .toISOString()
    .split("T")[0]}.pdf`)
}
</script>

<style scoped>
.chart-container {
  height: 400px;
  position: relative;
}
</style>
