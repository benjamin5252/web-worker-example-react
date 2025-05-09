import './App.css'
import useScrollToHash from './hooks/useScrollToHash'
import CompressImagePage from './pages/CompressImagePage'
import PageFreezePage from './pages/PageFreezePage'

function App() {
  useScrollToHash()
  return (
    <>
      <div id="example1" className="flex flex-col items-center justify-center min-h-svh w-full overflow-x-auto ">
        <PageFreezePage />
      </div>
      <div id="example2" className="flex flex-col items-center justify-center min-h-svh w-full overflow-x-auto ">
        <CompressImagePage/>
      </div>
    </>
  )
}

export default App
