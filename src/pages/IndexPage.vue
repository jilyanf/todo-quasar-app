<template>
  <q-page class="flex flex-center">
    <todo-app />
  </q-page>
</template>

<script>
import { defineComponent } from 'vue'
import TodoApp from '../components/ToDoApp.vue'

export default defineComponent({
  name: 'IndexPage',

  components: {
    TodoApp
  }
})
</script>
