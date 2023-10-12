## Configuring Associations with local documentations

Example project architecture:
```
.
├── src
│   ├── controllers
│   │   └── auth.controllers.ts
│   └── modules
│       ├── auth.module.ts
│       └── shop.module.ts
├── docs
│   ├── controllers
│   │   ├── controllers.md
│   │   └── authController.md
│   ├── modules
│   │   └── modules.md
│   ├── index.md
│   └── setup.md
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
    "src/index.ts": ["docs/index.md", "docs/setup.md"],
    "src/modules": ["docs/modules/modules.md"],
    "src/controllers": ["docs/controllers/controllers.md"],
    "src/controllers/auth.controller.ts": ["docs/controllers/authController.md"]
  }
}
```

The diagram below illustrates the associations:
```
src/index.ts ───────────────────────┬─ docs/index.md
                                    └─ docs/setup.md
src/modules/auth.module.ts ─────────── docs/modules/modules.md
src/modules/shop.module.ts ─────────── docs/modules/modules.md
src/controllers/auth.controller.ts ─┬─ docs/controllers/controllers.md
                                    └─ docs/controllers/authController.md
```
**[Left]** represents files or folders that require associated documentation.<br/>
**[Right]** indicates the linked documentation files.

Incorporating the ignorePatterns helps optimize the extension's performance by excluding the specified folder from documentation searches.