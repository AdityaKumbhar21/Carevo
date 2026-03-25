<div align="center">

# CAREVO - AI Career Guidance Platform

### *Personalized Career Discovery, Roadmaps, and Growth Tracking*

[![Live Demo](https://img.shields.io/badge/Live_Demo-Visit_Site-blue?style=for-the-badge)](https://carevo-nine.vercel.app/)
[![Demo Video](https://img.shields.io/badge/Demo_Video-Coming_Soon-red?style=for-the-badge)](#)
[![React](https://img.shields.io/badge/React-19.2.0-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express_5-339933?style=flat-square&logo=nodedotjs)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.2.0-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)

<p align="center">
	<img src="https://img.shields.io/badge/status-active-success?style=flat-square" alt="Status">
	<img src="https://img.shields.io/badge/license-ISC-blue?style=flat-square" alt="License">
</p>

---

**CAREVO** is an AI-powered career guidance platform that helps users discover best-fit careers, generate personalized learning roadmaps, track daily progress, and stay motivated through analytics and gamification.

[Launch Project](https://carevo-nine.vercel.app/)
</div>

---

## Features

<table>
<tr>
<td width="50%">

### User Features

| Feature | Description |
|---------|-------------|
| Secure Authentication | Register, login, email verification, OTP verification, password reset |
| Career DNA Insights | Personalized personality and career-fit analysis |
| Smart Career Matching | AI-driven career recommendations with simulation support |
| Validation Quiz | Generate and submit quizzes to validate user career alignment |
| Roadmap Generator | AI-generated structured roadmap to reach selected careers |
| Daily Tasks | Track today tasks, completion checks, and progress flow |
| Analytics Dashboard | Skills, probability, and growth overview endpoints |
| Gamification | Daily check-ins, badge unlocks, and progress rewards |

</td>
<td width="50%">

### Platform Features

| Feature | Description |
|---------|-------------|
| REST API Architecture | Clean modular route/controller/service structure |
| JWT Authorization | Protected routes with middleware-based access control |
| Schema Validation | Request validation using Zod + express middleware |
| AI Integration | Gemini-powered roadmap and quiz generation services |
| Email Workflows | Verification and password reset email support |
| Background Jobs | Cron-driven reminder workflows |
| CORS & Env Config | Production-ready CORS whitelist and env-based setup |
| Scalable Codebase | Separated configs, models, routes, and reusable services |

</td>
</tr>
</table>

### AI-Powered Features

| Feature | Description |
|---------|-------------|
| Career Recommendation Intelligence | Context-aware suggestions from user profile and behavior |
| Adaptive Quiz Generation | AI-generated validation quizzes per target role |
| Roadmap Synthesis | Multi-step learning plans generated from user goals |
| Regional Accessibility | Architecture ready for localized and multilingual outputs |

---

## How It Works

### For Users
1. Create account and verify identity via email/OTP.
2. Complete profile and career DNA inputs.
3. Explore recommended careers and run career simulation.
4. Generate a personalized roadmap and validation quiz.
5. Complete daily tasks and track progress via analytics + badges.

### For the Platform
- Aligns recommendations using profile + AI-generated insights.
- Converts long-term goals into actionable roadmap tasks.
- Encourages habit consistency through check-ins and rewards.
- Measures growth through analytics endpoints and progress metrics.

---

## Tech Stack

<div align="center">

| Layer | Technology |
|-------|------------|
| Frontend | ![React](https://img.shields.io/badge/React-19.2.0-61DAFB?logo=react&logoColor=white) ![Vite](https://img.shields.io/badge/Vite-7.3.1-646CFF?logo=vite&logoColor=white) ![Tailwind](https://img.shields.io/badge/Tailwind-4.2.0-06B6D4?logo=tailwindcss&logoColor=white) |
| Backend | ![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=nodedotjs&logoColor=white) ![Express](https://img.shields.io/badge/Express-5.2.1-000000?logo=express&logoColor=white) |
| Database | ![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose_9.2.1-47A248?logo=mongodb&logoColor=white) |
| AI | ![Google Gemini](https://img.shields.io/badge/Google_Gemini-0.24.1-4285F4?logo=google&logoColor=white) |
| Auth | ![JWT](https://img.shields.io/badge/JWT-9.0.3-000000?logo=jsonwebtokens&logoColor=white) ![bcrypt](https://img.shields.io/badge/bcryptjs-3.0.3-7952B3) |
| Automation | ![node-cron](https://img.shields.io/badge/node--cron-4.2.1-4B8BBE) ![Resend](https://img.shields.io/badge/Resend-6.9.2-black) |
| Tooling | ![ESLint](https://img.shields.io/badge/ESLint-10.0.0-4B32C3?logo=eslint&logoColor=white) ![Nodemon](https://img.shields.io/badge/Nodemon-3.1.13-76D04B?logo=nodemon&logoColor=white) |

</div>

---

## Project Structure

```text
carevo/
├── backend/
│   ├── package.json
│   └── src/
│       ├── index.js
│       ├── config/
│       │   └── db.js
│       ├── controllers/
│       ├── middlewares/
│       ├── models/
│       ├── routes/
│       ├── scripts/
│       ├── services/
│       └── validators/
├── frontend/
│   ├── package.json
│   ├── index.html
│   ├── vite.config.js
│   ├── public/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── services/
│       └── utils/
└── README.md
```

---

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB Atlas or local MongoDB instance
- npm

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd carevo
```

### 2. Backend Setup

```bash
cd backend
npm install

# create .env manually and add variables from this README

# run development server
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### 4. Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:5001

---

## Environment Variables

### Backend (backend/.env)

```env
# App
PORT=5001
NODE_ENV=development

# Database
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>/<db_name>

# Auth
JWT_SECRET=your_jwt_secret

# URLs
FRONTEND_URL=http://localhost:5173
CLIENT_URL=http://localhost:5173

# AI + Integrations
GEMINI_API_KEY=your_gemini_api_key
RAPIDAPI_KEY=your_rapidapi_key

# Email
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=Carevo <no-reply@yourdomain.com>
DOMAIN=yourdomain.com
```

### Frontend (frontend/.env)

```env
VITE_API_URL=http://localhost:5001/api
```

---

## API Endpoints

### Authentication

| Method | Endpoint |
|--------|----------|
| POST | /api/auth/register |
| POST | /api/auth/login |
| POST | /api/auth/send-otp |
| POST | /api/auth/verify-otp |
| POST | /api/auth/forgot-password |
| POST | /api/auth/reset-password/:token |
| GET | /api/auth/verify-email/:token |
| GET | /api/auth/me |

### Profile

| Method | Endpoint |
|--------|----------|
| POST | /api/user/profile/setup |
| PUT | /api/user/profile/update |
| GET | /api/user/profile |

### Careers and DNA

| Method | Endpoint |
|--------|----------|
| GET | /api/careers |
| GET | /api/careers/recommendations |
| POST | /api/careers/simulate |
| GET | /api/career-dna |

### Roadmap, Quiz, Tasks

| Method | Endpoint |
|--------|----------|
| POST | /api/roadmap/generate |
| GET | /api/roadmap |
| POST | /api/quiz/validation/generate |
| GET | /api/quiz/validation |
| POST | /api/quiz/submit |
| GET | /api/tasks/today |
| POST | /api/tasks/complete |

### Analytics and Gamification

| Method | Endpoint |
|--------|----------|
| GET | /api/analytics/skills |
| GET | /api/analytics/probability |
| GET | /api/analytics/overview |
| POST | /api/gamification/check-in |
| GET | /api/gamification/status |
| GET | /api/gamification/badges |
| GET | /api/badges |

---

## Deployment

### Frontend (Vercel)
1. Import the frontend project in Vercel.
2. Set build command: npm run build.
3. Set output directory: dist.
4. Add frontend environment variables.

### Backend (Render)
1. Create a new Web Service for backend.
2. Set build command: npm install.
3. Set start command: npm start.
4. Add backend environment variables.

---

## 👥 Team

<table>
<tr>
<td align="center">
<a href="https://github.com/someear9h">
<img src="https://github.com/someear9h.png" width="100px;" alt="Samarth"/><br />
<sub><b>Samarth Titotkar</b></sub>
</a><br />
<a href="mailto:tikotkarsamarth@gmail.com">📧</a>
</td>
<td align="center">
<a href="https://github.com/AdityaKumbhar21">
<img src="https://github.com/AdityaKumbhar21.png" width="100px;" alt="Aditya"/><br />
<sub><b>Aditya Kumbhar</b></sub>
</a><br />
<a href="mailto:adityakumbhar915@gmail.com">📧</a>
</td>
<td align="center">
<a href="https://github.com/shivraj-nalawade">
<img src="https://github.com/shivraj-nalawade.png" width="100px;" alt="Shivraj"/><br />
<sub><b>Shivraj Nalawade</b></sub>
</a><br />
<a href="mailto:shivrajnalawade77@gmail.com">📧</a>
</td>
<td align="center">
<a href="https://github.com/Kas1705">
<img src="https://github.com/Kas1705.png" width="100px;" alt="Kishan"/><br />
<sub><b>Kishan Shukla</b></sub>
</a><br />
<a href="mailto:kishanshukla509@gmail.com">📧</a>
</td>
</tr>
</table>


---


<div align="center">

Star this repo if you found it useful.

</div>
