"""
frontend_routes.py
------------------
Flask Blueprint providing all frontend (template) routes .

"""

from typing import Any, Dict
import logging

from flask import Blueprint, app, render_template, redirect,current_app, request, session, jsonify
from decorators.req_login import require_login
from utils.get_plan_status import compute_plan_status
from utils.codes import gencode , save_code,save_seccode

config = current_app.config
PROJECT_NAME = config.get("PROJECT_NAME")

logger = logging.getLogger(__name__)


frontend_blueprint = Blueprint(
    "frontend",
    __name__,
    template_folder="templates", 
)

@frontend_blueprint.route("/", methods=["GET"])
def home() -> str:
    """Landing page."""
    return render_template("index.html")

@frontend_blueprint.route("/login", methods=["GET"])
def login_page() -> str:
    """Render login page."""
    res = f"login.html"
    return render_template(res)

@frontend_blueprint.route("/logme", methods=["GET"])
def logme_page() -> str:
    """Render login page."""
    return render_template("logme.html")


@frontend_blueprint.route("/protected_area", methods=["GET"])
@require_login
def protected_area() -> Any:
    """
    Simple redirect wrapper after login to the main app page.
    Keeps old behavior: log the login event and redirect to /home_page
    """
    return redirect("/home_page")


@frontend_blueprint.route("/logout", methods=["GET"])
def logout() -> Any:
    """Clear session and redirect to login ."""
    session.clear()
    return redirect("/logme")

'''
Authenticated pages (page routing wrappers)

The pattern used here: small wrapper that enforces login and sets session['page'],
then redirects to fetch_user_data which will compute the correct template.
'''
def _render_protected_page(page_name: str) -> Any:
    """
    Helper to set session page and redirect to fetch_user_data route which renders
    the real template after preparing user_data. Kept small per standards.
    """
    session["page"] = page_name
    
        
    return f"/{PROJECT_NAME}"

@frontend_blueprint.route("/acc", methods=["GET"])
@require_login
def acc() -> Any:
    """Account wrapper."""
    return redirect(_render_protected_page("acc"))


@frontend_blueprint.route("/home_page", methods=["GET"])
@require_login
def home_page() -> Any:
    """Home wrapper."""
    return redirect(_render_protected_page("home"))


@frontend_blueprint.route("/support", methods=["GET"])
@require_login
def support() -> Any:
    """Support wrapper."""
    return redirect(_render_protected_page("support"))


@frontend_blueprint.route("/settings", methods=["GET"])
@require_login
def settings() -> Any:
    """Settings wrapper."""
    return redirect(_render_protected_page("settings"))

@frontend_blueprint.route(f"/{PROJECT_NAME}", methods=["GET"])
@require_login
def project() -> Any:
    """
    Entry point for the project.
    keeps separation of concerns.
    """
    page = session.get("page","home")
    
    return render_template(f"{page}.html")

def register_frontend(app) -> None:
    """
    Register the frontend blueprint on the Flask app.

    Usage (in app.py or routes/__init__.py):

        from routes.frontend_routes import register_frontend
        register_frontend(app)

    """
    app.register_blueprint(frontend_blueprint)
    logger.info("frontend blueprint registered")
