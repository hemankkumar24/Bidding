import React from 'react'
import Navbar from './components/Navbar'
import Products from './components/Products'

export const App = () => {
  return (
     <>
     <div className='w-full min-h-screen bg-stone-50'>
      <div className='w-full h-full max-w-10/12 mx-auto'>
        {/* Including Navbar Here */}
        <Navbar />
        {/* All Products */}
        <Products />
      </div>
    </div>
     </> 
  )
}
