// src/pages/NotFound.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4 text-center">
      <h1 className="text-4xl font-bold text-red-600 mb-4">404 - Página não encontrada</h1>
      <p className="text-gray-700 mb-6">A página que você tentou acessar não existe.</p>
      <Link
        to="/"
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
      >
        Voltar para o início
      </Link>
    </div>
  );
}
