import { useEffect, useRef, useState } from 'react'
import type { Item } from '../types/item'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import { socket } from '../socket'

function getStoragePathFromUrl(url: string) {
    const parts = url.split('/item-images/')
    return parts[1] // filename.ext
}

// Props interface for Card component
interface CardProps {
    item: Item
    userName: string;
}

// Response interface for socket
interface BidAckResponse {
    success: boolean;
    error: string;
}

// get live status for time left
function getLiveStatus(item: Item) {
    const now = Date.now()
    const start = new Date(item.start_time).getTime()
    const end = new Date(item.end_time).getTime()

    if (now < start) return 'upcoming'
    if (now > end) return 'ended'
    return 'live'
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

const Card = ({ item, userName }: CardProps) => {
    // live status of the current bid
    const liveStatus = getLiveStatus(item)
    // store the current time (updated every second)
    const [timeLeft, setTimeLeft] = useState('')
    // winning bid usestate
    const [winningBid, setWinningBid] = useState<boolean>(false);
    // outbid by state
    const [outbidBy, setOutbidBy] = useState<string | null>(null);
    // checking if i have ever bidded on that item
    const [hasBid, setHasBid] = useState<boolean>(false);
    // price update ref 
    const priceRef = useRef<HTMLSpanElement | null>(null);



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

    // handling bid logic here
    const handleBid = async () => {

        if(winningBid) { toast.success("You're already winning this bid!"); return;}

        socket.emit("bidPlaced", {
            itemId: item.id,
            bidAmount: item.current_bid + 10,
            bidder: userName
        },
            (response: BidAckResponse) => { // callback response recieved
                if (response.success) { toast.success("Bid placed successfully!"); setWinningBid(true); setOutbidBy(null); setHasBid(true);}
                else { toast.error(response.error); }
            })
    }

    // updating the value after recieving the bidupdated signal
    useEffect(() => {
        const onBidUpdated = (data: { itemId: string; newBid: number; bidder: string }) => {
            if (data.itemId !== item.id) return;

            item.current_bid = data.newBid;

            // flash green 
            if (priceRef.current) {
            priceRef.current.classList.add('text-green-500');

            setTimeout(() => {
                priceRef.current?.classList.remove('text-green-500');
            }, 600);
        }

            if (data.bidder === userName) {
                setWinningBid(true);
                setOutbidBy(null);
            } else if (hasBid) {
                setWinningBid(false);
                setOutbidBy(data.bidder);
            }
        };

        socket.on("bidUpdated", onBidUpdated);

        return () => {
            socket.off("bidUpdated", onBidUpdated);
        };
    }, [item.id, userName, hasBid]);

    return (
        <div className="w-full h-120 bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 p-4 flex flex-col gap-y-2 border border-gray-100">

            {/* Image Container */}
            <div className="w-full aspect-square overflow-hidden rounded-xl bg-gray-100 relative">
                {winningBid && (
                    <div className="absolute top-3 left-3 text-sm px-2 py-1 rounded-lg bg-green-200 text-green-700 z-50">
                        You're winning
                    </div>
                )}

                {!winningBid && outbidBy && (
                    <div className="absolute top-3 left-3 text-sm px-2 py-1 rounded-lg bg-red-200 text-red-700 z-50">
                        Outbid by {outbidBy}
                    </div>
                )}

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
                        ${liveStatus === 'live'
                            ? 'bg-green-100 text-green-700'
                            : liveStatus === 'upcoming'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-gray-200 text-gray-600'
                        }`}
                >
                    {item.status}
                </span>

                {/* Current Bid Amount */}
                <span ref={priceRef} className="text-lg font-bold text-gray-800 transition-colors duration-300">
                    ₹{item.current_bid.toLocaleString()}
                </span>
            </div>

            {
                liveStatus == 'live' ?
                    <div className='w-full py-2 rounded-xl hover:bg-green-200 cursor-pointer bg-green-100 text-green-700 flex justify-center items-center' onClick={handleBid}>
                        Place bid +(₹10)
                    </div> :
                    <div className='w-full py-2 rounded-xl cursor-pointer bg-red-100 text-red-700 flex justify-center items-center'>
                        {   // simple ternary operator usecase
                            liveStatus == 'upcoming' ? "Bidding Yet to Start" : "Bidding Ended"
                        }
                    </div>
            }

        </div>
    )
}

export default Card