# 🚀 AI-Powered DevSecOps Control Center

A complete **AI-powered DevSecOps platform** that automates CI/CD, Security Scanning, AI-based Analysis, Docker Deployment, and Application Monitoring for the **Wanderlust 3-Tier Application**.

This project demonstrates how modern DevOps and AI can be integrated into a single centralized dashboard for continuous development, security, deployment, and monitoring.

---

# 📌 Project Overview

The project consists of three major components:

- 🔄 Jenkins CI/CD Pipeline
- 🛡️ DevSecOps Security Pipeline
- 🤖 AI-Powered Monitoring Dashboard

The pipeline automatically performs:

- Source Code Checkout
- Dependency Installation
- SonarQube Code Analysis
- Trivy Vulnerability Scanning
- Docker Image Build
- Docker Hub Push
- Automatic Deployment
- AI Security Analysis
- Centralized Reporting

---

# 🏗️ Architecture

```
Developer
     │
     ▼
 GitHub Repository
     │
     ▼
 Jenkins Pipeline
     │
 ┌──────────────┬──────────────┐
 │              │              │
 ▼              ▼              ▼
SonarQube    Trivy Scan   Docker Build
 │              │              │
 └──────────────┴──────────────┘
               │
               ▼
       Docker Deployment
               │
               ▼
    Wanderlust 3-Tier App
               │
               ▼
AI-Powered DevSecOps Dashboard
               │
               ▼
 Reports • Monitoring • Analytics
```

---

# ✨ Features

## 🔄 CI/CD

- Jenkins Pipeline
- Automatic Build
- Docker Image Creation
- Docker Hub Push
- Automated Deployment

---

## 🛡️ DevSecOps

- SonarQube Code Quality
- Trivy Vulnerability Scan
- Security Reports
- Risk Assessment

---

## 🤖 AI Features

- AI Security Analysis
- AI Risk Assessment
- AI Recommendations
- Executive Summary
- AI Generated Reports

---

## 📊 Dashboard

- Executive Overview
- Pipeline Monitoring
- Security Dashboard
- AI Analysis
- Deployment Monitoring
- Application Health
- Reports Center

---

# 🛠️ Technology Stack

### Frontend

- React
- Vite
- Tailwind CSS

### Backend

- Node.js
- Express.js
- MongoDB

### DevOps

- Jenkins
- Docker
- Docker Compose
- SonarQube
- Trivy

### AI

- Google Gemini API

---

# 📂 Project Structure

```
DevOps_project/

├── central-dashboard/
│   ├── frontend/
│   └── backend/
│
├── wanderlust-3tier-project/
│
├── cicd-jenkins/
│
├── docs/
│   └── DevSecOps-Setup.md
│
├── README.md
└── .gitignore
```

---

# 📸 Screenshots

Add screenshots here.

- Dashboard
- Jenkins Pipeline
- SonarQube
- Trivy Scan
- AI Analysis
- Reports

---

# 🚀 Getting Started

Clone the repository

```bash
git clone https://github.com/PratikRangarii/DevSecOps-AI-Pipeline.git

cd DevOps_project
```

Install dependencies

```bash
cd central-dashboard/backend
npm install

cd ../frontend
npm install
```

Run the backend

```bash
npm run dev
```

Run the frontend

```bash
npm run dev
```

Start Jenkins & SonarQube

```bash
docker compose up -d
```

---

# 📖 Documentation

A complete step-by-step setup guide is available here:

**📄 docs/DevSecOps-Setup.md**

The guide includes:

- Jenkins Installation
- Docker Setup
- SonarQube Configuration
- Trivy Configuration
- SSH Agent Setup
- Jenkins Plugins
- Credentials
- Pipeline Configuration
- Deployment
- Troubleshooting

---

# 🚀 Future Enhancements

- Kubernetes Deployment
- Prometheus Monitoring
- Grafana Dashboard
- Email Notifications
- Slack Notifications
- RBAC Authentication
- Multi-Project Support
- PDF Report Generation

---

# 👨‍💻 Author

**Pratik Rangari**

Frontend Developer | MERN Stack | DevSecOps Engineer


---

# ⭐ Support

If you found this project useful, please consider giving it a ⭐ on GitHub.
