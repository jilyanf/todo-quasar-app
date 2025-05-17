// This composable provides todo functionality and state management
import { ref, reactive } from 'vue'
import TodoService from '../services/ToDoService'

export default function useTodo() {
  // State
  const todos = ref([])
  const newTask = ref('')
  const loading = reactive({
    fetch: false,
    create: false,
    update: false,
    delete: false
  })
  const error = ref(null)
  const editingId = ref(null)
  const editingText = ref('')
  const deleteTaskId = ref(null)

  // Notification state
  const notifications = ref([])
  const notificationId = ref(0)

  // Show a notification message
  const notify = (message, type = 'success', timeout = 3000) => {
    const id = notificationId.value++
    notifications.value.push({
      id,
      message,
      type,
      icon: type === 'success' ? 'check' : type === 'error' ? 'error' : 'info',
      color: type === 'success' ? 'positive' : type === 'error' ? 'negative' : 'info'
    })

    // Auto dismiss after timeout
    setTimeout(() => {
      dismissNotification(id)
    }, timeout)

    return id
  }

  // Dismiss a notification by id
  const dismissNotification = (id) => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index !== -1) {
      notifications.value.splice(index, 1)
    }
  }

  // Error handler for API calls
  const handleError = (operation, error) => {
    const errorMessage = error.message || `Failed to ${operation} task`
    console.error(`Error during ${operation}:`, error)
    notify(errorMessage, 'error')
    return Promise.reject(error)
  }

  // Fetch todos from API
  const fetchTodos = async (limit = 10) => {
    loading.fetch = true
    error.value = null

    try {
      const data = await TodoService.getTodos(limit)
      todos.value = data
      notify('Tasks loaded successfully', 'info')
      return data
    } catch (err) {
      return handleError('fetch', err)
    } finally {
      loading.fetch = false
    }
  }

  // Add a new todo
  const addTodo = async () => {
    if (!newTask.value.trim()) return

    loading.create = true
    error.value = null

    try {
      const todo = {
        title: newTask.value.trim(),
        completed: false,
        userId: 1 // Default user ID
      }

      const createdTodo = await TodoService.createTodo(todo)

      // Since JSONPlaceholder doesn't actually save new items,
      // we'll add it to our local array with a unique ID
      const newId = todos.value.length > 0 ?
        Math.max(...todos.value.map(todo => todo.id)) + 1 : 1

      const newTodo = {
        ...createdTodo,
        id: newId
      }

      todos.value.unshift(newTodo)
      newTask.value = ''
      notify('Task added successfully')
      return newTodo
    } catch (err) {
      return handleError('add', err)
    } finally {
      loading.create = false
    }
  }

  // Start editing a todo
  const startEdit = (todo) => {
    editingId.value = todo.id
    editingText.value = todo.title
  }

  // Save edited todo
  const saveEdit = async (todo) => {
    if (!editingText.value.trim()) return

    loading.update = true
    error.value = null

    try {
      const updatedTodo = {
        ...todo,
        title: editingText.value.trim()
      }

      await TodoService.updateTodo(updatedTodo)

      // Update the local todo
      const index = todos.value.findIndex(t => t.id === todo.id)
      if (index !== -1) {
        todos.value[index].title = editingText.value.trim()
      }

      editingId.value = null
      editingText.value = ''
      notify('Task updated successfully')
      return todos.value[index]
    } catch (err) {
      return handleError('update', err)
    } finally {
      loading.update = false
    }
  }

  // Update todo completion status
  const updateTodoStatus = async (todo) => {
    loading.update = true
    error.value = null

    try {
      await TodoService.updateTodoStatus(todo)
      notify(`Task marked as ${todo.completed ? 'completed' : 'incomplete'}`)
      return todo
    } catch (err) {
      // Revert the change in case of error
      todo.completed = !todo.completed
      return handleError('update status', err)
    } finally {
      loading.update = false
    }
  }

  // Delete a todo
  const deleteTodo = async (id) => {
    deleteTaskId.value = id
  }

  // Confirm and execute todo deletion
  const confirmDeleteTodo = async () => {
    if (!deleteTaskId.value) return

    loading.delete = true
    error.value = null

    try {
      await TodoService.deleteTodo(deleteTaskId.value)

      // Remove from local array
      todos.value = todos.value.filter(todo => todo.id !== deleteTaskId.value)
      notify('Task deleted successfully')

      const deletedId = deleteTaskId.value
      deleteTaskId.value = null
      return deletedId
    } catch (err) {
      return handleError('delete', err)
    } finally {
      loading.delete = false
    }
  }

  // Cancel deletion
  const cancelDelete = () => {
    deleteTaskId.value = null
  }

  // Retry failed operations
  const retryOperation = async (operation) => {
    switch (operation) {
      case 'fetch':
        return fetchTodos()
      case 'create':
        return addTodo()
      case 'update':
        return editingId.value ? saveEdit(todos.value.find(t => t.id === editingId.value)) : null
      case 'delete':
        return deleteTaskId.value ? confirmDeleteTodo() : null
      default:
        return null
    }
  }

  return {
    // State
    todos,
    newTask,
    loading,
    error,
    editingId,
    editingText,
    deleteTaskId,
    notifications,

    // Methods
    fetchTodos,
    addTodo,
    startEdit,
    saveEdit,
    updateTodoStatus,
    deleteTodo,
    confirmDeleteTodo,
    cancelDelete,
    notify,
    dismissNotification,
    retryOperation
  }
}
