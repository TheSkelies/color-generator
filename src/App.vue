<template>
  <div id="app" :class="{ 'dark-theme': isDarkTheme }">
    <header class="app-header">
      <h1>Палитры цветов</h1>
      <p>Создаём случайные и сочетающиеся палитры цветов</p>
    </header>

    <nav class="navigation">
      <button class="nav-button" @click="currentExample = 'generator'"
              :class="{ active: currentExample === 'generator' }">
        Генератор палитр
      </button>
      <button class="nav-button" @click="currentExample = 'saved'"
              :class="{ active: currentExample === 'saved' }">
        Сохранённые палитры
      </button>
    </nav>

    <main class="main-content">
      <section v-if="currentExample === 'generator'" class="palette-generator">
        <div class="controls">
          <div class="control-group">
            <label for="colorCount">Количество цветов:</label>
            <select id="colorCount" v-model="colorCount">
              <option value="3">3 цвета</option>
              <option value="5">5 цветов</option>
              <option value="7">7 цветов</option>
            </select>
          </div>

          <div class="control-group">
            <label for="format">Формат отображения:</label>
            <select id="format" v-model="colorFormat">
              <option value="hex">HEX</option>
              <option value="rgb">RGB</option>
            </select>
          </div>

          <div class="control-group">
            <label for="theme">Тема:</label>
            <select id="theme" v-model="isDarkTheme">
              <option :value="false">☀️ Светлая</option>
              <option :value="true">🌙 Тёмная</option>
            </select>
          </div>

          <button class="generate-btn" @click="generatePalette">
            Случайная палитра
          </button>

          <button class="save-palette-btn" @click="saveCurrentPalette"
                  :disabled="!currentColors.length">
            Сохранить палитру
          </button>
        </div>

        <div v-if="pinnedColors.length" class="pinned-colors">
          <h3>Закреплённые цвета</h3>
          <div class="colors-container">
            <div v-for="(color, index) in pinnedColors" :key="'pinned-' + index"
                 class="color-card pinned" :style="{ backgroundColor: color.hex }"
                 @click="copyToClipboard(color)">
              <div class="color-info">
                <span v-if="colorFormat === 'hex'">{{ color.hex }}</span>
                <span v-else>{{ color.rgb }}</span>
                <span class="pin-icon">📌</span>
              </div>
              <button class="unpin-btn" @click.stop="unpinColor(index)">
                ✕
              </button>
            </div>
          </div>
        </div>

        <div class="generated-colors" v-if="currentColors.length">
          <h3>Текущая палитра</h3>
          <div class="colors-container">
            <div v-for="(color, index) in currentColors" :key="index"
                 class="color-card small" :style="{ backgroundColor: color.hex }"
                 @click="copyToClipboard(color)">
              <div class="color-info">
                <span v-if="colorFormat === 'hex'">{{ color.hex }}</span>
                <span v-else>{{ color.rgb }}</span>
              </div>
              <button class="pin-btn" @click.stop="pinColor(color)"
                      :disabled="isColorPinned(color)">
                📌
              </button>
            </div>
          </div>
        </div>

        <div v-else class="welcome-message">
          <h2>Создайте свою первую палитру!</h2>
          <p>Нажмите кнопку "Случайная палитра" для генерации гармоничных цветов</p>
        </div>

        <div v-if="showNotification" class="notification">
          Цвет скопирован в буфер обмена!
        </div>
      </section>

      <section v-else-if="currentExample === 'saved'" class="saved-palettes">
        <h2>Сохранённые палитры</h2>

        <div v-if="savedPalettes.length" class="palettes-list">
          <div v-for="(palette, index) in savedPalettes" :key="index" class="palette-item">
            <div class="palette-header">
              <h3>Палитра #{{ index + 1 }}</h3>
              <button class="delete-palette-btn" @click="deletePalette(index)">
                Удалить
              </button>
            </div>
            <div class="colors-container">
              <div v-for="(color, colorIndex) in palette.colors" :key="colorIndex"
                   class="color-card small" :style="{ backgroundColor: color.hex }"
                   @click="copyToClipboard(color)">
                <div class="color-info">
                  <span v-if="colorFormat === 'hex'">{{ color.hex }}</span>
                  <span v-else>{{ color.rgb }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="empty-state">
          <p>У вас нет сохранённых палитр</p>
          <p>Сгенерируйте и сохраните палитры в разделе "Генератор палитр"</p>
        </div>


        <div v-if="showNotification" class="notification">
          Цвет скопирован в буфер обмена!
        </div>
      </section>
    </main>

    <footer class="app-footer">
      <p>Палитры цветов</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'


const currentExample = ref('generator')
const colorCount = ref(5)
const colorFormat = ref('hex')
const isDarkTheme = ref(false)
const currentColors = ref([])
const pinnedColors = ref([])
const savedPalettes = ref([])
const showNotification = ref(false)


const generateRandomHSL = () => {
  const baseHue = Math.floor(Math.random() * 360)
  const hueVariation = 30

  const hue = (baseHue + Math.floor(Math.random() * hueVariation)) % 360
  const saturation = 40 + Math.floor(Math.random() * 40)
  const lightness = 30 + Math.floor(Math.random() * 40)

  return { h: hue, s: saturation, l: lightness }
}

const hslToHex = (h, s, l) => {
  s /= 100
  l /= 100

  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs((h / 60) % 2 - 1))
  const m = l - c / 2

  let r, g, b

  if (h >= 0 && h < 60) {
    r = c; g = x; b = 0
  } else if (h >= 60 && h < 120) {
    r = x; g = c; b = 0
  } else if (h >= 120 && h < 180) {
    r = 0; g = c; b = x
  } else if (h >= 180 && h < 240) {
    r = 0; g = x; b = c
  } else if (h >= 240 && h < 300) {
    r = x; g = 0; b = c
  } else {
    r = c; g = 0; b = x
  }

  r = Math.round((r + m) * 255)
  g = Math.round((g + m) * 255)
  b = Math.round((b + m) * 255)

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

const hslToRgb = (h, s, l) => {
  s /= 100
  l /= 100

  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs((h / 60) % 2 - 1))
  const m = l - c / 2

  let r, g, b

  if (h >= 0 && h < 60) {
    r = c; g = x; b = 0
  } else if (h >= 60 && h < 120) {
    r = x; g = c; b = 0
  } else if (h >= 120 && h < 180) {
    r = 0; g = c; b = x
  } else if (h >= 180 && h < 240) {
    r = 0; g = x; b = c
  } else if (h >= 240 && h < 300) {
    r = x; g = 0; b = c
  } else {
    r = c; g = 0; b = x
  }

  r = Math.round((r + m) * 255)
  g = Math.round((g + m) * 255)
  b = Math.round((b + m) * 255)

  return `rgb(${r}, ${g}, ${b})`
}


const generatePalette = () => {
  const colors = []
  const baseHSL = generateRandomHSL()

  for (let i = 0; i < colorCount.value; i++) {
    const hue = (baseHSL.h + i * 30) % 360
    const saturation = Math.max(30, Math.min(80, baseHSL.s + (i % 3) * 10))
    const lightness = Math.max(20, Math.min(80, baseHSL.l + (i % 2) * 15))

    const hex = hslToHex(hue, saturation, lightness)
    const rgb = hslToRgb(hue, saturation, lightness)

    colors.push({
      hex,
      rgb,
      hsl: { h: hue, s: saturation, l: lightness }
    })
  }

  currentColors.value = colors
}


const copyToClipboard = async (color) => {
  const textToCopy = colorFormat.value === 'hex' ? color.hex : color.rgb

  await navigator.clipboard.writeText(textToCopy)
  showNotification.value = true
  setTimeout(() => {
    showNotification.value = false
  }, 2000)
}


const pinColor = (color) => {
  if (!isColorPinned(color)) {
    pinnedColors.value.push({ ...color })
  }
}


const unpinColor = (index) => {
  pinnedColors.value.splice(index, 1)
}


const isColorPinned = (color) => {
  return pinnedColors.value.some(pinned =>
      pinned.hex === color.hex && pinned.rgb === color.rgb
  )
}


const saveCurrentPalette = () => {
  if (!currentColors.value.length) return

  const palette = {
    colors: [...currentColors.value],
    date: new Date()
  }

  savedPalettes.value.unshift(palette)
  saveToLocalStorage()
}


const deletePalette = (index) => {
  savedPalettes.value.splice(index, 1)
  saveToLocalStorage()
}


const saveToLocalStorage = () => {
  const data = {
    savedPalettes: savedPalettes.value,
    pinnedColors: pinnedColors.value,
    colorFormat: colorFormat.value,
    isDarkTheme: isDarkTheme.value
  }
  localStorage.setItem('colorPalettes', JSON.stringify(data))
}

const loadFromLocalStorage = () => {
  const saved = localStorage.getItem('colorPalettes')
  if (saved) {
    try {
      const data = JSON.parse(saved)
      savedPalettes.value = data.savedPalettes || []
      pinnedColors.value = data.pinnedColors || []
      colorFormat.value = data.colorFormat || 'hex'
      isDarkTheme.value = data.isDarkTheme || false
    } catch (e) {
      console.error('Ошибка загрузки данных:', e)
    }
  }
}


onMounted(() => {
  loadFromLocalStorage()
  if (currentColors.value.length === 0) {
    generatePalette()
  }
})


watch([savedPalettes, pinnedColors, colorFormat, isDarkTheme], () => {
  saveToLocalStorage()
}, { deep: true })
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f5f5f5;
  color: #333;
  line-height: 1.6;
  transition: background-color 0.3s, color 0.3s;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

#app.dark-theme {
  background-color: #1a1a1a;
  color: #f0f0f0;
}

#app.dark-theme .app-footer {
  background-color: #222;
}

#app.dark-theme .control-group select,
#app.dark-theme .color-card {
  background-color: #333;
  color: #f0f0f0;
  border-color: #555;
}


.app-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
  text-align: center;
}

.app-header h1 {
  margin-bottom: 0.5rem;
  font-size: 2.5rem;
}

.app-header p {
  opacity: 0.9;
  font-size: 1.1rem;
}


.navigation {
  display: flex;
  justify-content: center;
  gap: 1rem;
  padding: 1.5rem;
  background-color: white;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  flex-wrap: wrap;
}

.dark-theme .navigation {
  background-color: #222;
  box-shadow: 0 2px 10px rgba(0,0,0,0.3);
}

.nav-button {
  padding: 0.75rem 1.5rem;
  border: 2px solid #667eea;
  background-color: transparent;
  color: #667eea;
  border-radius: 25px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.dark-theme .nav-button {
  border-color: #8a9eff;
  color: #8a9eff;
}

.nav-button:hover {
  background-color: #667eea;
  color: white;
  transform: translateY(-2px);
}

.dark-theme .nav-button:hover {
  background-color: #8a9eff;
}

.nav-button.active {
  background-color: #667eea;
  color: white;
}

.dark-theme .nav-button.active {
  background-color: #8a9eff;
}


.main-content {
  flex: 1;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}


.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.dark-theme .controls {
  background-color: #222;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.control-group label {
  font-weight: 600;
  font-size: 0.9rem;
}

.control-group select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
  min-width: 150px;
}

.generate-btn, .save-palette-btn {
  padding: 0.75rem 1.5rem;
  background-color: #667eea;
  color: white;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s ease;
  align-self: flex-end;
  height: fit-content;
}

.dark-theme .generate-btn, .dark-theme .save-palette-btn {
  background-color: #8a9eff;
}

.generate-btn:hover, .save-palette-btn:hover:not(:disabled) {
  background-color: #5a6fd8;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.save-palette-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}


.colors-container {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 1rem;
}

.color-card {
  flex: 1;
  min-width: 180px;
  height: 150px;
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  position: relative;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.color-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0,0,0,0.15);
}

.color-card.small {
  height: 120px;
  min-width: 140px;
}

.color-card.pinned {
  border: 3px solid #ffd700;
}

.color-info {
  background-color: rgba(255, 255, 255, 0.9);
  padding: 0.75rem;
  font-family: monospace;
  font-weight: 600;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dark-theme .color-info {
  background-color: rgba(30, 30, 30, 0.9);
  color: #f0f0f0;
}

.pin-icon {
  font-size: 1.2rem;
}

.pin-btn, .unpin-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: rgba(255, 255, 255, 0.8);
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.2rem;
  transition: background-color 0.3s;
}

.dark-theme .pin-btn, .dark-theme .unpin-btn {
  background-color: rgba(30, 30, 30, 0.8);
  color: #f0f0f0;
}

.pin-btn:hover, .unpin-btn:hover {
  background-color: rgba(255, 255, 255, 1);
}

.dark-theme .pin-btn:hover, .dark-theme .unpin-btn:hover {
  background-color: rgba(50, 50, 50, 1);
}

.pin-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}


.palette-item {
  background-color: white;
  border-radius: 10px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.dark-theme .palette-item {
  background-color: #222;
}

.palette-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 1rem;
}


.dark-theme {
  color: #aaa;
}

.delete-palette-btn {
  padding: 0.5rem 1rem;
  background-color: #ff6b6b;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.delete-palette-btn:hover {
  background-color: #ff5252;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #666;
}

.dark-theme .empty-state {
  color: #aaa;
}


.welcome-message {
  text-align: center;
  padding: 4rem 2rem;
  color: #666;
}

.dark-theme .welcome-message {
  color: #aaa;
}

.welcome-message h2 {
  margin-bottom: 1rem;
  color: #333;
}

.dark-theme .welcome-message h2 {
  color: #f0f0f0;
}


.notification {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: #4CAF50;
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 5px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  animation: slideIn 0.3s ease;
  z-index: 1000;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}


.app-footer {
  background-color: #333;
  color: white;
  text-align: center;
  padding: 1rem;
  margin-top: auto;
}

</style>