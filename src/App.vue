<template>
  <div id="app" :class="{ 'dark-theme': isDarkTheme }">
    <header class="app-header">
      <h1>Палитры цветов</h1>
      <p>Создаём случайные и сочетающиеся палитры цветов</p>
    </header>

    <nav class="navigation">
      <button class="nav-button"
              @click="currentExample = 'generator'"
              :class="{ active: currentExample === 'generator' }">
        Генератор палитр
      </button>

      <button class="nav-button"
              @click="currentExample = 'saved'"
              :class="{ active: currentExample === 'saved' }">
        Сохранённые палитры
      </button>



    </nav>

    <main class="main-content">
      <PaletteGenerator v-if="currentExample === 'generator'" />

      <SavedPalettes v-if="currentExample === 'saved'" />
    </main>

    <footer class="app-footer">
      <p>Палитры цветов</p>
    </footer>
  </div>
</template>

<script setup>
import { ref } from "vue";
import PaletteGenerator from "./components/PaletteGenerator.vue";
import SavedPalettes from "./components/SavedPalettes.vue";
import { usePalette } from "@/jsLogic/usePalette";

const currentExample = ref("generator");
const { isDarkTheme } = usePalette();
</script>