<template>
  <div class="example-details-container"> 
    <div v-if="loading" class="loading-container">
      <LoadingSpinner />
    </div>
    <div v-else-if="error" class="error-container">
      <ErrorMessage :message="error" />
    </div>
    <div v-else-if="item" class="example-details"> 
      <!-- Abas de Navegação -->
      <div class="tabs">
        <div class="tab active">Dados Gerais</div>
        <div class="tab">Outra Aba Exemplo</div> 
      </div>

      <div class="tab-content">
        <!-- Cabeçalho do Item -->
        <div class="example-header"> 
          <div class="example-header-main"> 
            <h2 class="example-name">{{ item.nome }}</h2> 
            <div class="example-actions"> 
              <button @click="handleEdit" class="action-button edit-button">
                <IconEdit class="icon" />
                Editar Item 
              </button>
              <button @click="showDeleteConfirm = true" class="action-button delete-button">
                <IconTrash class="icon" />
                Excluir Item 
              </button>
            </div>
          </div>
          <div class="example-meta"> 
            <span class="meta-item">ID: {{ item.id }}</span>
            <span class="meta-item">Data Chave: {{ formatDate(item.data_chave) }}</span> 
            <span v-if="item.categoria" class="meta-item">Categoria: {{ item.categoria }}</span> 
          </div>
        </div>

        <!-- Conteúdo da Aba Dados Gerais -->
        <div class="data-section">
          <h3 class="section-title">Informações do Item</h3> 
          <div class="data-grid responsive-grid"> 
            <div class="data-item"><span class="data-label">ID:</span> {{ item.id }}</div>
            <div class="data-item"><span class="data-label">Descrição:</span> {{ item.descricao }}</div>
            <div class="data-item"><span class="data-label">Local:</span> {{ item.local || '-' }}</div> 
            <div class="data-item"><span class="data-label">Status:</span> <span :class="`status-badge status-${item.status?.toLowerCase()}`">{{ item.status || '-' }}</span></div>
            <div class="data-item"><span class="data-label">Data Chave:</span> {{ formatDate(item.data_chave) }}</div>
            <div class="data-item"><span class="data-label">Data Secundária:</span> {{ formatDate(item.data_secundaria) }}</div> 
            <div class="data-item"><span class="data-label">Data de Conclusão:</span> {{ item.data_conclusao ? formatDate(item.data_conclusao) : '-' }}</div>
            <div class="data-item"><span class="data-label">Valor:</span> {{ formatCurrency(item.valor) }}</div> 
            <div class="data-item"><span class="data-label">Categoria:</span> {{ item.categoria || '-' }} (ID: {{ item.categoria_id }})</div> 
            <div class="data-item"><span class="data-label">Responsável:</span> {{ item.responsavel_nome || '-' }} (ID: {{ item.responsavel_id }})</div> 
            <div class="data-item"><span class="data-label">Criado em:</span> {{ formatDate(item.created_at) }}</div>
            <div class="data-item"><span class="data-label">Atualizado em:</span> {{ formatDate(item.updated_at) }}</div>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="empty-state">
      <p>Nenhum item para exibir.</p> 
    </div>

    <ConfirmationModal
      :show="showDeleteConfirm"
      title="Excluir Item" 
      :message="`Tem certeza que deseja excluir o item '${item?.nome}'? Esta ação não pode ser desfeita.`" 
      confirmText="Excluir"
      cancelText="Cancelar"
      @close="showDeleteConfirm = false"
      @confirm="handleDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router'; 
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import ErrorMessage from '@/components/common/ErrorMessage.vue';
import IconEdit from '@/components/icons/IconEdit.vue';
import IconTrash from '@/components/icons/IconTrash.vue';
import ConfirmationModal from '@/components/common/ConfirmationModal.vue';
import { useNotificationStore } from '@/stores/notificationStore';
import { formatDate, formatCurrency } from '@/utils/formatters';

interface ExampleItem {
  id: number;
  nome: string;
  descricao: string;
  local?: string;
  status?: string;
  data_chave: string; 
  data_secundaria?: string; 
  data_conclusao?: string;
  valor?: number;
  categoria?: string;
  categoria_id?: number;
  responsavel_nome?: string;
  responsavel_id?: number;
  created_at: string;
  updated_at: string;
}

const router = useRouter();
const notificationStore = useNotificationStore();

const item = ref<ExampleItem | null>(null); 
const loading = ref(true);
const error = ref<string | null>(null);
const showDeleteConfirm = ref(false);

const mockItemData: ExampleItem = {
  id: 1,
  nome: 'Item de Exemplo Detalhado',
  descricao: 'Esta é uma descrição detalhada para o item de exemplo, demonstrando como os dados podem ser apresentados.',
  local: 'Localização Fictícia, 123',
  status: 'Em Andamento',
  data_chave: new Date().toISOString(),
  data_secundaria: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString(),
  data_conclusao: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString(),
  valor: 12345.67,
  categoria: 'Categoria Exemplo',
  categoria_id: 101,
  responsavel_nome: 'Usuário Exemplo',
  responsavel_id: 202,
  created_at: new Date(new Date().setDate(new Date().getDate() - 10)).toISOString(),
  updated_at: new Date().toISOString(),
};

onMounted(() => {
  loading.value = true;
  error.value = null;
  setTimeout(() => {
    item.value = mockItemData;
    loading.value = false;
  }, 1000); 
});

const handleEdit = () => {
  if (item.value?.id) {
    notificationStore.addNotification(`Ação 'Editar' para o item '${item.value.nome}'.`, 'info');
  }
};

const handleDelete = async () => {
  if (!item.value?.id) return;
  notificationStore.addNotification(
    `Item '${item.value?.nome}' excluído (simulação)!`,
    'success'
  );
  showDeleteConfirm.value = false;
  setTimeout(() => {
    item.value = null; 
    error.value = "Item foi 'removido'. Recarregue para ver o mock novamente.";
  }, 500);
};

</script>

<style scoped lang="scss">
.example-details-container {
  width: 100%; 
  padding: $spacing-lg;
  background-color: $background-light;
  border-radius: $border-radius;
  box-shadow: $shadow-sm;
}

.loading-container,
.error-container,
.empty-state {
  @include center-flex;
  flex-direction: column;
  padding: $spacing-xl;
  min-height: 300px;
  text-align: center;
}

.tabs {
  display: flex;
  border-bottom: 1px solid $border-color;
  margin-bottom: $spacing-lg;

  .tab {
    padding: $spacing-md $spacing-lg;
    cursor: pointer;
    color: $text-gray;
    border-bottom: 2px solid transparent;
    transition: all 0.3s ease;

    &.active {
      color: $primary-color;
      border-bottom-color: $primary-color;
      font-weight: 600;
    }

    &:hover {
      color: $primary-color-dark;
    }
  }
}

.example-header {
  margin-bottom: 0; 
  padding-bottom: $spacing-sm; 
  border-bottom: 1px solid $border-color;
}

.example-header-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-sm;

  @media (max-width: $mobile-max) {
    flex-direction: column;
    align-items: flex-start;
    gap: $spacing-md; // Space between title and actions block
  }
}

.example-name {
  font-size: $font-size-xl;
  color: $text-color-dark;
  font-weight: 600;
  margin: 0;
}

.example-actions {
  display: flex;
  gap: $spacing-md;

  @media (max-width: $mobile-max) {
    width: 100%; // Make action buttons container take full width
  }

  .action-button {
    padding: $spacing-sm $spacing-md;
    font-size: $font-size-base;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: $spacing-xs;
    border: none;
    border-radius: $border-radius;
    cursor: pointer;
    transition: background-color $transition-speed;

    .icon {
      width: 16px;
      height: 16px;
    }

    &.edit-button {
      background-color: $primary-color;
      color: white;

      &:hover {
        background-color: $primary-color-dark;
      }
    }

    &.delete-button {
      background-color: $error-color;
      color: white;

      &:hover {
        background-color: $error-color-dark;
      }
    }
  }
}

.example-meta {
  display: flex;
  gap: $spacing-lg;
  font-size: $font-size-sm;
  color: $text-gray;

  .meta-item {
    // Styles for each metadata item, if necessary
  }
}

.tab-content {
  // Styles for the tab content container, if necessary
}

.data-section {
  background-color: $color-white; 
  padding: $spacing-lg;
  border-radius: $border-radius-sm;
}

.section-title {
  font-size: $font-size-lg;
  color: $text-color-dark;
  margin-bottom: $spacing-md;
  padding-bottom: $spacing-sm;
  border-bottom: 1px solid $border-color;
}

.data-grid {
  display: grid;
  gap: $spacing-md;

  &.responsive-grid {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  }
}

.data-item {
  background-color: $bg-gray-light;
  padding: $spacing-sm $spacing-md; 
  border-radius: $border-radius-sm;
  font-size: $font-size-base;
  color: $text-color-dark;
  display: flex; 
  align-items: center;
}

.data-label {
  font-weight: $font-weight-semibold;
  color: $text-gray-dark;
  margin-right: $spacing-xs;
  white-space: nowrap; 
}

.status-badge {
  padding: 3px $spacing-xs;
  border-radius: $border-radius-sm;
  font-size: $font-size-sm * 0.9;
  font-weight: $font-weight-semibold;
  text-transform: capitalize;
}

.status-planejada, .status-planned {
  background-color: $status-planned-bg; 
  color: $status-planned-text;
}

.status-em_andamento, .status-in_progress {
  background-color: $status-in-progress-bg; 
  color: $status-in-progress-text;
}

.status-concluida, .status-completed {
  background-color: $status-completed-bg; 
  color: $status-completed-text;
}

.status-cancelada, .status-cancelled {
  background-color: $status-cancelled-bg; 
  color: $status-cancelled-text;
}

.status-pendente, .status-pending {
  background-color: $status-pending-bg; 
  color: $status-pending-text;
}
</style>
