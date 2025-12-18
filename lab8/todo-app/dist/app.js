"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/todoapp';
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// MongoDB Connection
mongoose_1.default.connect(MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));
const todoSchema = new mongoose_1.default.Schema({
    title: { type: String, required: true },
    description: { type: String },
    completed: { type: Boolean, default: false },
});
const Todo = mongoose_1.default.model('Todo', todoSchema);
// Routes
// GET all todos
app.get('/todos', async (req, res) => {
    try {
        const todos = await Todo.find();
        res.json(todos);
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});
// GET a single todo by ID
app.get('/todos/:id', async (req, res) => {
    try {
        const todo = await Todo.findById(req.params.id);
        if (!todo)
            return res.status(404).json({ message: 'Todo not found' });
        res.json(todo);
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});
// POST a new todo
app.post('/todos', async (req, res) => {
    const { title, description } = req.body;
    const todo = new Todo({ title, description });
    try {
        const newTodo = await todo.save();
        res.status(201).json(newTodo);
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
// PUT (update) a todo by ID
app.put('/todos/:id', async (req, res) => {
    try {
        const { title, description, completed } = req.body;
        const updatedTodo = await Todo.findByIdAndUpdate(req.params.id, { title, description, completed }, { new: true });
        if (!updatedTodo)
            return res.status(404).json({ message: 'Todo not found' });
        res.json(updatedTodo);
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
// DELETE a todo by ID
app.delete('/todos/:id', async (req, res) => {
    try {
        const deletedTodo = await Todo.findByIdAndDelete(req.params.id);
        if (!deletedTodo)
            return res.status(404).json({ message: 'Todo not found' });
        res.json({ message: 'Todo deleted' });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
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
