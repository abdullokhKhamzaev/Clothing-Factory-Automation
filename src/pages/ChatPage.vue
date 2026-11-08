<script setup>
import { nextTick, ref } from "vue";
import { useChat } from "stores/chat.js";
import { renderMarkdown } from "src/libraries/miniMarkdown.js";
import { apiErrorMessage } from "src/libraries/constants/defaults.js";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const chat = useChat();

// Suhbat tarixi faqat brauzerda (sahifa ichida) saqlanadi
const messages = ref([]);
const input = ref('');
const loading = ref(false);
const errorText = ref('');
const scrollArea = ref(null);

const suggestions = [
  "To'quvda bugun nima gap?",
  "Bo'yoqda qancha materialimiz bor?",
  "Bugun nechta mahsulot tikildi?",
  "Ishchilardan qancha qarzimiz bor?",
];

async function send(text) {
  const question = (text ?? input.value).trim();
  if (!question || loading.value) return;

  errorText.value = '';
  messages.value.push({ role: 'user', content: question });
  input.value = '';
  loading.value = true;
  scrollDown();

  try {
    const res = await chat.ask(
      messages.value.map(m => ({ role: m.role, content: m.content }))
    );
    messages.value.push({
      role: 'assistant',
      content: res?.data?.reply || t('aiChat.emptyReply'),
    });
  } catch (err) {
    errorText.value = apiErrorMessage(err, err?.response?.data?.error || t('aiChat.failed'));
    // Savol tarixda qoladi — qayta yuborish oson bo'lsin
  } finally {
    loading.value = false;
    scrollDown();
  }
}

function clearChat() {
  messages.value = [];
  errorText.value = '';
}

function scrollDown() {
  nextTick(() => {
    const el = scrollArea.value;
    if (el) el.scrollTop = el.scrollHeight;
  });
}
</script>

<template>
  <div class="chat-wrap">
    <div class="flex items-center q-mb-sm">
      <div class="text-h6 text-primary">
        <q-icon name="smart_toy" class="q-mr-sm" />{{ $t('aiChat.title') }}
      </div>
      <q-space />
      <q-btn
        v-if="messages.length"
        flat
        dense
        no-caps
        color="grey"
        icon="delete_sweep"
        :label="$t('aiChat.clear')"
        @click="clearChat"
      />
    </div>

    <div ref="scrollArea" class="chat-messages q-pa-md">
      <!-- Bo'sh holat: tayyor savollar -->
      <div v-if="!messages.length" class="text-center q-mt-xl">
        <q-icon name="forum" size="48px" color="grey-5" />
        <div class="text-grey-7 q-mt-sm q-mb-md">{{ $t('aiChat.hint') }}</div>
        <div class="q-gutter-sm">
          <q-btn
            v-for="s in suggestions"
            :key="s"
            outline
            no-caps
            color="primary"
            :label="s"
            @click="send(s)"
          />
        </div>
      </div>

      <div
        v-for="(m, i) in messages"
        :key="i"
        class="q-mb-md flex"
        :class="m.role === 'user' ? 'justify-end' : 'justify-start'"
      >
        <div class="bubble" :class="m.role === 'user' ? 'bubble-user' : 'bubble-ai'">
          <!-- AI javobi: xavfsiz mini-markdown (jadval/ro'yxat/qalin) -->
          <div v-if="m.role === 'assistant'" v-html="renderMarkdown(m.content)" />
          <div v-else style="white-space: pre-wrap">{{ m.content }}</div>
        </div>
      </div>

      <div v-if="loading" class="flex justify-start q-mb-md">
        <div class="bubble bubble-ai">
          <q-spinner-dots size="28px" color="primary" />
          <span class="text-grey-7 q-ml-sm">{{ $t('aiChat.thinking') }}</span>
        </div>
      </div>

      <q-banner v-if="errorText" dense rounded class="bg-red-1 text-red-10">
        <template v-slot:avatar><q-icon name="error" color="red" /></template>
        {{ errorText }}
      </q-banner>
    </div>

    <q-input
      v-model="input"
      outlined
      autogrow
      :disable="loading"
      :placeholder="$t('aiChat.placeholder')"
      @keydown.enter.exact.prevent="send()"
      class="q-mt-sm"
    >
      <template v-slot:append>
        <q-btn
          round
          dense
          flat
          color="primary"
          icon="send"
          :disable="loading || !input.trim()"
          @click="send()"
        />
      </template>
    </q-input>
  </div>
</template>

<style>
/* v-html ichidagi markdown elementlari uchun (scoped ishlamaydi) */
.bubble-ai .md-table {
  border-collapse: collapse;
  margin: 8px 0;
  width: 100%;
  font-size: 13px;
}
.bubble-ai .md-table th,
.bubble-ai .md-table td {
  border: 1px solid #ddd;
  padding: 5px 8px;
  text-align: left;
}
.bubble-ai .md-table th {
  background: #f0f4f8;
  font-weight: 600;
}
.bubble-ai .md-table tr:nth-child(even) td {
  background: #fafafa;
}
.bubble-ai .md-list {
  margin: 6px 0;
  padding-left: 20px;
}
.bubble-ai .md-heading {
  font-weight: 700;
  margin: 8px 0 4px;
}
.bubble-ai .md-gap {
  height: 8px;
}
</style>

<style scoped>
.chat-wrap {
  max-width: 900px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 140px);
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  background: #fafafa;
}

.bubble {
  max-width: 85%;
  border-radius: 12px;
  padding: 10px 14px;
  font-size: 14px;
  line-height: 1.5;
}

.bubble-user {
  background: #1976d2;
  color: #fff;
  border-bottom-right-radius: 4px;
}

.bubble-ai {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-bottom-left-radius: 4px;
}

.query-pre {
  font-size: 11px;
  background: #f5f5f5;
  border-radius: 6px;
  padding: 8px;
  overflow-x: auto;
  white-space: pre-wrap;
  margin: 4px 0 0;
}
</style>
