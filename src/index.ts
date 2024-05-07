import * as core from "@actions/core";
import * as github from "@actions/github";
import { marked } from "marked";
import { getPrTitles, parseSections } from "./utils";

// TODO: those should be inputs
const isUI = false;

function getRequiredSections(): string[] {
  const requiredSectionsInput = core.getInput("required-sections");
  const requiredSections = requiredSectionsInput.split(",");
  return requiredSections;
}

const requiredSections = getRequiredSections();
const REQUIRED_PR_SECTIONS =
  requiredSections.length === 0 ? ["description", "how to test it", "approach"] : requiredSections;

async function run() {
  try {
    const token = core.getInput("gh-token", { required: true });
    const octokit = github.getOctokit(token);

    const context = github.context;
    if (context.payload.pull_request == null) {
      core.setFailed("No pull request found.");
      return;
    }

    const prNumber = context.payload.pull_request.number;

    const { data: pr } = await octokit.rest.pulls.get({
      owner: context.repo.owner,
      repo: context.repo.repo,
      pull_number: prNumber,
    });

    let prDescription = pr.body;

    if (!prDescription) {
      core.setFailed("PR Description is empty");
      return;
    }

    //? remove comments from PR content
    prDescription = prDescription?.replace(/<!--[\s\S]*?-->/g, "");

    const prDescContent = await marked(prDescription);

    const foundTitles = getPrTitles(prDescContent);

    const hasRequriedSections = REQUIRED_PR_SECTIONS.every((title) => foundTitles.has(title));

    if (!hasRequriedSections) {
      throw new Error(`"Some required Titles are missing"`);
    }

    const sections = parseSections(prDescContent);

    sections.forEach((section) => {
      if (section.title.toLowerCase() === "description" && section.characterCount < 30) {
        throw new Error(`Section ${section.title} should have more than 30 characters at least`);
      }

      if (REQUIRED_PR_SECTIONS.includes(section.title.toLocaleLowerCase()) && section.characterCount < 20) {
        throw new Error(`Section ${section.title} should have more than 20 characters at least`);
      }
    });
  } catch (error: any) {
    core.setFailed(error.message);
  }
}

run();
