import { createRouter, createWebHistory } from 'vue-router'
import AppLayout from '@/components/layout/AppLayout.vue'
import ClientsView from '@/views/clients/ClientsView.vue'
import LoginView from '@/views/LoginView.vue'
import { useAuthStore } from '@/stores/auth'

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
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          redirect: '/clientes'
        },
        {
          path: 'obras',
          name: 'obras',
          component: () => import('../views/obras/ObrasView.vue'),
          meta: {
            title: 'Obras',
            breadcrumb: [
              { title: 'Home', path: '/' },
              { title: 'Obras', path: '/obras' }
            ]
          }
        },
        {
          path: 'gastos',
          name: 'gastos',
          component: () => import('../views/gastos/GastosView.vue'),
          meta: {
            title: 'Gastos',
            breadcrumb: [
              { title: 'Home', path: '/' },
              { title: 'Gastos', path: '/gastos' }
            ]
          }
        },
        {
          path: 'gastos/novo/:obra_id?',
          name: 'new-gasto',
          component: () => import('../views/gastos/GastoFormView.vue'),
          props: route => ({ obraId: route.params.obra_id ? Number(route.params.obra_id) : null }),
          meta: {
            title: 'Novo Gasto',
            breadcrumb: [
              { title: 'Home', path: '/' },
              { title: 'Gastos', path: '/gastos' },
              { title: 'Novo Gasto' }
            ]
          }
        },
        {
          path: 'gastos/:id/editar',
          name: 'edit-gasto',
          component: () => import('../views/gastos/GastoFormView.vue'),
          meta: {
            title: 'Editar Gasto',
            breadcrumb: [
              { title: 'Home', path: '/' },
              { title: 'Gastos', path: '/gastos' },
              {
                title: 'Detalhes do Gasto',
                dynamic: true,
                getPath: (route: any) => route && route.params ? `/gastos/${route.params.id}` : '#'
              },
              { title: 'Editar Gasto' }
            ],
            requiresAuth: true
          }
        },
        {
          path: 'categorias-gastos',
          name: 'categorias-gastos',
          component: () => import('../views/categoriasGastos/CategoriasGastosView.vue'),
          meta: {
            title: 'Categorias de Gastos',
            breadcrumb: [
              { title: 'Home', path: '/' },
              { title: 'Categorias de Gastos', path: '/categorias-gastos' }
            ]
          }
        },
        {
          path: 'obras/novo/:cliente_id?',
          name: 'new-obra',
          component: () => import('../views/obras/ObraFormView.vue'),
          props: route => ({ clienteId: route.params.cliente_id ? Number(route.params.cliente_id) : null }),
          meta: {
            title: 'Nova Obra',
            breadcrumb: [
              { title: 'Home', path: '/' },
              { title: 'Clientes', path: '/clientes' },
              {
                title: 'Detalhes do Cliente',
                dynamic: true,
                getPath: (route: any) => `/clientes/${route.params.cliente_id}`
              },
              { title: 'Nova Obra' }
            ]
          }
        },
        {
          path: 'obras/:id/editar',
          name: 'edit-obra',
          component: () => import('../views/obras/ObraFormView.vue'),
          meta: {
            title: 'Editar Obra',
            breadcrumb: [
              { title: 'Home', path: '/' },
              { 
                title: 'Detalhes do Cliente', 
                dynamic: true, 
                getPath: (params, store) => `/clientes/${store.currentClienteId}?active_tab=obras`
              },
              {
                title: 'Detalhes da Obra',
                dynamic: true,
                getPath: (route: any) => route && route.params ? `/obras/${route.params.id}` : '#'
              },
              { title: 'Editar Obra' }
            ],
            requiresAuth: true
          }
        },
        {
          path: 'obras/:id',
          name: 'obra-details',
          component: () => import('@/views/obras/ObraDetailsView.vue'),
          meta: {
            title: 'Detalhes da Obra',
            breadcrumb: [
              { title: 'Home', path: '/' },
              { 
                title: 'Detalhes do Cliente', 
                dynamic: true, 
                getPath: (params, store) => `/clientes/${store.currentClienteId}?active_tab=obras`
              },
              { title: 'Detalhes da Obra' } 
            ],
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
            breadcrumb: [
              { title: 'Home', path: '/' },
              { title: 'Clientes', path: '/clientes' },
              {
                title: 'Detalhes do Cliente',
                dynamic: true,
                getPath: (route: any) => `/clientes/${route.params.cliente_id}`
              },
              { title: 'Nova Categoria de Gasto' }
            ]
          }
        },
        {
          path: 'categorias-gastos/:id/editar',
          name: 'edit-categoria-gasto',
          component: () => import('@/views/categoriasGastos/CategoriaGastoFormView.vue'),
          meta: {
            title: 'Editar Categoria de Gasto',
            breadcrumb: [
              { title: 'Home', path: '/' },
              { 
                title: 'Detalhes do Cliente', 
                dynamic: true, 
                getPath: (params, store) => `/clientes/${store.currentClienteId}?active_tab=categoria-gasto`
              },
              { title: 'Editar Categoria de Gasto' }
            ],
            requiresAuth: true
          }
        },
        {
          path: 'clientes',
          name: 'clients',
          component: ClientsView,
          meta: { title: 'Clientes' }
        },
        {
          path: 'clientes/novo',
          name: 'new-client',
          component: () => import('../views/clients/ClientFormView.vue'),
          meta: { title: 'Novo Cliente' }
        },
        {
          path: 'clientes/:id/editar',
          name: 'edit-client',
          component: () => import('../views/clients/ClientFormView.vue'),
          meta: { 
            title: 'Editar Cliente',
            parent: 'clients'
          }
        },
        {
          path: 'clientes/:id',
          name: 'client-details',
          component: () => import('../views/clients/ClientDetailsView.vue'),
          meta: { 
            title: 'Detalhes do Cliente',
            parent: 'clients'
          }
        },
        {
          path: 'usuarios',
          name: 'users',
          component: () => import('../views/usuarios/UsersView.vue'),
          meta: { title: 'Usuários' }
        },
        {
          path: 'usuarios/novo',
          name: 'new-user',
          component: () => import('../views/usuarios/UserFormView.vue'),
          meta: { title: 'Novo Usuário' }
        },
        {
          path: 'usuarios/:id/editar',
          name: 'edit-user',
          component: () => import('../views/usuarios/UserFormView.vue'),
          meta: { 
            title: 'Editar Usuário',
            parent: 'users'
          }
        },
        {
          path: 'usuarios/:id',
          name: 'user-details',
          component: () => import('../views/usuarios/UserDetailsView.vue'),
          meta: { 
            title: 'Detalhes do Usuário',
            parent: 'users'
          }
        },
        {
          path: 'example/detail-base',
          name: 'example-detail-base',
          component: () => import('../views/examples/ExampleDetailView.vue'),
          meta: {
            title: 'Exemplo Detalhes Base',
            breadcrumb: [
              { title: 'Home', path: '/' },
              { title: 'Exemplos', path: '/example/detail-base' }, 
              { title: 'Detalhes Base' }
            ],
            requiresAuth: true
          }
        }
      ]
    },
    {
      path: '/about',
      name: 'about',
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
