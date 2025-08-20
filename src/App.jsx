 import './App.css'
import { FilterProvider } from './Components/contexts/FilterContext'
import Home from './Pages/Home'

function App() {
 
  return (
     <div>
      <FilterProvider>
      <Home/>
      </FilterProvider>
     </div>
  )
}

export default App
