// Sélectionner ou créer la base de données des cocktails
use("cocktail-api");

// Insérer des cocktails dans la collection 'recipes'
db.getCollection("recipes").insertMany([
  {
    name: "Mojito",
    ingredients: [
      { name: "Rhum blanc", quantity: "50 ml" },
      { name: "Jus de citron vert", quantity: "30 ml" },
      { name: "Sucre", quantity: "2 cuillères à café" },
      { name: "Feuilles de menthe", quantity: "6 feuilles" },
      { name: "Eau gazeuse", quantity: "Compléter le verre" },
      { name: "Glace pilée", quantity: "À remplir" },
    ],
    instructions: [
      "Mettre les feuilles de menthe et le sucre dans un verre.",
      "Écraser délicatement pour libérer les arômes.",
      "Ajouter le jus de citron vert et le rhum blanc.",
      "Remplir le verre avec de la glace pilée.",
      "Compléter avec de l'eau gazeuse.",
      "Mélanger doucement et servir.",
    ],
    category: "alcoolisé",
    glass: "tumbler",
    garnish: "brin de menthe",
    mainAlcohol: "rhum",
  },
  {
    name: "Piña Colada",
    ingredients: [
      { name: "Rhum blanc", quantity: "50 ml" },
      { name: "Crème de coco", quantity: "30 ml" },
      { name: "Jus d'ananas", quantity: "90 ml" },
      { name: "Glaçons", quantity: "4-5 cubes" },
    ],
    instructions: [
      "Mettre tous les ingrédients dans un mixeur.",
      "Mixer jusqu'à obtenir une consistance lisse.",
      "Verser dans un verre highball.",
      "Décorer avec un morceau d'ananas ou une cerise.",
    ],
    category: "alcoolisé",
    glass: "highball",
    garnish: "tranche d'ananas",
    mainAlcohol: "rhum",
  },
]);
