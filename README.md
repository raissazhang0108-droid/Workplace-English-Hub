# Workplace English Hub（职场英语学习）

后端：Python（FastAPI + SQLAlchemy + SQLite）  
前端：React（Vite）  
功能：单词 / 句子 / 场景对话 的增删改查（CRUD）

## 目录结构

- backend/：后端 API（FastAPI）
- frontend/：前端页面（React + Vite）

## 启动后端

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

健康检查：

- http://127.0.0.1:8000/health

说明：

- SQLite 数据库文件默认生成在 `backend/` 目录下：`workplace_english.db`
- 已配置 CORS 允许 `http://localhost:5173`

## 启动前端

```bash
cd frontend
npm install
npm run dev
```

访问：

- http://localhost:5173

## API 一览（CRUD）

### 单词 Words
- GET    `/api/words`
- POST   `/api/words`
- PUT    `/api/words/{word_id}`
- DELETE `/api/words/{word_id}`

### 句子 Sentences
- GET    `/api/sentences`
- POST   `/api/sentences`
- PUT    `/api/sentences/{sentence_id}`
- DELETE `/api/sentences/{sentence_id}`

### 场景对话 Dialogues
- GET    `/api/dialogues`
- POST   `/api/dialogues`
- PUT    `/api/dialogues/{dialogue_id}`
- DELETE `/api/dialogues/{dialogue_id}`

## 常见问题

- 前端请求失败（CORS/连接失败）
  - 确认后端在 `127.0.0.1:8000` 启动
  - 确认前端在 `localhost:5173` 访问
