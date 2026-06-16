# 🔐 Liquid Vault

An offline digital vault for securely storing sensitive information.

---

## Overview

Liquid Vault allows you to store passwords, private notes, and bank card information directly on your device — without any server, database, or internet connection.

---

## Version 0.1 Features

* Create a Master Password on first launch
* Login using Master Password (SHA-256 hash)
* Dashboard with item statistics
* Live search across stored items
* Category filtering
* Add / Edit / Delete items
* Support for three item types:

  * **Password** — username, password, website URL
  * **Note** — private text notes
  * **Bank Card** — card number, CVV, PIN, expiration date
* Eye icon to show/hide sensitive fields (PIN, CVV, Password)
* Full Dark Theme
* Responsive design (mobile and desktop)

---

## Technology Stack

| Layer        | Technology               |
| ------------ | ------------------------ |
| UI           | Pure HTML + CSS          |
| Logic        | Vanilla JavaScript       |
| Cryptography | Web Crypto API (SHA-256) |
| Storage      | LocalStorage             |
| Dependencies | None                     |

---

## Project Structure

```text
LiquidVault/
├── index.html          # UI structure and event listeners
├── css/
│   └── style.css       # All styles — Dark Theme
├── js/
│   ├── app.js          # Central orchestrator and bootstrap logic
│   ├── auth.js         # Master Password and session management
│   ├── storage.js      # Single access point to LocalStorage
│   └── ui.js           # Rendering, forms, modals, and toasts
├── assets/
└── README.md
```

---

## Running the Application

1. Download the project folder
2. Open `index.html` directly in your browser
3. That's it — no installation or server required

---

## Architecture

The application follows the **Separation of Concerns** principle:

```text
UI Layer (index.html + style.css + ui.js)
        ↓ Events
App Layer (app.js) ← Orchestrator
        ↓ Calls
Auth Layer (auth.js) + Storage Layer (storage.js)
        ↓ Persist
LocalStorage
```

No module communicates directly with another module — all interactions pass through `app.js`.

---

## LocalStorage Data Structure

```json
lv_master: {
  "hash": "sha256-hex-string",
  "created_at": 1718000000000,
  "schema_version": "0.1"
}

lv_items: [
  {
    "id": "lv_abc123_xyz",
    "type": "password | note | card",
    "title": "Title",
    "created_at": 1718000000000,
    "updated_at": 1718000000000,
    "data": {}
  }
]
```

---

## Roadmap

| Version | Features                                                      |
| ------- | ------------------------------------------------------------- |
| 0.1     | ✅ MVP — Full item management                                  |
| 0.2     | Password generator, auto-lock, improved search                |
| 0.3     | Backup export/import                                          |
| 1.0     | AES-256 encryption, biometric authentication, Android version |

---

## Security Notice

This version is an MVP. Data is currently stored in LocalStorage without full encryption.

The architecture is intentionally designed so that AES-256-GCM encryption can be added in version 1.0 by modifying only `storage.js`, without requiring a full codebase rewrite.

---

## License

MIT

---

## Author

Saman Motie

GitHub: LiquidDevCore
