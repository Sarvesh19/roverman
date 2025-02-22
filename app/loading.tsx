"use client"

import { Car } from "lucide-react"

export default function Loading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-2">
        <Car className="h-8 w-8 animate-bounce text-primary" />
        <p className="text-lg font-medium">Loading...</p>
      </div>
    </div>
  )
}