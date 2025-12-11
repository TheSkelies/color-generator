<template>
  <section class="palette-generator">
    <div class="controls">
      <div class="control-group">
        <label>Количество цветов:</label>
        <select v-model="colorCount">
          <option value="3">3</option>
          <option value="5">5</option>
          <option value="7">7</option>
        </select>
      </div>

      <div class="control-group">
        <label>Формат:</label>
        <select v-model="colorFormat">
          <option value="hex">HEX</option>
          <option value="rgb">RGB</option>
        </select>
      </div>



      <button class="generate-btn" @click="generatePalette">
        Создать градиент
      </button>


      <button class="generate-btn" @click="generateRandomPalette">
        🎲 Случайная палитра
      </button>

      <div class="control-group base-color-group">
        <label for="base-color">Базовый цвет:</label>
        <input
            id="base-color"
            type="color"
            v-model="baseColorHex"
            title="Выберите базовый цвет"
        >
      </div>


      <button class="generate-btn" @click="generatePaletteOnBaseColor">
        Палитра на основе цвета
      </button>

      <button class="save-palette-btn"
              @click="savePalette"
              :disabled="!currentColors.length">
        💾 Сохранить палитру
      </button>
    </div>

    <div>
      <button class="nav-button"
              @click="isDarkTheme = false"
              :class="{ active: isDarkTheme === false }">
        ☀️ Светлая
      </button>
      <button class="nav-button"
              @click="isDarkTheme = true"
              :class="{ active: isDarkTheme === true }">
        🌙 Тёмная
      </button>
    </div>

    <div v-if="pinnedColors.length" class="pinned-colors">
      <h3>Закреплённые цвета</h3>
      <div class="colors-container">
        <ColorCard v-for="(c,i) in pinnedColors"
                   :key="'p-'+i"
                   :color="c"
                   :format="colorFormat"
                   pinned
                   @copy="copyToClipboard"
                   @remove="unpinColor(i)" />
      </div>
    </div>

    <div v-if="currentColors.length">
      <h3>Текущая палитра</h3>
      <div class="colors-container">
        <ColorCard v-for="(c,i) in currentColors"
                   :key="i"
                   :color="c"
                   :format="colorFormat"
                   @copy="copyToClipboard"
                   @pin="pinColor(c)" />
      </div>
    </div>

    <div v-if="showNotification" class="notification">
      Цвет скопирован!
    </div>
  </section>
</template>

<script setup>
import ColorCard from "./ColorCard.vue";
import { usePalette } from "@/jsLogic/usePalette";

const {
  colorCount,
  colorFormat,
  currentColors,
  pinnedColors,
  showNotification,
  generatePalette,
  copyToClipboard,
  pinColor,
  unpinColor,
  savePalette,
  generatePaletteOnBaseColor,
  baseColorHex,
  generateRandomPalette,
    isDarkTheme,
} = usePalette();
</script>
