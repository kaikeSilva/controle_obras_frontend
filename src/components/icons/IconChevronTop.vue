<template>
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    :width="size" 
    :height="size" 
    :viewBox="viewBox"
    fill="currentColor"
    :class="className"
  >
    <!-- SVG path for chevron-top icon -->
    <path fill-rule="evenodd" d="M5.23 12.79a.75.75 0 001.06-.02L10 8.832l3.71 3.938a.75.75 0 001.08-1.04l-4.25-4.5a.75.75 0 00-1.08 0l-4.25 4.5a.75.75 0 00-.02 1.06z" clip-rule="evenodd" />
  </svg>
</template>

<script setup lang="ts">
interface Props {
  size?: string | number
  viewBox?: string
  className?: string
}

withDefaults(defineProps<Props>(), {
  size: 20,
  viewBox: '0 0 24 24',
  className: ''
})
</script>
