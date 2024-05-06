import { getInput } from "@actions/core";

const example = getInput("example");
console.log(`hello ${example}`);
