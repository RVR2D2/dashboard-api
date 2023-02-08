import express from 'express';
import { userRouter } from "./users/users";
const port = 8000;
const app = express();
app.use((req, res, next) => {
    console.log('Время ', Date.now());
    next();
});
app.get('/hello', (req, res) => {
    throw new Error('Error');
});
app.use('/users', userRouter);
app.use((err, req, res, next) => {
    console.log(err === null || err === void 0 ? void 0 : err.message);
    res === null || res === void 0 ? void 0 : res.status(500).send(err === null || err === void 0 ? void 0 : err.message);
});
app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
});
