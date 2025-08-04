
import { execSync } from "child_process";

const ENV_REGEX = /(^|.*\/)\.env($|(\.|$))/;

// Get staged files
let changedFiles = "";
try {
  changedFiles = execSync("git diff --cached --name-only").toString();
} catch (e) {
  console.error("❌ Failed to get staged files.");
  process.exit(1);
}

const changedFilesList = changedFiles.trim().split("\n");
const stagedMatches = changedFilesList.filter(f => ENV_REGEX.test(f));

if (stagedMatches.length > 0) {
  console.error("\x1b[31m🚨 WARNING: You're trying to push a staged .env file! Push blocked by NoLeak Guardian.\x1b[0m");
  console.error("🔍 Found in staged files:");
  stagedMatches.forEach(f => console.error(`- ${f}`));
  process.exit(1);
}

// Also check for tracked .env files in general
let trackedFiles = "";
try {
  trackedFiles = execSync("git ls-files").toString();
} catch (e) {
  console.error("❌ Failed to get tracked files.");
  process.exit(1);
}

const trackedFilesList = trackedFiles.trim().split("\n");
const trackedMatches = trackedFilesList.filter(f => ENV_REGEX.test(f));

if (trackedMatches.length > 0) {
  console.error("\x1b[31m🚨 WARNING: .env file(s) already tracked in your Git repo! Push blocked by NoLeak Guardian.\x1b[0m");
  console.error("🔍 Found in tracked files:");
  trackedMatches.forEach(f => console.error(`- ${f}`));
  process.exit(1);
}

console.log("✅ No tracked .env files detected. Push allowed.");
process.exit(0);
