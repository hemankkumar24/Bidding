import { useEffect, useState } from 'react'
import type { Item } from '../types/item'
import { supabase } from '../lib/supabase.js'
import toast from 'react-hot-toast'

function getStoragePathFromUrl(url: string) {
    const parts = url.split('/item-images/')
    return parts[1] // filename.ext
}

// Props interface for Card component
interface CardProps {
    item: Item
}

// Utility function to format remaining time from milliseconds
function formatTimeLeft(ms: number): string {
    if (ms <= 0) return 'Ended'

    const totalSeconds = Math.floor(ms / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    return `${hours}h ${minutes}m ${seconds}s`
}

const Card = ({ item }: CardProps) => {
    // store the current time (updated every second)
    const [timeLeft, setTimeLeft] = useState('')

    // Timer effect - updates countdown every second
    useEffect(() => {
        const updateTimer = () => {
            const diff = new Date(item.end_time).getTime() - Date.now()
            setTimeLeft(formatTimeLeft(diff))
        }

        updateTimer() // Initial call
        const interval = setInterval(updateTimer, 1000)

        return () => clearInterval(interval) // Cleanup on unmount
    }, [item.end_time])

    const handleDelete = async () => {
        try {
            // 1. Delete image from storage
            if (item.image_link) {
                const path = getStoragePathFromUrl(item.image_link)

                const { error: storageError } = await supabase.storage
                    .from('item-images')
                    .remove([path])

                if (storageError) {
                    console.error('Storage delete failed:', storageError)
                    return
                }
            }

            // 2. Delete item row
            const { error: dbError } = await supabase
                .from('items')
                .delete()
                .eq('id', item.id)

            if (dbError) {
                console.error('DB delete failed:', dbError)
                return
            }

            toast.success('Item deleted successfully')

        } catch (err) {
            console.error(err)
        }
    }


    return (
        <div className="w-full h-[30rem] bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 p-4 flex flex-col gap-y-2 border border-gray-100">

            {/* Image Container */}
            <div className="w-full aspect-square overflow-hidden rounded-xl bg-gray-100">
                <img
                    src={item.image_link}
                    alt={item.title}
                    className="object-cover object-center w-full h-full hover:scale-105 transition-transform duration-300"
                />
            </div>

            {/* Title */}
            <div className='w-full flex justify-between'>
            <h2 className="text-xl font-semibold text-gray-800 line-clamp-1">
                {item.title}
            </h2>
            <h1 className='text-red-600 cursor-pointer' onClick={handleDelete}>Delete</h1>
            </div>

            {/* Description */}
            {item.description && (
                <p className="text-sm text-gray-500 line-clamp-2">
                    {item.description}
                </p>
            )}

            {/* Timer */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>⏱</span>
                <span className="font-medium">{timeLeft}</span>
            </div>

            {/* Status + Current Bid */}
            <div className="mt-auto flex justify-between items-center pt-3 border-t border-gray-100">
                {/* Status Badge */}
                <span
                    className={`text-xs font-semibold px-3 py-1.5 rounded-full uppercase tracking-wide
                        ${item.status === 'live'
                            ? 'bg-green-100 text-green-700'
                            : item.status === 'upcoming'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-gray-200 text-gray-600'
                        }`}
                >
                    {item.status}
                </span>

                {/* Current Bid Amount */}
                <span className="text-lg font-bold text-gray-800">
                    ₹{item.current_bid.toLocaleString()}
                </span>
            </div>

            {
                item.status == 'live' ?
                    <div className='w-full py-2 rounded-xl hover:bg-green-200 cursor-pointer bg-green-100 text-green-700 flex justify-center items-center'>
                        Place bid
                    </div> :
                    <div className='w-full py-2 rounded-xl cursor-pointer bg-red-100 text-red-700 flex justify-center items-center'>
                        {   // simple ternary operator usecase
                            item.status == 'upcoming' ? "Bidding Yet to Start" : "Bidding Ended"
                        }
                    </div>
            }

        </div>
    )
}

export default Card