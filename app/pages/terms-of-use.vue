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
            {{ t('terms-of-use.title') }}
          </h1>

          <p class="mb-2">
            <strong>{{ t('terms-of-use.effective_date') }} :</strong> {{ formattedDate }}
          </p>

          <p
            class="mb-6"
            v-html="richText('terms-of-use.intro.0')"
          />

          <p
            class="mb-8"
            v-html="
              t('terms-of-use.intro.1')
                + ' <b><a href=\'mailto:' + t('terms-of-use.email') + '\' class=\'terms-link\'>'
                + t('terms-of-use.email')
                + '</a></b>.'
            "
          />
        </div>

        <div>
          <v-card
            v-for="sectionNumber in 14"
            :key="sectionNumber"
            class="mb-6"
            variant="tonal"
            rounded="lg"
          >
            <v-card-title class="text-h6 font-weight-semibold">
              {{ t('terms-of-use.' + sectionNumber + '.title') }}
            </v-card-title>

            <v-divider />

            <v-card-text>
              <p
                v-if="sectionNumber !== 3 && sectionNumber !== 4 && sectionNumber !== 5 && sectionNumber !== 7 && sectionNumber !== 8 && sectionNumber !== 10 && sectionNumber !== 12"
                class="terms-preline"
                v-html="richText('terms-of-use.' + sectionNumber + '.content')"
              />

              <div v-else>
                <div
                  v-for="blockIndex in sectionBlocks[sectionNumber]"
                  :key="blockIndex"
                  class="mb-4"
                >
                  <p
                    class="terms-preline"
                    v-html="richText('terms-of-use.' + sectionNumber + '.content.' + blockIndex)"
                  />
                </div>
              </div>
              <NuxtLink
                v-if="sectionNumber === 10"
                to="https://github.com/EDM115/spendly"
                class="terms-link"
                text="https://github.com/EDM115/spendly"
                target="_blank"
              />
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
    "terms-of-use": {
      "1": {
        "content": "Spendly is a financial habits tracking app that allows users to record and view personal financial information for tracking purposes. The Service may include features such as account creation, OAuth login, data entry, dashboards, charts, and exports (features may change over time).",
        "title": "1) The Service"
      },
      "10": {
        "content": {
          "0": "Spendly's source code is publicly available on GitHub and is licensed under the **MIT License**. You may **view, audit, copy, modify, distribute, and reuse** the code, provided you comply with the MIT License terms (including any required copyright and license notices).",
          "1": "You retain all rights to your **User Data**. By using the Service, you grant Spendly only the limited rights necessary to host, process, and display your User Data in order to operate the Service and provide its features to you.",
          "2": "Repository (for reference) :"
        },
        "title": "10) Intellectual property"
      },
      "11": {
        "content": "We will not send promotional communications. We may send **account-related communications only**, such as password reset emails or essential notices related to your account's operation or security.",
        "title": "11) Communications"
      },
      "12": {
        "content": {
          "0": "To the fullest extent permitted by law :\n- Spendly and its administrators will not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of data, profits, or revenues, arising out of your use of (or inability to use) the Service.\n- The Service is **entirely free** and will **never introduce a paid plan**. Accordingly, to the maximum extent allowed by law, Spendly's total aggregate liability for any claim related to the Service will not exceed **0** (since no fees are charged).",
          "1": "Because the Service is provided without guaranteed availability or data safety, you understand and accept that you use it **at your own risk**."
        },
        "title": "12) Limitation of liability"
      },
      "13": {
        "content": "We may update these Terms at any time. If we do, we will change the \"Effective date\" at the top. Continued use of the Service after changes become effective means you accept the updated Terms.",
        "title": "13) Changes to these Terms"
      },
      "14": {
        "content": "For support, deletion requests, or questions about these Terms, email aforementioned email address.",
        "title": "14) Contact"
      },
      "2": {
        "content": "You must provide accurate information when creating or using an account. You are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account.\nIf you use OAuth to sign in, you are responsible for maintaining access to your OAuth provider account and complying with their terms.",
        "title": "2) Eligibility and accounts"
      },
      "3": {
        "content": {
          "0": "You control what you input into the Service, including financial data (\"**User Data**\"). You represent and warrant that :",
          "1": "- You have the right to provide the User Data you submit.\n- Your use of the Service and submission of User Data will not violate applicable laws or the rights of others.",
          "2": "You are solely responsible for :\n- The accuracy, completeness, and usefulness of your User Data\n- Any decisions you make based on the Service's outputs or summaries",
          "3": "**Spendly does not provide financial, legal, or tax advice.** The Service is for tracking and informational purposes only."
        },
        "title": "3) User content and your responsibilities"
      },
      "4": {
        "content": {
          "0": "You agree not to :",
          "1": "- Use the Service in a way that violates any law or regulation\n- Attempt to gain unauthorized access to the Service, other accounts, or related systems\n- Interfere with or disrupt the operation, security, or integrity of the Service\n- Upload or transmit malicious code, or attempt to exploit vulnerabilities\n- Use the Service to harass, abuse, or harm others"
        },
        "title": "4) Prohibited conduct"
      },
      "5": {
        "content": {
          "0": "Administrators may take enforcement actions, including **suspending or banning accounts**, if they determine an account is acting against these Terms or the integrity of the Service.",
          "1": "We may also restrict or terminate your access :\n- To protect the Service or other users\n- To comply with legal obligations\n- For any reason related to misuse, abuse, or violations of these Terms",
          "2": "Termination may result in loss of access to your account and User Data without recoverability."
        },
        "title": "5) Admin enforcement, bans, and termination"
      },
      "6": {
        "content": "To provide support and resolve issues, Service administrators may have the ability to **impersonate a user** and view that user's data without requiring the user's authentication credentials.\nThis capability exists **solely** for **user-accorded** debugging, troubleshooting, and help. If you request support that requires access to your account, you acknowledge that such access may occur.",
        "title": "6) Support access and impersonation"
      },
      "7": {
        "content": {
          "0": "By default, User Data you provide is retained **indefinitely** unless :\n1. The Service ceases to exist\n2. You manually delete your data (where functionality exists)\n3. An administrator deletes your data (for example, at your request or for operational/enforcement reasons)",
          "1": "You may request :\n- **A copy of your data**, or\n- **Deletion of your account/data**\n  by emailing the aforementioned email address.",
          "2": "We will make reasonable efforts to respond, but we do not guarantee data export or deletion in all cases (e.g., if the Service has already been shut down or if technical limitations prevent retrieval)."
        },
        "title": "7) Data retention and deletion"
      },
      "8": {
        "content": {
          "0": "You understand and agree that :",
          "1": "- **Availability of the Service is not guaranteed in any way.**\n- **Safety of the data stored in the Service is not guaranteed in any way.**",
          "2": "The Service is provided on an \"**AS IS**\" and \"**AS AVAILABLE**\" basis. We may change, suspend, or discontinue any part of the Service at any time."
        },
        "title": "8) Availability, uptime, and data safety disclaimers"
      },
      "9": {
        "content": "Administrators may **shut down the Service at any moment**, with or without notice. If the Service is shut down, you may lose access to your account and User Data. You are responsible for maintaining your own backups of any information you do not want to lose.",
        "title": "9) Service shutdown"
      },
      "effective_date": "Effective date",
      "email": "spendly{'@'}edm115.dev",
      "intro": {
        "0": "These Terms of Use (\"**Terms**\") govern your use of Spendly (the \"**Service**\"). By accessing or using the Service, you agree to these Terms. If you do not agree, do not use the Service.",
        "1": "If you have questions about these Terms, contact"
      },
      "title": "Terms of Use - Spendly"
    }
  },
  "fr": {
    "terms-of-use": {
      "1": {
        "content": "Spendly est une application de suivi des habitudes financières qui permet aux utilisateurs d'enregistrer et de consulter des informations financières personnelles à des fins de suivi. Le Service peut inclure des fonctionnalités telles que la création de compte, la connexion OAuth, la saisie de données, des tableaux de bord, des graphiques et des exports (les fonctionnalités peuvent évoluer au fil du temps).",
        "title": "1) Le Service"
      },
      "10": {
        "content": {
          "0": "Le code source de Spendly est publiquement disponible sur GitHub et est sous licence **MIT**. Vous pouvez **consulter, auditer, copier, modifier, distribuer et réutiliser** le code, à condition de respecter les termes de la licence MIT (y compris toute mention de copyright et de licence requise).",
          "1": "Vous conservez tous les droits sur vos **Données utilisateur**. En utilisant le Service, vous accordez à Spendly uniquement les droits limités nécessaires pour héberger, traiter et afficher vos Données utilisateur afin d'exploiter le Service et de vous fournir ses fonctionnalités.",
          "2": "Dépôt (pour référence) :"
        },
        "title": "10) Propriété intellectuelle"
      },
      "11": {
        "content": "Nous n'enverrons pas de communications promotionnelles. Nous pouvons envoyer **uniquement des communications liées au compte**, comme des e-mails de réinitialisation de mot de passe ou des notifications essentielles liées au fonctionnement ou à la sécurité de votre compte.",
        "title": "11) Communications"
      },
      "12": {
        "content": {
          "0": "Dans toute la mesure permise par la loi :\n- Spendly et ses administrateurs ne seront pas responsables des dommages indirects, accessoires, spéciaux, consécutifs ou punitifs, ni de toute perte de données, de profits ou de revenus, résultant de votre utilisation (ou de votre incapacité à utiliser) le Service.\n- Le Service est **entièrement gratuit** et **n'introduira jamais d'offre payante**. En conséquence, dans la mesure maximale autorisée par la loi, la responsabilité totale cumulée de Spendly pour toute réclamation liée au Service n'excédera pas **0** (aucun frais n'étant facturé).",
          "1": "Étant donné que le Service est fourni sans garantie de disponibilité ni de sécurité des données, vous comprenez et acceptez que vous l'utilisez **à vos propres risques**."
        },
        "title": "12) Limitation de responsabilité"
      },
      "13": {
        "content": "Nous pouvons mettre à jour ces Conditions à tout moment. Dans ce cas, nous modifierons la \"Date d'effet\" en haut. Le fait de continuer à utiliser le Service après l'entrée en vigueur des modifications signifie que vous acceptez les Conditions mises à jour.",
        "title": "13) Modifications des présentes Conditions"
      },
      "14": {
        "content": "Pour l'assistance, les demandes de suppression, ou toute question concernant ces Conditions, envoyez un e-mail à l'adresse mentionnée ci-dessus.",
        "title": "14) Contact"
      },
      "2": {
        "content": "Vous devez fournir des informations exactes lors de la création ou de l'utilisation d'un compte. Vous êtes responsable du maintien de la confidentialité de vos identifiants de connexion et de toutes les activités effectuées sous votre compte.\nSi vous utilisez OAuth pour vous connecter, vous êtes responsable de conserver l'accès à votre compte auprès du fournisseur OAuth et de respecter ses conditions.",
        "title": "2) Éligibilité et comptes"
      },
      "3": {
        "content": {
          "0": "Vous contrôlez ce que vous saisissez dans le Service, y compris les données financières (\"**Données utilisateur**\"). Vous déclarez et garantissez que :",
          "1": "- Vous avez le droit de fournir les Données utilisateur que vous soumettez.\n- Votre utilisation du Service et la soumission de Données utilisateur ne violeront pas les lois applicables ni les droits de tiers.",
          "2": "Vous êtes seul responsable :\n- De l'exactitude, de l'exhaustivité et de l'utilité de vos Données utilisateur\n- De toute décision prise sur la base des sorties, synthèses ou résumés du Service",
          "3": "**Spendly ne fournit aucun conseil financier, juridique ou fiscal.** Le Service est destiné uniquement au suivi et à l'information."
        },
        "title": "3) Contenu utilisateur et vos responsabilités"
      },
      "4": {
        "content": {
          "0": "Vous acceptez de ne pas :",
          "1": "- Utiliser le Service d'une manière qui enfreint une loi ou une réglementation\n- Tenter d'obtenir un accès non autorisé au Service, à d'autres comptes ou à des systèmes connexes\n- Interférer avec ou perturber le fonctionnement, la sécurité ou l'intégrité du Service\n- Téléverser ou transmettre du code malveillant, ou tenter d'exploiter des vulnérabilités\n- Utiliser le Service pour harceler, maltraiter ou nuire à autrui"
        },
        "title": "4) Comportements interdits"
      },
      "5": {
        "content": {
          "0": "Les administrateurs peuvent prendre des mesures d'application, y compris **suspendre ou bannir des comptes**, s'ils déterminent qu'un compte agit à l'encontre des présentes Conditions ou de l'intégrité du Service.",
          "1": "Nous pouvons également restreindre ou résilier votre accès :\n- Pour protéger le Service ou d'autres utilisateurs\n- Pour respecter des obligations légales\n- Pour toute raison liée à une mauvaise utilisation, un abus, ou une violation des présentes Conditions",
          "2": "La résiliation peut entraîner la perte d'accès à votre compte et à vos Données utilisateur, sans possibilité de récupération."
        },
        "title": "5) Application, bannissements et résiliation"
      },
      "6": {
        "content": "Afin de fournir une assistance et de résoudre des problèmes, les administrateurs du Service peuvent avoir la possibilité de **se faire passer pour un utilisateur** et de consulter les données de cet utilisateur sans nécessiter ses identifiants d'authentification.\nCette capacité existe **uniquement** pour du débogage, du dépannage et de l'aide **avec l'accord de l'utilisateur**. Si vous demandez une assistance nécessitant l'accès à votre compte, vous reconnaissez que cet accès peut avoir lieu.",
        "title": "6) Accès support et \"impersonation\""
      },
      "7": {
        "content": {
          "0": "Par défaut, les Données utilisateur que vous fournissez sont conservées **indéfiniment** sauf si :\n1. Le Service cesse d'exister\n2. Vous supprimez manuellement vos données (lorsque la fonctionnalité existe)\n3. Un administrateur supprime vos données (par exemple, à votre demande ou pour des raisons opérationnelles / d'application)",
          "1": "Vous pouvez demander :\n- **Une copie de vos données**, ou\n- **La suppression de votre compte / de vos données**\n  en envoyant un e-mail à l'adresse mentionnée ci-dessus.",
          "2": "Nous ferons des efforts raisonnables pour répondre, mais nous ne garantissons pas l'export ou la suppression dans tous les cas (par ex., si le Service a déjà été arrêté ou si des limitations techniques empêchent la récupération)."
        },
        "title": "7) Conservation et suppression des données"
      },
      "8": {
        "content": {
          "0": "Vous comprenez et acceptez que :",
          "1": "- **La disponibilité du Service n'est garantie d'aucune manière.**\n- **La sécurité des données stockées dans le Service n'est garantie d'aucune manière.**",
          "2": "Le Service est fourni \"**EN L'ÉTAT**\" et \"**SELON DISPONIBILITÉ**\". Nous pouvons modifier, suspendre ou interrompre toute partie du Service à tout moment."
        },
        "title": "8) Disponibilité, uptime et avertissements sur la sécurité des données"
      },
      "9": {
        "content": "Les administrateurs peuvent **arrêter le Service à tout moment**, avec ou sans préavis. En cas d'arrêt, vous pouvez perdre l'accès à votre compte et à vos Données utilisateur. Vous êtes responsable de conserver vos propres sauvegardes de toute information que vous ne souhaitez pas perdre.",
        "title": "9) Arrêt du Service"
      },
      "effective_date": "Date d'effet",
      "email": "spendly{'@'}edm115.dev",
      "intro": {
        "0": "Les présentes Conditions d'utilisation (les \"**Conditions**\") régissent votre utilisation de Spendly (le \"**Service**\"). En accédant au Service ou en l'utilisant, vous acceptez ces Conditions. Si vous n'êtes pas d'accord, n'utilisez pas le Service.",
        "1": "Si vous avez des questions concernant ces Conditions, contactez-nous à"
      },
      "title": "Conditions d'utilisation - Spendly"
    }
  }
}
</i18n>

<script setup lang="ts">
const {
  locale,
  t,
} = useI18n()

useHead({ title: t("terms-of-use.title") })

const effectiveDate = new Date("2026-02-01")

const formattedDate = computed(() => {
  return effectiveDate.toLocaleDateString(locale.value, {
    year: "numeric",
    month: "long",
    day: "2-digit",
    weekday: "long",
  })
})

const sectionBlocks: Record<number, number[]> = {
  3: [ 0, 1, 2, 3 ],
  4: [ 0, 1 ],
  5: [ 0, 1, 2 ],
  7: [ 0, 1, 2 ],
  8: [ 0, 1, 2 ],
  10: [ 0, 1, 2 ],
  12: [ 0, 1 ],
}

function richText(key: string) {
  return String(t(key))
    .replace(/\n/g, "<br>")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
}
</script>

<style lang="scss">
.terms-link {
  color: rgb(var(--v-theme-primary));
  text-decoration: underline;
  font-weight: 700;
}
</style>
