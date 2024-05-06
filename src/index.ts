import * as core from "@actions/core";
import * as github from "@actions/github";
import { marked } from "marked";
import { getPrTitles, parseSections } from "./utils";

// TODO: those should be inputs
const REQUIRED_PR_SECTIONS = ["description", "how to test it", "approach"];
const isUI = false;

// TODO: find a better way for those (more dynamic)
// the character count in each section by default
const templateDefaults = {
  description: 0,
  howToTest: 64,
  screenshots: 369,
  approach: 50,
};

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

    const prDescription = pr.body;

    if (!prDescription) {
      core.setFailed("PR Description is empty");
      return;
    }
    const prDescContent = await marked(prDescription);

    const foundTitles = getPrTitles(prDescContent);

    core.info("Found titles are: ");
    console.log(foundTitles);

    const hasRequriedSections = REQUIRED_PR_SECTIONS.every((title) =>
      foundTitles.has(title)
    );

    if (!hasRequriedSections) {
      core.setFailed("Some required Titles are missing");
      return;
    }

    const sections = parseSections(prDescContent);

    core.info("Found sections");
    console.log(sections);

    sections.forEach((section) => {
      if (
        section.title.toLowerCase() === "description" &&
        section.characterCount < templateDefaults.description + 30
      ) {
        throw new Error(
          `Section ${section.title} should have more than 30 characters at least`
        );
      }

      if (section.characterCount < 10) {
        throw new Error(
          `Section ${section.title} should have more than 10 characters at least`
        );
      }
    });

    core.debug(
      "Job completed Successfully, all required sections meet the critera"
    );
  } catch (error: any) {
    core.setFailed(error.message);
  }
}

run();
