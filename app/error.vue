<template>
  <v-app>
    <v-main>
      <LayoutNavBar />
      <v-container
        class="fill-height"
      >
        <v-col align="center">
          <v-row
            align="center"
            align-content="center"
            justify="center"
          >
            <h1 class="text-h1">
              {{ error.statusCode }}
            </h1>
          </v-row>
          <v-row
            align="center"
            align-content="center"
            justify="center"
          >
            <v-alert
              color="error"
              :text="error.message"
              max-width="35%"
            />
          </v-row>
          <v-row
            align="center"
            align-content="center"
            justify="center"
          >
            <v-btn
              :text="t('error.back')"
              to="/"
              color="error"
              prepend-icon="mdi-home-outline"
              size="large"
              style="margin-top: 1rem;"
              variant="outlined"
            />
          </v-row>
        </v-col>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import type { NuxtError } from "#app"

const { t } = useI18n()

const props = defineProps<{
  error: NuxtError;
}>()
</script>
