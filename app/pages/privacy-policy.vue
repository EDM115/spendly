<!-- eslint-disable vue/no-v-html manual -->

<template>
  <v-container class="py-8">
    <v-row justify="center">
      <v-col
        cols="12"
        md="8"
        lg="7"
      >
        <div class="mb-6">
          <h1 class="text-h4 font-weight-bold mb-4">
            {{ $t('privacy-policy.title') }}
          </h1>

          <p class="mb-2">
            <strong>{{ $t('privacy-policy.effective_date') }} :</strong> {{ formattedDate }}
          </p>

          <p
            class="mb-4"
            v-html="richText('privacy-policy.description.0')"
          />

          <p
            class="mb-6"
            v-html="richText('privacy-policy.description.1') + ' <b><a href=\'mailto:' + $t('privacy-policy.email') + '\' class=\'privacy-link\'>' + $t('privacy-policy.email') + '</a></b>.'"
          />
        </div>

        <v-divider class="mb-6" />

        <div>
          <v-card
            v-for="sectionNumber in 11"
            :key="sectionNumber"
            class="mb-6"
            variant="tonal"
            rounded="lg"
          >
            <v-card-title class="text-h6 font-weight-semibold">
              {{ $t('privacy-policy.' + sectionNumber + '.title') }}
            </v-card-title>

            <v-divider />

            <v-card-text>
              <div v-if="sectionNumber === 2">
                <div
                  v-for="subSection in ['a', 'b', 'c', 'd', 'e']"
                  :key="subSection"
                  class="mb-6"
                >
                  <h3
                    class="text-subtitle-1 font-weight-medium mb-2"
                    v-html="richText('privacy-policy.' + sectionNumber + '.' + subSection + '.title')"
                  />

                  <p
                    v-html="richText('privacy-policy.' + sectionNumber + '.' + subSection + '.content')"
                  />
                </div>
              </div>

              <p
                v-else
                v-html="richText('privacy-policy.' + sectionNumber + '.content')"
              />
            </v-card-text>
          </v-card>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
const {
  locale,
  t,
} = useI18n()

const effectiveDate = new Date("2026-02-01")

const formattedDate = computed(() => {
  return effectiveDate.toLocaleDateString(locale.value, {
    year: "numeric",
    month: "long",
    day: "2-digit",
    weekday: "long",
  })
})

function richText(key: string) {
  return String(t(key))
    .replace(/\n/g, "<br>")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
}
</script>

<style lang="scss">
.privacy-link {
  color: rgb(var(--v-theme-primary));
  text-decoration: underline;
  font-weight: 700;
}
</style>
