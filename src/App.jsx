import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import DashboardEventos from "./components/DashboardEventos";
import NovaLicitacao from "./pages/NovaLicitacao";
import DetalhesLicitacao from "./pages/DetalhesLicitacao";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redireciona a rota raiz para o detalhe específico */}
        <Route path="/" element={<Navigate to="/detalhes/dc724962-66ef-44fd-92e5-de837abd0b13" replace />} />

        <Route path="/nova" element={<NovaLicitacao />} />
        <Route path="/detalhes/:id" element={<DetalhesLicitacao />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
