<template>
  <header class="app-header" :class="{ 'sidebar-collapsed': layoutStore.isSidebarCollapsed }">
    <button class="menu-toggle" 
    @click="handleMenuToggle">
      <IconBars :size="24" />
    </button>
    
    <div class="header-title">
      <h1>
        {{ currentContext?.name }}
      </h1>
      <span>{{ currentContext?.description }}</span>
    </div>
    
    <div class="header-actions">      
      <span class="user-name">{{ userStore.userName }}</span>
      <img 
        :src="userStore.userAvatar" 
        :alt="userStore.userName"
        class="user-avatar"
      >

    </div>
  </header>
</template>

<script setup lang="ts">
import { useLayoutStore } from '@/stores/layout'
import { useUserStore } from '@/stores/user'
import IconBars from '@/components/icons/IconBars.vue'
import IconSun from '@/components/icons/IconSun.vue'
import IconMoon from '@/components/icons/IconMoon.vue'
import IconSignOut from '@/components/icons/IconSignOut.vue'
import IconSupport from '@/components/icons/IconSupport.vue'
import { useBreadcrumbStore } from '@/stores/breadcrumbStore'
import { storeToRefs } from 'pinia'


const layoutStore = useLayoutStore()
const userStore = useUserStore()
const breadcrumbStore = useBreadcrumbStore()

const { currentContext } = storeToRefs(breadcrumbStore)

function handleMenuToggle() {
  if (window.innerWidth <= 768) {
    layoutStore.toggleSidebar()
  } else {
    layoutStore.toggleSidebarCollapse()
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/variables';
@import '@/styles/mixins';

.app-header {
  height: $header-height;
  background: white;
  display: flex;
  align-items: center;
  padding: 0 1rem;
  box-shadow: $shadow-sm;
  position: fixed;
  width: calc(100% - $sidebar-width);
  top: 0;
  right: 0;
  left: $sidebar-width;
  z-index: 100;
  transition: all 0.3s ease;
  
  &.sidebar-collapsed {
    width: calc(100% - $sidebar-collapsed-width);
    left: $sidebar-collapsed-width;
  }

  .menu-toggle {
    display: none;
  }

  @include dark-mode {
    background: #1e1e1e;
    color: white;
  }

  @include mobile-only {
    left: 0;
    width: 100%;

    .menu-toggle {
      display: block;
    }
  }
}

.menu-toggle,
.theme-toggle,
.logout-btn {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: background-color $transition-speed;
  color: #333; /* Cor mais escura para os ícones */
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
    
    @include dark-mode {
      background-color: rgba(255, 255, 255, 0.1);
    }
  }
}

.header-title {
  flex: 1;
  margin-left: 1rem;
  
  h1 {
    color: #111;
    font-weight: 700;
    font-size: 1.25rem;
  }
  
  p {
    color:rgb(59, 61, 65);
    font-weight: 500;
    font-size: 0.95rem;
  }
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-name {
  @include mobile-only {
    display: none;
  }
  color: #222;
  font-weight: 600;
  font-size: 0.95rem;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
}
</style>
