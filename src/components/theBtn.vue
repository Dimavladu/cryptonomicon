<template>
  <button
    :disabled="isShow"
    type="button"
    class="
      inline-flex
      items-center
      py-2
      px-4
      border border-transparent
      shadow-sm
      text-sm
      leading-4
      font-medium
      rounded-full
      text-white
      bg-gray-600
      hover:bg-gray-700
      transition-colors
      duration-300
      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500
    "
    :class="{ 'cursor-not-allowed opacity-50': isShow }"
  >
    <slot />
  </button>
</template>
<script setup>
import { defineProps } from "vue";

defineProps({
  isShow: {
    type: Boolean,
    required: false,
  },
});
</script>

<style scoped>
</style>