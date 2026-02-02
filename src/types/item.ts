export interface Item {
  id: string
  title: string
  description: string | null
  start_time: string
  end_time: string
  duration_minutes: number
  status: 'upcoming' | 'live' | 'ended'
  current_bid: number
  image_link: string
  created_at: string
}
