# Immortal-Template — Modular Flask backend for hackathons & fast projects

> Fast, modular Flask backend template with a service/adapters architecture (routes → services → adapters).
> Designed for quick hackathon spin-ups and reusable production prototypes.

Repository: Khalidiqnaibi / *Immortal-template* on GitHub.

---

## Quick summary

* Clean separation of concerns: **routes → services → adapters**.
* Modular provider pattern for auth & payments (Google OAuth, Stripe).
* Firebase adapter included (but pluggable).
* Test-ready (pytest).
* Designed to be safe to open-source (no secrets in repo; `.env.example` included).

---

## Features

* App factory pattern (`create_app`) for testing and WSGI friendliness.
* Adapter layer to swap databases or storage (e.g., Firebase → PostgreSQL).
* Provider abstraction for OAuth and payments (add new providers by implementing the provider interface).
* Basic project skeleton for quick customization during hackathons.
* Example tests and conventions to keep things maintainable.

---

## Repo snapshot (what's in this repo)

```
.
├── app.py
├── config.py
├── requirements.txt
├── .env.example
├── README.md
├── auth/                # auth service + providers (google)
├── routes/              # flask blueprints (auth, payments, frontend)
├── services/            # business logic layer
├── payments/            # payment provider abstractions / stripe
├── database/            # adapters (firebase_adapter)
├── decorators/          # auth guards / decorators
├── templates/           # server-rendered html / frontend assets
├── static/              # static assets
├── tests/               # pytest tests
└── utils/               # helpers, logging, etc.
```

(derived from repository contents). 

---

## Quick start (local)

1. Clone the repo:

```bash
git clone https://github.com/Khalidiqnaibi/Immortal-template.git
cd Immortal-template
```

2. Create and activate a Python 3.10+ virtualenv:

```bash
python -m venv .venv
source .venv/bin/activate   # Linux / macOS
.venv\Scripts\activate      # Windows
```

3. Install dependencies:

```bash
pip install -r requirements.txt
```

4. Copy `.env.example` → `.env` and fill in values (do **not** commit secrets):

```bash
cp .env.example .env
# Edit .env with your editor
```

Example `.env` keys (from `.env.example`):

```
OAUTH_CLIENT_SECRETS_FILE=
FIREBASE_CREDENTIALS_PATH=
ADMIN_SECRET=
SECRET_KEY=
PROJECT_NAME=
BACKEND_URL=
OAUTH_GOOGLE_CLIENT_ID=
OAUTH_REDIRECT_URI=
FIREBASE_DATABASE_URL=
FIREBASE_STORAGE_BUCKET=
STRIPE_API_KEY=
```

5. Run the app (development):

```bash
python app.py
# API available at http://localhost:5000/api/ (default)
```

---

## Running tests

Run the test suite:

```bash
pytest -v
```

Tests include auth flow examples and firebase-related tests. Keep test names formatted as:

```
test_<feature>_<expected_behavior>()
```

---

## Architecture / How it works

High-level flow:

```
HTTP request → routes (blueprints) → service layer → adapters (DB/3rd party)
```

* **Routes**: validate requests, build DTOs, call services, and return responses.
* **Services**: contain business logic, orchestrate multiple adapters/providers.
* **Adapters**: isolated implementations for persistence and third-party APIs (Firebase, Stripe, etc.).
* **Providers**: pluggable implementations for auth and payments (e.g., `google_provider`, `stripe_provider`).

Services and providers are injected into the Flask app via `app.extensions["services"]` so controllers can fetch them without tight coupling.

---

## `app.py` — summary

* Uses the **app factory** `create_app()` pattern so you can create multiple app instances (testing vs prod).
* Robust file resolution helper `_resolve_file_path()` to find credential files in different environments.
* Initializes Firebase only once (protects against double initialization during reloads).
* Builds services and registers blueprints (payments, auth, frontend) and stores them in `app.extensions["services"]` for controllers to use.
  See `app.py` in the repo for the exact implementation.

---

## Extending the template

### Add a new route

1. Create a new blueprint in `routes/`.
2. Use `current_app.extensions["services"]` to access injected services.
3. Register the blueprint in `create_app()`.

### Add a new auth provider

* Implement the provider interface in `auth/providers/` (follow `google_provider.py` style).
* Register it in `AuthService` initialization or add provider discovery logic.

### Add a new payment provider

* Implement the same interface as `payments/payment_provider.py`.
* Add config key(s) and instantiate your provider in `create_app()`.

### Swap database adapter

* Implement the adapter interface (methods used by services) under `database/adapters/`.
* Replace the adapter creation in `create_app()` and the rest of the system should work without changes.

---

## Deployment notes

* For WSGI servers (uWSGI / gunicorn / PythonAnywhere), import `app` from `app.py` (module-level `app = create_app()` is provided for that purpose).
* Ensure environment variables or a secure config mechanism is used in production (do not rely on a plaintext `.env` on production servers).
* Keep Firebase credentials and OAuth secret files outside version control; use secrets manager for production.

---

## Security best practices

* Never commit credentials or private key files. `.gitignore` should include credential paths.
* Rotate keys regularly (OAuth client secrets, Stripe keys).
* Use HTTPS in production for OAuth redirect URIs.
* Limit Firebase permissions to the minimum necessary for your app.

---

## Contributing

1. Fork the repo
2. Create a feature branch
3. Run tests locally and add tests for new features
4. Open a PR with a clear description and small, focused changes


# By **Khalid iqnaibi** (*Immortal*)