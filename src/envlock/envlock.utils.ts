import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { EnvironmentLoader } from "../workflow/workflow.types";

// envlock is run as a CLI, not imported: this package is public and @tiii-dev/envlock-cli is private.

// `envlock export` writes simple values as-is and the rest as JSON strings. Errors never show a line: it holds a secret.
export const parseEnvlockExport = (text: string): Record<string, string> =>
  Object.fromEntries(
    text
      .split(/\r?\n/)
      .filter((line) => line !== "")
      .map((line, index) => {
        const separator = line.indexOf("=");
        if (separator < 1)
          throw new Error(
            `envlock export line ${index + 1} is not KEY=value - update @tiii-dev/envlock-cli`,
          );
        const value = line.slice(separator + 1);
        return [
          line.slice(0, separator),
          value.startsWith('"') ? (JSON.parse(value) as string) : value,
        ];
      }),
  );

// The envlock app name is the package name without its scope, as the SSM path was.
export const getAppName = (projectDir: string): string => {
  const pkg: unknown = JSON.parse(
    readFileSync(join(projectDir, "package.json"), "utf-8"),
  );
  const name =
    typeof pkg === "object" && pkg !== null && "name" in pkg
      ? pkg.name
      : undefined;
  if (typeof name !== "string" || name === "")
    throw new Error(
      `${join(projectDir, "package.json")} has no "name" - envlock looks the env up by it`,
    );
  return name.replace(/^@[^/]+\//, "");
};

const exportEnv = (app: string, environment: string): string => {
  try {
    // stdin and stderr stay on the terminal, so envlock can ask for the passphrase.
    return execFileSync("envlock", ["export", app, environment], {
      encoding: "utf-8",
      stdio: ["inherit", "pipe", "inherit"],
    });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT")
      throw new Error(
        "envlock not found - install it with: bun add -g @tiii-dev/envlock-cli",
      );
    throw new Error(
      `envlock export ${app} ${environment} failed - see its message above`,
      { cause: error },
    );
  }
};

export const loadEnvironmentFromEnvlock =
  (projectDir: string): EnvironmentLoader =>
  (environment) =>
    parseEnvlockExport(exportEnv(getAppName(projectDir), environment));
