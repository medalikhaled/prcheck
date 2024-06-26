/**
 *
 * @param {string} parsedMarkdown takes in a parsed markdown string
 * @returns {Set<string>} returns all the heading titles h1, h2, h3 in a Set
 */

export function getPrTitles(parsedMarkdown: string): Set<String> {
  // Regex for h1-h3 tags with capturing group
  const regex = /<h[1-3]>(.*?)<\/h[1-3]>/gi;

  const foundTitles = new Set<string>();
  let match;

  while ((match = regex.exec(parsedMarkdown)) !== null) {
    foundTitles.add(match[1].trim().toLowerCase());
  }

  return foundTitles;
}

type Section = {
  title: string;
  content: string;
  characterCount: number;
};

//! Last section always will have a character count of 0 since there is no section after it
export function parseSections(parsedMarkdown: string): Section[] {
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

  //TODO: if section isLast count till the end of the pr desc string
  if (currentTitle) {
    sections.push({
      title: currentTitle,
      content: content || "",
      characterCount: content.length,
    });
  }
  return sections;
}

// TODO: find a better way for those (more dynamic)
const templateDefaults = {
  description: 30,
  howToTest: 20,
  screenshots: 20,
  approach: 20,
};
