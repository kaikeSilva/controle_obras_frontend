<template>
  <div class="stat-card">
    <div class="stat-header">
      <div class="stat-title">{{ title }}</div>
      <div class="stat-icon">
        <component :is="resolveIcon" :size="20" />
      </div>
    </div>
    <div class="stat-value">{{ value }}</div>
    <div v-if="change" class="stat-change" :class="changeClass">
      <span>{{ change.direction }}</span> {{ change.value }} vs mês anterior
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import IconCircleCheck from '@/components/icons/IconCircleCheck.vue'
import IconMoney from '@/components/icons/IconMoney.vue'
import IconPlus from '@/components/icons/IconPlus.vue'
import IconCalendar from '@/components/icons/IconCalendar.vue'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  value: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  change: {
    type: Object,
    required: true,
    validator: (value: any) => {
      return value.direction && value.value && value.isPositive !== undefined
    }
  }
})

// Computar a classe CSS com base na direção da mudança
const changeClass = computed(() => {
  return {
    'change-positive': props.change.isPositive,
    'change-negative': !props.change.isPositive
  }
})

// Resolver o componente de ícone com base no nome do ícone
const resolveIcon = computed(() => {
  const iconMap: Record<string, any> = {
    'IconCircleCheck': IconCircleCheck,
    'IconMoney': IconMoney,
    'IconPlus': IconPlus,
    'IconCalendar': IconCalendar
  }
  
  return iconMap[props.icon] || IconCircleCheck
})
</script>

<style scoped lang="scss">
.stat-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px;
  transition: all 0.2s ease;
  
  @include dark-mode {
    background: #1e1e1e;
    border-color: #333;
  }
  
  &:hover {
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    border-color: #cbd5e1;
    
    @include dark-mode {
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
      border-color: #444;
    }
  }
}

.stat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.stat-title {
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  
  @include dark-mode {
    color: #94a3b8;
  }
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  color: #94a3b8;
  
  @include dark-mode {
    color: #64748b;
  }
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 6px;
  
  @include dark-mode {
    color: #f1f1f1;
  }
}

.stat-change {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  font-weight: 500;
}

.change-positive {
  color: #059669;
  
  @include dark-mode {
    color: #10b981;
  }
}

.change-negative {
  color: #dc2626;
  
  @include dark-mode {
    color: #ef4444;
  }
}
</style>
