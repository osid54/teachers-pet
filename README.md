# Teacher's Pet

**Empowering Educators and Students with Customizable Worksheets**

---

## Table of Contents

1.  [About Teacher's Pet](#about-teachers-pet)
2.  [Features](#features)
3.  [Tech Stack](#tech-stack)
4.  [Getting Started](#getting-started)
    * [Prerequisites](#prerequisites)
    * [Local Setup](#local-setup)
5.  [Deployment](#deployment)
6.  [Future Plans](#future-plans)
7.  [License](#license)
8.  [Contact](#contact)

---

## 1. About Teacher's Pet

Teacher's Pet is an intuitive online platform designed to simplify the creation of customizable mathematical worksheets for K-12 educators, homeschooling parents, and students seeking additional practice. It aims to reduce the time spent on manual problem generation, allowing more focus on teaching and personalized learning experiences.

This tool offers dynamic PDF generation based on user-defined topics, number ranges, problem types, and more. Future developments include robust account management, template saving, and a community sharing forum.

## 2. Features

**Worksheet Generation:**
* **Customizable Topics:** Generate problems for Arithmetic (Addition, Subtraction, Multiplication, Division).
* **Adjustable Difficulty:** Control number properties like digit count, and allow/disallow negative numbers.
* **Flexible Layout:** Specify total page count and problems per page.
* **Answer Key Inclusion:** Option to include a full answer key in the generated PDF.
* **Problem Mixing:** Option to generate "Mixed Problems" where problems from all selected topics appear randomized within a single section of the worksheet, while retaining their specific modifiers.

**User Accounts & Template Management (In Progress/Upcoming):**
* **User Registration & Login:** Secure account creation and authentication.
* **Templates Page:** A central hub for managing templates.
* **Inline Authentication:** Login and Register forms directly on the templates page for a seamless experience.
* **Template Saving (In Progress):** Save current worksheet settings as a template to your account.
    * Template properties: Name, Description, Tags (predefined), Public/Private status.
* **Template Loading/Editing (In Progress):**
    * "Use Template": Load template settings onto the generation page for quick use.
    * "Edit Template": (Currently hidden while in development) Load template settings onto the generation page for modification and re-saving.
* **Template Listing:** View your own created templates ("My Templates").
* **Template Deletion:** Delete your own templates.

**Community & Sharing:**
* **Public Templates Listing:** Browse templates shared by other users.
* **Search & Filter:** Find templates by name, description, and tags.
* **Sorting:** Sort templates by date created or popularity (likes).
* **Like/Favorite Templates:** Social features to interact with public templates.

## 3. Tech Stack

Teacher's Pet is built with a modern, full-stack architecture:

**Frontend:**
* **Vite + React Router:** Client-side React app with browser-based routing.
* **React:** Declarative JavaScript library for building user interfaces.
* **Tailwind CSS:** Utility-based styling.
* **Axios:** Promise-based HTTP client for making API requests.
* **uuid:** For generating unique IDs for template instances.

**Backend:**
* **FastAPI** (Python Web Framework): For building the high-performance, asynchronous API endpoints.
* **Uvicorn:** ASGI server to run the FastAPI application.
* **SQLAlchemy:** Python SQL Toolkit and Object Relational Mapper (ORM) for database interactions.
* **asyncpg:** PostgreSQL adapter used by SQLAlchemy for asynchronous database operations.
* **Alembic:** Database migration tool for managing schema changes.
* **Passlib:** Secure password hashing library.
* **Python-jose:** Library for JSON Web Token (JWT) creation and verification.
* **ReportLab:** Python library for generating PDF documents programmatically.

**Database:**
* **PostgreSQL:** Robust, open-source relational database.

**Hosting:**
* **Frontend:** Vercel (static Vite build)
* **Backend & Database:** Railway (for FastAPI web service and PostgreSQL managed database)

## 4. Getting Started

Follow these steps to set up and run Teacher's Pet locally on your machine.

### Prerequisites

Before you begin, ensure you have the following installed:
* [**Node.js**](https://nodejs.org/en/download/) (LTS version recommended) & `npm`
* [**Python 3.12**](https://www.python.org/downloads/) & `pip` (matches backend CI and the runtime pin)
* [**Git**](https://git-scm.com/downloads)
* [**PostgreSQL**](https://www.postgresql.org/download/) (local server for backend development)

### Local Setup

If you only want to run the frontend against the hosted API, you do not need a local backend or PostgreSQL installation. Configure `VITE_API_BASE_URL` in `frontend/.env.local` with the Railway API URL and skip the backend steps below. Worksheet and template changes will use the live service.

1.  **Clone the Repository:**
    ```bash
    git clone [https://github.com/osid54/teachers-pet.git](https://github.com/osid54/teachers-pet.git)
    cd teachers-pet
    ```

2.  **Backend Setup:**
    * Navigate into the backend directory:
        ```bash
        cd backend
        ```
    * Create and activate a Python virtual environment:
        ```bash
        python -m venv venv
        # On Windows: venv\Scripts\activate.bat
        # On macOS/Linux: source venv/bin/activate
        ```
    * Install Python dependencies:
        ```bash
        pip install -r requirements.txt
        ```
    * Run backend tests from `backend/`:
        ```bash
        python -m unittest discover -s tests
        ```
    * **PostgreSQL Database Configuration:**
        * Ensure your local PostgreSQL server is running.
        * Create a dedicated database user (e.g., `teacherspetuser`) and database (e.g., `teachers_pet_db`) in your local PostgreSQL.
        * Set your `DATABASE_URL` environment variable locally before running the backend:
            * **Example (Windows Command Prompt):**
                `set "DATABASE_URL=postgresql+asyncpg://teacherspetuser:your_password@localhost/teachers_pet_db"`
            * **Example (macOS/Linux Bash):**
                `export DATABASE_URL="postgresql+asyncpg://teacherspetuser:your_password@localhost/teachers_pet_db"`
            * *(Replace `your_password` with your actual local PostgreSQL user's password)*
        * Set `SECRET_KEY` to a unique random value before starting the backend. For example, generate one with `python -c "import secrets; print(secrets.token_urlsafe(32))"`, then set it in your shell. Do not reuse the production key in local development.
    * **Alembic Database Migrations:**
        * The repository already contains Alembic configuration and migration history. Do not initialize Alembic again.
        * Apply the checked-in migrations to a fresh local database: `alembic upgrade head`
        * After model changes, create and review a migration with `alembic revision --autogenerate -m "describe schema change"`, then apply it locally.
    * **Run the Backend Server (Optional, for running only backend):**
        ```bash
        uvicorn main:app --reload --port 5000
        ```
        (The API will be accessible at `http://127.0.0.1:5000` and docs at `http://127.0.0.1:5000/docs`).

3.  **Frontend Setup:**
    * Open a new terminal window.
    * Navigate into the frontend directory:
        ```bash
        cd frontend
        ```
    * Install Node.js dependencies:
        ```bash
        npm install
        ```
    * **Frontend Environment Variables:** Create a `.env.local` file in `frontend/` and add your local backend URL:
        ```
        VITE_API_BASE_URL=http://localhost:5000
        ```
    * **Run the Frontend Development Server (Optional, for running only frontend):**
        ```bash
        npm run dev
        ```
        (The frontend will be accessible at `http://localhost:3000`).

4.  **Run Both Frontend and Backend Concurrently:**
    * From the `frontend/` directory, use the `dev-all` script:
        * **On Windows:**
            ```bash
            npm run dev-all
            ```
        * **On macOS/Linux:**
            ```bash
            npm run dev-all-unix
            ```
    * This will start both your FastAPI backend and Vite frontend development servers simultaneously.

## 5. Deployment

Teacher's Pet is designed for continuous deployment:

* **Frontend (Vite):** Hosted on [Vercel](https://vercel.com/).
    * Connected to the `frontend/` subdirectory of this repository.
    * Set the framework preset to Vite and the output directory to `dist`; `frontend/vercel.json` handles client-side routes.
    * `VITE_API_BASE_URL` is configured on Vercel to point to the deployed Railway backend URL.
* **Backend (FastAPI) & Database (PostgreSQL):** Hosted on [Railway](https://railway.app/).
    * Connected to the `backend/` subdirectory of this repository.
    * Database connection string (`DATABASE_URL`) and `SECRET_KEY` are configured as environment variables on Railway.
    * `backend/railway.json` runs `python -m alembic upgrade head` before starting the backend. `backend/.python-version` pins Python 3.12. This is a migration command, not the destructive demo reset.
    * The existing demo database was reset through Alembic and verified on 2026-10-29. Follow `backend/DEPLOYMENT_CHECKLIST.md` before deploying these branch changes; no schema stamping or repeat reset is needed.

## 6. Future Plans

* Implement the "Edit Template" functionality on the generation page.
* Add more math subjects (e.g., Geometry, Advanced Algebra) with specialized problem generators.
* Implement custom PDF formatting options (e.g., specific layouts, fonts).

## 7. License

This project is licensed under the MIT License.

## 8. Contact

Have questions or feedback? Feel free to reach out:
* Email: `[2004.osid54@gmail.com]`
* Website/Portfolio: `[http://www.osid.dev]`

---
