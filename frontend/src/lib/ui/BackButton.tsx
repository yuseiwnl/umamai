'use client'

import { useRouter } from 'next/navigation'
import { FaArrowLeft } from 'react-icons/fa'

interface BackButtonProps {
  className?: string
}

export default function BackButton({ className }: BackButtonProps) {
  const router = useRouter()

  return (
    <button
      onClick={() => router.back()}
      className={`flex items-center justify-center w-10 h-10 rounded-full bg-white/50 text-white backdrop-blur hover:bg-black/70 transition ${className}`}
    >
      <FaArrowLeft className="w-5 h-5" />
    </button>
  )
}
