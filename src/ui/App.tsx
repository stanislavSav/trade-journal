import './styles.css'
import { I18nProvider } from '../i18n'
import { ErrorBoundary } from './ErrorBoundary'
import { JournalApp } from './JournalApp'
import { UpdateBanner } from './UpdateBanner'

export function App() {
  return (
    <I18nProvider>
      <ErrorBoundary>
        <JournalApp />
      </ErrorBoundary>
      <UpdateBanner />
    </I18nProvider>
  )
}
