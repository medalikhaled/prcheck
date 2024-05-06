import * as core from "@actions/core";
import * as github from "@actions/github";
import { marked } from "marked";
import { getPrTitles, parseSections } from "./utils";

const REQUIRED_PR_SECTIONS = ["description", "how to test it", "approach"];
const isUI = false;

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
    const parsedContent = await marked(prDescription);

    const foundTitles = getPrTitles(parsedContent);
    console.log(foundTitles);

    const hasRequriedSections = REQUIRED_PR_SECTIONS.every((title) =>
      foundTitles.has(title)
    );

    if (!hasRequriedSections) {
      core.setFailed("Some required Titles are missing");
      return;
    }

    core.info(prDescription);
  } catch (error: any) {
    core.setFailed(error.message);
  }
}

run();
