import express from 'express';
import Todo from '../schemas/todo.schema.js';
import mongoose from 'mongoose';
import joi from 'joi';

const router = express.Router();
// 1. `value` 데이터는 **필수적으로 존재**해야한다.
// 2. `value` 데이터는 **문자열 타입**이어야한다.
// 3. `value` 데이터는 **최소 1글자 이상**이어야한다.
// 4. `value` 데이터는 **최대 50글자 이하**여야한다.
// 5. 유효성 검사에 실패했을 때, 에러가 발생해야한다.
const createTodoschema = joi.object({
  value: joi.string().min(1).max(50).required(),
});

// 할일 등록 API
router.post('/todos', async (req, res, next) => {
  // 1. 클라이언트로 부터 받아온 value 데이터를 가져온다.
  //const {value} = req.body;
  try {
    //req.body가 객체이기에 req.body로 유효성 검증을 진행한다.
    const validation = await createTodoschema.validateAsync(req.body);

    const { value } = validation;

    // 1-1. 만약 value가 존재하지 않을 때 오류가 발생되는걸 처리
    if (!value) {
      return res
        .status(400)
        .json({ errorMessage: '해야할 일(value) 데이터가 존재하지 않습니다.' });
    }

    // 2. 해당하는 마지막 order 데이터를 조회한다.
    //sort('order')시에 오름차순으로 정렬하여 처음 order 데이터를 뽑았을 때 값이 제일 작은 값이 되므로 -를 붙여서 내림차순으로 처리
    const todoMaxOrder = await Todo.findOne().sort('-order').exec();

    // 3. 만약 존재한다면 현재 해야할 일을 +1 하고 , order 데이터가 존재하지 않는다면, 1로 할당한다.
    const order = todoMaxOrder.order ? todoMaxOrder.order + 1 : +1; // todoMaxOrder.order로 잡아야지만 제대로 값이 추가가 된다는거.

    console.log(order);
    // 4. 해야할 일 등록
    const todos = new Todo({ value, order });
    console.log(`todo:` + todos);
    await todos.save(); //실제로 db에 todo를 저장한다.

    // 5. 해야할 일을 클라이언트에게  반환
    return res.status(201).json({ todos });
  } catch (error) {
    next(error);
  }
});

// 해야할 일 목록 조회 api
router.get('/todos', async (req, res, next) => {
  const todos = await Todo.find().sort('-order').exec(); //find()는 여러개의 데이터를 조회한다.
  return res.status(200).json({ todos }); //여기서 json내부에 들어간 값이 해당 객체의 이름이 된다.
});

// 할일 순서 변경,완료 / 해제 API
router.patch('/todos/:todoId', async (req, res, next) => {
  const { todoId } = req.params;
  const { value, order, done } = req.body;

  //나의 order가 무엇인지 알아야함
  const currentTodo = await Todo.findById(todoId).exec();
  //todoId에 해당하는 id가 존재하지 않을 때
  if (!currentTodo) {
    return res
      .status(404)
      .json({ errorMessage: '존재하지 않는 해야할 일 입니다.' });
  }

  //해야 할 일의 순서 변경
  //기존에 있던 order의 값은 현재의 order 값이 되고
  if (order) {
    const todoOrder = await Todo.findOne({ order }).exec();
    if (todoOrder) {
      todoOrder.order = currentTodo.order;
      await todoOrder.save();
    }

    //현재의 order 값은 새로 들어온 order가 된다.
    currentTodo.order = order;
  }

  if (done !== undefined) {
    // true나 false를 둘다 받을 수 있다.
    currentTodo.doneAt = done ? new Date() : null;
  }

  if (value) {
    currentTodo.value = value;
  }

  await currentTodo.save();

  return res.status(200).json({});
});

// 할일 삭제 API
router.delete('/todos/:todoId', async (req, res, next) => {
  const { todoId } = req.params;
  //console.log(todoId);

  const deleteTodo = await Todo.findById(todoId).exec();

  if (!deleteTodo) {
    return res
      .status(404)
      .json({ errorMessage: '존재하지 않는 해야할 일 Id다.' });
  }

  await Todo.deleteOne({ _id: todoId });

  return res.status(200).json({});
});

// 할일 내용 변경 API
export default router;
