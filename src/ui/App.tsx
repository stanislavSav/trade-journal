import './styles.css'
import { ErrorBoundary } from './ErrorBoundary'
import { JournalApp } from './JournalApp'

export function App() {
  return (
    <ErrorBoundary>
      <JournalApp />
    </ErrorBoundary>
  )
}
