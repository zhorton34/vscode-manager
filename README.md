# VS Code Manager

A command-line tool to manage VS Code extensions and settings.

## Installation

1. Requires [Deno](https://deno.land/) to be installed.
2. `gh repo clone zhorton34/vscode-manager`
3. `cd vscode-manager && deno task vscode-manager --help`

## Commands

- `list-extensions`: List all installed extensions
- `disable-telemetry`: Disable VS Code telemetry
- `reset-settings`: Reset VS Code settings to default
- `clear-workspace-storage`: Clear VS Code workspace storage
- `uninstall-all`: Uninstall all extensions
- `install-extension <extensionId>`: Install a specific extension
- `backup-settings`: Backup VS Code settings
- `list-user-snippets`: List all user snippets
- `restore-settings`: Restore VS Code settings from backup

## Examples

```bash
❯ deno task vscode-manager
Task vscode-manager deno run -A ./main.ts

Usage:   vscode-manager
Version: 1.0.0         

Description:

  Manage VS Code extensions and settings

Options:

  -h, --help     - Show this help.                            
  -V, --version  - Show the version number for this program.  

Commands:

  list-extensions                         - List all installed extensions       
  uninstall-all                           - Uninstall all extensions            
  disable-telemetry                       - Disable VS Code telemetry           
  reset-settings                          - Reset VS Code settings to default   
  clear-workspace-storage                 - Clear VS Code workspace storage     
  install-extension        <extensionId>  - Install a specific extension        
  backup-settings                         - Backup VS Code settings             
  list-user-snippets                      - List all user snippets              
  restore-settings                        - Restore VS Code settings from backup
```

## Usage 
```bash
deno task vscode-manager --help
deno task vscode-manager --version
deno task vscode-manager uninstall-all
deno task vscode-manager list-extensions
deno task vscode-manager backup-settings
deno task vscode-manager restore-settings
deno task vscode-manager remove-extension "tanben.step-line-generator"
deno task vscode-manager install-extension "tanben.step-line-generator"
```

## Example of the uninstall-all command
```bash
❯ deno task vscode-manager uninstall-all
Task vscode-manager deno run -A ./main.ts "uninstall-all"
The following extensions will be uninstalled:
+------------------------------------------+
| Extensions to be uninstalled             |
+------------------------------------------+
| donjayamanne.python-extension-pack       |
| ms-azuretools.vscode-azureresourcegroups |
| ms-toolsai.jupyter                       |
+------------------------------------------+
Are you sure you want to uninstall all extensions? (y/n)
y
Uninstalling donjayamanne.python-extension-pack...
Uninstalling ms-azuretools.vscode-azureresourcegroups...
Uninstalling ms-toolsai.jupyter...
All extensions have been uninstalled.
```