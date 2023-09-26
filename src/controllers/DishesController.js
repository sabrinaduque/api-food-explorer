const knex = require("../database/knex")
const AppError = require('../utils/AppError');

class DishesController {
  async create(request, response) {
    const { title, description, ingredients, price, category } = request.body

    const checkDishAlreadyExists = await knex("dishes").where({ title }).first();

    if (checkDishAlreadyExists) {
      throw new AppError("Este prato já existe no cardápio!")
    }

    const [dish_id] = await knex("dishes").insert({
      title,
      category,
      description,
      price
    })

    const hasOnlyOneIngredient = typeof (ingredients) === "string";

    let dishIngredient

    if (hasOnlyOneIngredient) {
      dishIngredient = {
        name: ingredients,
        dish_id
      }
    } else if (ingredients.length > 1) {
      dishIngredient = ingredients.map(name => {
        return {
          name,
          dish_id
        }
      });
    }

    await knex("ingredients").insert(dishIngredient)

    response.json()
  }

  async show(request, response) {
    const { id } = request.params

    const dishes = await knex("dishes").where({ id }).first()
    const ingredients = await knex("ingredients").where({dish_id: id}).orderBy("name")

    return response.json({
      ...dishes,
      ingredients
    })
  }
}

module.exports = DishesController