# Configuring Associations with Github provider documentations

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
    "src/index.ts": ["https://github.com/Lynch-cai/docx-documentations-local-template/blob/main/documentations/ifTernary.md", "https://github.com/Lynch-cai/docx-documentations-local-template/blob/main/documentations/asyncAwait.md"],
    "src/modules": ["https://github.com/Lynch-cai/docx-documentations-local-template/blob/main/documentations/modules.md"],
    "src/controllers": ["https://github.com/Lynch-cai/docx-documentations-local-template/blob/main/documentations/controllers/controllers.md"],
    "src/controllers/auth.controller.ts": ["https://github.com/Lynch-cai/docx-documentations-local-template/blob/main/documentations/controllers/authControllers.md"]
  }
}
```

The diagram below illustrates the associations:
```
src/index.ts ───────────────────────┬─ github/../ifTernary.md
                                    └─ github/../asyncAwait.md
src/modules/auth.module.ts ─────────── github/../modules.md
src/modules/shop.module.ts ─────────── github/../modules.md
src/controllers/auth.controller.ts ─┬─ github/../controllers.md
                                    └─ github/../authController.md
```
**[Left]** represents files or folders that require associated documentation.<br/>
**[Right]** indicates the linked documentation files.

Incorporating the ignorePatterns helps optimize the extension's performance by excluding the specified folder from documentation searches.

## Public repository
We highly recommend adding your access token to avoid API limitations (50 requests/h). <br />
[How to add my access token](/README.md#how-to-add-your-access-token)

## Private repository
If your documentations are on a private repository, you need to add your access token. <br />
[How to add my access token](/README.md#how-to-add-your-access-token)