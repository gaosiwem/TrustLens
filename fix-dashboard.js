const fs = require("fs");
const prettier = require("prettier");

async function fixDashboard() {
  try {
    // Read the current broken file
    const filePath =
      "c:\\Users\\5907\\Documents\\Projects\\Tsediyalo\\TrustLens\\frontend\\src\\app\\dashboard\\page.tsx";
    let content = fs.readFileSync(filePath, "utf-8");

    // First, fix obvious structural issues
    // Fix mangled comments
    content = content.replace(
      /\/\/ ([^{]*?) (const|let|var|function|export)/g,
      "// $1\n$2"
    );

    // Fix object properties that are on same line
    content = content.replace(/,\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, ",\n$1:");

    // Now try to format with prettier
    const formatted = await prettier.format(content, {
      parser: "typescript",
      semi: true,
      singleQuote: false,
      trailingComma: "es5",
      tabWidth: 2,
    });

    fs.writeFileSync(filePath, formatted, "utf-8");
    console.log("✅ Dashboard file successfully formatted!");
  } catch (error) {
    console.error("Error:", error.message);
    console.log("File still has syntax errors that need manual fixing");
  }
}

fixDashboard();
