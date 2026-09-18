import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const prototypeDir = path.dirname(fileURLToPath(import.meta.url));
const dataSource = fs.readFileSync(path.join(prototypeDir, "data.js"), "utf8");
const appSource = fs.readFileSync(path.join(prototypeDir, "app.js"), "utf8");
const htmlSource = fs.readFileSync(path.join(prototypeDir, "index.html"), "utf8");
const sandbox = {};
vm.runInNewContext(`${dataSource}\nthis.farmFeel = FARM_FEEL;`, sandbox);

const config = sandbox.farmFeel;
const errors = [];

if (config.plotCount !== 6) errors.push(`Expected 6 plots, found ${config.plotCount}.`);
if (config.finalDay !== 4) errors.push(`Expected a four-day test, found ${config.finalDay}.`);
if (config.matureStage !== 2) errors.push(`Expected two growth steps, found ${config.matureStage}.`);
if (config.tools.join(",") !== "seed,water,harvest") errors.push("Expected seed, water and harvest tools.");
if (!appSource.includes('addEventListener("pointermove"')) errors.push("Drag interaction is missing.");
if (!htmlSource.includes('id="garden"') && !appSource.includes('id="garden"')) errors.push("Garden surface is missing.");

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log("OK: 6 plots, 3 direct tools, 2 growth steps, 4-day farm-feel loop.");
