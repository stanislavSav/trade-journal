import './styles.css'
import { I18nProvider } from '../i18n'
import { ErrorBoundary } from './ErrorBoundary'
import { JournalApp } from './JournalApp'

export function App() {
  return (
    <I18nProvider>
      <ErrorBoundary>
        <JournalApp />
      </ErrorBoundary>
    </I18nProvider>
  )
}
