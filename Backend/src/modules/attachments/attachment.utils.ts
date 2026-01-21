import { v4 as uuid } from "uuid";
import path from "path";

export function generateFilePath(originalName: string) {
  const ext = path.extname(originalName);
  return `${uuid()}${ext}`;
}
