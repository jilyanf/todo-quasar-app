// TodoService.js
// This service handles all API interactions with the JSONPlaceholder API

import axios from 'axios'

const API_URL = 'https://jsonplaceholder.typicode.com/todos'

export default {
  /**
   * Get todos from the API
   * @param {Number} limit - Optional limit of todos to retrieve
   * @returns {Promise} - Promise with todos data
   */
  getTodos(limit = 10) {
    return axios.get(`${API_URL}?_limit=${limit}`)
  },

  /**
   * Create a new todo
   * @param {Object} todo - Todo object with title, userId and completed status
   * @returns {Promise} - Promise with created todo data
   */
  createTodo(todo) {
    return axios.post(API_URL, {
      title: todo.title,
      completed: todo.completed || false,
      userId: todo.userId || 1
    })
  },

  /**
   * Update an existing todo
   * @param {Object} todo - Todo object with id, title, and completed status
   * @returns {Promise} - Promise with updated todo data
   */
  updateTodo(todo) {
    return axios.put(`${API_URL}/${todo.id}`, todo)
  },

  /**
   * Delete a todo by id
   * @param {Number} id - Todo ID to delete
   * @returns {Promise} - Promise with response data
   */
  deleteTodo(id) {
    return axios.delete(`${API_URL}/${id}`)
  }
}
