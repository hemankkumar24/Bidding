import { useEffect, useState } from 'react'
import Card from './Card'
import { supabase } from '../lib/supabase'
import type { Item } from '../types/item' // the interface for each item
import toast from 'react-hot-toast'

type ProductsProps = {
  userName: string;
};

const Products = ({ userName }: ProductsProps) => {

  const [items, setItems] = useState<Item[]>([]) // use state for items
  let value:number = 0;

  useEffect(() => {
    const fetchItems = async () => {
      // calling all items from the database
      const { data, error } = await supabase.from('items_with_status').select('*')

      // logging error if error in fetching data
      if (error) { console.error(error) }

      // setting items inside the useState
      setItems(data as Item[])
      if(value == 0) {
        toast.success("Products Fetched Successfully!")
        value += 1;
      }
    }

    fetchItems() // calling the useeffect function

    const channel = supabase.channel('items-realtime').on('postgres_changes', {
      event: '*', schema: 'public', table: 'items',
    }, () => { fetchItems() }).subscribe()

    return () => {
      supabase.removeChannel(channel)
    }

  }, [])




  return (
    <div className='w-full h-full py-5'>
      {/* All the products will be mentioned here */}
      <div className='grid md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3'>
        {items.map(item => ( // mapping all the items for every card
          <Card key={item.id} item={item} userName={userName} />
        ))}
      </div>
    </div>
  )
}

export default Products