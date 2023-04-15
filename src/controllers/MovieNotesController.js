const knex = require('../database/knex')

class MovieNotesController {
  async create(request, response) {
    const { title, description, rating, movie_tags } = request.body;
    const { user_id } = request.params;

    const [note_id] = await knex("movie_notes").insert({
      title,
      description,
      rating,
      user_id
    })

    const movieTagsInsert = movie_tags.map(name => {
      return {
        name,
        note_id,
        user_id
      }
    })

    await knex("movie_tags").insert(movieTagsInsert);

    response.status(201).json();

  }

  async show(request, response) {
    const { id } = request.params;

    const movie_note = await knex("movie_notes").where({ id }).first();

    const movie_tags = await knex("movie_tags").where({ note_id: id }).orderBy("name");

    response.json({
      ...movie_note,
      movie_tags
    });
  }

  async delete(request, response) {
    const { id } = request.params;

    await knex("movie_notes").where({ id }).delete();

    return response.json();
  }

  async index(request, response) {
    const { user_id } = request.query;
    
    const movie_notes = await knex("movie_notes").where({ user_id }).orderBy("title");

    response.json(movie_notes);
  }
}

module.exports = MovieNotesController;