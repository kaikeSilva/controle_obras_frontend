import { createRouter, createWebHistory } from 'vue-router'
import AppLayout from '@/components/layout/AppLayout.vue'
import ClientsView from '@/views/clients/ClientsView.vue'
import LoginView from '@/views/LoginView.vue'
import { useAuthStore } from '@/stores/auth'
import type { BreadcrumbItem } from '@/types/breadcrumb.types'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { requiresAuth: false }
    },
    {
      path: '/',
      component: AppLayout,
      meta: { 
        name: 'home',
        requiresAuth: true,
        breadcrumb: "Clientes",
        description: "Gerencie seus clientes aqui"
      },
      children: [
        {
          path: '',
          redirect: '/dashboard',
          meta: {
            title: 'Home',
            breadcrumb: "Dashboard"
          }
        },
        {
          path: 'dashboard',
          name: 'dashboard',
          component: () => import('../views/dashboard/DashboardView.vue'),
          meta: {
            title: 'Dashboard',
            description: 'Informações do seu negócio',
            breadcrumb: "Dashboard"
          }
        },
        {
          path: 'obras',
          name: 'obras',
          component: () => import('../views/obras/ObrasView.vue'),
          meta: {
            title: 'Obras',
            description: 'Gerencie suas obras aqui',
            breadcrumb: "Obras"
          }
        },
        {
          path: 'gastos',
          name: 'gastos',
          component: () => import('../views/gastos/GastosView.vue'),
          meta: {
            title: 'Gastos',
            description: 'Gerencie seus gastos aqui',
            breadcrumb: "Gastos"
          }
        },
        {
          path: 'gastos/novo/:obra_id?',
          name: 'new-gasto',
          component: () => import('../views/gastos/GastoFormView.vue'),
          props: route => ({ obraId: route.params.obra_id ? Number(route.params.obra_id) : null }),
          meta: {
            title: 'Novo Gasto',
            description: 'Crie um novo gasto aqui',
            breadcrumb: "Novo Gasto"
          }
        },
        {
          path: 'gastos/:id/editar',
          name: 'edit-gasto',
          component: () => import('../views/gastos/GastoFormView.vue'),
          meta: {
            title: 'Editar Gasto',
            description: 'Edite um gasto aqui',
            breadcrumb: "Editar Gasto",
            requiresAuth: true
          }
        },
        {
          path: 'categorias-gastos',
          name: 'categorias-gastos',
          component: () => import('../views/categoriasGastos/CategoriasGastosView.vue'),
          meta: {
            title: 'Categorias de Gastos',
            description: 'Gerencie suas categorias de gastos aqui',
            breadcrumb: "Categorias de Gastos"
          }
        },
        {
          path: 'obras/novo/:cliente_id?',
          name: 'new-obra',
          component: () => import('../views/obras/ObraFormView.vue'),
          props: route => ({ clienteId: route.params.cliente_id ? Number(route.params.cliente_id) : null }),
          meta: {
            title: 'Nova Obra',
            description: 'Crie uma nova obra aqui',
            breadcrumb: "Nova Obra"
          }
        },
        {
          path: 'obras/:id/editar',
          name: 'edit-obra',
          component: () => import('../views/obras/ObraFormView.vue'),
          meta: {
            title: 'Editar Obra',
            description: 'Edite uma obra aqui',
            breadcrumb: "Editar Obra",
            requiresAuth: true
          }
        },
        {
          path: 'obras/:id',
          name: 'obra-details',
          component: () => import('@/views/obras/ObraDetailsView.vue'),
          meta: {
            title: 'Detalhes da Obra',
            description: 'Veja os detalhes de uma obra aqui',
            breadcrumb: "Detalhes da Obra",
            requiresAuth: true
          }
        },
        {
          path: 'obras/:id/relatorio',
          name: 'obra-report',
          component: () => import('../views/obras/ObraReportView.vue'),
          meta: {
            title: 'Relatório da Obra',
            description: 'Visualize o relatório financeiro da obra',
            breadcrumb: "Relatório da Obra",
            requiresAuth: true
          }
        },
        {
          path: 'categorias-gastos/novo/:cliente_id?',
          name: 'new-categoria-gasto',
          component: () => import('@/views/categoriasGastos/CategoriaGastoFormView.vue'),
          props: route => ({ clienteId: route.params.cliente_id ? Number(route.params.cliente_id) : null }),
          meta: {
            title: 'Nova Categoria de Gasto',
            description: 'Crie uma nova categoria de gasto aqui',
            breadcrumb: "Nova Categoria de Gasto"
          }
        },
        {
          path: 'categorias-gastos/:id/editar',
          name: 'edit-categoria-gasto',
          component: () => import('@/views/categoriasGastos/CategoriaGastoFormView.vue'),
          meta: {
            title: 'Editar Categoria de Gasto',
            description: 'Edite uma categoria de gasto aqui',
            breadcrumb: "Editar Categoria de Gasto",
            requiresAuth: true
          }
        },
        {
          path: 'clientes',
          name: 'clients',
          component: ClientsView,
          meta: { title: 'Clientes', breadcrumb: "Clientes", description: 'Gerencie seus clientes aqui' }
        },
        {
          path: 'clientes/novo',
          name: 'new-client',
          component: () => import('../views/clients/ClientFormView.vue'),
          meta: { title: 'Novo Cliente', breadcrumb: "Novo Cliente", description: 'Crie um novo cliente aqui' }
        },
        {
          path: 'clientes/:id/editar',
          name: 'edit-client',
          component: () => import('../views/clients/ClientFormView.vue'),
          meta: { 
            title: 'Editar Cliente',
            description: 'Edite um cliente aqui',
            breadcrumb: "Editar Cliente",
            parent: 'clients'
          }
        },
        {
          path: 'clientes/:id',
          name: 'client-details',
          component: () => import('../views/clients/ClientDetailsView.vue'),
          meta: { 
            title: 'Detalhes do Cliente',
            description: 'Veja os detalhes de um cliente aqui',
            breadcrumb: "Detalhes do Cliente",
            parent: 'clients'
          }
        },
        {
          path: 'usuarios',
          name: 'users',
          component: () => import('../views/usuarios/UsersView.vue'),
          meta: { title: 'Usuários', breadcrumb: "Usuários", description: 'Gerencie seus usuários aqui' }
        },
        {
          path: 'usuarios/novo',
          name: 'new-user',
          component: () => import('../views/usuarios/UserFormView.vue'),
          meta: { title: 'Novo Usuário', breadcrumb: "Novo Usuário", description: 'Crie um novo usuário aqui' }
        },
        {
          path: 'usuarios/:id/editar',
          name: 'edit-user',
          component: () => import('../views/usuarios/UserFormView.vue'),
          meta: { 
            title: 'Editar Usuário',
            description: 'Edite um usuário aqui',
            breadcrumb: "Editar Usuário",
            parent: 'users'
          }
        },
        {
          path: 'usuarios/:id',
          name: 'user-details',
          component: () => import('../views/usuarios/UserDetailsView.vue'),
          meta: { 
            title: 'Detalhes do Usuário',
            description: 'Veja os detalhes de um usuário aqui',
            breadcrumb: "Detalhes do Usuário",
            parent: 'users'
          }
        },
        {
          path: 'example/detail-base',
          name: 'example-detail-base',
          component: () => import('../views/examples/ExampleDetailView.vue'),
          meta: {
            title: 'Exemplo Detalhes Base',
            breadcrumb: "Exemplo Detalhes Base",
            description: 'Veja os detalhes de um exemplo aqui',
            requiresAuth: true
          }
        },
        {
          path: 'entrada-recursos',
          name: 'entrada-recursos',
          component: () => import('../views/entradaRecurso/EntradaRecursoView.vue'),
          meta: {
            title: 'Entrada de Recursos',
            description: 'Gerencie suas entradas de recursos aqui',
            breadcrumb: "Entrada de Recursos",
            requiresAuth: true
          }
        },
        {
          path: 'entrada-recursos/novo/:obra_id?',
          name: 'new-entrada-recurso',
          component: () => import('../views/entradaRecurso/EntradaRecursoFormView.vue'),
          props: route => ({ obraId: route.params.obra_id ? Number(route.params.obra_id) : null }),
          meta: {
            title: 'Nova Entrada de Recurso',
            description: 'Crie uma nova entrada de recurso aqui',
            breadcrumb: "Nova Entrada de Recurso",
            requiresAuth: true
          }
        },
        {
          path: 'entrada-recursos/:id/editar',
          name: 'edit-entrada-recurso',
          component: () => import('../views/entradaRecurso/EntradaRecursoFormView.vue'),
          meta: {
            title: 'Editar Entrada de Recurso',
            description: 'Edite uma entrada de recurso aqui',
            breadcrumb: "Editar Entrada de Recurso",
            requiresAuth: true
          }
        },
        {
          path: 'entrada-recursos/:id',
          name: 'entrada-recurso-details',
          component: () => import('../views/entradaRecurso/EntradaRecursoDetailsView.vue'),
          meta: {
            title: 'Detalhes da Entrada de Recurso',
            description: 'Veja os detalhes de uma entrada de recurso aqui',
            breadcrumb: "Detalhes da Entrada de Recurso",
            requiresAuth: true
          }
        }
      ]
    },
    {
      path: '/about',
      name: 'about',
      meta: { title: 'Sobre', breadcrumb: "Sobre", description: 'Veja os detalhes de um exemplo aqui' },
      component: () => import('../views/AboutView.vue')
    }
  ]
})

// Navigation guards
router.beforeEach((to, from, next) => {
  // Check if route requires authentication
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth !== false)
  
  // If route doesn't require auth, proceed
  if (!requiresAuth) {
    next()
    return
  }
  
  // Check auth store first
  const authStore = useAuthStore()
  
  // If authenticated in store, proceed
  if (authStore.isAuthenticated) {
    next()
    return
  }
  
  // If not authenticated in store, check localStorage directly
  const storedToken = localStorage.getItem('auth_token')
  const storedUser = localStorage.getItem('auth_user')
  
  if (storedToken && storedUser) {
    // We have stored credentials, manually update the store
    // This is needed because the store might not be initialized yet
    authStore.$patch({
      token: storedToken,
      user: JSON.parse(storedUser)
    })
    next()
  } else {
    // No authentication found, redirect to login
    next({ name: 'login' })
  }
})

export default router
