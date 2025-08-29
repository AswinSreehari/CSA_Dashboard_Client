import React from 'react'
import { LoaderFive } from "./ui/loader";


const TopsectionLoader = () => {
  return (
        <div className="w-full rounded-lg h-40 text-2xl p-6 bg-white dark:bg-[#0f172a] ">
            <LoaderFive  text="Generating chart..." />
        
    </div>
  )
}

export default TopsectionLoader