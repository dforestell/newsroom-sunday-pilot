import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import { visit } from "unist-util-visit";
import type { Root, RootContent } from "mdast";
import type { Element, Root as HtmlRoot } from "hast";

const parser = unified().use(remarkParse).use(remarkGfm);

function textContent(node: Root | RootContent): string {
  if ("value" in node) return node.value;
  if ("children" in node) return node.children.map((child) => textContent(child as RootContent)).join("");
  return "";
}

export function parseMarkdown(body: string) {
  const tree = parser.parse(body);
  const anchors = new Set<string>();
  visit(tree, "heading", (node) => {
    const base = "story-" + (textContent(node).toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, "").trim().replace(/\s+/g, "-") || "section");
    let id = base;
    let suffix = 1;
    while (anchors.has(id)) id = `${base}-${suffix++}`;
    anchors.add(id);
    node.data = { ...node.data, hProperties: { id } };
  });
  return { tree, anchors };
}

const renderer = unified()
  // No rehype-raw or MDX: HTML nodes are dropped, never evaluated.
  .use(remarkRehype)
  .use(rehypeSanitize, { ...defaultSchema, clobberPrefix: "" })
  .use(() => (tree: HtmlRoot) => { wrapCallOpening(tree); })
  .use(() => (tree: HtmlRoot) => {
    visit(tree, "element", (node, index, parent) => {
      if (node.tagName === "th") node.properties.scope = "col";
      if (node.tagName === "a" && typeof node.properties.href === "string" && /^https?:\/\//.test(node.properties.href)) {
        node.properties.target = "_blank";
        node.properties.rel = ["noopener", "noreferrer"];
      }
      if (node.tagName === "table" && parent && typeof index === "number") {
        parent.children[index] = {
          type: "element", tagName: "div", properties: { className: ["story-table"], tabIndex: 0, role: "region", ariaLabel: "Story table" }, children: [node],
        };
        return index + 1;
      }
      if (node.tagName === "p" && parent && typeof index === "number" && isSourcesKicker(node)) {
        let next = index + 1;
        while (next < parent.children.length) {
          const sibling = parent.children[next];
          if (sibling.type === "text" && !sibling.value.trim()) next += 1;
          else break;
        }
        const list = parent.children[next];
        if (list?.type === "element" && list.tagName === "ul") {
          const section: Element = {
            type: "element",
            tagName: "section",
            properties: { className: ["story-sources"], ariaLabel: "Sources" },
            children: [
              { type: "element", tagName: "p", properties: { className: ["story-sources-kicker"] }, children: [{ type: "text", value: "Sources" }] },
              list,
            ],
          };
          parent.children.splice(index, next - index + 1, section);
          // Revisit the new section so its links get the external-link treatment.
          return index;
        }
      }
      if (node.tagName === "p" && parent && typeof index === "number") {
        const figure = figureFromParagraph(node);
        if (figure) {
          parent.children[index] = figure;
          return index + 1;
        }
      }
    });
  })
  .use(rehypeStringify);

function leadLabel(node: HtmlRoot["children"][number]): string | undefined {
  if (node.type !== "element" || node.tagName !== "p") return undefined;
  const first = node.children[0];
  if (first?.type !== "element" || first.tagName !== "strong" || first.children[0]?.type !== "text") return undefined;
  return first.children[0].value.trim();
}

// A call column opens with "The call:" … "Posted:" paragraphs. Group them so
// the opening carries the same rail as the call cards on /calls.
function wrapCallOpening(tree: HtmlRoot) {
  const kids = tree.children;
  const start = kids.findIndex((node) => leadLabel(node) === "The call:");
  if (start === -1) return;
  const end = kids.findIndex((node, i) => i > start && leadLabel(node) === "Posted:");
  if (end === -1) return;
  const rail: Element = { type: "element", tagName: "div", properties: { className: ["story-call-rail"] }, children: kids.slice(start, end + 1) as Element["children"] };
  kids.splice(start, end - start + 1, rail);
}

function isSourcesKicker(node: Element): boolean {
  const meaningful = node.children.filter((child) => child.type !== "text" || child.value.trim());
  const strong = meaningful[0];
  return (
    meaningful.length === 1 &&
    strong.type === "element" &&
    strong.tagName === "strong" &&
    strong.children.length === 1 &&
    strong.children[0].type === "text" &&
    strong.children[0].value.trim() === "Sources"
  );
}

function figureFromParagraph(node: Element): Element | undefined {
  const meaningful = node.children.filter((child) => child.type !== "text" || child.value.trim());
  const image = meaningful[0];
  if (meaningful.length !== 1 || image.type !== "element" || image.tagName !== "img") return;
  const caption = typeof image.properties.title === "string" ? image.properties.title.trim() : "";
  if (caption) delete image.properties.title;
  return {
    type: "element",
    tagName: "figure",
    properties: {},
    children: caption
      ? [image, { type: "element", tagName: "figcaption", properties: {}, children: [{ type: "text", value: caption }] }]
      : [image],
  };
}

export function renderMarkdown(tree: Root): string {
  return renderer.stringify(renderer.runSync(tree));
}

export function markdownText(body: string): string {
  return textContent(parser.parse(body));
}
