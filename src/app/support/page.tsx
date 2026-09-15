'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCw } from 'lucide-react'

export default function SupportPage() {
  const router = useRouter()

  useEffect(() => {
    router.push('/tickets')
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
    </div>
  )
}
