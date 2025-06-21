# AGENT BEST PRACTICES - Vue.js Docker Development

## CRITICAL DECISION MAKING HIERARCHY

### 1. ALWAYS TRY FIRST - Agent Capabilities
**YOU MUST ATTEMPT THESE ACTIONS BEFORE REQUESTING DEVELOPER HELP:**

- **File Creation/Editing**: Try to create/edit Vue components, TypeScript files, and configurations
- **Directory Creation**: Try creating folders for components, composables, stores, and services
- **Code Writing**: Write complete Vue 3 components, composables, and TypeScript classes
- **Package Management**: Ask developer to install packages and wait for confirmation before moving forward
- **Build Configuration**: Ask developer to modify vite.config.ts, tsconfig.json, and environment files

### 2. PREFER VUE 3 + VITE COMMANDS - Framework First Approach
**WHEN POSSIBLE, USE VUE/VITE COMMANDS OVER MANUAL CREATION:**

```bash
# PREFERRED: Use Vue 3 + Vite commands
docker compose exec vue-app <command>
### 3. DOCKER COMMAND EXECUTION
**ALWAYS ATTEMPT DOCKER COMMANDS DIRECTLY:**

```bash
# TRY THESE FIRST
docker compose exec vue-app npm install
docker compose exec vue-app npm run build  
docker compose exec vue-app npm run type-check
docker compose exec vue-app npm run lint
docker compose ps
docker compose logs vue-app
docker compose up --build
```

### 4. ONLY REQUEST HELP WHEN EXPLICITLY BLOCKED
**REQUEST DEVELOPER ACTION ONLY WHEN YOU RECEIVE EXPLICIT ERROR MESSAGES:**

- ✅ "Permission denied"
- ✅ "Cannot edit file in .gitignore" 
- ✅ "Access denied to container"
- ✅ "Command not found"
- ✅ "File is read-only"
- ✅ "EACCES: permission denied"
- ✅ "Module not found" (after install attempts)

**DO NOT REQUEST HELP FOR:**
- ❌ Components you haven't tried to create
- ❌ Dependencies you haven't attempted to install
- ❌ Directories you haven't tried to create
- ❌ Standard Vue.js operations
- ❌ Build errors you haven't attempted to resolve
- ❌ need clarification

## TECHNOLOGY STACK GUIDELINES

### Core Technologies Detected
1. **Vue 3.5.13** - Composition API with TypeScript
2. **TypeScript 5.8** - Strict mode enabled
3. **Vite 6.2.4** - Build tool and dev server
4. **Pinia 3.0.1** - State management
5. **Vue Router 4.5.0** - Routing
6. **Docker** - Containerized development
7. **Sass** - CSS preprocessing (when needed)
8. **Vitest** - Unit testing
9. **ESLint + Prettier** - Code quality

### Framework Knowledge (Vue 3 + TypeScript + Vite)
**USE VUE 3 CONVENTIONS AND MODERN FEATURES:**

- **Composition API**: Use `<script setup>` syntax primarily
- **TypeScript**: Use proper typing with interfaces and types  
- **Reactive References**: Use `ref()`, `reactive()`, `computed()`
- **Lifecycle Hooks**: Use `onMounted()`, `onUnmounted()`, etc.
- **Component Structure**: Use Single File Components (.vue)
- **State Management**: Use Pinia for global state
- **Routing**: Use Vue Router 4 with TypeScript
- **Build Tool**: Use Vite for development and building

### Directory Structure (Vue 3 + TypeScript)
**FOLLOW STANDARD VUE 3 PROJECT CONVENTIONS:**

```
src/
├── components/
│   ├── ui/
│   ├── layout/
│   └── features/
├── composables/
├── stores/
├── services/
├── types/
├── utils/
├── views/
├── router/
├── assets/
└── styles/
```

### Package Management Priority
Always ask developer to install packages and wait for confirmation before moving forward.
