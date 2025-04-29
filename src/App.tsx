import './App.css'
import CompressImage from './pages/compressImage'
import PageFreeze from './pages/pageFreeze'

function App() {
  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-svh">
        <PageFreeze />
      </div>
      <div className="flex flex-col items-center justify-center min-h-svh">
        <CompressImage/>
      </div>
    </>
  )
}

export default App
