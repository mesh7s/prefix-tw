import "./style.css";
import { Notyf } from "notyf";
import hljs from "highlight.js";
import { editor } from "./editor";

const notyf = new Notyf({
  position: { x: "center", y: "top" },
  dismissible: true,
  ripple: true,
  duration: 2000,
});

const btn = getElById<HTMLButtonElement>("convert");
const result = getElById<HTMLParagraphElement>("result");
const prefixEl = getElById<HTMLInputElement>("prefix");
prefixEl.value = localStorage.getItem("prefix") ?? "";
const ignoreEl = getElById<HTMLInputElement>("ignore");
const copyIcon = getElById<HTMLDivElement>("copyIcon");
const codeContainer = getElById<HTMLDivElement>("codeContainer");
ignoreEl.value = localStorage.getItem("ignore") ?? "";
let resultHtml = "";

if (!prefixEl.value.trim()) {
  btn.disabled = true;
}

prefixEl.oninput = () => {
  localStorage.setItem("prefix", prefixEl.value);

  if (!editor.getValue().trim() || !prefixEl.value.trim()) {
    btn.disabled = true;
  } else {
    btn.disabled = false;
  }
};

ignoreEl.oninput = () => {
  localStorage.setItem("ignore", ignoreEl.value);
};

editor.getModel()!.onDidChangeContent(() => {
  const value = editor.getValue();

  if (value.trim().length > 0 && prefixEl.value.trim()) {
    if (btn.disabled) btn.disabled = false;
  } else if (!btn.disabled) {
    btn.disabled = true;
  }
});

copyIcon.onclick = () => {
  navigator.clipboard.writeText(resultHtml);
  notyf.success("HTML copied to clipboard!");
};

const parser = new DOMParser();

btn.onclick = () => {
  const prefix = prefixEl.value;
  const ignore = ignoreEl.value.split(" ").filter((i) => i);
  let val = editor.getValue();
  const parsed = parser.parseFromString(editor.getValue(), "text/html");
  const treeWalker = document.createTreeWalker(parsed);

  let node: Node | null = treeWalker.currentNode;

  while (node !== null) {
    const classes = (node as HTMLElement).classList;

    if (!classes || classes.length === 0) {
      node = treeWalker.nextNode();
      continue;
    }

    const newClasses = getPrefixedClasses(classes, ignore, prefix);
    val = val.replaceAll(`class="${classes.value}"`, `class="${newClasses.join(" ")}"`);
    node = treeWalker.nextNode();
  }

  result.textContent = val;
  resultHtml = val;
  result.removeAttribute("data-highlighted");
  hljs.highlightElement(result);
  codeContainer.classList.remove("hidden");
};

function getElById<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id)!;
  return el as T;
}

function getPrefixedClasses(classes: DOMTokenList, ignore: string[], prefix: string) {
  const newClasses: string[] = [];

  for (const c of classes) {
    if (
      ignore.length > 0 &&
      ignore.find((i) => {
        if (i.endsWith("*")) {
          return c.startsWith(i.substring(0, i.length - 1));
        }

        return c === i;
      })
    ) {
      newClasses.push(c);
      continue;
    }

    const split = c.split(":");

    if (split.length > 1) {
      split[split.length - 1] = `${prefix}${split[split.length - 1]}`;
      newClasses.push(split.join(":"));
    } else {
      newClasses.push(`${prefix}${c}`);
    }
  }

  return newClasses;
}
