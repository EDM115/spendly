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
            {{ $t('terms-of-use.title') }}
          </h1>

          <p class="mb-2">
            <strong>{{ $t('terms-of-use.effective_date') }} :</strong> {{ formattedDate }}
          </p>

          <p
            class="mb-6"
            v-html="richText('terms-of-use.intro.0')"
          />

          <p
            class="mb-8"
            v-html="
              $t('terms-of-use.intro.1')
                + ' <b><a href=\'mailto:' + $t('terms-of-use.email') + '\' class=\'terms-link\'>'
                + $t('terms-of-use.email')
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
              {{ $t('terms-of-use.' + sectionNumber + '.title') }}
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

/*
## Terms of Use - Spendly
**Effective date :** February 1, 2026
These Terms of Use ("**Terms**") govern your use of Spendly (the "**Service**"). By accessing or using the Service, you agree to these Terms. If you do not agree, do not use the Service.
If you have questions about these Terms, contact **[spendly@edm115.dev](mailto:spendly@edm115.dev)**.

---

### 1) The Service

Spendly is a financial habits tracking app that allows users to record and view personal financial information for tracking purposes. The Service may include features such as account creation, OAuth login, data entry, dashboards, charts, and exports (features may change over time).

---

### 2) Eligibility and accounts
You must provide accurate information when creating or using an account. You are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account.
If you use OAuth to sign in, you are responsible for maintaining access to your OAuth provider account and complying with their terms.

---

### 3) User content and your responsibilities
You control what you input into the Service, including financial data ("**User Data**"). You represent and warrant that :
- You have the right to provide the User Data you submit.
- Your use of the Service and submission of User Data will not violate applicable laws or the rights of others.
You are solely responsible for :
- The accuracy, completeness, and usefulness of your User Data
- Any decisions you make based on the Service's outputs or summaries
**Spendly does not provide financial, legal, or tax advice.** The Service is for tracking and informational purposes only.

---

### 4) Prohibited conduct
You agree not to :
- Use the Service in a way that violates any law or regulation
- Attempt to gain unauthorized access to the Service, other accounts, or related systems
- Interfere with or disrupt the operation, security, or integrity of the Service
- Upload or transmit malicious code, or attempt to exploit vulnerabilities
- Use the Service to harass, abuse, or harm others

---

### 5) Admin enforcement, bans, and termination
Administrators may take enforcement actions, including **suspending or banning accounts**, if they determine an account is acting against these Terms or the integrity of the Service.
We may also restrict or terminate your access :
- To protect the Service or other users
- To comply with legal obligations
- For any reason related to misuse, abuse, or violations of these Terms
Termination may result in loss of access to your account and User Data without recoverability.

---

### 6) Support access and impersonation
To provide support and resolve issues, Service administrators may have the ability to **impersonate a user** and view that user's data without requiring the user's authentication credentials.
This capability exists **solely** for **user-accorded** debugging, troubleshooting, and help. If you request support that requires access to your account, you acknowledge that such access may occur.

---

### 7) Data retention and deletion
By default, User Data you provide is retained **indefinitely** unless :
1. The Service ceases to exist
2. You manually delete your data (where functionality exists)
3. An administrator deletes your data (for example, at your request or for operational/enforcement reasons)
You may request :
- **A copy of your data**, or
- **Deletion of your account/data**
  by emailing **[spendly@edm115.dev](mailto:spendly@edm115.dev)**.
We will make reasonable efforts to respond, but we do not guarantee data export or deletion in all cases (e.g., if the Service has already been shut down or if technical limitations prevent retrieval).

---

### 8) Availability, uptime, and data safety disclaimers
You understand and agree that :
- **Availability of the Service is not guaranteed in any way.**
- **Safety of the data stored in the Service is not guaranteed in any way.**
The Service is provided on an "**AS IS**" and "**AS AVAILABLE**" basis. We may change, suspend, or discontinue any part of the Service at any time.

---

### 9) Service shutdown
Administrators may **shut down the Service at any moment**, with or without notice. If the Service is shut down, you may lose access to your account and User Data. You are responsible for maintaining your own backups of any information you do not want to lose.

---

### 10) Intellectual property
Spendly's source code is publicly available on GitHub and is licensed under the **MIT License**. You may **view, audit, copy, modify, distribute, and reuse** the code, provided you comply with the MIT License terms (including any required copyright and license notices).
You retain all rights to your **User Data**. By using the Service, you grant Spendly only the limited rights necessary to host, process, and display your User Data in order to operate the Service and provide its features to you.
Repository (for reference) : https://github.com/EDM115/spendly

---

### 11) Communications
We will not send promotional communications. We may send **account-related communications only**, such as password reset emails or essential notices related to your account's operation or security.

---

### 12) Limitation of liability
To the fullest extent permitted by law :
- Spendly and its administrators will not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of data, profits, or revenues, arising out of your use of (or inability to use) the Service.
- The Service is **entirely free** and will **never introduce a paid plan**. Accordingly, to the maximum extent allowed by law, Spendly's total aggregate liability for any claim related to the Service will not exceed **0** (since no fees are charged).
Because the Service is provided without guaranteed availability or data safety, you understand and accept that you use it **at your own risk**.

---

### 13) Changes to these Terms
We may update these Terms at any time. If we do, we will change the "Effective date" at the top. Continued use of the Service after changes become effective means you accept the updated Terms.

---

### 14) Contact
For support, deletion requests, or questions about these Terms, email : **[spendly@edm115.dev](mailto:spendly@edm115.dev)**
*/
</script>

<style lang="scss">
.terms-link {
  color: rgb(var(--v-theme-primary));
  text-decoration: underline;
  font-weight: 700;
}
</style>
