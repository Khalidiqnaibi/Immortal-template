# Template Documentation

Core backend API powering **projects** — a template for making projects with structured data and systems.

---

# Overview

Thia template API is the **central backend system** for future projects.

The system is built using:

* SOLID principles
* Plugin-based extensibility
* Strict code standards
* Explicit state
* Measurable, testable logic

---

# Full Project Structure

```
template/
│
├── app.py
├── config.py
├── README.md
├── requirements.txt
│
├── auth/                      # Authentication system
├── routes/                    # API blueprints
├── services/                  # Service layer
├── payments/                  # Payment providers
├── decorators/                # Auth guards
├── utils/                     # Utilities + event logging
├── documentation/             # Standards + known issues
├── tests/                     # System tests
├── static/                    # Frontend assets
└── templates/                 # HTML templates
```

---

# Service Layer Overview

All API routes call services.

```
routes → services  → adapters
```


This keeps:

* Routes clean
* logic centralized
* Testability high

---

# Authentication Layer

```
auth/
├── auth_service.py
├── providers/google_provider.py
```

Supports:

* Google OAuth
* Extensible provider system

---

# Payments Layer

```
payments/
├── stripe_provider.py
├── payment_provider.py
```

Implements provider abstraction.

---

# Testing

Run:

```bash
pytest -v
```

Includes:

* Auth flow tests
* Firebase tests

Test naming:

```
test_<feature>_<expected_behavior>()
```

---

# Developer Setup

1. Clone repository
2. Create Python 3.10 venv
3. Install:

```bash
pip install -r requirements.txt
```

4. Add `.env`

5. Run:

```bash
python app.py
```

API available at:

```
http://localhost:5000/api/
```

# License

© 2025-2026 Khalid Iqnaibi
