"use client"

import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { useState } from "react"
import { Link } from "react-router-dom"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <svg className="h-6 w-6 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>
            <span className="text-xl font-semibold">HeathCare</span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <a href="#services" className="text-sm font-medium transition-colors hover:text-primary">
              Services
            </a>
            <a href="#about" className="text-sm font-medium transition-colors hover:text-primary">
              About Us
            </a>
            <a href="#providers" className="text-sm font-medium transition-colors hover:text-primary">
              Providers
            </a>
            <a href="#contact" className="text-sm font-medium transition-colors hover:text-primary">
              Contact
            </a>
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Link to="/login">
              <Button variant="ghost" size="sm">
                Login
              </Button>
            </Link>
          </div>

          <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="border-t py-4 md:hidden">
            <nav className="flex flex-col gap-4">
              <a href="#services" className="text-sm font-medium">
                Services
              </a>
              <a href="#about" className="text-sm font-medium">
                About Us
              </a>
              <a href="#providers" className="text-sm font-medium">
                Providers
              </a>
              <a href="#contact" className="text-sm font-medium">
                Contact
              </a>
              <div className="flex flex-col gap-2 pt-4">
                <Button variant="ghost" size="sm">
                  Login
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
