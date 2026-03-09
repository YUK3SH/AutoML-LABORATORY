"""
database.py
-----------
SQLite database setup and helper functions.
Tables: users, experiments, contact_messages
"""

import sqlite3
import hashlib
import os
import secrets
from datetime import datetime
from config import BASE_DIR

DB_PATH = os.path.join(BASE_DIR, "automl_lab.db")


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Create all tables if they don't exist."""
    conn = get_db()
    c = conn.cursor()

    c.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            name       TEXT NOT NULL,
            email      TEXT UNIQUE NOT NULL,
            password   TEXT NOT NULL,
            college    TEXT,
            created_at TEXT DEFAULT (datetime('now'))
        )
    """)

    c.execute("""
        CREATE TABLE IF NOT EXISTS experiments (
            id              INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id         INTEGER NOT NULL,
            dataset_name    TEXT,
            target_column   TEXT,
            frameworks_used TEXT,
            winner_model    TEXT,
            winner_accuracy REAL,
            report_json     TEXT,
            model_path      TEXT,
            created_at      TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    """)

    c.execute("""
        CREATE TABLE IF NOT EXISTS contact_messages (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            name       TEXT NOT NULL,
            email      TEXT NOT NULL,
            subject    TEXT,
            message    TEXT NOT NULL,
            created_at TEXT DEFAULT (datetime('now'))
        )
    """)

    conn.commit()
    conn.close()


# ── User helpers ──────────────────────────────────────────────────────────────

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


def create_user(name, email, password, college=""):
    conn = get_db()
    try:
        conn.execute(
            "INSERT INTO users (name, email, password, college) VALUES (?, ?, ?, ?)",
            (name, email, hash_password(password), college)
        )
        conn.commit()
        return {"success": True}
    except sqlite3.IntegrityError:
        return {"success": False, "error": "Email already registered."}
    finally:
        conn.close()


def authenticate_user(email, password):
    conn = get_db()
    row = conn.execute(
        "SELECT * FROM users WHERE email=? AND password=?",
        (email, hash_password(password))
    ).fetchone()
    conn.close()
    return dict(row) if row else None


def get_user_by_id(user_id):
    conn = get_db()
    row = conn.execute("SELECT * FROM users WHERE id=?", (user_id,)).fetchone()
    conn.close()
    return dict(row) if row else None


# ── Experiment helpers ────────────────────────────────────────────────────────

def save_experiment(user_id, dataset_name, target_column, frameworks_used,
                    winner_model, winner_accuracy, report_json, model_path=""):
    import json
    conn = get_db()
    cur = conn.execute(
        """INSERT INTO experiments
           (user_id, dataset_name, target_column, frameworks_used,
            winner_model, winner_accuracy, report_json, model_path)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
        (user_id, dataset_name, target_column,
         json.dumps(frameworks_used) if isinstance(frameworks_used, list) else frameworks_used,
         winner_model, winner_accuracy,
         json.dumps(report_json) if isinstance(report_json, dict) else report_json,
         model_path)
    )
    exp_id = cur.lastrowid
    conn.commit()
    conn.close()
    return exp_id


def get_user_experiments(user_id):
    conn = get_db()
    rows = conn.execute(
        "SELECT * FROM experiments WHERE user_id=? ORDER BY created_at DESC",
        (user_id,)
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_experiment_by_id(exp_id):
    conn = get_db()
    row = conn.execute("SELECT * FROM experiments WHERE id=?", (exp_id,)).fetchone()
    conn.close()
    return dict(row) if row else None


# ── Contact helpers ───────────────────────────────────────────────────────────

def save_contact_message(name, email, subject, message):
    conn = get_db()
    conn.execute(
        "INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)",
        (name, email, subject, message)
    )
    conn.commit()
    conn.close()
