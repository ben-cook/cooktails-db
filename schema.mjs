import { makeExecutableSchema } from "@graphql-tools/schema";
import { ingredients } from "./ingredients.mjs";
import { drinks } from "./drinks.mjs";
import jaroWinklerDistance from "jaro-winkler";

const typeDefs = `
type Ingredient {
  id: String
  name: ID
  description: String
  type: String
  alcoholic: Boolean
  ABV: String
}

type Drink {
  id: ID!
  name: String
  strDrinkAlternate: String
  strTags: String
  strVideo: String
  strCategory: String
  strIBA: String
  strAlcoholic: String
  strGlass: String
  instructions: String
  strDrinkThumb: String
  ingredients: [Ingredient]
  measures: [String]
}

type Query {
  ingredients: [Ingredient]
  ingredient: Ingredient
  drinks: [Drink]
  findDrinkByID(id: String): Drink
  findDrinkByName(name: String): Drink
  findIngredientByName(name: String): Ingredient
  findDrinksWithIngredient(ingredientName: String): [Drink]
  findDrinksWithIngredients(ingredientNames: [String], limit: Int, offset: Int): [Drink]
  searchDrinksByName(searchTerm: String): [Drink!]!
  fuzzySearchDrinksByName(searchTerm: String, limit: Int, offset: Int): [Drink!]!
  randomDrink: Drink!
}
`;

const resolvers = {
  Query: {
    ingredients: () => ingredients,

    ingredient: (_, { id }) =>
      ingredients.find((ingredient) => ingredient.id === id),

    drinks: () => drinks,

    findDrinkByID: (_, { id }) => drinks.find((drink) => drink.id === id),

    findDrinkByName: (_, { name }) =>
      drinks.find((drink) => drink.name.toLowerCase() === name.toLowerCase()),

    findIngredientByName: (_, { name }) =>
      ingredients.find(
        (ingredient) => ingredient.name.toLowerCase() === name.toLowerCase()
      ),

    findDrinksWithIngredient: (_, { ingredientName }) =>
      drinks.filter((drink) => drink.ingredients.includes(ingredientName)),

    findDrinksWithIngredients: (_, { ingredientNames, offset, limit }) => {
      if (ingredientNames.length === 0) {
        const popularDrinkNames = [
          "Moscow Mule",
          "Pina Colada",
          "Mojito",
          "Espresso Martini",
          "Daiquiri",
          "Cosmopolitan",
          "Negroni",
          "Aperol Spritz",
          "Old Fashioned",
          "Margarita",
          "Martini",
          "French 75",
        ];
        return drinks.filter((drink) =>
          popularDrinkNames
            .map((name) => name.toLowerCase())
            .includes(drink.name.toLowerCase())
        );
      } else {
        return drinks
          .filter((drink) =>
            ingredientNames.every((ingredientName) =>
              drink.ingredients
                .map((ingredient) => ingredient.toLowerCase())
                .includes(ingredientName.toLowerCase())
            )
          )
          .slice(offset, offset + limit);
      }
    },

    searchDrinksByName: (_, { searchTerm }) =>
      drinks.filter((drink) =>
        drink.name.toLowerCase().includes(searchTerm.toLowerCase())
      ),

    fuzzySearchDrinksByName: (_, { searchTerm, offset, limit }) => {
      if (searchTerm === "") {
        // return drinks.slice(offset, offset + limit);
        const popularDrinkNames = [
          "Moscow Mule",
          "Pina Colada",
          "Mojito",
          "Espresso Martini",
          "Daiquiri",
          "Cosmopolitan",
          "Negroni",
          "Aperol Spritz",
          "Old Fashioned",
          "Margarita",
          "Martini",
          "French 75",
        ];
        return drinks.filter((drink) =>
          popularDrinkNames
            .map((name) => name.toLowerCase())
            .includes(drink.name.toLowerCase())
        );
      } else {
        return drinks
          .filter(
            (drink) =>
              drink.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              jaroWinklerDistance(drink.name, searchTerm, {
                caseSensitive: false,
              }) > 0.9
          )
          .slice(offset, offset + limit);
      }
    },

    randomDrink: () => drinks[Math.floor(Math.random() * drinks.length)],
  },

  Drink: {
    ingredients(parent) {
      return ingredients.filter((ingredient) =>
        parent.ingredients
          .map((ingredient) => ingredient.toLowerCase())
          .includes(ingredient.name.toLowerCase())
      );
    },
  },
};

const schema = {
  typeDefs: typeDefs,
  resolvers: resolvers,
};

export default schema;
