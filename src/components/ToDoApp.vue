<template>
  <div class="todo-app q-pa-md">
    <!-- Header -->
    <div class="text-h3 text-weight-bold text-primary q-mb-xl text-center">
      🎯 TaskFlow
      <q-icon name="rocket_launch" color="secondary" class="q-ml-sm" />
    </div>

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
          class="shadow-3 input"
        >
          <template v-slot:prepend>
            <q-icon name="edit_note" color="primary" />
          </template>
        </q-input>
      </div>
      <div class="col-12 col-sm-3 flex justify-end items-end btn-container">
        <q-btn
          color="secondary"
          label="Add Task"
          @click="addTask"
          :loading="loading.create"
          :disable="!newTask || loading.create"
          class="full-width shadow-3 button"
          unelevated
          icon="add"
          size="md"
        />
      </div>
    </div>

    <!-- Loading State -->
    <template v-if="loading.fetch">
      <div class="text-center q-pa-md">
        <q-spinner-hourglass
          color="primary"
          size="3em"
          class="q-mb-md"
        />
        <div class="text-h6 text-grey-7">Loading tasks...</div>
      </div>
    </template>

    <!-- Error State -->
    <template v-else-if="error && !todos.length">
      <div class="text-center q-pa-xl">
        <q-icon name="sentiment_dissatisfied" size="xl" color="negative" />
        <div class="text-h5 q-mt-md text-weight-medium">
          Oops! Something went wrong
        </div>
        <div class="text-grey-7 q-mt-sm q-mb-lg">{{ error.message }}</div>
        <q-btn
          color="primary"
          label="Try Again"
          @click="retryOperation('fetch')"
          icon="refresh"
          unelevated
        />
      </div>
    </template>

    <!-- No Tasks State -->
    <template v-else-if="!loading.fetch && todos.length === 0">
      <div class="text-center q-pa-xl">
        <q-icon name="task_alt" size="xl" color="grey-6" class="q-mb-md" />
        <div class="text-h5 text-weight-medium text-grey-8">All caught up! 🎉</div>
        <div class="text-grey-7 q-mt-sm">Start by adding your first task</div>
      </div>
    </template>

    <!-- Task List -->
    <div class="q-mt-lg">
      <transition-group name="list" tag="div">
        <q-card
          v-for="todo in todos"
          :key="todo.id"
          class="q-mb-sm shadow-2 task-card"
          :class="{
            'bg-green-1': todo.completed,
            'border-left-primary': !todo.completed,
            'border-left-green': todo.completed,
            'editing-item': editingId === todo.id
          }"
        >
          <q-card-section class="row items-center q-col-gutter-md q-py-md">
            <!-- Checkbox -->
            <div class="col-auto">
              <q-checkbox
                v-model="todo.completed"
                @update:model-value="updateTaskStatus(todo)"
                :disable="loading.update"
                size="lg"
                color="primary"
                checked-icon="task_alt"
              />
            </div>

            <!-- Task Content -->
            <div class="col-grow">
              <div v-if="editingId === todo.id" class="edit-input">
                <q-input
                  v-model="editingText"
                  outlined
                  dense
                  autofocus
                  :loading="loading.update"
                  :disable="loading.update"
                  @keyup.enter="saveEdit(todo)"
                  class="shadow-1"
                />
              </div>
              <div
                v-else
                class="text-h6 task-content"
                :class="{
                  'text-strike': todo.completed,
                  'text-grey-6': todo.completed
                }"
              >
                {{ todo.title }}
                <q-chip
                  v-if="todo.category"
                  :color="todo.completed ? 'grey-4' : 'primary'"
                  text-color="white"
                  size="sm"
                  class="q-ml-sm"
                >
                  {{ todo.category }}
                </q-chip>
              </div>
            </div>

            <!-- Actions -->
            <div class="col-auto row q-gutter-xs">
              <q-btn
                v-if="editingId === todo.id"
                flat
                round
                color="positive"
                icon="check"
                @click="saveEdit(todo)"
                :loading="loading.update"
                size="md"
              />
              <q-btn
                v-else
                flat
                round
                color="primary"
                icon="edit"
                @click="startEdit(todo)"
                :disable="loading.update"
                size="md"
              />
              <q-btn
                flat
                round
                color="negative"
                icon="delete"
                @click="deleteTaskId = todo.id"
                :loading="loading.delete && deleteTaskId === todo.id"
                size="md"
              />
            </div>
          </q-card-section>
        </q-card>
      </transition-group>
    </div>

    <!-- Delete Confirmation Dialog -->
    <q-dialog v-model="showDeleteDialog" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="negative" text-color="white" size="lg" />
          <span class="text-h6 q-ml-md text-weight-medium">Confirm Delete</span>
        </q-card-section>

        <q-card-section class="q-pt-none">
          Are you sure you want to delete this task? This action cannot be undone.
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            flat
            label="Cancel"
            color="grey-7"
            @click="cancelDelete"
            v-close-popup
          />
          <q-btn
            flat
            label="Delete"
            color="negative"
            @click="confirmDeleteTodo"
            :loading="loading.delete"
            icon="delete_forever"
            unelevated
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
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
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
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
.task-card {
  border-left: 4px solid transparent;
  transition: all 0.3s ease;
  border-radius: 8px;
}
.task-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important;
}

.editing-item {
  background-color: #f8f9fa;
  border-left-color: var(--q-primary) !important;
}
.text-strike {
  text-decoration: line-through;
  color: #9e9e9e;
}

</style>
