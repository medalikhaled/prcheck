import * as core from "@actions/core";
import * as github from "@actions/github";

const REQUIRED_PR_SECTIONS = ["description", "how to test it", "approach"];
const isUI = false;

//TODO: test this one
/**
 *
 * @param {string} parsedMarkdown takes in a parsed markdown string
 * @returns {Set<string>} returns all the heading titles h1, h2, h3 in a Set
 */

function getPrTitles(parsedMarkdown: string) {
  // Regex for h1-h3 tags with capturing group
  const regex = /<h[1-3]>(.*?)<\/h[1-3]>/gi;

  const foundTitles = new Set();
  let match;

  while ((match = regex.exec(parsedMarkdown)) !== null) {
    foundTitles.add(match[1].trim().toLowerCase());
  }

  return foundTitles;
}

//! last section is always ign
function parseSections(parsedMarkdown: string) {
  const sections = [];
  let currentTitle = null;
  let content = "";

  // Regex for h1-h3 with capturing groups
  const regex = /<h[1-3]>(.*?)<\/h[1-3]>(.*?)(?=<h1>|<h2|<h3|\b$)/gis;

  let match;
  while ((match = regex.exec(parsedMarkdown)) !== null) {
    // Capture group 1: title, group 2: content
    const title = match[1].trim();
    const currentContent = match[2].trim();

    if (currentTitle) {
      sections.push({
        title: currentTitle,
        content: content || "",
        characterCount: content.length,
      });
    }

    currentTitle = title;
    content = currentContent;
  }

  // Add the last section if content exists after the final heading
  if (currentTitle) {
    sections.push({
      title: currentTitle,
      content: content || "",
      characterCount: content.length,
    });
  }
  return sections;
}

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

    const foundTitles = getPrTitles(prDescription);
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
