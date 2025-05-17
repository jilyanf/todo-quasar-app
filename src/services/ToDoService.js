// Handles all API interactions with the JSONPlaceholder API
import axios from 'axios'


// Axios instance with default settings
const apiClient = axios.create({
  baseURL: 'https://jsonplaceholder.typicode.com',
  timeout: 10000, // Timeout after 10 seconds
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// Error handling interceptor
apiClient.interceptors.response.use(
  response => response,
  error => {
    // Handle errors globally
    console.error('API Error:', error.response || error.message || error)

    // Create a standardized error object
    const errorData = {
      status: error.response? error.response.status : 500,
      message: error.message || 'An unknown error occurred',
      timestamp: new Date().toISOString(),
      endpoint: error.config?.url || 'unknown',
    }

    // Reject promise with standardized error object
    return Promise.reject(errorData)
  }
)

export default {
  /**
   * Get todos from the API
   * @param {Number} limit - Optional limit of todos to retrieve
   * @returns {Promise} - Promise with todos data
   */
  getTodos(limit = 10) {
    return apiClient.get(`/todos?_limit=${limit}`)
    .then(response => {
      return response.data
    })
  },

  /**
   * Create a new todo
   * @param {Object} todo - Todo object with title, userId and completed status
   * @returns {Promise} - Promise with created todo data
   */
  createTodo(todo) {
    return apiClient.post('/todos', {
      title: todo.title,
      completed: todo.completed || false,
      userId: todo.userId || 1
    }).then(response => response.data)
  },

  /**
   * Update an existing todo
   * @param {Object} todo - Todo object with id, title, and completed status
   * @returns {Promise} - Promise with updated todo data
   */
  updateTodo(todo) {
    return apiClient.put(`/todos/${todo.id}`, todo)
    .then(response => {
      return response.data
    })
  },

  /**
   * Update the completion status of a todo
   * @param {Object} todo - Todo object with id and completed status
   * @returns {Promise} - Promise with updated todo data
   */
  updateTodoStatus(todo) {
    return apiClient.patch(`/todos/${todo.id}`, {
      completed: todo.completed
    }).then(response => response.data)
  },

  /**
   * Delete a todo by id
   * @param {Number} id - Todo ID to delete
   * @returns {Promise} - Promise with response data
   */
  deleteTodo(id) {
    return apiClient.delete(`/todos/${id}`)
    .then(response => {
      return response.data
    })
  },
}
