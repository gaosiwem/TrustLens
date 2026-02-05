import fs from "fs";
import path from "path";

const logoPath = path.join(process.cwd(), "frontend/public/logo.png");

try {
  const fd = fs.openSync(logoPath, "r");
  const buffer = Buffer.alloc(8);
  fs.readSync(fd, buffer, 0, 8, 0);
  fs.closeSync(fd);

  console.log("File path:", logoPath);
  console.log("Header bytes:", buffer.toString("hex"));

  const pngSignature = "89504e470d0a1a0a";
  if (buffer.toString("hex") === pngSignature) {
    console.log("✅ Valid PNG signature detected.");
  } else {
    console.error("❌ Invalid PNG signature!");
  }
} catch (err) {
  console.error("Error reading file:", err);
}
