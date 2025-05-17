<template>
  <div class="todo-app q-pa-md">
    <!-- Task Input Form -->
    <div class="row q-col-gutter-sm q-mb-md items-center input-container">
      <div class="col-12 col-sm-9">
        <q-input
          v-model="newTask"
          label="Task Name"
          @keyup.enter="addTask"
          outlined
          :loading="loading.create"
          :disable="loading.create"
          :error="!!error"
          :error-message="error?.message"
          class="input"
        />
      </div>
      <div class="col-12 col-sm-3 flex justify-end items-end btn-container">
        <q-btn
          color="primary"
          label="Submit"
          @click="addTask"
          :loading="loading.create"
          :disable="!newTask || loading.create"
          class="full-width button"
          unelevated
        />
      </div>
    </div>

    <!-- Global Loading Indicator -->
    <div v-if="loading.fetch" class="text-center q-pa-md">
      <q-spinner color="primary" size="3em" />
      <div class="q-mt-sm">Loading tasks...</div>
    </div>

    <!-- Error State -->
    <div v-else-if="error && !todos.length" class="text-center q-pa-md">
      <q-icon name="error" size="3em" color="negative" />
      <div class="text-h6 q-mt-sm">Failed to load tasks</div>
      <div class="text-grey q-mb-md">{{ error.message }}</div>
      <q-btn color="primary" label="Retry" @click="retryOperation('fetch')" />
    </div>

    <!-- No Tasks State -->
    <div v-else-if="!loading.fetch && todos.length === 0" class="text-center q-pa-md">
      <q-icon name="task_alt" size="3em" color="grey-7" />
      <div class="text-h6 q-mt-sm">No tasks found</div>
      <div class="text-grey">Add a new task to get started</div>
    </div>

    <!-- Task List -->
    <div class="q-mt-lg">
      <q-card v-for="todo in todos" :key="todo.id" class="q-mb-md">
        <q-card-section class="row items-center q-col-gutter-sm">
          <!-- Task Checkbox -->
          <div class="col-2 col-sm-1 flex items-center">
            <q-checkbox
              v-model="todo.completed"
              @update:model-value="updateTaskStatus(todo)"
              :disable="loading.update"
            />
          </div>

          <!-- Task Title -->
          <div class="col-10 col-sm-8 flex items-center">
            <div v-if="editingId === todo.id">
              <q-input
              v-model="editingText"
              outlined
              dense
              :loading="loading.update"
              :disable="loading.update"
              @keyup.enter="saveEdit(todo)"
            />
            </div>
            <div v-else class="text-h6" :class="{ 'text-strike': todo.completed }">
              {{ todo.title }}
            </div>
          </div>

          <!-- Task Actions -->
          <div class="col-12 col-sm-3 row justify-end q-gutter-sm q-mt-sm q-mt-sm-none items-center">
            <q-btn
              v-if="editingId === todo.id"
              flat
              color="positive"
              icon="save"
              @click="saveEdit(todo)"
              :loading="loading.update"
              :disable="loading.update"
            />
            <q-btn
              v-else
              flat
              color="primary"
              icon="edit"
              @click="startEdit(todo)"
              :disable="loading.update"
            />
            <q-btn
              flat
              color="negative"
              icon="delete"
              @click="deleteTaskId = (todo.id)"
              :loading="loading.delete && deleteTaskId === todo.id"
              :disable="loading.delete"
            />
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Delete Confirmation Dialog -->
    <q-dialog v-model="showDeleteDialog">
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="negative" text-color="white" />
          <span class="q-ml-sm">Are you sure you want to delete this task?</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            flat
            label="Cancel"
            color="primary"
            @click="cancelDelete"
            :disable="loading.delete"
          />
          <q-btn
            flat
            label="Delete"
            color="negative"
            @click="confirmDeleteTodo"
            :loading="loading.delete"
            :disable="loading.delete"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Notifications -->
    <q-notifications position="bottom-right" />
  </div>
</template>

<script>
import { defineComponent, onMounted, computed } from 'vue'
import useTodo from '../composables/useTodo'

export default defineComponent({
  name: 'TodoApp',

  setup() {
    const {
      todos,
      newTask,
      loading,
      error,
      editingId,
      editingText,
      deleteTaskId,
      fetchTodos,
      addTodo,
      startEdit,
      saveEdit,
      updateTodoStatus,
      deleteTodo,
      confirmDeleteTodo,
      cancelDelete,
      retryOperation,
    } = useTodo()

    // Computed property for the delete dialog visibility
    const showDeleteDialog = computed(() => deleteTaskId.value !== null)

    // Function to handle adding a new task
    const addTask = async () => {
      try {
        await addTodo()
      } catch (err) {
        // Error handled in the composable
        console.error('Error adding task:', err)
      }
    }

    // Function to handle updating task status
    const updateTaskStatus = async (todo) => {
      try {
        await updateTodoStatus(todo)
      } catch (err) {
        // Error handled in the composable
        console.error('Error updating task status:', err)
      }
    }

    // Load tasks on component mount
    onMounted(() => {
      fetchTodos()
    })

    return {
      todos,
      newTask,
      loading,
      error,
      editingId,
      editingText,
      deleteTaskId,
      showDeleteDialog,
      addTask,
      startEdit,
      saveEdit,
      updateTaskStatus,
      deleteTodo,
      confirmDeleteTodo,
      cancelDelete,
      retryOperation
    }
  }
})
</script>

<style scoped>
.todo-app {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 16px;
}
.input-container {
  margin-top: auto;
  padding-bottom: 0;
}
.input {
  padding-bottom: 0;
}
.button {
  padding-top: 15px;
  padding-bottom: 15px;
}
.text-strike {
  text-decoration: line-through;
  color: #9e9e9e;
}
</style>
