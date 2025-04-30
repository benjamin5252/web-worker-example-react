import './App.css'
import CompressImagePage from './pages/CompressImagePage'
import PageFreezePage from './pages/PageFreezePage'

function App() {
  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-svh">
        <PageFreezePage />
      </div>
      <div className="flex flex-col items-center justify-center min-h-svh">
        <CompressImagePage/>
      </div>
    </>
  )
}

export default App
