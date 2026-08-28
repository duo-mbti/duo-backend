// 서버 진입점
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const testsRouter = require('./routes/tests');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/tests', testsRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`서버가 http://localhost:${PORT} 에서 실행중입니다.`);
});
