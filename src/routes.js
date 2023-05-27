import { randomUUID } from 'node:crypto';

import { Database } from './database.js';
import { buildRoutePath } from './utils/build-route-path.js';

const database = new Database();

export const routes = [
  {
    method: 'GET',
    path: buildRoutePath('/tasks'),
    handler: (request, response) => {
      const { search } = request.query;

      const tasks = database.select('tasks', search ? {
        title: search,
        description: search
      } : null)

      return response.end(JSON.stringify(tasks))
    }
  },
  {
    method: 'POST',
    path: buildRoutePath('/tasks'),
    handler: (request, response) => {
      const { title, description } = request.body;

      if (!title) {
        return request.writeHead(400).end(JSON.stringify({
          error: 'error',
          message: 'Title required'
        }))
      }

      if (!description) {
        return request.writeHead(400).end(JSON.stringify({
          error: 'error',
          message: 'Description required'
        }))
      }

      const task = {
        id: randomUUID(),
        title,
        description,
        completed_at: null,
        created_at: new Date(),
        updated_at: new Date()
      }

      database.insert('tasks', task);

      return response.writeHead(201).end(JSON.stringify(task));
    }
  },
  {
    method: 'PUT',
    path: buildRoutePath('/tasks/:id'),
    handler: (request, response) => {
      const { id } = request.params;
      const { title, description } = request.body

      if (!title) {
        return request.writeHead(400).end(JSON.stringify({
          error: 'error',
          message: 'Title required'
        }))
      }

      if (!description) {
        return request.writeHead(400).end(JSON.stringify({
          error: 'error',
          message: 'Description required'
        }))
      }

      const [task] = database.select('tasks', { id })

      if (!task) {
        return res.writeHead(404).end(JSON.stringify({
          error: 'error',
          message: 'Task not found!'
        }))
      }


      database.update('tasks', id, {
        title,
        description,
        updated_at: new Date()
      })

      return response.writeHead(204).end();
    }
  },
  {
    method: 'PATCH',
    path: buildRoutePath('/tasks/:id/complete'),
    handler: (request, response) => {
      const { id } = request.params

      const [task] = database.select('tasks', { id })

      if (!task) {
        return res.writeHead(404).end({
          error: 'error',
          message: 'Task not found!'
        })
      }

      const isTaskCompleted = !!task.completed_at
      const completedAt = isTaskCompleted ? null : new Date()

      database.update('tasks', id, { completed_at: completedAt })

      return response.writeHead(204).end()
    }
  },
  {
    method: 'DELETE',
    path: buildRoutePath('/tasks/:id'),
    handler: (request, response) => {
      const { id } = req.params

      const [task] = database.select('tasks', { id })

      if (!task) {
        return res.writeHead(404).end({
          error: 'error',
          message: 'Task not found!'
        })
      }

      database.delete('tasks', id);

      return response.writeHead(204).end();
    }
  }
]