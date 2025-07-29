// src/components/DashboardEventos.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function DashboardEventos() {
  const [eventos, setEventos] = useState([]);
  const [eventosPorData, setEventosPorData] = useState({});
  const [proxima, setProxima] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [eventoSelecionado, setEventoSelecionado] = useState(null);
  const [form, setForm] = useState({
    id: null,
    modalidade: "",
    data: "",
    hora: "",
    orgao: "",
    objeto: "",
    valor_estimado: "",
    valor_ideal: "",
    observacoes: "",
    arquivo: null,
    arquivo_url: "",
  });
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    fetchEventos();
  }, []);

  async function fetchEventos() {
    const { data, error } = await supabase
      .from("eventos")
      .select("*")
      .order("data", { ascending: true })
      .order("hora", { ascending: true });

    if (error) {
      console.error("Erro ao buscar eventos:", error.message);
      return;
    }

    if (!data) return;

    setEventos(data);

    // Agrupar por data formatada dd/MM/yyyy
    const agrupados = data.reduce((acc, ev) => {
      const dataFormatada = ev.data
        ? format(parseISO(ev.data), "dd/MM/yyyy")
        : "Data indefinida";
      if (!acc[dataFormatada]) acc[dataFormatada] = [];
      acc[dataFormatada].push(ev);
      return acc;
    }, {});
    setEventosPorData(agrupados);

    // Encontrar próxima licitação futura
    const hoje = new Date();
    const futuras = data
      .filter((ev) => ev.data && new Date(ev.data) >= hoje)
      .sort((a, b) => new Date(a.data) - new Date(b.data));
    if (futuras.length > 0) setProxima(futuras[0]);
  }

  function abrirModal(evento = null) {
    if (evento) {
      setForm({
        id: evento.id,
        modalidade: evento.modalidade || "",
        data: evento.data || "",
        hora: evento.hora || "",
        orgao: evento.orgao || "",
        objeto: evento.objeto || "",
        valor_estimado: evento.valor_estimado ?? "",
        valor_ideal: evento.valor_ideal ?? "",
        observacoes: evento.observacoes || "",
        arquivo: null,
        arquivo_url: evento.arquivo_url || "",
      });
      setEventoSelecionado(evento);
    } else {
      // Novo registro (limpar form)
      setForm({
        id: null,
        modalidade: "",
        data: "",
        hora: "",
        orgao: "",
        objeto: "",
        valor_estimado: "",
        valor_ideal: "",
        observacoes: "",
        arquivo: null,
        arquivo_url: "",
      });
      setEventoSelecionado(null);
    }
    setMensagem("");
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
  }

  function handleChange(e) {
    const { name, value, files } = e.target;
    if (name === "arquivo") {
      setForm((f) => ({ ...f, arquivo: files[0] || null }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  }

  async function salvarEvento(e) {
    e.preventDefault();

    let arquivo_url = form.arquivo_url;

    if (form.arquivo) {
      const id = form.id || crypto.randomUUID();
      const arquivoNome = `${id}/${form.arquivo.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("licitacoes")
        .upload(arquivoNome, form.arquivo, { cacheControl: "3600", upsert: true });

      if (uploadError) {
        setMensagem("Erro ao fazer upload do arquivo: " + uploadError.message);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("licitacoes")
        .getPublicUrl(arquivoNome);

      arquivo_url = urlData.publicUrl;
    }

    const novoEvento = {
      modalidade: form.modalidade,
      data: form.data,
      hora: form.hora,
      orgao: form.orgao,
      objeto: form.objeto,
      valor_estimado:
        form.valor_estimado !== "" ? parseFloat(form.valor_estimado) : null,
      valor_ideal:
        form.valor_ideal !== "" ? parseFloat(form.valor_ideal) : null,
      observacoes: form.observacoes,
      arquivo_url,
    };

    let error = null;

    if (form.id) {
      // Update
      const { error: err } = await supabase
        .from("eventos")
        .update(novoEvento)
        .eq("id", form.id);
      error = err;
    } else {
      // Insert
      novoEvento.id = crypto.randomUUID();
      const { error: err } = await supabase.from("eventos").insert([novoEvento]);
      error = err;
    }

    if (error) {
      setMensagem("Erro ao salvar licitação: " + error.message);
      return;
    }

    setMensagem("Licitação salva com sucesso!");
    fetchEventos();
    fecharModal();
  }

  return (
    <div className="p-5 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Licitações Agendadas</h1>

      {/* Botão Nova Licitação */}
      <button
        onClick={() => abrirModal(null)}
        className="mb-6 px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        + Nova Licitação
      </button>

      {/* Alerta da próxima licitação */}
      {proxima && (
        <div
          className="bg-blue-100 border border-blue-400 text-blue-800 px-4 py-3 rounded mb-6 cursor-pointer shadow-md hover:bg-blue-200"
          onClick={() => abrirModal(proxima)}
        >
          <strong className="font-semibold">Próxima Licitação:</strong>{" "}
          {proxima.modalidade} - {format(parseISO(proxima.data), "dd/MM/yyyy")}{" "}
          às {proxima.hora || "hora não definida"} | {proxima.orgao}
        </div>
      )}

      {/* Lista de cards agrupados por data */}
      {Object.entries(eventosPorData).map(([data, eventos]) => (
        <div key={data} className="mb-6">
          <h2 className="text-xl font-semibold mb-3 border-b border-gray-300 pb-1">
            {data}
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {eventos.map((ev) => (
              <div
                key={ev.id}
                className="bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-lg transition"
                onClick={() => abrirModal(ev)}
              >
                <h3 className="font-semibold text-blue-800">{ev.orgao}</h3>
                <p className="text-sm text-gray-700">
                  {ev.modalidade} - {ev.hora || "Hora não definida"}
                </p>
                <p className="text-sm font-medium text-gray-900">
                  Valor Estimado:{" "}
                  {ev.valor_estimado !== null && ev.valor_estimado !== undefined
                    ? ev.valor_estimado.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })
                    : "R$ 0,00"}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Modal */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-start pt-20 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full p-6 relative">
            <button
              onClick={fecharModal}
              className="absolute top-3 right-3 text-gray-600 hover:text-gray-900 font-bold text-xl"
              aria-label="Fechar modal"
            >
              &times;
            </button>

            <h2 className="text-2xl font-bold mb-4">
              {eventoSelecionado ? "Editar Licitação" : "Nova Licitação"}
            </h2>

            <form onSubmit={salvarEvento} className="space-y-4 max-h-[75vh] overflow-y-auto">
              <select
                required
                name="modalidade"
                value={form.modalidade}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              >
                <option value="">Selecione Modalidade</option>
                <option value="Pregão Eletrônico">Pregão Eletrônico</option>
                <option value="Dispensa Eletrônica">Dispensa Eletrônica</option>
              </select>

              <input
                type="date"
                required
                name="data"
                value={form.data}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              />

              <input
                type="time"
                required
                name="hora"
                value={form.hora}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              />

              <input
                type="text"
                required
                name="orgao"
                placeholder="Órgão"
                value={form.orgao}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              />

              <textarea
                required
                name="objeto"
                placeholder="Objeto"
                value={form.objeto}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              />

              <input
                type="number"
                step="0.01"
                name="valor_estimado"
                placeholder="Valor Estimado (R$)"
                value={form.valor_estimado}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              />

              <input
                type="number"
                step="0.01"
                name="valor_ideal"
                placeholder="Valor Ideal (R$) - Opcional"
                value={form.valor_ideal}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              />

              <textarea
                name="observacoes"
                placeholder="Observações"
                value={form.observacoes}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              />

              <div>
                <label className="block mb-1 font-medium">Arquivo (PDF ou imagem)</label>
                <input
                  type="file"
                  accept=".pdf,image/*"
                  name="arquivo"
                  onChange={handleChange}
                  className="w-full"
                />
                {form.arquivo_url && (
                  <a
                    href={form.arquivo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline mt-1 block"
                  >
                    Documento atual
                  </a>
                )}
              </div>

              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Salvar
              </button>

              {mensagem && (
                <p className="mt-3 text-center text-sm text-red-600">{mensagem}</p>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

