import { commitDatabaseChanges } from "./db-sync";

export async function autoCommit(message: string) {
  // Fire and forget - don't await to avoid blocking the API response
  // Commit happens locally first (fast), then push in background
  commitDatabaseChanges(message).catch((error) => {
    console.log(`[GIT] Commit skipped:`, error);
  });
}
