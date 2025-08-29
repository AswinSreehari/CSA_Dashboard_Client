import React from 'react'
import { LoaderFive } from "./ui/loader";


const Loader = () => {
  return (
    <div
         className='col-span-12 lg:col-span-8 mt-5 mx-0 transition-all duration-300 cursor-pointer hover:ring-2 ring-blue-500 rounded-lg'
         tabIndex={0}
        role="button"
        aria-label="Open top keywords details"
      >
        <div className="rounded-xl border border-gray-200 text-2xl h-130 dark:border-gray-800 bg-white dark:bg-[#0f172a] p-6 shadow-sm flex flex-col">
        <LoaderFive  text="Generating chart..." />
    </div>
    </div>
  )
}

export default Loader