// Demo mode: the app opened with ?demo (docs/demo-data/plan.md). The data itself is in demoData.ts.
export const isDemo =
  import.meta.env.DEV && typeof location !== 'undefined' && new URLSearchParams(location.search).has('demo')
