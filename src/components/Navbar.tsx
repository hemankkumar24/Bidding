import { useEffect, useState } from 'react'
import AddProductOverlay from './AddProductOverlay'

const Navbar = () => {

  // toggle to add products
  const [addProductToggle, setAddProductToggle] = useState<boolean>(false)

  // prevent scrolling when the add product is opened
  useEffect(() => {
    if (addProductToggle) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [addProductToggle])

  return (
    <div className={`h-20 w-full `}>
      { // here is an overlay on the add product toggle
        addProductToggle && <AddProductOverlay setAddProductToggle={setAddProductToggle}/>
      }
      <div className='h-full w-full flex items-center justify-between py-3 border-b border-b-gray-300'>
        <div className='text-3xl font-semibold'>
          Live Bidding
        </div>
        <div className='text-2xl text-green-700 hover:bg-green-300 px-4 py-2 rounded-lg bg-green-200 font-bold cursor-pointer' onClick={() => { setAddProductToggle(true) }}>
          Add Product
        </div>
      </div>
    </div>
  )
}

export default Navbar