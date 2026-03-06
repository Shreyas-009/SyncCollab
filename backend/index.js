import express from 'express';
import connectDB from './connectDb.js';
import dotenv from 'dotenv';
import todoRouter from './routes/todo-routes.js'
import chatRouter from './routes/chat-routes.js'
import path from 'path';
import cors from 'cors';

dotenv.config();

const app = express();

app.use(express.json());

// Allow all origins in development
app.use(cors({
    origin: '*',
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id']
}))

const __dirname = path.resolve();

const PORT = process.env.PORT || 3000;

app.use('/api', todoRouter);
app.use('/api', chatRouter);

connectDB();

if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../frontend/dist")))

    app.get(/.*/, (_, res) => {
        res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"))
    })
}

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
