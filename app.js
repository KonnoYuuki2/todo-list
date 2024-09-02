import express from 'express';
import connect from './schemas/index.js';
import TodosRouter from './routes/todo.router.js';
import errorhandler from './middlewares/error-handler.middleware.js';

const app = express();
const PORT = 3000;

connect();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// static Middleware, express.static()을 사용하여 정적 파일을 제공합니다.
// app.js를 기준으로 ./assets 경로에 있는 파일을 아무런 가공 없이 그대로 전달해주는 미들웨어다.
app.use(express.static('./asset')); //자동으로 해당 폴더내에 index.js 파일을 찾아서 실행

app.use((req, res, next) => {
  console.log('Request URL:', req.originalUrl, ' - ', new Date());
  next();
});

const router = express.Router();

router.get('/', (req, res) => {
  return res.status(200).json({ memo: '정상적으로 연결 됨' });
});

//app.use는 미들웨어를 사용하게 해주는 코드다.
//맨 처음 인자 값에 들어간 /api에 의해서 localhost:3000/api 경로로 접근하는 경우에만
//json 미들웨어를 거친 뒤, router로 연결되게 하는 것
app.use('/api', [router, TodosRouter]);

//에러 처리 미들웨어를 등록한다.
app.use(errorhandler);

app.listen(PORT, () => {
  console.log(PORT, '포트로 서버가 열렸다.');
});
