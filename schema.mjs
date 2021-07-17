import { makeExecutableSchema } from "@graphql-tools/schema";
import { ingredients } from "./ingredients.mjs";
import { drinks } from "./drinks.mjs";

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
  idPlusOne: Int
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
  },

  Drink: {
    ingredients(parent) {
      return ingredients.filter((ingredient) =>
        parent.ingredients.includes(ingredient.name)
      );
    },
  },

  Ingredient: {
    idPlusOne: ({ id }) => parseInt(id) + 1,
  },
};

const schema = {
  typeDefs: typeDefs,
  resolvers: resolvers,
};

export default schema;
