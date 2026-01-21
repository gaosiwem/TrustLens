# TrustLens

TrustLens is a comprehensive **Consumer Trust & Complaint Management Platform** designed to bring transparency and accountability to the marketplace. It empowers consumers to voice their issues while providing brands with professional tools to manage their reputation and resolve customer concerns effectively.

---

## 🚀 Key Features

### For Consumers

- **Professional Complaint Filing**: Use our AI-powered assistant to professionalize and structure your complaints.
- **Real-Time Tracking**: Monitor the status of your submissions from `SUBMITTED` to `RESOLVED` in real-time.
- **Community Transparency**: Browse public complaints and see how brands respond to customer issues.
- **Industry Directory**: Explore brands across various sectors in South Africa, from Finance to Automotive.

### For Brands

- **Official Responses**: Respond officially to customer complaints with a verified brand badge.
- **Reputation Dashboard**: Access detailed analytics, sentiment trends, and resolution efficiency metrics.
- **Brand Verification**: Claim your brand profile with official business credentials to build lasting customer trust.
- **Portfolio Management**: Manage multiple brands from a single consolidated dashboard.

### For Administrators

- **Governance Tools**: Monitor escalations, manage enforcement actions, and maintain platform integrity.
- **Trust Heatmap**: Visualize brand performance and high-risk sectors across the ecosystem.
- **Verification Queue**: Review and process brand verification requests locally and globally.

---

## 🛠️ Technology Stack

### Frontend

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Styling**: Tailwind CSS (with custom design system)
- **Authentication**: NextAuth.js
- **Icons**: Lucide React & Material Symbols

### Backend

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: Prisma ORM (connecting to MySQL/Postgres)
- **Task Queue**: Redis-based AI processing jobs
- **Security**: JWT-based authentication & role-based access control (RBAC)

---

## 🏗️ Getting Started

### Prerequisites

- Node.js (v18+)
- npm / yarn / pnpm
- A running Redis instance (for background jobs)
- Database (PostgreSQL or MySQL)

### 1. Clone the repository

```bash
git clone https://github.com/gaosiwem/TrustLens.git
cd TrustLens
```

### 2. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd Backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables in `.env`:
   ```env
   DATABASE_URL="your_database_url"
   REDIS_HOST="localhost"
   REDIS_PORT=6379
   JWT_SECRET="your_secret"
   ```
4. Run migrations:
   ```bash
   npx prisma migrate dev
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```

### 3. Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables in `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL="http://localhost:4000"
   NEXTAUTH_SECRET="your_secret"
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

---

## 🤖 AI Integration

TrustLens utilizes advanced AI modules to:

- **Summarize Complaints**: Automatically generate professional summaries of complex consumer issues.
- **Sentiment Analysis**: Analyze brand reputation trends based on the tone and volume of complaints.
- **Intelligent Search**: Provide semantic search capabilities across the industry directory.

---

## ⚖️ License

Distributed under the MIT License. See `LICENSE` for more information.

---

© 2026 TrustLens Technologies • South Africa
