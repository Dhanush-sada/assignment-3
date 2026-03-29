const express = require('express');
const { createClient } = require('redis');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = process.env.REDIS_PORT || 6379;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const client = createClient({
  socket: {
    host: REDIS_HOST,
    port: REDIS_PORT,
    reconnectStrategy: (retries) => Math.min(retries * 100, 3000)
  }
});

client.on('error', (err) => console.error('Redis Client Error:', err));
client.on('connect', () => console.log(`Connected to Redis at ${REDIS_HOST}:${REDIS_PORT}`));

(async () => {
  await client.connect();
})();

app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await client.lRange('tasks', 0, -1);
    const parsed = tasks.map(t => JSON.parse(t));
    res.json(parsed);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

app.post('/api/tasks', async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });
    const task = {
      id: Date.now().toString(),
      title,
      completed: false,
      createdAt: new Date().toISOString()
    };
    await client.lPush('tasks', JSON.stringify(task));
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create task' });
  }
});

app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const tasks = await client.lRange('tasks', 0, -1);
    const target = tasks.find(t => JSON.parse(t).id === id);
    if (!target) return res.status(404).json({ error: 'Task not found' });
    await client.lRem('tasks', 1, target);
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Task Manager API running on port ${PORT}`);
});
