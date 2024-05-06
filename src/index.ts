import { getInput } from "@actions/core";
import { getOctokit } from "@actions/github";

const token = getInput("gh-token");
const gh = getOctokit(token);

console.log(`hello ${gh.request.toString()}`);
