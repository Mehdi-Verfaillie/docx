# Configuring Associations with Website documentations

Example project architecture:
```
.
├── src
│   ├── controllers
│   │   └── auth.controllers.ts
│   └── modules
│       ├── auth.module.ts
│       └── shop.module.ts
├── node_modules
│   └── dummy-module
│       ├── index.js
│       ├── README.md
│       └── license
├── index.ts
├── .docx.json
└── README.md
```

`.docx.json`:
```json
{
  "ignorePatterns": ["node_modules", ".git"],
  "associations": {
    "src/index.ts": ["https://expressjs.com/fr/starter/basic-routing", "https://expressjs.com/fr/starter/static-files.html"],
    "src/modules": ["https://expressjs.com/fr/guide/database-integration.html"],
    "src/controllers": ["https://expressjs.com/fr/guide/writing-middleware.html"],
    "src/controllers/auth.controller.ts": ["https://expressjs.com/fr/guide/using-middleware.html"]
  }
}
```

The diagram below illustrates the associations:
```
src/index.ts ───────────────────────┬─ website/../basic-routing
                                    └─ website/../static-files
src/modules/auth.module.ts ─────────── website/../database-integration
src/modules/shop.module.ts ─────────── website/../database-integration
src/controllers/auth.controller.ts ─┬─ website/../writing-middleware
                                    └─ website/../using-middleware
```
**[Left]** represents files or folders that require associated documentation.<br/>
**[Right]** indicates the linked documentation files.

Incorporating the ignorePatterns helps optimize the extension's performance by excluding the specified folder from documentation searches.