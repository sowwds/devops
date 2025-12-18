import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/todoapp';

app.use(cors());
app.use(express.json());

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Todo Model
interface ITodo {
  title: string;
  description?: string;
  completed: boolean;
}

const todoSchema = new mongoose.Schema<ITodo>({
  title: { type: String, required: true },
  description: { type: String },
  completed: { type: Boolean, default: false },
});

const Todo = mongoose.model<ITodo>('Todo', todoSchema);

// Routes
// GET all todos
app.get('/todos', async (req, res) => {
  try {
    const todos = await Todo.find();
    res.json(todos);
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

// GET a single todo by ID
app.get('/todos/:id', async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (!todo) return res.status(404).json({ message: 'Todo not found' });
    res.json(todo);
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

// POST a new todo
app.post('/todos', async (req, res) => {
  const { title, description } = req.body;
  const todo = new Todo({ title, description });
  try {
    const newTodo = await todo.save();
    res.status(201).json(newTodo);
  } catch (err) {
    res.status(400).json({ message: (err as Error).message });
  }
});

// PUT (update) a todo by ID
app.put('/todos/:id', async (req, res) => {
  try {
    const { title, description, completed } = req.body;
    const updatedTodo = await Todo.findByIdAndUpdate(
      req.params.id,
      { title, description, completed },
      { new: true }
    );
    if (!updatedTodo) return res.status(404).json({ message: 'Todo not found' });
    res.json(updatedTodo);
  } catch (err) {
    res.status(400).json({ message: (err as Error).message });
  }
});

// DELETE a todo by ID
app.delete('/todos/:id', async (req, res) => {
  try {
    const deletedTodo = await Todo.findByIdAndDelete(req.params.id);
    if (!deletedTodo) return res.status(404).json({ message: 'Todo not found' });
    res.json({ message: 'Todo deleted' });
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.send('Todo API is running!');
});

// Server Start
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
