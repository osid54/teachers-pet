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
* **Next.js** (React Framework): For building the user interface, routing, and server-side rendering capabilities.
* **React:** Declarative JavaScript library for building user interfaces.
* **Sass:** CSS pre-processor for structured and maintainable styling.
* **Axios:** Promise-based HTTP client for making API requests.
* **uuid:** For generating unique IDs for template instances.

**Backend:**
* **FastAPI** (Python Web Framework): For building the high-performance, asynchronous API endpoints.
* **Uvicorn:** ASGI server to run the FastAPI application.
* **SQLAlchemy:** Python SQL Toolkit and Object Relational Mapper (ORM) for database interactions.
* **Psycopg (asyncio driver):** PostgreSQL adapter for Python, used with SQLAlchemy for asynchronous database operations.
* **Alembic:** Database migration tool for managing schema changes.
* **Passlib:** Secure password hashing library.
* **Python-jose:** Library for JSON Web Token (JWT) creation and verification.
* **ReportLab:** Python library for generating PDF documents programmatically.

**Database:**
* **PostgreSQL:** Robust, open-source relational database.

**Hosting:**
* **Frontend:** Vercel (for Next.js deployment)
* **Backend & Database:** Railway (for FastAPI web service and PostgreSQL managed database)

## 4. Getting Started

Follow these steps to set up and run Teacher's Pet locally on your machine.

### Prerequisites

Before you begin, ensure you have the following installed:
* [**Node.js**](https://nodejs.org/en/download/) (LTS version recommended) & `npm`
* [**Python 3.9+**](https://www.python.org/downloads/) & `pip`
* [**Git**](https://git-scm.com/downloads)
* [**PostgreSQL**](https://www.postgresql.org/download/) (local server for backend development)

### Local Setup

1.  **Clone the Repository:**
    ```bash
    git clone [https://github.com/your-username/teachers-pet.git](https://github.com/your-username/teachers-pet.git)
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
    * **PostgreSQL Database Configuration:**
        * Ensure your local PostgreSQL server is running.
        * Create a dedicated database user (e.g., `teacherspetuser`) and database (e.g., `teachers_pet_db`) in your local PostgreSQL.
        * Set your `DATABASE_URL` environment variable locally before running the backend:
            * **Example (Windows Command Prompt):**
                `set DATABASE_URL="postgresql+psycopg://teacherspetuser:your_password@localhost/teachers_pet_db"`
            * **Example (macOS/Linux Bash):**
                `export DATABASE_URL="postgresql+psycopg://teacherspetuser:your_password@localhost/teachers_pet_db"`
            * *(Replace `your_password` with your actual local PostgreSQL user's password)*
    * **Alembic Database Migrations:**
        * Initialize Alembic (if not done already): `alembic init alembic_migrations`
        * Generate initial migration (or update existing): `alembic revision --autogenerate -m "Add User and Template tables"`
        * Apply migrations: `alembic upgrade head`
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
        NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
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
    * This will start both your FastAPI backend and Next.js frontend development servers simultaneously.

## 5. Deployment

Teacher's Pet is designed for continuous deployment:

* **Frontend (Next.js):** Hosted on [Vercel](https://vercel.com/).
    * Connected to the `frontend/` subdirectory of this repository.
    * `NEXT_PUBLIC_API_BASE_URL` is configured on Vercel to point to the deployed Railway backend URL.
* **Backend (FastAPI) & Database (PostgreSQL):** Hosted on [Railway](https://railway.app/).
    * Connected to the `backend/` subdirectory of this repository.
    * Database connection string (`DATABASE_URL`) and `SECRET_KEY` are configured as environment variables on Railway.
    * Alembic migrations are automatically applied via a `preDeployHook` in `backend/railway.json`.

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
