import fs from "fs";
const path = "frontend/Sprint30.md";
try {
  const stats = fs.statSync(path);
  console.log(`File size: ${stats.size} bytes`);
  const content = fs.readFileSync(path);
  console.log(`Buffer length: ${content.length}`);
  console.log("Hex head:", content.slice(0, 32).toString("hex"));
  console.log("Text head:", content.slice(0, 500).toString("utf8"));
} catch (e) {
  console.error(e);
}
