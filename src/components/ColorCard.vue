<template>
  <div class="color-card" :style="{ backgroundColor: color.hex }" @click="copy">
    <div class="color-info">
      <span>{{ format === 'hex' ? color.hex : color.rgb }}</span>
      <span v-if="pinned" class="pin-icon">📌</span>
    </div>

    <button v-if="pinned"
            class="unpin-btn"
            @click.stop="$emit('remove')">✕</button>

    <button v-else
            class="pin-btn"
            @click.stop="$emit('pin')">📌</button>
  </div>
</template>

<script setup>
const props = defineProps({
  color: Object,
  format: String,
  pinned: Boolean
});

const emit = defineEmits(["copy", "pin", "remove"]);

const copy = () => emit("copy", props.color);
</script>
