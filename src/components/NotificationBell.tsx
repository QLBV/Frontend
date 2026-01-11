"use client"

import { useState, useEffect, useRef } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { getUnreadCount } from "@/services/notification.service"
import NotificationDropdown from "./NotificationDropdown"
import { toast } from "sonner"

export default function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Fetch unread count
  const fetchUnreadCount = async () => {
    if (isLoading) return; // Prevent multiple simultaneous requests

    try {
      setIsLoading(true)
      const count = await getUnreadCount()
      setUnreadCount(count)
    } catch (error: any) {
      // Silent fail for 429 errors - don't spam logs
      if (error?.response?.status !== 429) {
        if (import.meta.env.DEV) {
          console.error("Failed to fetch unread count:", error)
        }
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchUnreadCount()
  }, [])

  // Poll for unread count every 60 seconds (increased from 30)
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      fetchUnreadCount()
    }, 60000) // 60 seconds to reduce API calls

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  // Refresh count when dropdown opens/closes
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (open) {
      // Refresh count when opening
      fetchUnreadCount()
    }
  }

  // Callback to update count after actions in dropdown
  const handleNotificationAction = () => {
    fetchUnreadCount()
  }

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <Bell size={24} className="text-black font-bold" strokeWidth={2.5} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-xs font-bold rounded-full border-2 border-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[380px] p-0"
        align="end"
        sideOffset={8}
      >
        <NotificationDropdown
          onAction={handleNotificationAction}
          onClose={() => setIsOpen(false)}
        />
      </PopoverContent>
    </Popover>
  )
}
