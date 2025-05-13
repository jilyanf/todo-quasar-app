<template>
  <div class="todo-app q-pa-md">
    <div class="row q-mb-md">
      <div class="col-8">
        <q-input
          v-model="newTask"
          label="Task Name"
          @keyup.enter="addTask"
          class="q-mr-sm"
          outlined
        />
      </div>
      <div class="col-4">
        <q-btn
          color="primary"
          label="Submit"
          @click="addTask"
          :disable="!newTask"
          class="q-ml-sm"
        />
      </div>
    </div>

    <div class="q-mt-lg">
      <q-card v-for="todo in todos" :key="todo.id" class="q-mb-md">
        <q-card-section class="row items-center">
          <div class="col-6">
            <div v-if="editingId === todo.id">
              <q-input v-model="editingText" outlined dense />
            </div>
            <div v-else class="text-h6" :class="{ 'text-strike': todo.completed }">
              {{ todo.title }}
            </div>
          </div>
          <div class="col-2">
            <q-checkbox v-model="todo.completed" @update:model-value="updateTaskStatus(todo)" />
          </div>
          <div class="col-4 row justify-end">
            <q-btn
              v-if="editingId === todo.id"
              flat
              color="positive"
              icon="save"
              @click="saveEdit(todo)"
              class="q-mr-xs"
            />
            <q-btn
              v-else
              flat
              color="primary"
              icon="edit"
              @click="startEdit(todo)"
              class="q-mr-xs"
            />
            <q-btn
              flat
              color="negative"
              icon="delete"
              @click="deleteTask(todo.id)"
            />
          </div>
        </q-card-section>
      </q-card>

      <div v-if="loading" class="text-center q-pa-md">
        <q-spinner color="primary" size="3em" />
        <div class="q-mt-sm">Loading tasks...</div>
      </div>

      <div v-if="!loading && todos.length === 0" class="text-center q-pa-md">
        <q-icon name="task_alt" size="3em" color="grey-7" />
        <div class="text-h6 q-mt-sm">No tasks found</div>
        <div class="text-grey">Add a new task to get started</div>
      </div>
    </div>

    <q-dialog v-model="confirmDelete">
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="negative" text-color="white" />
          <span class="q-ml-sm">Are you sure you want to delete this task?</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn flat label="Delete" color="negative" @click="confirmDeleteTask" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showNotification">
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar :icon="notificationIcon" :color="notificationColor" text-color="white" />
          <span class="q-ml-sm">{{ notificationMessage }}</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="OK" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue'
import axios from 'axios'

export default defineComponent({
  name: 'TodoApp',

  setup() {
    const API_URL = 'https://jsonplaceholder.typicode.com/todos'
    const todos = ref([])
    const newTask = ref('')
    const loading = ref(true)
    const editingId = ref(null)
    const editingText = ref('')
    const deleteTaskId = ref(null)
    const confirmDelete = ref(false)
    const showNotification = ref(false)
    const notificationMessage = ref('')
    const notificationIcon = ref('check')
    const notificationColor = ref('positive')

    // Function to show notification
    const notify = (message, type = 'success') => {
      notificationMessage.value = message

      if (type === 'success') {
        notificationIcon.value = 'check'
        notificationColor.value = 'positive'
      } else if (type === 'error') {
        notificationIcon.value = 'error'
        notificationColor.value = 'negative'
      } else if (type === 'info') {
        notificationIcon.value = 'info'
        notificationColor.value = 'info'
      }

      showNotification.value = true
    }

    // Fetch tasks from API
    const fetchTasks = async () => {
      loading.value = true
      try {
        // Limit to 10 tasks for better performance
        const response = await axios.get(`${API_URL}?_limit=10`)
        todos.value = response.data
        notify('Tasks loaded successfully', 'info')
      } catch (error) {
        console.error('Error fetching tasks:', error)
        notify('Failed to load tasks', 'error')
      } finally {
        loading.value = false
      }
    }

    // Add a new task
    const addTask = async () => {
      if (!newTask.value.trim()) return

      try {
        const response = await axios.post(API_URL, {
          title: newTask.value.trim(),
          completed: false,
          userId: 1 // Default user ID
        })

        // Since JSONPlaceholder doesn't actually save new posts,
        // we'll add it to our local array with a unique ID
        const newId = todos.value.length > 0 ?
          Math.max(...todos.value.map(todo => todo.id)) + 1 : 1

        todos.value.unshift({
          ...response.data,
          id: newId
        })

        newTask.value = ''
        notify('Task added successfully')
      } catch (error) {
        console.error('Error adding task:', error)
        notify('Failed to add task', 'error')
      }
    }

    // Start editing a task
    const startEdit = (todo) => {
      editingId.value = todo.id
      editingText.value = todo.title
    }

    // Save edited task
    const saveEdit = async (todo) => {
      if (!editingText.value.trim()) return

      try {
        await axios.put(`${API_URL}/${todo.id}`, {
          ...todo,
          title: editingText.value.trim()
        })

        // Update the local todo
        const index = todos.value.findIndex(t => t.id === todo.id)
        if (index !== -1) {
          todos.value[index].title = editingText.value.trim()
        }

        editingId.value = null
        editingText.value = ''
        notify('Task updated successfully')
      } catch (error) {
        console.error('Error updating task:', error)
        notify('Failed to update task', 'error')
      }
    }

    // Update task completion status
    const updateTaskStatus = async (todo) => {
      try {
        await axios.put(`${API_URL}/${todo.id}`, {
          ...todo,
          completed: todo.completed
        })

        notify(`Task marked as ${todo.completed ? 'completed' : 'incomplete'}`)
      } catch (error) {
        console.error('Error updating task status:', error)
        notify('Failed to update task status', 'error')
        // Revert the change in case of error
        todo.completed = !todo.completed
      }
    }

    // Prompt for delete confirmation
    const deleteTask = (id) => {
      deleteTaskId.value = id
      confirmDelete.value = true
    }

    // Confirm and delete task
    const confirmDeleteTask = async () => {
      try {
        await axios.delete(`${API_URL}/${deleteTaskId.value}`)

        // Remove from local array
        todos.value = todos.value.filter(todo => todo.id !== deleteTaskId.value)

        notify('Task deleted successfully')
      } catch (error) {
        console.error('Error deleting task:', error)
        notify('Failed to delete task', 'error')
      }
    }

    // Load tasks when component mounts
    onMounted(() => {
      fetchTasks()
    })

    return {
      todos,
      newTask,
      loading,
      editingId,
      editingText,
      confirmDelete,
      showNotification,
      notificationMessage,
      notificationIcon,
      notificationColor,
      addTask,
      startEdit,
      saveEdit,
      updateTaskStatus,
      deleteTask,
      confirmDeleteTask
    }
  }
})
</script>

<style scoped>
.text-strike {
  text-decoration: line-through;
  color: #9e9e9e;
}
</style>
