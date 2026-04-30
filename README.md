# Team Task Manager

A full-stack Team Task Manager built with **React (Vite)** + **Express** + **MongoDB** + **JWT auth**.
Frontend and backend are completely separate. Pure `npm`. No monorepo, no platform-specific dependencies.

```
team-task-manager/
├── client/   # React frontend (Vite + Tailwind)
└── server/   # Node.js backend (Express + Mongoose + JWT)
```
🔗 Live Demo

👉 https://teamtaskmanager-production-b0eb.up.railway.app

📦 GitHub Repository

👉 https://github.com/YOUR_USERNAME/TeamTaskManager

Features
🔐 Authentication
Signup / Login with JWT
Secure password hashing (bcrypt)
Protected routes
👥 Role-Based Access Control
Admin
Create & delete projects
Add/remove members
Create & manage tasks
Member
View assigned projects
Update task status
📁 Project Management
Create multiple projects
Add team members to projects
Manage project-level access
✅ Task Management
Create and assign tasks
Status tracking (Todo / In Progress / Done)
Due date support
Overdue tracking
📊 Dashboard
Tasks assigned to user
Tasks by status
Overdue tasks
---

## Prerequisites

- Node.js 18+
- A MongoDB instance (local or hosted, e.g. MongoDB Atlas)

---

## 1. Backend setup

```bash
cd server
cp .env.example .env       # then edit .env with your real values
npm install
npm run dev
```

`.env` keys:

| Key          | Example                                              |
| ------------ | ---------------------------------------------------- |
| `MONGO_URI`  | `mongodb://127.0.0.1:27017/team_task_manager`        |
| `JWT_SECRET` | a long random string                                 |
| `PORT`       | `5000`                                               |

The server starts on `http://localhost:${PORT}` (default `5000`).

Health check: `GET /api/health` → `{ "status": "ok" }`

---

## 2. Frontend setup

```bash
cd client
cp .env.example .env       # optional, defaults to http://localhost:5000/api
npm install
npm run dev
```

The Vite dev server starts on `http://localhost:5173`.

---

## API endpoints

All protected routes require `Authorization: Bearer <token>`.

### Auth — `/api/auth`

| Method | Path        | Auth   | Description                                  |
| ------ | ----------- | ------ | -------------------------------------------- |
| POST   | `/signup`   | public | `{ email, password, role? }` → `{ token, user }` |
| POST   | `/login`    | public | `{ email, password }` → `{ token, user }`    |
| GET    | `/me`       | user   | Returns the current user                     |
| GET    | `/users`    | user   | List all users (used for assignment)         |

### Projects — `/api/projects`

| Method | Path                       | Role   | Description                             |
| ------ | -------------------------- | ------ | --------------------------------------- |
| GET    | `/`                        | user   | List projects you can access            |
| GET    | `/:id`                     | user   | Get a project (must be member/admin)    |
| POST   | `/`                        | admin  | Create a project                        |
| POST   | `/:id/members`             | admin  | Add a member: `{ userId }`              |
| DELETE | `/:id/members/:userId`     | admin  | Remove a member                         |
| DELETE | `/:id`                     | admin  | Delete a project (and its tasks)        |

### Tasks — `/api/tasks`

| Method | Path                  | Role        | Description                                                 |
| ------ | --------------------- | ----------- | ----------------------------------------------------------- |
| GET    | `/mine`               | user        | Tasks assigned to me                                        |
| GET    | `/project/:projectId` | user        | Tasks for a project                                         |
| POST   | `/`                   | admin       | Create a task                                               |
| PATCH  | `/:id`                | user/admin  | Members can update **status only**; admins can update all   |
| DELETE | `/:id`                | admin       | Delete a task                                               |

### Roles

- **admin** — create projects, add/remove members, create/update/delete tasks
- **member** — view assigned projects, update task status

---

## Test in Postman

1. `POST /api/auth/signup` with `{ "email": "admin@example.com", "password": "secret", "role": "admin" }`
2. Copy the returned `token`. Add header `Authorization: Bearer <token>` to subsequent requests.
3. `POST /api/projects` with `{ "name": "Launch", "description": "Q1 launch" }`
4. `POST /api/tasks` with `{ "title": "Write copy", "projectId": "<id>" }`
5. `PATCH /api/tasks/:id` with `{ "status": "Done" }`

---

## Deployment (Railway)

### Backend

1. Push the repo to GitHub.
2. On Railway, create a new project → Deploy from GitHub → select the `server/` folder as the root.
3. Set environment variables: `MONGO_URI`, `JWT_SECRET`. (Railway sets `PORT` automatically.)
4. Build command: `npm install`
5. Start command: `npm start`

### Frontend

1. Set `VITE_API_URL` in `client/.env` to your deployed backend URL (e.g. `https://your-api.up.railway.app/api`).
2. Build with `npm run build` — output is in `client/dist`.
3. Deploy `client/dist` to Vercel / Netlify / Railway static hosting.

---

## Project layout

### `server/`

```
server/
├── config/db.js               # Mongo connection
├── controllers/               # Route handlers
│   ├── authController.js
│   ├── projectController.js
│   └── taskController.js
├── middleware/
│   ├── auth.js                # JWT verification
│   └── role.js                # Role-based access guard
├── models/
│   ├── User.js
│   ├── Project.js
│   └── Task.js
├── routes/
│   ├── auth.js
│   ├── projects.js
│   └── tasks.js
├── index.js                   # Express entry
├── .env.example
└── package.json
```

### `client/`

```
client/
├── index.html
├── tailwind.config.js
├── postcss.config.js
├── vite.config.js
├── src/
│   ├── api/axios.js           # Axios instance with JWT interceptor
│   ├── context/AuthContext.jsx
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── ProtectedRoute.jsx
│   │   └── TaskCard.jsx
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Signup.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Projects.jsx
│   │   └── ProjectDetails.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
└── package.json
```
