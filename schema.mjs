import { makeExecutableSchema } from "@graphql-tools/schema";
import { ingredients } from "./ingredients.mjs";
import { drinks } from "./drinks.mjs";
import jaroWinklerDistance from "jaro-winkler";

// type Drink {
//     id: ID!
//     name: String!
//     instructions: String!
//   }

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
  findDrinksWithIngredient(ingredientName: String): [Drink]
  findDrinksWithIngredients(ingredientNames: [String]): [Drink]
  searchDrinksByName(searchTerm: String): [Drink!]!
  fuzzySearchDrinksByName(searchTerm: String): [Drink!]!
}
`;

const resolvers = {
  Query: {
    ingredients: () => ingredients,

    ingredient: (_, { id }) =>
      ingredients.find((ingredient) => ingredient.id === id),

    drinks: () => drinks,

    findDrinkByID: (_, { id }) => drinks.find((drink) => drink.id === id),

    findDrinksWithIngredient: (_, { ingredientName }) =>
      drinks.filter((drink) => drink.ingredients.includes(ingredientName)),

    findDrinksWithIngredients: (_, { ingredientNames }) =>
      drinks.filter((drink) =>
        ingredientNames.every((ingredientName) =>
          drink.ingredients.includes(ingredientName)
        )
      ),

    searchDrinksByName: (_, { searchTerm }) =>
      drinks.filter((drink) =>
        drink.name.toLowerCase().includes(searchTerm.toLowerCase())
      ),

    fuzzySearchDrinksByName: (_, { searchTerm }) =>
      drinks.filter(
        (drink) =>
          drink.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          jaroWinklerDistance(drink.name, searchTerm, {
            caseSensitive: false,
          }) > 0.9
      ),
  },

  Drink: {
    ingredients(parent) {
      return ingredients.filter((ingredient) =>
        parent.ingredients.includes(ingredient.name)
      );
    },
  },
};

const schema = {
  typeDefs: typeDefs,
  resolvers: resolvers,
};

export default schema;
