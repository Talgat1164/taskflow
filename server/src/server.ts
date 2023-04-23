import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io'; 
import mongoose from 'mongoose';
import * as usersController  from './controllers/users';
import * as boardsController from "./controllers/boards";
import bodyParser from 'body-parser';
import authMiddleware from './middlewares/auth';
import cors from 'cors';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);
const PORT = 4001; 

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

mongoose.set("toJSON", {
  virtuals: true,
  transform: (_, converted) => {
    delete converted._id;
  },
});

app.get('/', (req, res) => {
  res.send('Api is up');
})

app.post('/api/users', usersController.register);
app.post('/api/users/login', usersController.login);
app.get('/api/user', authMiddleware, usersController.currentUser);
app.get("/api/boards", authMiddleware, boardsController.getBoards);
app.post("/api/boards", authMiddleware, boardsController.createBoard);

io.on('connection', () => {
  console.log('connect');
});

mongoose.connect("mongodb+srv://ttokayev7:F7NIZjfbukE8T90r@cluster0.n7ex4ub.mongodb.net/?retryWrites=true&w=majority").then(() => {
  console.log('connected to mongodb'); 
  httpServer.listen(PORT, () => {
    console.log(`Api PORT = ${PORT}`)
  })
})

