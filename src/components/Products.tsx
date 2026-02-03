import { useEffect, useState } from 'react'
import Card from './Card'
import { supabase } from '../lib/supabase'
import type { Item } from '../types/item' // the interface for each item
import toast from 'react-hot-toast'

const Products = () => {

  const [items, setItems] = useState<Item[]>([]) // use state for items

  useEffect(() => {
    const fetchItems = async () => {
      // calling all items from the database
      const { data, error } = await supabase.from('items_with_status').select('*')

      // logging error if error in fetching data
      if (error) { console.error(error) }

      // setting items inside the useState
      setItems(data as Item[])
      toast.success("Products Fetched Successfully!")
    }

    fetchItems() // calling the useeffect function
  }, [])

  return (
    <div className='w-full h-full py-5'>
        {/* All the products will be mentioned here */}
        <div className='grid grid-cols-4 gap-3'>
            { items.map(item => ( // mapping all the items for every card
                <Card key={item.id} item={item} />
            ))}
        </div>
    </div>
  )
}

export default Products