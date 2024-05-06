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

//! last section is always ignored
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
