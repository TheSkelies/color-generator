<template>
  <section class="saved-palettes">
    <h2>Сохранённые палитры</h2>

    <div v-if="savedPalettes.length" class="palettes-list">
      <div v-for="(p,i) in savedPalettes" :key="i" class="palette-item">
        <div class="palette-header">
          <h3>Палитра #{{ i + 1 }}</h3>
          <button class="delete-palette-btn" @click="deletePalette(i)">
            Удалить
          </button>
        </div>

        <div class="colors-container">
          <ColorCard v-for="(c,j) in p.colors"
                     :key="j"
                     :color="c"
                     :format="colorFormat"
                     @copy="copyToClipboard" />
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <p>Пока нет сохранённых палитр</p>
    </div>

    <div v-if="showNotification" class="notification">
      Цвет скопирован!
    </div>
  </section>
</template>

<script setup>
import ColorCard from "./ColorCard.vue";
import { usePalette } from "../composables/usePalette";

const {
  savedPalettes,
  colorFormat,
  copyToClipboard,
  deletePalette,
  showNotification
} = usePalette();
</script>
