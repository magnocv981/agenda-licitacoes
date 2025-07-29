import { useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

export default function NovaLicitacao() {
  const [form, setForm] = useState({
    modalidade: "",
    data: "",
    hora: "",
    orgao: "",
    objeto: "",
    valor_estimado: "",
    valor_ideal: "",
    observacoes: "",
  });
  const [arquivo, setArquivo] = useState(null);
  const [mensagem, setMensagem] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setArquivo(e.target.files[0]);
  };

  const formatarMoeda = (valor) => {
    return parseFloat(valor.replace(/\./g, "").replace(",", "."));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagem("");

    const id = uuidv4();
    let arquivo_url = null;

    try {
      if (arquivo) {
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("licitacoes")
          .upload(`${id}/${arquivo.name}`, arquivo);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("licitacoes")
          .getPublicUrl(`${id}/${arquivo.name}`);

        arquivo_url = urlData.publicUrl;
      }

      const { error: insertError } = await supabase.from("eventos").insert([
        {
          id,
          modalidade: form.modalidade,
          data: form.data,
          hora: form.hora,
          orgao: form.orgao,
          objeto: form.objeto,
          valor_estimado: form.valor_estimado
            ? formatarMoeda(form.valor_estimado)
            : null,
          valor_ideal: form.valor_ideal
            ? formatarMoeda(form.valor_ideal)
            : null,
          observacoes: form.observacoes,
          arquivo_url,
        },
      ]);

      if (insertError) throw insertError;

      setMensagem("Licitação cadastrada com sucesso!");
      setTimeout(() => navigate("/"), 2000);
    } catch (error) {
      console.error(error);
      setMensagem("Erro ao cadastrar licitação.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow">
      <h2 className="text-2xl font-bold mb-4">Nova Licitação</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="modalidade"
          placeholder="Modalidade"
          value={form.modalidade}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />
        <div className="grid grid-cols-2 gap-4">
          <input
            type="date"
            name="data"
            value={form.data}
            onChange={handleChange}
            className="border p-2 rounded"
          />
          <input
            type="time"
            name="hora"
            value={form.hora}
            onChange={handleChange}
            className="border p-2 rounded"
          />
        </div>
        <input
          type="text"
          name="orgao"
          placeholder="Órgão"
          value={form.orgao}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />
        <textarea
          name="objeto"
          placeholder="Objeto"
          value={form.objeto}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            name="valor_estimado"
            placeholder="Valor Estimado (R$)"
            value={form.valor_estimado}
            onChange={handleChange}
            className="border p-2 rounded"
          />
          <input
            type="text"
            name="valor_ideal"
            placeholder="Valor Ideal (R$) — opcional"
            value={form.valor_ideal}
            onChange={handleChange}
            className="border p-2 rounded"
          />
        </div>
        <textarea
          name="observacoes"
          placeholder="Observações"
          value={form.observacoes}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />
        <input type="file" onChange={handleFileChange} className="w-full" />

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Salvar Licitação
        </button>
      </form>

      {mensagem && (
        <div className="mt-4 text-center text-sm text-green-600 font-semibold">
          {mensagem}
        </div>
      )}
    </div>
  );
}
