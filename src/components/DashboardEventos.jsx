import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { format } from "date-fns";

export default function DashboardEventos() {
  const [eventos, setEventos] = useState([]);
  const [proxima, setProxima] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchEventos() {
      const { data, error } = await supabase
        .from("eventos")
        .select("*")
        .order("data", { ascending: true });
      if (!error && data) {
        setEventos(data);
        const hoje = new Date();
        const futuras = data.filter((e) => new Date(e.data) >= hoje);
        if (futuras.length) setProxima(futuras[0]);
      }
    }
    fetchEventos();
  }, []);

  const formatReal = (valor) =>
    valor
      ? valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
      : "-";

  const eventosAgrupados = eventos.reduce((acc, evento) => {
    const dataFormatada = format(new Date(evento.data), "dd/MM/yyyy");
    acc[dataFormatada] = acc[dataFormatada] || [];
    acc[dataFormatada].push(evento);
    return acc;
  }, {});

  const handleOpenModal = () => {
    setForm({});
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newEvento = {
      ...form,
      id: crypto.randomUUID(),
      valor_estimado: form.valor_estimado ? parseFloat(form.valor_estimado) : null,
      valor_ideal: form.valor_ideal ? parseFloat(form.valor_ideal) : null,
    };
    const { error } = await supabase.from("eventos").insert([newEvento]);
    if (!error) {
      setShowModal(false);
      window.location.reload();
    } else {
      alert("Erro ao salvar: " + error.message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-primary">Licitações Agendadas</h1>
        <button
          onClick={handleOpenModal}
          className="bg-primary hover:bg-primary-dark text-white font-medium px-5 py-3 rounded shadow transition"
        >
          Nova Licitação
        </button>
      </div>

      {/* Próxima Licitação */}
      {proxima && (
        <div
          onClick={() => navigate(`/detalhes/${proxima.id}`)}
          className="cursor-pointer bg-blue-100 border border-primary text-primary px-5 py-3 rounded mb-6 shadow hover:bg-blue-200 transition"
        >
          <strong>Próxima Licitação:</strong> {proxima.objeto} -{" "}
          {format(new Date(proxima.data), "dd/MM/yyyy")}
        </div>
      )}

      {/* Eventos agrupados por data */}
      {Object.entries(eventosAgrupados).map(([data, lista]) => (
        <div
          key={data}
          className="bg-white rounded-lg shadow p-5 mb-6 border border-gray-200"
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-4">{data}</h2>
          <ul>
            {lista.map((evento) => (
              <li
                key={evento.id}
                onClick={() => navigate(`/detalhes/${evento.id}`)}
                className="cursor-pointer p-4 rounded hover:bg-gray-100 flex justify-between items-center"
              >
                <div>
                  <p className="font-medium text-gray-900">{evento.objeto}</p>
                  <p className="text-gray-600">{evento.orgao}</p>
                </div>
                <span className="font-semibold text-primary">
                  {formatReal(evento.valor_estimado)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}

      {/* Modal de criação */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 overflow-auto max-h-[90vh]">
            <h2 className="text-xl font-bold mb-4 text-primary">Nova Licitação</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                name="objeto"
                placeholder="Objeto"
                required
                className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-primary"
                onChange={handleChange}
              />
              <input
                name="orgao"
                placeholder="Órgão"
                required
                className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-primary"
                onChange={handleChange}
              />
              <input
                name="data"
                type="date"
                required
                className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-primary"
                onChange={handleChange}
              />
              <input
                name="hora"
                type="time"
                required
                className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-primary"
                onChange={handleChange}
              />
              <input
                name="valor_estimado"
                placeholder="Valor Estimado (R$)"
                type="number"
                step="0.01"
                required
                className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-primary"
                onChange={handleChange}
              />
              <input
                name="valor_ideal"
                placeholder="Valor Ideal (R$ - opcional)"
                type="number"
                step="0.01"
                className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-primary"
                onChange={handleChange}
              />
              <textarea
                name="observacoes"
                placeholder="Observações"
                className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-primary"
                onChange={handleChange}
              />
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded transition"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
