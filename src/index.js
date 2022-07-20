const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
   const { username } = request.headers;

   const user = users.find((user) => user.username === username);
   if (!user) {
      return response.status(400).json({ error: 'Mensagem do erro' });
   }

   request.user = user;
   return next();
}

app.post('/users', (request, response) => {
   const { name, username } = request.body;

   const newUser = {
      id: uuidv4(),
      name,
      username,
      todos: [],
   }
   
   const userExists = users.some((user) => user.username === username);
   if (userExists) {
      return response.status(400).json({ error: 'Mensagem do erro' });
   }

   users.push(newUser);

   response.status(201).json(newUser);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
   const { user } = request;
   
   return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
   const { user } = request;
   const { title, deadline } = request.body;
   
   const newTodo = {
      id: uuidv4(),
      title,
      done: false,
      deadline: new Date(deadline),
      created_at: new Date(),
   }
   
   user.todos.push(newTodo);
   return response.status(201).json(newTodo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
   const { user } = request;
   const { title, deadline } = request.body;
   const { id } = request.params;
   
   const todoIndex = user.todos.findIndex((todo) => todo.id === id);
   if (todoIndex === -1) {
      return response.status(404).json({ error: 'Mensagem do erro' });
   }
   
   user.todos[todoIndex] = { 
      ...user.todos[todoIndex],
      title,
      deadline: new Date(deadline),
   }

   return response.json(user.todos[todoIndex]);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
   const { user } = request;
   const { id } = request.params;
   
   const todoIndex = user.todos.findIndex((todo) => todo.id === id);
   if (todoIndex === -1) {
      return response.status(404).json({ error: 'Mensagem do erro' });
   }

   user.todos[todoIndex] = {
      ...user.todos[todoIndex],
      done: true,
   }

   return response.json(user.todos[todoIndex]);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
   const { user } = request;
   const { id } = request.params;

   const todoIndex = user.todos.findIndex((todo) => todo.id === id);
   if (todoIndex === -1) {
      return response.status(404).json({ error: 'Mensagem do erro' });
   }

   user.todos.splice(todoIndex, 1);

   return response.status(204).send();
});

module.exports = app;
