import { useT } from '../i18n'
import { exitDemo } from '../state/demo'

/** Above the header in demo mode (docs/demo-data/plan.md §5.1). A plain region, not role="status". */
export function DemoBanner() {
  const t = useT()
  return (
    <div className="demo-banner">
      <p>{t.demo.banner}</p>
      <button type="button" className="text-btn" onClick={exitDemo}>
        {t.demo.exit}
      </button>
    </div>
  )
}
