import React from 'react'
import CardEvento from './CardEvento'

export default function DashboardEventos() {
  return (
    <div className="p-3">
      <h1 className="text-3xl font-bold mb-4">Licitações Agendadas</h1>

      <CardEvento
        evento={{
          id: "1",
          orgao: "Licitação A",
          objeto: "Objeto da licitação A",
          data: "2025-07-30",
        }}
      />

      <CardEvento
        evento={{
          id: "2",
          orgao: "Licitação B",
          objeto: "Objeto da licitação B",
          data: "2025-08-05",
        }}
      />
    </div>
  )
}
