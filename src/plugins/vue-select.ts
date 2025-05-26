import type { App } from 'vue'
import Multiselect from '@vueform/multiselect'
import '@vueform/multiselect/themes/default.css'

export default {
  install: (app: App) => {
    app.component('Multiselect', Multiselect)
  }
}
