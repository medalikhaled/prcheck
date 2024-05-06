import * as core from "@actions/core";
import * as github from "@actions/github";
import marked from "marked";

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
    console.log(prDescription);
  } catch (error: any) {
    core.setFailed(error.message);
  }
}

run();
