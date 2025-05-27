<template>
  <div class="table-container">
    <div class="table-header" v-if="pagination && pagination.total >= 0">
      <Pagination 
        :current-page="pagination.currentPage"
        :total-pages="pagination.lastPage"
        :per-page="pagination.perPage"
        :total="pagination.total"
        :from="paginationFrom"
        :to="paginationTo"
        @page-change="$emit('page-change', $event)"
        @per-page-change="$emit('per-page-change', $event)"
      />
    </div>
    
    <!-- Visualização em tabela para desktop -->
    <div class="table-responsive" v-if="!isMobile">
      <table class="fontes-pagadoras-table">
        <thead>
          <tr>
            <th @click="handleSort('nome')" class="sortable-header">
              <span class="header-text">Nome</span>
              <IconSort 
                v-if="props.sortBy === 'nome'" 
                :type="props.sortDirection" 
                size="14" 
                class="sort-icon"
              />
            </th>
            <th @click="handleSort('descricao')" class="sortable-header">
              <span class="header-text">Descrição</span>
              <IconSort 
                v-if="props.sortBy === 'descricao'" 
                :type="props.sortDirection" 
                size="14" 
                class="sort-icon"
              />
            </th>
            <th @click="handleSort('ativo')" class="sortable-header">
              <span class="header-text">Status</span>
              <IconSort 
                v-if="props.sortBy === 'ativo'" 
                :type="props.sortDirection" 
                size="14" 
                class="sort-icon"
              />
            </th>
            <th @click="handleSort('data_cadastro')" class="sortable-header">
              <span class="header-text">Data de Cadastro</span>
              <IconSort 
                v-if="props.sortBy === 'data_cadastro'" 
                :type="props.sortDirection" 
                size="14" 
                class="sort-icon"
              />
            </th>
            <th class="actions-header">
              <span class="header-text">Ações</span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="fonte in fontesPagadoras" :key="fonte.id" class="table-row">
            <td>{{ fonte.nome }}</td>
            <td>{{ fonte.descricao || '-' }}</td>
            <td>
              <span 
                class="status-badge" 
                :class="{ 'active': fonte.ativo, 'inactive': !fonte.ativo }"
                
              >
                {{ fonte.ativo ? 'Ativo' : 'Inativo' }}
              </span>
            </td>
            <td>{{ formatDate(fonte.data_cadastro || fonte.created_at) }}</td>
            <td class="actions-cell">
              <div class="action-buttons">
                <button
                  class="action-button edit-button"
                  @click="handleEdit(fonte.id)"
                  title="Editar"
                >
                  <IconEdit size="16" />
                </button>
                <button
                  class="action-button delete-button"
                  @click="handleDelete(fonte.id)"
                  title="Excluir"
                >
                  <IconDelete size="16" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- Visualização em cards para mobile -->
    <div class="mobile-cards" v-if="isMobile">
      <div v-for="fonte in fontesPagadoras" :key="fonte.id" class="mobile-card">
        <div class="mobile-card-header">
          <div class="mobile-card-title">{{ fonte.nome }}</div>
          <span 
            class="status-badge" 
            :class="{ 'active': fonte.ativo, 'inactive': !fonte.ativo }"
            
          >
            {{ fonte.ativo ? 'Ativo' : 'Inativo' }}
          </span>
        </div>
        
        <div class="mobile-card-content">
          <div class="mobile-card-item" v-if="fonte.descricao">
            <div class="mobile-card-label">Descrição:</div>
            <div class="mobile-card-value">{{ fonte.descricao }}</div>
          </div>
          
          <div class="mobile-card-item">
            <div class="mobile-card-label">Data de Cadastro:</div>
            <div class="mobile-card-value">{{ formatDate(fonte.data_cadastro || fonte.created_at) }}</div>
          </div>
        </div>
        
        <div class="mobile-card-actions">
          <button class="mobile-card-button edit" @click="handleEdit(fonte.id)" title="Editar">
            <IconEdit size="20" />
            <span>Editar</span>
          </button>
          <button class="mobile-card-button delete" @click="handleDelete(fonte.id)" title="Excluir">
            <IconDelete size="20" />
            <span>Excluir</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { FontePagadora, PaginationLinks } from '@/types/fontePagadora.types'
import Pagination from '@/components/common/Pagination.vue'
import IconSort from '@/components/icons/IconSort.vue'
// IconEllipsis import removed
import IconEdit from '@/components/icons/IconEdit.vue'
import IconDelete from '@/components/icons/IconDelete.vue'

interface PaginationInfo {
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
  links: PaginationLinks | null;
}

interface Props {
  fontesPagadoras: FontePagadora[];
  pagination?: PaginationInfo | null;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'page-change', page: number): void;
  (e: 'per-page-change', perPage: number): void;
  (e: 'sort', field: string): void;
  (e: 'edit', fonteId: number): void;
  (e: 'delete', fonteId: number): void;
  
}>()

// Estado para controlar a visualização mobile/desktop
const isMobile = ref(false)

// Função para verificar o tamanho da tela
const checkScreenSize = () => {
  isMobile.value = window.innerWidth <= 767
}

// Adicionar e remover os listeners quando o componente é montado/desmontado
onMounted(() => {
  // document.removeEventListener('click', closeMenuOnClickOutside) // Listener removed
  
  // Verificar o tamanho da tela inicialmente
  checkScreenSize()
  
  // Adicionar listener para redimensionamento da janela
  window.addEventListener('resize', checkScreenSize)
})

onUnmounted(() => {
  // document.removeEventListener('click', closeMenuOnClickOutside) // Listener removed
  window.removeEventListener('resize', checkScreenSize)
})

// Ações
const handleEdit = (fonteId: number) => {
  emit('edit', fonteId)
  // activeMenu.value = null // activeMenu removed
}

const handleDelete = (fonteId: number) => {
  emit('delete', fonteId)
  // activeMenu.value = null // activeMenu removed
}

// const toggleStatus = (fonteId: number, ativo: boolean) => {
//   emit('toggle-status', fonteId, ativo)
// } // Function removed

const handleSort = (field: string) => {
  emit('sort', field)
}

// Calculate pagination info for display
const paginationFrom = computed(() => {
  if (!props.pagination) return 0
  return (props.pagination.currentPage - 1) * props.pagination.perPage + 1
})

const paginationTo = computed(() => {
  if (!props.pagination) return 0
  return Math.min(
    props.pagination.currentPage * props.pagination.perPage,
    props.pagination.total
  )
})

const formatDate = (dateString: string): string => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('pt-BR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}
</script>

<style scoped>
.table-container {
  width: 100%;
}

.table-header {
  margin-bottom: 0.5rem;
}

.table-responsive {
  overflow-x: auto;
  position: relative;
}

.fontes-pagadoras-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background-color: white;
  border-radius: 0.375rem;
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
}

.fontes-pagadoras-table th,
.fontes-pagadoras-table td {
  padding: 0.75rem 1rem;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
  color: #1f2937; /* Texto mais escuro para melhor legibilidade */
  vertical-align: middle;
}

.fontes-pagadoras-table th {
  font-weight: 600;
  font-size: 0.875rem;
  color: #4b5563; /* Cinza mais escuro para melhor contraste */
  background-color: #f9fafb;
  white-space: nowrap;
  position: relative;
}

.fontes-pagadoras-table th:first-child {
  border-top-left-radius: 0.375rem;
}

.fontes-pagadoras-table th:last-child {
  border-top-right-radius: 0.375rem;
}

.fontes-pagadoras-table tbody tr:last-child td {
  border-bottom: none;
}

.fontes-pagadoras-table tbody tr:last-child td:first-child {
  border-bottom-left-radius: 0.375rem;
}

.fontes-pagadoras-table tbody tr:last-child td:last-child {
  border-bottom-right-radius: 0.375rem;
}

.sortable-header {
  cursor: pointer;
  user-select: none;
  position: relative;
  padding-right: 1.5rem;
  width: auto;
}

.header-text {
  display: inline-block;
  padding-right: 0.5rem;
}

.sort-icon {
  opacity: 0.6;
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
}

.status-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer; /* Kept as it was, though click handler is removed */
}

.status-badge.active {
  background-color: #dcfce7;
  color: #166534;
}

.status-badge.inactive {
  background-color: #fee2e2;
  color: #991b1b;
}

.actions-cell {
  width: 60px; 
  text-align: center; 
}

.actions-header {
  text-align: center;
  width: 60px;
}

/* Styles for new desktop action buttons */
.action-buttons {
  display: flex;
  gap: 0; 
  justify-content: center; 
}

.action-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;
  border-radius: 4px;
  color: #6b7280; 
  transition: all 0.2s;
  display: inline-flex; 
  align-items: center;
  justify-content: center;
  width: 2rem; 
  height: 2rem; 
}

.action-button.edit-button:hover {
  background-color: #dbeafe; 
  color: #1e40af;      
}

.action-button.delete-button:hover {
  background-color: #fee2e2; 
  color: #b91c1c;      
}

.action-button ::v-deep(svg) {
  width: 1rem;  
  height: 1rem; 
}

/* Styles for mobile card view action buttons */
@media (max-width: 767px) {
  .mobile-cards {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-top: 0.5rem;
  }
  
  .mobile-card {
    background-color: white;
    border-radius: 0.375rem;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
    padding: 1rem;
  }
  
  .mobile-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
  }
  
  .mobile-card-title {
    font-weight: 600;
    font-size: 1rem;
    color: #111827;
  }
  
  .mobile-card-content {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
  }
  
  .mobile-card-item {
    display: flex;
    justify-content: space-between;
  }
  
  .mobile-card-label {
    font-size: 0.875rem;
    color: #6b7280;
    font-weight: 500;
  }
  
  .mobile-card-value {
    font-size: 0.875rem;
    color: #1f2937;
    font-weight: 500;
    text-align: right;
  }
  
  .mobile-card-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    margin-top: 0.75rem;
    border-top: 1px solid #e5e7eb;
    padding-top: 0.75rem;
  }
  
  .mobile-card-button {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.375rem 0.75rem;
    border-radius: 0.375rem;
    font-size: 0.75rem; /* For the span */
    font-weight: 600;
    cursor: pointer;
    background-color: #f3f4f6; /* Base background */
    color: #1f2937; /* Base text color */
    border: none;
  }

  .mobile-card-button ::v-deep(svg) {
    width: 1.25rem; /* 20px */
    height: 1.25rem; /* 20px */
  }
  
  .mobile-card-button.edit {
    background-color: #e0e7ff;
    color: #4f46e5;
  }
  
  .mobile-card-button.delete {
    background-color: #fee2e2;
    color: #dc2626;
  }
}
</style>
