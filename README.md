Here is a professional, production-grade `README.md` for your project, tailored to the modular backend architecture and features present in your source code.

---

# 🚀 MPMS (Modern Project Management System) API

> A robust, scalable Node.js REST API for managing projects, sprints, tasks, and team collaboration.

This backend service powers the MPMS platform, providing secure authentication, role-based access control, file attachments, time-tracking, and real-time activity logging. Built with strict type safety and a modular architecture, it is designed for scale, maintainability, and seamless frontend integration.

### 🛠 Tech Stack

| Category                 | Technology                  |
| ------------------------ | --------------------------- |
| **Backend Framework**    | Node.js, Express.js         |
| **Language**             | TypeScript                  |
| **Database & ORM**       | PostgreSQL, Prisma          |
| **Validation**           | Zod                         |
| **Authentication**       | JSON Web Tokens (JWT)       |
| **File Uploads**         | Multer (Local/Disk Storage) |
| **Emails/Notifications** | Nodemailer                  |

---

## 🏗 Architecture / Design Patterns

This project follows a strict **Feature-Sliced Modular Architecture** to maintain clean code and separation of concerns.

- **Modular Structure (`src/app/modules/`)**: Every core feature (Auth, Users, Projects, Tasks, Sprints, Comments) is isolated into its own module.
- **Controller-Service Pattern**:
- `*.route.ts`: Defines API endpoints and attaches middleware.
- `*.controller.ts`: Handles HTTP requests/responses and extracts payloads.
- `*.service.ts`: Contains pure business logic and database transactions.

- **Centralized Validation**: Zod is used alongside a `validateRequest` middleware to ensure strict runtime type-checking before requests reach the controllers.
- **Global Error Handling**: A centralized `globalErrorHandler` catches all operational and unhandled exceptions, formatting them into standardized API responses.

---

## 📋 Prerequisites

Ensure you have the following installed on your local development machine:

- **Node.js** (v18.0.0 or higher)
- **pnpm** (v8.0.0 or higher)
- **PostgreSQL** (v14 or higher running locally or via Docker)

---

## 💻 Local Setup Sequence

Follow these steps to get the backend running locally.

**1. Clone the repository and install dependencies**

```bash
git clone <your-repo-url>
cd mpms-server
pnpm install

```

**2. Setup Environment Variables**

```bash
cp .env.example .env

```

_(Open the `.env` file and configure your database credentials—see the Environment Variables section below)._

**3. Initialize the Database**

```bash
# Generate the Prisma Client
pnpm prisma generate

# Sync the schema with your local PostgreSQL database
pnpm prisma db push

# (Optional) Seed the database with initial Admin user and dummy data
pnpm run seed

```

**4. Start the Development Server**

```bash
pnpm dev

```

The API will be available at `http://localhost:5000`.

---

## 🔐 Environment Variables

| Variable               | Example Value                                | Description                           |
| ---------------------- | -------------------------------------------- | ------------------------------------- |
| `PORT`                 | `5000`                                       | The port the server runs on.          |
| `DATABASE_URL`         | `postgresql://user:pass@localhost:5432/mpms` | Connection string for PostgreSQL.     |
| `JWT_SECRET`           | `super_secret_key_123`                       | Secret key for signing Auth tokens.   |
| `JWT_EXPIRES_IN`       | `7d`                                         | Lifespan of the authentication token. |
| `EMAIL_USER`           | `your_email`                                 | SMTP server for Nodemailer.           |
| `GOOGLE_CLIENT_ID`     | `google_id`                                  | SMTP port.                            |
| `GOOGLE_CLIENT_SECRET` | `google_secret`                              | SMTP username.                        |
| `GOOGLE_REFRESH_TOKEN` | `google_refresh_token`                       | SMTP password.                        |

---

## 📜 Available Scripts

Use `pnpm` to run these built-in scripts:

```bash
pnpm dev          # Starts the server in development mode using ts-node-dev/nodemon
pnpm build        # Compiles TypeScript into the /dist folder for production
pnpm start        # Runs the compiled JavaScript in production mode
pnpm lint         # Runs ESLint to check for code quality issues
pnpm format       # Formats code using Prettier
pnpm prisma:push  # Pushes schema changes to the database
pnpm seed         # Executes the database seeding script

```

---

## API List using POSTMAN

https://documenter.getpostman.com/view/23489586/2sBXwmPsbD
