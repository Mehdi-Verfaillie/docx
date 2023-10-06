<p align="center">
  <img src="./src//assets/logo.png" alt="Docx" width="200">
</p>
<h1 align="center">DOCX</h1>
<p align="center">VS Code extension that facilitate access to your company's standards and documentation for the technical team</p>

<div align="center">
  <a href="https://marketplace.visualstudio.com/items?itemName=docx-mt5.docx">
    <img src="./src/assets/get-it-on-vs-code.png" height="50">
  </a>
</div>

<br />

<p align="center">
  <a href="#demo">Demo</a> •
  <a href="#installation">Installation</a> •
  <a href="#configuration">Configuration</a> •
  <a href="#usage">Usage</a> •
  <a href="#features">Features</a> •
  <a href="#roadmap">Roadmap</a> •
  <a href="#contribution">Contribution</a> •
  <a href="#other">Other</a>
</p>

<hr />
<br />

## Demo

<img src="./src/assets/demo-1.gif">

## Installation

You can install the extension in two ways:

### Option 1 - Via Visual Studio Code

1. Open the extensions menu in Visual Studio Code by clicking "Extensions" in the sidebar.
2. Search for "docx" under the author "docx-mt5."
3. Click "Install" for the appropriate extension.

### Option 2 - Via the Marketplace

1. Visit the extension's page on the [Visual Studio Code Marketplace](https://marketplace.visualstudio.com/items?itemName=docx-mt5.docx).
2. Click "Install" for the extension.

## Configuration

To configure the extension, follow these steps:

1. Open a project in Visual Studio Code.
2. Use the following command to create a `.docx.json` file at the root of the project. <br />
   This command will generate a configuration file with all files and folders associations possible based on the project.

```bash
docx generate-config
```

3. When you have finished the associations between files/folders and the documentations, you can type the following command to remove all unused associations :

```bash
docx clean-config
```

<br />

The `.docx.json` file follows this structure:

```json
{
  "associations": {
    "file/or/folder": ["path/to/documentation.md"],
    "file/or/folder/2": [
        "path/to/documentation.bpmn"
        "github/or/gitlab/url/to/documentation.md",
    ]
  }
}
```

<br />

### Configuring Associations with local documentations

Here's an example of `.docx.json`:

```json
{
  "associations": {
    "myFile.ts": ["myFileDoc.md"],
    "myFolder": ["myFolderDoc.md"],
    "myFolder/mySecondFile.ts": ["mySecondFileDoc.md", "mySecondFileSecondDoc.md"]
  }
}
```

This means that :

- File `myFile.ts` is linked to `myFileDoc.md`
- Files in `myFolder` are linked to `myFolderDoc.md`
- File `myFolder/mySecondFile.ts` is linked to `mySecondFileDoc.md`, `mySecondFileSecondDoc.md` and `myFolderDoc.md` because it is in `myfolder`.

You can also check out a sample repository where these associations have already been created: [Link to Example Repository](https://github.com/Lynch-cai/docx-documentations-local-template)

<br />

### Configuring Associations with public/private repository documentations (Github / Gitlab)

Here's an example `.docx.json`:

```json
{
  "associations": {
    "myFile.ts": [
      "https://github.com/Lynch-cai/docx-documentations-local-template/blob/main/documentations/controllers/controllers.md"
    ]
  }
}
```

This means that `myFile.ts` is linked to the documentation from the **public/private repository** (https://github.com/Lynch-cai/docx-documentations-local-template/blob/main/documentations/controllers/controllers.md)

Note:
To access the private repository, the extension needs authorization to access it, so you'll need to add your private token. <br>
Access will only be made on your machine, no data is sent elsewhere.

## Usage

1. Open a file linked to documentation, e.g., "myFile.ts."

<!-- Add screenshot -->

2. Click the book icon in the top right corner of the screen.

<!-- Add screenshot -->

3. Choose the documentation you're interested in from the list.

<!-- Add screenshot -->

For visual steps, look at the [demo](#demo).

## Features

- [x] Ability to link a file to documentation.
- [x] Ability to link a file to multiple documentations.
- [x] Linking all files in a folder to documentation.
- [x] Support for local documentation.
- [ ] Support for documentation in a public or private repository.
- [ ] Support for different file types (.md, .bpmn, etc.).

## Roadmap

Here are the upcoming planned features:

- [ ] Integration with CI to provide information about documentations and associated standards for changes made by developers.
- [ ] Adding documentation editing functionality.
- [ ] Adding the ability to select only one file type per documentation, e.g., only "\*.controller.ts" files are related to "controllers.md."

## Contribution

Contributions are welcome! To contribute by proposing new features or fixing bugs, please follow these steps:

1. Fork the repository.
2. Make your changes.
3. Submit a pull request to the main branch.

Thank you for your interest in the extension and potential contributions!

## Other

Note: The extension will add the following configuration to your vscode settings:

```json
"json.schemas": [
    {
        "fileMatch": [
            "/.docx.json"
        ],
        "url": "https://raw.githubusercontent.com/Mehdi-Verfaillie/docx/main/src/config/.docx.schema.json"
    }
]
```

This configuration ensures that Visual Studio Code recognizes the .docx.json file format and provides schema support.
This addition to your settings is essential for the proper functioning of the extension, so please keep it enabled.
