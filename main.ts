import { Command } from "https://deno.land/x/cliffy/command/mod.ts";
import { join } from "https://deno.land/std@0.190.0/path/mod.ts";


function createTable(headers: string[], rows: string[][]): string {
    const allRows = [headers, ...rows];
    const columnWidths = allRows[0].map((_, colIndex) => 
      Math.max(...allRows.map(row => row[colIndex].length))
    );
  
    const separator = '+' + columnWidths.map(w => '-'.repeat(w + 2)).join('+') + '+';
    
    return [
      separator,
      formatRow(headers, columnWidths),
      separator,
      ...rows.map(row => formatRow(row, columnWidths)),
      separator
    ].join('\n');
  }
  
function formatRow(row: string[], columnWidths: number[]): string {
    return '| ' + row.map((cell, i) => cell.padEnd(columnWidths[i])).join(' | ') + ' |';
}

async function prompt(message: string): Promise<boolean> {
    console.log(message + " (y/n)");
    const buf = new Uint8Array(1);
    await Deno.stdin.read(buf);
    const answer = new TextDecoder().decode(buf).toLowerCase();
    return answer === 'y';
}

  
export async function runCommand(command: string): Promise<string> {
  const cmd = new Deno.Command(Deno.build.os === "windows" ? "cmd" : "sh", {
    args: Deno.build.os === "windows" ? ["/c", command] : ["-c", command],
  });
  const { stdout } = await cmd.output();
  return new TextDecoder().decode(stdout).trim();
}

function getVSCodeSettingsPath(): string {
  const homeDir = Deno.env.get("HOME") || Deno.env.get("USERPROFILE");
  if (!homeDir) throw new Error("Unable to determine home directory");

  if (Deno.build.os === "windows") {
    return join(homeDir, "AppData", "Roaming", "Code", "User", "settings.json");
  } else if (Deno.build.os === "darwin") {
    return join(homeDir, "Library", "Application Support", "Code", "User", "settings.json");
  } else {
    return join(homeDir, ".config", "Code", "User", "settings.json");
  }
}

export const vscodeManager = new Command()
  .name("vscode-manager")
  .version("1.0.0")
  .description("Manage VS Code extensions and settings")

  .command("list-extensions")
  .description("List all installed extensions")
  .action(async () => {
    const extensions = (await runCommand("code --list-extensions")).split("\n").filter(Boolean);
    const table = createTable(["Extension ID"], extensions.map(ext => [ext]));
    console.log("Installed extensions:");
    console.log(table);
  })  

  .command("uninstall-all")
  .description("Uninstall all extensions")
  .action(async () => {
    const extensions = (await runCommand("code --list-extensions")).split("\n").filter(Boolean);
    const table = createTable(["Extensions to be uninstalled"], extensions.map(ext => [ext]));
    console.log("The following extensions will be uninstalled:");
    console.log(table);

    const confirm = await prompt("Are you sure you want to uninstall all extensions?");
    if (!confirm) {
      console.log("Operation cancelled.");
      return;
    }

    for (const ext of extensions) {
      console.log(`Uninstalling ${ext}...`);
      await runCommand(`code --uninstall-extension ${ext}`);
    }
    console.log("All extensions have been uninstalled.");
  })

  .command("disable-telemetry")
  .description("Disable VS Code telemetry")
  .action(async () => {
    const settingsPath = getVSCodeSettingsPath();
    const settings = JSON.parse(await Deno.readTextFile(settingsPath));
    settings["telemetry.telemetryLevel"] = "off";
    await Deno.writeTextFile(settingsPath, JSON.stringify(settings, null, 2));
    console.log("VS Code telemetry has been disabled.");
  })

  .command("reset-settings")
  .description("Reset VS Code settings to default")
  .action(async () => {
    const settingsPath = getVSCodeSettingsPath();
    await Deno.writeTextFile(settingsPath, "{}");
    console.log("VS Code settings have been reset to default.");
  })

  .command("clear-workspace-storage")
  .description("Clear VS Code workspace storage")
  .action(async () => {
    const homeDir = Deno.env.get("HOME") || Deno.env.get("USERPROFILE");
    if (!homeDir) throw new Error("Unable to determine home directory");
    const storagePath = join(homeDir, ".config", "Code", "User", "workspaceStorage");
    await Deno.remove(storagePath, { recursive: true });
    console.log("VS Code workspace storage has been cleared.");
  })

  .command("install-extension <extensionId:string>")
  .description("Install a specific extension")
  .action(async (_, extensionId) => {
    console.log(`Installing ${extensionId}...`);
    await runCommand(`code --install-extension ${extensionId}`);
    console.log(`Extension ${extensionId} has been installed.`);
  })

  .command("backup-settings")
  .description("Backup VS Code settings")
  .action(async () => {
    const settingsPath = getVSCodeSettingsPath();
    const backupPath = join(Deno.env.get("HOME") || Deno.env.get("USERPROFILE") || "", "vscode_settings_backup.json");
    await Deno.copyFile(settingsPath, backupPath);
    console.log(`Settings backed up to ${backupPath}`);
  })

  .command("list-user-snippets")
  .description("List all user snippets")
  .action(async () => {
    const homeDir = Deno.env.get("HOME") || Deno.env.get("USERPROFILE");
    if (!homeDir) {
      console.log("Home directory not found");
      return;
    }
    const snippetsPath = join(homeDir, ".config", "Code", "User", "snippets");
    const snippets = [];
    for await (const snippet of Deno.readDir(snippetsPath)) {
      snippets.push([snippet.name]);
    }
    const table = createTable(["Snippet Name"], snippets);
    console.log("User snippets:");
    console.log(table);
  })

  .command("restore-settings")
  .description("Restore VS Code settings from backup")
  .action(async () => {
    const settingsPath = getVSCodeSettingsPath();
    const backupPath = join(Deno.env.get("HOME") || Deno.env.get("USERPROFILE") || "", "vscode_settings_backup.json");
    await Deno.copyFile(backupPath, settingsPath);
    console.log(`Settings restored from ${backupPath}`);
  });

if (import.meta.main) {
    const args = Deno.args;
    if (args.length === 0) {
      vscodeManager.showHelp();
    } else {
      await vscodeManager.parse(args);
    }
}