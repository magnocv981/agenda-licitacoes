/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1D3557", // Azul escuro refinado
        "primary-dark": "#16324A", // Versão mais escura
        "primary-light": "#DCE8F2", // Para destaque leve
        background: "#F7F9FC", // Fundo claro elegante
      },
    },
  },
  plugins: [],
};
