<template>
  <v-menu
    v-model="menu"
    :close-on-content-click="false"
    location="bottom"
    content-class="glass-menu-content"
  >
    <template #activator="{ props: btnProps }">
      <v-tooltip
        v-if="tooltipText"
        :text="tooltipText"
        location="bottom"
      >
        <template #activator="{ props: ttProps }">
          <v-btn
            v-bind="{ ...btnProps, ...ttProps }"
            icon="mdi-calendar-range-outline"
            variant="outlined"
            :color="color"
            class="rounded-e-0 glow-icon"
            :disabled="timeRangeModel === 'all'"
          />
        </template>
      </v-tooltip>

      <v-btn
        v-else
        v-bind="btnProps"
        icon="mdi-calendar-range-outline"
        variant="outlined"
        :color="color"
        class="rounded-e-0 glow-icon"
        :disabled="timeRangeModel === 'all'"
      />
    </template>

    <v-card class="glass-card pa-1 border-thin">
      <v-card-text class="pa-0">
        <v-date-picker
          v-if="timeRangeModel === 'day' || timeRangeModel === 'week'"
          v-model="tempDate"
          show-adjacent-months
          :multiple="timeRangeModel === 'week' ? 'range' : false"
          weeks-in-month="dynamic"
          weekday-format="short"
          color="secondary"
          class="glass-date-picker"
          bg-color="transparent"
          @update:model-value="(val) => {
            const v = Array.isArray(val)
              ? val[0]
              : val

            if (!v) {
              return
            }

            if (typeof v === 'string') {
              anchorDateModel = (v.split('T')[0] ?? '')
            } else {
              const d = v instanceof Date ? v : new Date(v)

              anchorDateModel = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
            }

            menu = false
          }"
        />

        <v-stepper-vertical
          v-else-if="timeRangeModel === 'month'"
          v-model="monthStep"
          :items="monthStepperItems"
          :color="color"
          alt-labels
          bg-color="transparent"
          flat
        >
          <template #[`item.1`]>
            <v-date-picker-years
              v-model="monthYear"
              color="secondary"
              bg-color="transparent"
            />
          </template>

          <template #[`item.2`]>
            <v-date-picker-months
              v-model="tempMonth"
              v-model:year="monthYear"
              color="secondary"
              bg-color="transparent"
            />
          </template>

          <template #actions="{ step, next, prev }">
            <div class="d-flex align-center ga-2 pa-3">
              <v-btn
                color="error"
                variant="text"
                @click="menu = false"
              >
                {{ $t("app.date-range-filter.cancel") }}
              </v-btn>

              <v-spacer />

              <v-btn
                v-if="step === 1"
                variant="tonal"
                :color="color"
                @click="next"
              >
                {{ $t("app.date-range-filter.next") }}
              </v-btn>

              <v-btn
                v-else
                color="secondary"
                variant="text"
                @click="prev"
              >
                {{ $t("app.date-range-filter.prev") }}
              </v-btn>

              <v-btn
                v-if="step === 2"
                variant="flat"
                :color="color"
                :disabled="tempMonth === undefined || tempMonth === null"
                @click="() => {
                  const m = tempMonth

                  if (m === undefined || m === null) {
                    return
                  }

                  const month1 = (m >= 0 && m <= 11) ? (m + 1) : m

                  anchorDateModel = `${monthYear}-${String(month1).padStart(2, '0')}-01`
                  menu = false
                }"
              >
                {{ $t("app.date-range-filter.validate") }}
              </v-btn>
            </div>
          </template>
        </v-stepper-vertical>

        <v-date-picker-years
          v-else-if="timeRangeModel === 'year'"
          v-model="tempYear"
          color="secondary"
          bg-color="transparent"
          @update:model-value="(y) => {
            if (!y) {
              return
            }

            anchorDateModel = `${y}-01-01`
            monthYear = y
            menu = false
          }"
        />
      </v-card-text>
    </v-card>
  </v-menu>

  <v-btn-toggle
    v-if="smAndUp"
    v-model="timeRangeModel"
    mandatory
    class="mr-4 rounded-s-0 rounded-e-pill glass-toggle"
    :color="color"
  >
    <v-btn
      v-for="item in dateFilterItems"
      :key="item.value"
      :value="item.value"
      size="small"
    >
      {{ item.text }}
    </v-btn>
  </v-btn-toggle>

  <div
    v-else
    class="period-select"
  >
    <v-select
      v-model="timeRangeModel"
      class="mr-4 glass-input"
      :base-color="color"
      :color="color"
      :items="dateFilterItems"
      item-title="text"
      item-value="value"
      density="comfortable"
      hide-details
      variant="outlined"
      bg-color="transparent"
    />
  </div>
</template>

<script lang="ts" setup>
const props = withDefaults(defineProps<{
  timeRange: string;
  anchorDate: string;
  color?: string;
}>(), {
  color: "secondary",
})

const emit = defineEmits<{
  "update:time-range": [value: string];
  "update:anchor-date": [value: string];
}>()

const {
  locale,
  t,
} = useI18n()
const { smAndUp } = useVDisplay()

const menu = ref(false)

const tempDate = ref<string | string[] | Date | null>(null)
const tempMonth = ref<number | undefined>(undefined)
const tempYear = ref<number | undefined>(undefined)
const monthStep = ref<number>(1)

const now0 = new Date()
const monthYear = ref<number>(now0.getFullYear())

const timeRangeModel = computed({
  get: () => props.timeRange,
  set: (v: string) => emit("update:time-range", v),
})

const anchorDateModel = computed({
  get: () => props.anchorDate,
  set: (v: string) => emit("update:anchor-date", v),
})

const monthStepperItems = computed(() => ([
  {
    title: t("app.date-range-filter.year"), value: 1,
  },
  {
    title: t("app.date-range-filter.month"), value: 2,
  },
]))

const dateFilterItems = computed(() => ([
  {
    text: t("app.time-range.day"), value: "day",
  },
  {
    text: t("app.time-range.week"), value: "week",
  },
  {
    text: t("app.time-range.month"), value: "month",
  },
  {
    text: t("app.time-range.year"), value: "year",
  },
  {
    text: t("app.time-range.all"), value: "all",
  },
]))

function getWeekStartAndEnd(date: Date): {
  start: Date; end: Date;
} {
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

const tooltipText = computed(() => {
  if (timeRangeModel.value === "all") {
    return ""
  }

  const [ y, m, d ] = (anchorDateModel.value || "").split("-")
    .map(Number)

  if (!y || !m || !d) {
    return ""
  }

  const base = new Date(y, m - 1, d)

  const fmt = (date: Date, options: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(locale.value, options)
    .format(date)

  const baseOpts: Intl.DateTimeFormatOptions = {
    weekday: "long", day: "2-digit", month: "long", year: "numeric",
  }

  if (timeRangeModel.value === "day") {
    return fmt(base, baseOpts)
  }

  if (timeRangeModel.value === "week") {
    const {
      start, end,
    } = getWeekStartAndEnd(base)

    return `${fmt(start, baseOpts)} - ${fmt(end, baseOpts)}`
  }

  if (timeRangeModel.value === "month") {
    const monthBase = new Date(y, m - 1, 1)

    return fmt(monthBase, {
      month: "long", year: "numeric",
    })
  }

  if (timeRangeModel.value === "year") {
    return String(y)
  }

  return ""
})

watch(menu, (open) => {
  if (!open) {
    return
  }

  const [ y, m, d ] = (anchorDateModel.value || "").split("-")
    .map(Number)

  if (!y || !m || !d) {
    return
  }

  if (timeRangeModel.value === "week") {
    const baseDate = new Date(y, m - 1, d)
    const {
      start, end,
    } = getWeekStartAndEnd(baseDate)

    const dates: string[] = []

    for (let dt = new Date(start); dt <= end; dt.setDate(dt.getDate() + 1)) {
      dates.push(dt.toISOString())
    }

    tempDate.value = dates

    return
  }

  tempDate.value = anchorDateModel.value
  monthYear.value = y
  tempYear.value = y
  tempMonth.value = (m - 1)

  if (timeRangeModel.value === "month") {
    monthStep.value = 1
  }
})

watch(timeRangeModel, (val) => {
  if (val === "all") {
    menu.value = false
  }
})
</script>

<style lang="scss" scoped>
.v-btn-group--horizontal {
  overflow-x: clip;
}

.period-select :deep(.v-input__control > .v-field) {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  border-top-right-radius: 9999px;
  border-bottom-right-radius: 9999px;
}

:deep(.v-date-picker) {
  background-color: transparent !important;
}

:deep(.v-stepper-vertical) {
  box-shadow: none !important;
  background-color: transparent !important;
}
</style>
