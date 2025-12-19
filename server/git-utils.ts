import { commitDatabaseChanges } from "./db-sync";

export async function autoCommit(message: string) {
  try {
    // Commit to local git repo
    // Push will be attempted but won't block if it fails
    await commitDatabaseChanges(message);
  } catch (error) {
    console.log(`[GIT] Commit skipped:`, error);
  }
}
