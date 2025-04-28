import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import './App.css'
import PageFreeze from './pages/pageFreeze'

function App() {
  const [count, setCount] = useState(0)
  

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-svh">
        <PageFreeze />
      </div>
    </>
  )
}

export default App
