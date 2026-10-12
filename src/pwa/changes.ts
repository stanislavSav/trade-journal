// "What changed" link (docs/update-prompt/plan.md D8): GitHub's compare view from the running build to main, so a
// user can read every change before taking an update. Without a known commit, the list of recent commits.
export const REPO_URL = 'https://github.com/stanislavSav/trade-journal'

export function changesUrl(commit: string): string {
  return commit ? `${REPO_URL}/compare/${commit}...main` : `${REPO_URL}/commits/main`
}
