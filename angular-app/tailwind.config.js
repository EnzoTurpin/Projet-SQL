/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  // S'assurer que Tailwind génère les classes au plus tôt dans le flot de rendu
  important: true,
  theme: {
    extend: {
      colors: {
        "tropical-vibes": "#FF6347", // Couleur principale
        "color-blanc-custom": "#FFF5EE",
        "couleur-secondaire": "#FFEB3B",
        "couleur-accent": "#008080",
      },
      boxShadow: {
        custom: "0 10px 15px rgba(0, 0, 0, 0.1)",
      },
      screens: {
        // Redéfinir les breakpoints pour s'assurer qu'ils sont bien appliqués
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
    },
  },
  // Désactiver JIT (Just-In-Time) pour avoir des styles plus stables
  mode: 'aot',
  plugins: [],
};
