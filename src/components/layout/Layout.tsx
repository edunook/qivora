import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { LoadingScreen } from '../ui/LoadingScreen'
import { useEffect, useState } from 'react'

export const Layout = () => {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Hide loading screen after initial load
    const timer = setTimeout(() => {
      setLoading(false)
    }, 3000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="relative min-h-screen flex flex-col">
      {loading && <LoadingScreen />}
      <Navbar />
      <main className="flex-1 flex flex-col pt-24">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
