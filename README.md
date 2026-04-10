<div align="center">

# Citizen Connect

**AI-powered civic issue reporting — from submission to resolution.**

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-6-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://mongodb.com)
[![License](https://img.shields.io/badge/License-Educational-blue?style=flat-square)](#license)

[Overview](#overview) · [Features](#features) · [Architecture](#architecture) · [Getting Started](#getting-started) · [Roadmap](#roadmap)

</div>

---

## Overview

Citizen Connect is a full-stack civic platform that lets citizens report real-world infrastructure issues — potholes, broken streetlights, drainage failures — and ensures those reports are **verified, prioritized, and routed** to the right people automatically.

Traditional complaint portals suffer from spam, no accountability, and zero cost transparency. Citizen Connect addresses this by running every submission through an AI validation pipeline before it ever reaches an admin or worker.

```
Citizen submits report (image + description)
          │
          ▼
   AI Service analyzes image + metadata
          │
   ┌──────┴──────┐
   │             │
 REAL          FAKE / SUSPICIOUS
   │             │
Accepted      Rejected (with reason)
   │
   ▼
Cost estimate generated → routed to Admin / Worker
```

---

## Features

### AI Verification Pipeline
Every submission is scored for authenticity using image analysis and metadata. Reports classified as suspicious or fake are rejected before entering the system, keeping the queue clean and actionable.

### Role-Based Access
| Role | Capabilities |
|------|-------------|
| **Citizen** | Submit reports, track status, acknowledge issues |
| **Worker** | View assigned verified tasks, upload completion proof |
| **Admin** | Manage complaints, assign workers, view analytics |

### Smart Cost Estimation
Repair cost is automatically estimated in ₹ based on issue type, severity, and location — giving admins a data point before any budget decision.

### Status Lifecycle
```
pending_ai → verified → assigned → in_progress → completed
```

### Community Acknowledgement
Citizens can support each other's reports. Higher engagement surfaces issues with greater community impact to the top of the admin queue.

---

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React (Vite), Tailwind CSS, React Router, Axios, Lucide Icons |
| **Backend** | Node.js, Express.js, MongoDB (Mongoose), JWT, Multer |
| **AI Service** | Node.js, Claude Vision API, Google Vision API (optional), custom decision engine |

---

## Architecture

```
citizen-connect/
├── client/          # React + Vite frontend
├── server/          # Express REST API, JWT auth, MongoDB
└── ai-service/      # Standalone AI microservice (image analysis + scoring)
```

The AI service runs as an independent microservice. The backend communicates with it over HTTP, which means it can be scaled, swapped, or mocked entirely without touching application logic.

---

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB instance (local or Atlas)
- Anthropic API key (or enable mock mode)

### 1. Clone

```bash
git clone https://github.com/your-username/citizen-connect.git
cd citizen-connect
```

### 2. AI Service

```bash
cd ai-service
npm install
```

Create `.env`:

```env
ANTHROPIC_API_KEY=your_key
GOOGLE_VISION_API_KEY=your_key   # optional
AI_PORT=5001
USE_MOCK_AI=true                 # set false in production
```

```bash
node index.js
```

### 3. Backend

```bash
cd ../server
npm install
```

Create `.env`:

```env
MONGODB_URI=your_mongo_uri
JWT_SECRET=your_secret
AI_SERVICE_URL=http://localhost:5001
PORT=5000
DEMO_MODE=true   # bypasses auth for local testing
```

```bash
npm run dev
```

### 4. Frontend

```bash
cd ../client
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

> **Demo mode** — set `DEMO_MODE=true` in the server `.env` to skip authentication and explore all roles without accounts.

---

## Roadmap

- [ ] Real-time notifications via WebSockets
- [ ] Cloud image storage (Cloudinary)
- [ ] Live GPS integration for field workers
- [ ] Advanced admin analytics dashboard
- [ ] Mobile app (React Native)

---

## License

This project is intended for educational and demonstration purposes.

---

<div align="center">

*If this project was useful, consider giving it a ⭐*

</div>