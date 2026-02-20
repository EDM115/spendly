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
            {{ t('privacy-policy.title') }}
          </h1>

          <p class="mb-2">
            <strong>{{ t('privacy-policy.effective_date') }} :</strong> {{ formattedDate }}
          </p>

          <p
            class="mb-4"
            v-html="richText('privacy-policy.description', 0)"
          />

          <p
            class="mb-6"
            v-html="
              richText('privacy-policy.description', 1)
                + ' <b><a href=\'mailto:' + t('privacy-policy.email') + '\' class=\'privacy-link\'>'
                + t('privacy-policy.email')
                + '</a></b>.'
            "
          />
        </div>

        <v-divider class="mb-6" />

        <div>
          <v-card
            v-for="sectionKey in sectionKeys"
            :key="sectionKey"
            class="mb-6"
            variant="tonal"
            rounded="lg"
          >
            <v-card-title class="text-h6 font-weight-semibold">
              {{ t(`privacy-policy.${sectionKey}.title`) }}
            </v-card-title>

            <v-divider />

            <v-card-text>
              <div v-if="sectionKey === 'the-information-we-collect'">
                <p
                  class="mb-6"
                  v-html="richText(`privacy-policy.${sectionKey}.content`)"
                />

                <div
                  v-for="subKey in infoCollectSubKeys"
                  :key="subKey"
                  class="mb-6"
                >
                  <h3
                    class="text-subtitle-1 font-weight-medium mb-2"
                    v-html="richText(`privacy-policy.${sectionKey}.${subKey}.title`)"
                  />

                  <div v-if="isArrayKey(`privacy-policy.${sectionKey}.${subKey}.content`)">
                    <div
                      v-for="(_block, blockIndex) in tm(`privacy-policy.${sectionKey}.${subKey}.content`)"
                      :key="blockIndex"
                      class="mb-4"
                    >
                      <p v-html="richText(`privacy-policy.${sectionKey}.${subKey}.content`, blockIndex as number)" />
                    </div>
                  </div>

                  <p
                    v-else
                    v-html="richText(`privacy-policy.${sectionKey}.${subKey}.content`)"
                  />
                </div>
              </div>

              <div v-else>
                <div v-if="isArrayKey(`privacy-policy.${sectionKey}.content`)">
                  <div
                    v-for="(_block, blockIndex) in tm(`privacy-policy.${sectionKey}.content`)"
                    :key="blockIndex"
                    class="mb-4"
                  >
                    <p v-html="richText(`privacy-policy.${sectionKey}.content`, blockIndex as number)" />
                  </div>
                </div>

                <p
                  v-else
                  v-html="richText(`privacy-policy.${sectionKey}.content`)"
                />
              </div>
            </v-card-text>
          </v-card>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<i18n>
{
  "en": {
    "privacy-policy": {
      "scope": {
        "content": "This Privacy Policy applies to information processed by Spendly when you use the Service, including when you create an account, sign in (including via OAuth like Google), enter financial tracking information, or request support.",
        "title": "1) Scope"
      },
      "changes-to-this-privacy-policy": {
        "content": "We may update this Privacy Policy from time to time. If we make changes, we will revise the \"Effective date\" at the top. Your continued use of the Service after changes take effect means you accept the updated policy.",
        "title": "10) Changes to this Privacy Policy"
      },
      "contact": {
        "content": "For privacy questions, data requests, or account issues, contact the aforementioned email address.",
        "title": "11) Contact"
      },
      "the-information-we-collect": {
        "account-and-login-information": {
          "content": [
            "Depending on how you sign in, we may collect :\n- **Email address**\n- **Username**\n- **Password**",
            "**Important note about passwords :** If you use password-based authentication, your password is not accessible to us in plaintext. We **cannot** read your password and **cannot** retrieve it in case you lost it. However, you can reset your password, as long as you provided an email address."
          ],
          "title": "A. Account and login information"
        },
        "oauth-third-party-sign-in-information": {
          "content": [
            "If you sign in using OAuth (Google/GitHub/any other provider we might add in the future), we store an **OAuth token** or equivalent credential required to authenticate you and operate the Service. This token may allow us to retrieve limited profile information on your behalf, such as :\n- **Your name and/or username** associated with your OAuth account (as provided by the provider and permitted by the OAuth scopes you approve)",
            "We do not use OAuth access for any unrelated purpose. We do not attempt to access or collect information outside what you authorize through the consent screen and what is necessary to provide the Service."
          ],
          "title": "B. OAuth / third-party sign-in information"
        },
        "financial-and-usage-data-you-input": {
          "content": "Spendly is a financial habits tracking app. We collect and store the information you enter into the app, which may include (depending on features you use) :\n- Spending/income entries\n- Categories, budgets, recurring items\n- Notes, tags, and other metadata you choose to attach\n- Any other financial tracking details you input for the purpose of using the Service",
          "title": "C. Financial and usage data you input"
        },
        "content": "We collect only the data you voluntarily provide to us or that is necessary for the Service to function as intended.",
        "support-and-communications": {
          "content": "If you contact us (for example, to request help, deletion, or a data copy), we will receive :\n- The contents of your email and any information you include\n- Your email address and any metadata your email provider includes (e.g., timestamp)",
          "title": "D. Support and communications"
        },
        "what-we-do-not-collect": {
          "content": "We do not intentionally collect data that you do not provide and that is not needed for the Service to work. We do not send marketing emails and do not use your email address for promotional communications. We will **never** share any of the information you provide with third parties for their own marketing purposes, analytics or advertising.",
          "title": "E. What we do **not** collect"
        },
        "title": "2) The information we collect"
      },
      "how-we-use-your-information": {
        "content": [
          "We use your information for the following purposes :",
          "1. **Provide and operate the Service**\n  - Create and manage your account\n  - Authenticate you at login (including via OAuth)\n  - Store and display the financial tracking data you enter",
          "2. **Account-related communications**\n  - Send necessary emails such as password reset or other account/security-related notices\n  - We do not send newsletters, marketing, or non-essential communications",
          "3. **Support and troubleshooting**\n  - Respond to your requests and support inquiries\n  - Diagnose bugs, resolve issues, and improve reliability",
          "4. **Security, integrity, and enforcement**\n  - Detect abuse, fraud, or misuse\n  - Enforce our Terms of Use, including account restrictions or bans when warranted",
        ],
        "title": "3) How we use your information"
      },
      "admin-access-and-impersonation-for-support": {
        "content": "Service administrators may have the ability to **impersonate** a user account, meaning they can view that user's data without requiring the user's authentication credentials.\n**This capability is strictly for support purposes**, such as debugging, troubleshooting, and help **when the user has requested or agreed to such assistance**. We do not use impersonation to access user data for unrelated reasons.",
        "title": "4) Admin access and \"impersonation\" for support"
      },
      "how-we-share-your-information": {
        "content": [
          "We do not sell your personal information.\nWe may share information only in limited situations :\n- **With service providers** that help us run the Service (for example, hosting or infrastructure). These providers may process data on our behalf to operate the Service.\n- **For legal compliance or protection**, if we believe in good faith it is necessary to comply with applicable law, protect the Service, enforce our Terms of Use, or respond to lawful requests.",
          "When you use OAuth, the OAuth provider may process information according to its own policies. Your use of the OAuth services is governed by the OAuth provider's applicable terms and privacy policies."
        ],
        "title": "5) How we share your information"
      },
      "data-retention": {
        "content": [
          "We keep the data you provide **indefinitely** unless one of the following occurs :\n1. **The Service ceases to exist** (for example, if the Service is shut down)\n2. **You delete your data manually** (where the Service provides deletion functionality)\n3. **A service administrator deletes your data** (for example, in response to a request or as part of enforcement or maintenance)",
          "Because retention is indefinite by default, you control deletion by using in-app deletion tools (if available) or by contacting us."
        ],
        "title": "6) Data retention"
      },
      "your-rights-and-choices": {
        "content": [
          "You can request the following at any time by emailing the aforementioned email address :\n- **A copy of your data** (export)\n- **Deletion of your account and/or data**",
          "We will make reasonable efforts to fulfill requests. In some cases, deletion may not be possible if the Service has already ceased to exist or if technical limitations prevent retrieval/export. If we cannot complete a request, we will explain why to the extent we can."
        ],
        "title": "7) Your rights and choices"
      },
      "security-and-risk-disclosure": {
        "content": "We take reasonable steps to operate the Service, but **the availability of the Service is not guaranteed**. Additionally, **the safety of any data stored in the Service is not guaranteed**. No method of storage or transmission is 100% secure, and you use the Service with this understanding.\nWe recommend that you avoid storing any information you consider highly sensitive or irreplaceable.",
        "title": "8) Security and risk disclosure"
      },
      "service-shutdown": {
        "content": "Administrators may **shut down the Service at any moment**. In the event of shutdown, you may lose access to your account and data. Where feasible, we may attempt to provide notice, but we are not obligated or guaranteed to do so.",
        "title": "9) Service shutdown"
      },
      "description": [
        "Spendly (\"**Spendly**\", \"**we**\", \"**us**\", or \"**our**\") provides a personal finance habits tracking application (the \"**Service**\"). This Privacy Policy explains what information we collect, how we use it, how we store it, and what choices you have.",
        "If you have questions about this Privacy Policy or your data, contact us at"
      ],
      "effective_date": "Effective date",
      "email": "spendly{'@'}edm115.dev",
      "title": "Privacy Policy - Spendly"
    }
  },
  "fr": {
    "privacy-policy": {
      "scope": {
        "content": "La présente Politique de confidentialité s'applique aux informations traitées par Spendly lorsque vous utilisez le Service, notamment lorsque vous créez un compte, vous connectez (y compris via OAuth comme Google), saisissez des informations de suivi financier, ou demandez de l'assistance.",
        "title": "1) Champ d'application"
      },
      "changes-to-this-privacy-policy": {
        "content": "Nous pouvons mettre à jour cette Politique de confidentialité de temps à autre. Si nous apportons des modifications, nous mettrons à jour la \"Date d'effet\" en haut. La poursuite de votre utilisation du Service après l'entrée en vigueur des changements signifie que vous acceptez la politique mise à jour.",
        "title": "10) Modifications de cette Politique de confidentialité"
      },
      "contact": {
        "content": "Pour toute question relative à la confidentialité, les demandes de données, ou les problèmes de compte, contactez l'adresse e-mail mentionnée ci-dessus.",
        "title": "11) Contact"
      },
      "the-information-we-collect": {
        "account-and-login-information": {
          "content": [
            "Selon la méthode de connexion, nous pouvons collecter :\n- **Adresse e-mail**\n- **Nom d'utilisateur**\n- **Mot de passe**",
            "**Note importante concernant les mots de passe :** Si vous utilisez une authentification par mot de passe, votre mot de passe n'est pas accessible pour nous en clair. Nous **ne pouvons pas** lire votre mot de passe et **ne pouvons pas** le récupérer si vous l'avez perdu. En revanche, vous pouvez réinitialiser votre mot de passe, à condition d'avoir fourni une adresse e-mail.",
          ],
          "title": "A. Informations de compte et de connexion"
        },
        "oauth-third-party-sign-in-information": {
          "content": [
            "Si vous vous connectez via OAuth (Google/GitHub/tout autre fournisseur que nous pourrions ajouter à l'avenir), nous stockons un **jeton OAuth** ou un identifiant équivalent nécessaire pour vous authentifier et faire fonctionner le Service. Ce jeton peut nous permettre de récupérer en votre nom des informations de profil limitées, par exemple :\n- **Votre nom et/ou nom d'utilisateur** associé à votre compte OAuth (tel que fourni par le fournisseur et autorisé par les scopes OAuth que vous approuvez)",
            "Nous n'utilisons pas l'accès OAuth à des fins non liées au Service. Nous ne tentons pas d'accéder ni de collecter des informations au-delà de ce que vous autorisez via l'écran de consentement et de ce qui est nécessaire pour fournir le Service.",
          ],
          "title": "B. Informations de connexion OAuth / via un tiers"
        },
        "financial-and-usage-data-you-input": {
          "content": "Spendly est une application de suivi des habitudes financières. Nous collectons et stockons les informations que vous saisissez dans l'application, qui peuvent inclure (selon les fonctionnalités utilisées) :\n- Entrées de dépenses / revenus\n- Catégories, budgets, éléments récurrents\n- Notes, tags et autres métadonnées que vous choisissez d'ajouter\n- Tout autre détail de suivi financier saisi dans le but d'utiliser le Service",
          "title": "C. Données financières et d'usage que vous saisissez"
        },
        "content": "Nous ne collectons que les données que vous nous fournissez volontairement ou qui sont nécessaires au bon fonctionnement du Service.",
        "support-and-communications": {
          "content": "Si vous nous contactez (par exemple, pour demander de l'aide, une suppression, ou une copie de données), nous recevrons :\n- Le contenu de votre e-mail et toute information que vous incluez\n- Votre adresse e-mail et toute métadonnée incluse par votre fournisseur d'e-mail (par ex. horodatage)",
          "title": "D. Support et communications"
        },
        "what-we-do-not-collect": {
          "content": "Nous ne collectons pas intentionnellement de données que vous ne fournissez pas et qui ne sont pas nécessaires au fonctionnement du Service. Nous n'envoyons pas d'e-mails marketing et n'utilisons pas votre adresse e-mail à des fins promotionnelles. Nous ne partagerons **jamais** les informations que vous fournissez avec des tiers pour leurs propres finalités marketing, d'analytique ou de publicité.",
          "title": "E. Ce que nous ne collectons **pas**"
        },
        "title": "2) Les informations que nous collectons"
      },
      "how-we-use-your-information": {
        "content": [
          "Nous utilisons vos informations aux fins suivantes :",
          "1. **Fournir et exploiter le Service**\n  - Créer et gérer votre compte\n  - Vous authentifier lors de la connexion (y compris via OAuth)\n  - Stocker et afficher les données de suivi financier que vous saisissez",
          "2. **Communications liées au compte**\n  - Envoyer des e-mails nécessaires, comme la réinitialisation de mot de passe ou d'autres notifications liées au compte / à la sécurité\n  - Nous n'envoyons pas de newsletters, de marketing, ni de communications non essentielles",
          "3. **Support et dépannage**\n  - Répondre à vos demandes et requêtes d'assistance\n  - Diagnostiquer les bugs, résoudre les problèmes et améliorer la fiabilité",
          "4. **Sécurité, intégrité et application**\n  - Détecter les abus, la fraude ou une utilisation abusive\n  - Faire appliquer nos Conditions d'utilisation, y compris des restrictions de compte ou des bannissements si nécessaire",
        ],
        "title": "3) Comment nous utilisons vos informations"
      },
      "admin-access-and-impersonation-for-support": {
        "content": "Les administrateurs du Service peuvent avoir la possibilité de **se faire passer** pour un compte utilisateur, ce qui signifie qu'ils peuvent consulter les données de cet utilisateur sans nécessiter les identifiants d'authentification de l'utilisateur.\n**Cette capacité est strictement destinée au support**, par exemple pour le débogage, le dépannage et l'aide **lorsque l'utilisateur a demandé ou accepté une telle assistance**. Nous n'utilisons pas l'impersonation pour accéder aux données des utilisateurs pour des raisons non liées.",
        "title": "4) Accès administrateur et \"impersonation\" pour le support"
      },
      "how-we-share-your-information": {
        "content": [
          "Nous ne vendons pas vos informations personnelles.\nNous pouvons partager des informations uniquement dans des situations limitées :\n- **Avec des prestataires de service** qui nous aident à faire fonctionner le Service (par exemple, hébergement ou infrastructure). Ces prestataires peuvent traiter des données pour notre compte afin d'exploiter le Service.\n- **Pour la conformité légale ou la protection**, si nous estimons de bonne foi que cela est nécessaire pour respecter la loi applicable, protéger le Service, faire appliquer nos Conditions d'utilisation, ou répondre à des demandes légales.",
          "Lorsque vous utilisez OAuth, le fournisseur OAuth peut traiter des informations conformément à ses propres politiques. Votre utilisation des services OAuth est régie par les conditions et politiques de confidentialité du fournisseur OAuth.",
        ],
        "title": "5) Comment nous partageons vos informations"
      },
      "data-retention": {
        "content": [
          "Nous conservons les données que vous fournissez **indéfiniment** sauf si l'un des cas suivants se produit :\n1. **Le Service cesse d'exister** (par exemple, si le Service est arrêté)\n2. **Vous supprimez vos données manuellement** (lorsque le Service propose une fonctionnalité de suppression)\n3. **Un administrateur du Service supprime vos données** (par exemple, suite à une demande ou dans le cadre d'une application / maintenance)",
          "Étant donné que la conservation est indéfinie par défaut, vous contrôlez la suppression via les outils de suppression dans l'application (si disponibles) ou en nous contactant.",
        ],
        "title": "6) Conservation des données"
      },
      "your-rights-and-choices": {
        "content": [
          "Vous pouvez demander à tout moment, par e-mail à l'adresse mentionnée ci-dessus :\n- **Une copie de vos données** (export)\n- **La suppression de votre compte et/ou de vos données**",
          "Nous ferons des efforts raisonnables pour répondre aux demandes. Dans certains cas, la suppression peut ne pas être possible si le Service a déjà cessé d'exister ou si des limitations techniques empêchent la récupération / l'export. Si nous ne pouvons pas satisfaire une demande, nous expliquerons pourquoi dans la mesure du possible.",
        ],
        "title": "7) Vos droits et choix"
      },
      "security-and-risk-disclosure": {
        "content": "Nous prenons des mesures raisonnables pour exploiter le Service, mais **la disponibilité du Service n'est pas garantie**. De plus, **la sécurité des données stockées dans le Service n'est pas garantie**. Aucune méthode de stockage ou de transmission n'est sûre à 100 %, et vous utilisez le Service en ayant conscience de cela.\nNous vous recommandons d'éviter de stocker toute information que vous considérez comme hautement sensible ou irremplaçable.",
        "title": "8) Sécurité et divulgation des risques"
      },
      "service-shutdown": {
        "content": "Les administrateurs peuvent **arrêter le Service à tout moment**. En cas d'arrêt, vous pouvez perdre l'accès à votre compte et à vos données. Lorsque cela est possible, nous pouvons tenter de prévenir, mais nous n'y sommes ni obligés ni garantis.",
        "title": "9) Arrêt du Service"
      },
      "description": [
        "Spendly (\"**Spendly**\", \"**nous**\", \"**notre**\" ou \"**nos**\") propose une application de suivi des habitudes financières personnelles (le \"**Service**\"). La présente Politique de confidentialité explique quelles informations nous collectons, comment nous les utilisons, comment nous les stockons, et quels choix vous avez.",
        "Si vous avez des questions concernant cette Politique de confidentialité ou vos données, contactez-nous à"
      ],
      "effective_date": "Date d'effet",
      "email": "spendly{'@'}edm115.dev",
      "title": "Politique de confidentialité - Spendly"
    }
  }
}
</i18n>

<script setup lang="ts">
const {
  locale,
  t,
  tm,
} = useI18n()

useHead({ title: t("privacy-policy.title") })

const effectiveDate = new Date("2026-02-01")

const formattedDate = computed(() => {
  return effectiveDate.toLocaleDateString(locale.value, {
    year: "numeric",
    month: "long",
    day: "2-digit",
    weekday: "long",
  })
})

const sectionKeys = [
  "scope",
  "the-information-we-collect",
  "how-we-use-your-information",
  "admin-access-and-impersonation-for-support",
  "how-we-share-your-information",
  "data-retention",
  "your-rights-and-choices",
  "security-and-risk-disclosure",
  "service-shutdown",
  "changes-to-this-privacy-policy",
  "contact",
] as const

type SectionKey = typeof sectionKeys[number]

const infoCollectSubKeys = [
  "account-and-login-information",
  "oauth-third-party-sign-in-information",
  "financial-and-usage-data-you-input",
  "support-and-communications",
  "what-we-do-not-collect",
] as const

function isArrayKey(key: string): boolean {
  const value = tm(key)

  return Array.isArray(value)
}

function richText(key: string, idx?: number): string {
  const raw
    = typeof idx === "number"
      // @ts-expect-error local i18n
      ? String(tm(key)[idx].loc.source)
      : String(t(key))

  return raw
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
