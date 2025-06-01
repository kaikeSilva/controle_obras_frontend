<template>
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      :width="size" 
      :height="size" 
      :viewBox="viewBox"
      fill="currentColor"
      :class="className"
    >
      <!-- SVG path for example icon -->
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
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
  