"""
auth.py
-------
Session-based authentication helpers for Flask.
"""

from functools import wraps
from flask import session, redirect, url_for, jsonify, request


def login_required(f):
    """Decorator: redirects to login if user not in session."""
    @wraps(f)
    def decorated(*args, **kwargs):
        if "user_id" not in session:
            if request.is_json or request.path.startswith("/api/"):
                return jsonify({"error": "Login required."}), 401
            return redirect(url_for("login"))
        return f(*args, **kwargs)
    return decorated


def get_current_user():
    from backend.database import get_user_by_id
    uid = session.get("user_id")
    return get_user_by_id(uid) if uid else None
