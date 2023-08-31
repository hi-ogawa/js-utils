import type { Migrator } from "./migrator";

export class MigratorCli {
  constructor(private migrator: Migrator) {}

  async parseAndRun(args: string[]) {
    let command = args[0] ?? "";
    if (command === "init-latest") {
      await this.migrator.init();
      command = "latest";
    }

    switch (command) {
      case "init": {
        await this.migrator.init();
        console.log("[migration-init] success");
        return;
      }
      case "status": {
        const result = await this.migrator.status();
        console.log("[migration-status]");
        for (const [name, e] of result.map) {
          console.log(name, ":", e.state?.executed_at ?? "(pending)");
        }
        return;
      }
      case "up":
      case "down":
      case "latest": {
        const result = await this.migrator[command]();
        console.log("[executed-migrations]");
        for (const r of result.results) {
          console.log(r.name, ":", r.status, "-", r.direction);
        }
        if (result.error) {
          throw result.error;
        }
        return;
      }
    }
    throw new Error(
      `unknown command '${command}' (supported commands: 'init', 'status', 'up', 'down', 'latest', 'init-latest')`
    );
  }
}
