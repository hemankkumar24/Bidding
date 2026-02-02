import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'

interface AddProductOverlayProps {
    setAddProductToggle: React.Dispatch<React.SetStateAction<boolean>>
}

const AddProductOverlay = ({ setAddProductToggle }: AddProductOverlayProps) => {

    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [startTime, setStartTime] = useState('')
    const [startingBid, setStartingBid] = useState<number>(0)
    const [durationMinutes, setDurationMinutes] = useState<number>(0)
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [loading, setLoading] = useState(false)

    // save the image in supabase blob storage and return the image link
    const handleImageUpload = async () => {
        if (!imageFile) return null

        const fileExt = imageFile.name.split('.').pop()
        const fileName = `${crypto.randomUUID()}.${fileExt}`

        const { error } = await supabase.storage.from('item-images').upload(fileName, imageFile)

        if (error) {
            console.error(error)
            return null
        }

        const { data } = supabase.storage.from('item-images').getPublicUrl(fileName)

        return data.publicUrl
    }

    // handle submit of the form
    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const imageUrl = await handleImageUpload()

            // insert the new auction
            const { error } = await supabase.from('items').insert({
                title,
                description,
                image_link: imageUrl,
                start_time: new Date(startTime).toISOString(),
                duration_minutes: durationMinutes,
                current_bid: startingBid,
            })

            if (error) throw error

            // reset + close modal
            setAddProductToggle(false)
            setTitle('')
            setDescription('')
            setStartTime('')
            setStartingBid(0)
            setDurationMinutes(0)
            setImageFile(null)

        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

return (
    // on clicking the gray-er part the toggle is closed
    <div className='absolute w-full h-full overflow-y-hidden top-0 left-0 z-20 bg-stone-900/50' onClick={() => { setAddProductToggle(false) }}>
        <div className="absolute top-1/2 left-1/2 max-w-2xl w-full -translate-x-1/2 -translate-y-1/2 h-auto z-50 bg-stone-200 rounded-3xl p-5" onClick={(e) => e.stopPropagation()}>
            <div className='text-2xl border-b-gray-300 border-b pb-2'>
                Add Product
            </div>
            <form className='flex flex-col py-2 gap-y-2' onSubmit={handleSubmit}>
                <div className='text-xl'>
                    Title
                    <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full bg-stone-100 outline-0 py-2 px-2 rounded-sm text-sm"
                    />
                </div>
                <div className='text-xl'>
                    Description
                    <input
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full bg-stone-100 outline-0 py-2 px-2 rounded-sm text-sm"
                    />
                </div>
                <div className='text-xl'>
                    Start Time
                    <input
                        type="datetime-local"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="w-full bg-stone-100 outline-0 py-2 px-2 rounded-sm text-sm"
                    />
                </div>
                <div className='text-xl'>
                    Starting Bid (Rs)
                    <input
                        type="number"
                        value={startingBid}
                        onChange={(e) => setStartingBid(Number(e.target.value))}
                        className="w-full bg-stone-100 outline-0 py-2 px-2 rounded-sm text-sm"
                    />
                </div>
                <div className='text-xl'>
                    Duration Minutes
                    <input
                        type="number"
                        value={durationMinutes}
                        onChange={(e) => setDurationMinutes(Number(e.target.value))}
                        className="w-full bg-stone-100 outline-0 py-2 px-2 rounded-sm text-sm"
                    />
                </div>
                <div className="text-xl">
                    Product Image
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                        className="w-full text-sm"
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="mt-4 bg-green-200 text-green-700 border-green-400  hover:bg-green-300 cursor-pointer border py-2 rounded-lg font-semibold disabled:opacity-50"
                >
                    {loading ? 'Adding...' : 'Add Product'}
                </button>
            </form>
        </div>
    </div>
)
}

export default AddProductOverlay