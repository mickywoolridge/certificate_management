/**
 * Prisma loads the schema (including env("DATABASE_URL")) before `generate` runs.
 * Railway and some CI environments omit DATABASE_URL during install/build; a
 * placeholder is enough for `prisma generate` (no DB connection). Runtime and
 * `migrate deploy` still require the real DATABASE_URL.
 */
const { execSync } = require("node:child_process");

const url = process.env.DATABASE_URL?.trim();
if (!url) {
  process.env.DATABASE_URL =
    "postgresql://placeholder:placeholder@127.0.0.1:5432/placeholder?schema=public";
}

execSync("npx prisma generate", { stdio: "inherit", env: process.env });
