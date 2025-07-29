import React from 'react'
import { Link, useLocation } from 'react-router-dom'

export default function Navbar() {
  const location = useLocation()
  const active = (path) => location.pathname === path ? 'text-white bg-blue-600' : 'text-blue-600'

  return (
    <nav className="flex gap-4 p-4 bg-gray-100 shadow-md">
      <Link to="/" className={`px-4 py-2 rounded ${active('/')}`}>Agenda</Link>
      <Link to="/nova" className={`px-4 py-2 rounded ${active('/nova')}`}>Nova Licitação</Link>
    </nav>
  )
}
