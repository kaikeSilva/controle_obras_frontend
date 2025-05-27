<template>
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      :width="size" 
      :height="size" 
      :viewBox="viewBox"
      fill="currentColor"
      :class="className"
    >
        <g id="Layer1">
            <path d="M27,3c-0,-0.552 -0.448,-1 -1,-1l-20,0c-0.552,0 -1,0.448 -1,1l-0,26c0,0.552 0.448,1 1,1l20,0c0.552,0 1,-0.448 1,-1l-0,-26Zm-2,1l-0,24c-0,0 -18,0 -18,0c-0,-0 -0,-24 -0,-24l18,0Zm-9,10c-3.311,0 -6,2.689 -6,6c-0,3.311 2.689,6 6,6c3.311,0 6,-2.689 6,-6c-0,-3.311 -2.689,-6 -6,-6Zm-1,2.126c-1.724,0.445 -3,2.012 -3,3.874c-0,2.208 1.792,4 4,4c1.862,0 3.429,-1.276 3.874,-3l-3.874,0c-0.552,0 -1,-0.448 -1,-1l0,-3.874Zm-2,-4.126l6,0c0.552,0 1,-0.448 1,-1c0,-0.552 -0.448,-1 -1,-1l-6,0c-0.552,0 -1,0.448 -1,1c0,0.552 0.448,1 1,1Zm-2,-4l10,0c0.552,0 1,-0.448 1,-1c0,-0.552 -0.448,-1 -1,-1l-10,0c-0.552,0 -1,0.448 -1,1c0,0.552 0.448,1 1,1Z"/>
        </g>
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
