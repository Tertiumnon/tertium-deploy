import { afterEach, beforeEach, expect, test } from "bun:test";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  getAppName,
  loadEnvironmentFromEnvlock,
  parseEnvlockExport,
} from "./envlock.utils";

let projectDir: string;

beforeEach(() => {
  projectDir = mkdtempSync(join(tmpdir(), "tertium-deploy-"));
});

afterEach(() => {
  rmSync(projectDir, { recursive: true, force: true });
});

test("plain and JSON-quoted export values are read back", () => {
  expect(
    parseEnvlockExport(
      'PORT=12620\nURL=mysql://u:p@h/db?a=1\nNL="a\\nb"\nEMPTY=\n',
    ),
  ).toEqual({
    PORT: "12620",
    URL: "mysql://u:p@h/db?a=1",
    NL: "a\nb",
    EMPTY: "",
  });
});

test("a line that is not KEY=value is refused without showing it", () => {
  expect(() => parseEnvlockExport("A=1\nsecret")).toThrow(
    "line 2 is not KEY=value",
  );
});

test("the app name is the package name without its scope", () => {
  writeFileSync(
    join(projectDir, "package.json"),
    '{"name":"@tertium/weather-api"}',
  );
  expect(getAppName(projectDir)).toBe("weather-api");
});

test("a package without a name is refused", () => {
  writeFileSync(join(projectDir, "package.json"), "{}");
  expect(() => getAppName(projectDir)).toThrow('has no "name"');
});

test("a machine without envlock is told how to install it", () => {
  writeFileSync(join(projectDir, "package.json"), '{"name":"weather-api"}');
  const path = process.env.PATH;
  process.env.PATH = projectDir;
  try {
    expect(() => loadEnvironmentFromEnvlock(projectDir)("dev")).toThrow(
      "envlock not found",
    );
  } finally {
    process.env.PATH = path;
  }
});
