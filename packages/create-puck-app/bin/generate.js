#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { program } from "commander";
import inquirer from "inquirer";
import Handlebars from "handlebars";
import glob from "glob";
import { execSync } from "child_process";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

program
  .command("create <app-name>")
  .action(async (appName) => {
    const questions = [
      {
        type: "input",
        name: "recipe",
        message: "Which recipe would you like to use?",
        required: true,
        default: "next",
      },
    ];
    const answers = await inquirer.prompt(questions);
    const recipe = answers.recipe;

    // Copy template files to the new directory
    const templatePath = path.join(__dirname, "../templates", recipe);
    const appPath = path.join(process.cwd(), appName);

    if (!recipe) {
      console.error(`Please specify a recipe.`);
      return;
    }

    if (!fs.existsSync(templatePath)) {
      console.error(`No recipe named ${recipe} exists.`);
      return;
    }

    if (fs.existsSync(appPath)) {
      console.error(
        `A directory called ${appName} already exists. Please use a different name or delete this directory.`
      );
      return;
    }

    await fs.mkdirSync(appName);

    // Compile handlebars templates
    const templateFiles = glob.sync(`**/*`, {
      cwd: templatePath,
      nodir: true,
      dot: true,
    });

    for (const templateFile of templateFiles) {
      const filePath = path.join(templatePath, templateFile);
      const targetPath = filePath
        .replace(templatePath, appPath)
        .replace(".hbs", "");

      let data;

      if (path.extname(filePath) === ".hbs") {
        const templateString = await fs.readFileSync(filePath, "utf-8");

        const template = Handlebars.compile(templateString);
        data = template({ ...answers, appName });
      } else {
        data = await fs.readFileSync(filePath, "utf-8");
      }

      const dir = path.dirname(targetPath);

      await fs.mkdirSync(dir, { recursive: true });

      await fs.writeFileSync(targetPath, data);
    }

    execSync("yarn install", { cwd: appPath, stdio: "inherit" });

    const inGitRepo =
      execSync("git rev-parse --is-inside-work-tree", {
        cwd: appPath,
      }).toString() === "true";

    // Only commit if this is a new repo
    if (!inGitRepo) {
      execSync("git init", { cwd: appPath, stdio: "inherit" });

      execSync("git add .", { cwd: appPath, stdio: "inherit" });
      execSync("git commit -m 'build(puck): generate app'", {
        cwd: appPath,
        stdio: "inherit",
      });
    }
  })
  .parse(process.argv);