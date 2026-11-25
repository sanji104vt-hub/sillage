import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const html = readFileSync("public/contact.html", "utf8");
const privacy = readFileSync("public/privacy.html", "utf8");
assert(html.includes('<form action="https://formspree.io/f/xwloynve" method="POST">'), "Contact endpoint mismatch");
assert(!/YOUR_FORMSPREE_ID|USER SETUP REQUIRED|フォームは準備中/.test(html), "Unconfigured form remains");
for (const name of ["name", "email", "message"]) {
  assert(new RegExp(`<(?:input|textarea)\\b[^>]*name="${name}"[^>]*required`).test(html), `Required field missing: ${name}`);
}
assert(html.includes('name="_gotcha"'), "Spam honeypot missing");
assert(html.includes("Formspree") && html.includes("機密情報"), "Form processing notice missing");
assert(privacy.includes("Formspree, Inc.") && privacy.includes("https://formspree.io/legal/privacy-policy/"), "Privacy disclosure missing");
for (const page of [html, privacy]) {
  assert(page.includes("G-60BQRQWB5M"), "GA4 tag missing");
  assert(page.includes("UucVcbwbG6YhXKLVS3GGS8nVk_egyJCLywDHkw6J-5Q"), "Verification tag missing");
}
console.log("Contact validation: OK (endpoint, required fields, notices, tracking tags)");
