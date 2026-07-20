<template>
  <v-container class="changelog-page position-relative">
    <header class="changelog-header text-center position-relative">
      <v-chip
        color="info"
        variant="tonal"
        prepend-icon="mdi-history"
        rounded="lg"
        class="mb-5 font-weight-bold"
      >
        {{ t("changelog.eyebrow") }}
      </v-chip>
      <h1 class="text-h3 text-md-h2 font-weight-black pb-4">
        {{ t("changelog.title") }}
      </h1>
      <p class="text-h6 text-medium-emphasis font-weight-light mx-auto changelog-description">
        {{ t("changelog.description") }}
      </p>
    </header>

    <main class="release-timeline position-relative">
      <article
        v-for="(release, releaseIndex) in releases"
        :key="`${releaseIndex}-${release.title}`"
        class="release-entry"
        :style="getReleaseStyle(release.type)"
      >
        <div class="release-marker-column">
          <v-avatar
            :color="getReleasePresentation(release.type).color"
            variant="flat"
            size="52"
            class="release-marker"
          >
            <v-icon
              :icon="getReleasePresentation(release.type).icon"
              size="25"
            />
          </v-avatar>
        </div>

        <div class="release-content">
          <div class="d-flex flex-wrap align-center ga-2 mb-3">
            <span class="release-type text-caption font-weight-black">
              {{ t(`changelog.types.${release.type}`) }}
            </span>
            <v-chip
              v-if="release.version"
              color="success"
              variant="tonal"
              size="small"
              rounded="lg"
              class="font-weight-bold version-chip"
            >
              {{ release.version }}
            </v-chip>
          </div>

          <h2 class="text-h5 text-md-h4 font-weight-bold mb-2">
            {{ release.title }}
          </h2>
          <p
            v-if="release.description"
            class="text-body-1 text-medium-emphasis mb-0 release-description"
          >
            {{ release.description }}
          </p>
        </div>
      </article>
    </main>
  </v-container>
</template>

<script setup lang="ts">
const {
  t,
  tm,
} = useI18n()

const releasePresentations: Record<ChangelogReleaseType, ReleasePresentation> = {
  feat: {
    color: "primary",
    icon: "mdi-creation-outline",
  },
  fix: {
    color: "accent",
    icon: "mdi-bandage",
  },
  chore: {
    color: "secondary",
    icon: "mdi-broom",
  },
}

const releases = computed(function getReleases() {
  return tm("changelog.releases") as unknown as ChangelogRelease[]
})

useHead({ title: t("main.changelog") })

function getReleasePresentation(type: ChangelogReleaseType): ReleasePresentation {
  return releasePresentations[type]
}

function getReleaseStyle(type: ChangelogReleaseType): Record<string, string> {
  const { color } = getReleasePresentation(type)

  return {
    "--release-color": `rgb(var(--v-theme-${color}))`,
    "--release-background": `rgba(var(--v-theme-${color}), 0.12)`,
  }
}
</script>

<style scoped lang="scss">
.changelog-page {
  min-height: 100vh;
  padding-top: 112px;
  padding-bottom: 72px;
  overflow: hidden;
}

.changelog-header {
  max-width: 820px;
  margin: 0 auto 72px;
  z-index: 1;

  h1 {
    background: linear-gradient(115deg, rgb(var(--v-theme-primary)), rgb(var(--v-theme-secondary)));
    background-clip: text;
    color: transparent;
  }
}

.changelog-description {
  max-width: 700px;
  line-height: 1.7;
}

.release-timeline {
  max-width: 940px;
  margin: 0 auto;
  z-index: 1;
}

.release-entry {
  display: grid;
  grid-template-columns: 64px minmax(0, 1fr);
  column-gap: 24px;
  align-items: start;

  &:not(:last-child) {
    padding-bottom: 44px;
  }
}

.release-marker-column {
  position: relative;
  display: flex;
  justify-content: center;
  align-self: stretch;

  &::before {
    position: absolute;
    top: 0;
    bottom: -44px;
    left: 50%;
    width: 2px;
    background: linear-gradient(to bottom, var(--release-color), rgba(var(--v-theme-primary), 0.18));
    content: "";
    transform: translateX(-50%);
  }
}

.release-entry:last-child .release-marker-column::before {
  bottom: 0;
}

.release-marker {
  z-index: 1;
  border: 5px solid rgb(var(--v-theme-background));
  box-shadow: 0 8px 28px var(--release-background);
}

.release-content {
  min-height: 112px;
  padding: 6px 0 28px;
}

.version-chip {
  letter-spacing: 0.04em;
}

.release-type {
  padding: 3px 9px;
  border-radius: 999px;
  background: var(--release-background);
  color: var(--release-color);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.release-description {
  max-width: 760px;
  line-height: 1.75;
  white-space: pre-line;
}

@media (max-width: 959px) {
  .changelog-page {
    padding-top: 96px;
  }

  .release-entry {
    grid-template-columns: 52px minmax(0, 1fr);
    column-gap: 16px;
  }
}

@media (max-width: 600px) {
  .changelog-page {
    padding-right: 14px;
    padding-bottom: 48px;
    padding-left: 14px;
  }

  .changelog-header {
    margin-bottom: 48px;
  }

  .release-entry {
    grid-template-columns: 42px minmax(0, 1fr);
    column-gap: 12px;

    &:not(:last-child) {
      padding-bottom: 32px;
    }
  }

  .release-marker-column::before {
    bottom: -32px;
  }

  .release-marker {
    width: 40px !important;
    height: 40px !important;
    border-width: 4px;
  }

  .release-content {
    min-height: 104px;
    padding-top: 4px;
  }
}
</style>
