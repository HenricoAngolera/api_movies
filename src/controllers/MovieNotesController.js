const knex = require('../database/knex');
const AppError = require('../utils/AppError');

class MovieNotesController {
  async create(request, response) {
    const { title, description, rating, movie_tags } = request.body;
    const user_id = request.user.id;

    if (rating < 0 || rating > 5){
      throw new AppError('The rating must be greater than or equal to 0 or less than or equal to 5');
    }

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

    return response.status(201).json();

  }

  async show(request, response) {
    const { id } = request.params;

    const movie_note = await knex("movie_notes").where({ id }).first();

    const movie_tags = await knex("movie_tags").where({ note_id: id }).orderBy("name");

    return response.json({
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
    const { title, movie_tags } = request.query;
    const user_id = request.user.id

    let movie_notes;

    if(movie_tags){
      const filteredTags = movie_tags.split(',').map(tag => tag.trim());
      movie_notes = await knex("movie_tags")
        .select("movie_notes.id", "movie_notes.title", "movie_notes.user_id")
        .where("movie_notes.user_id", user_id)
        .whereLike("movie_notes.title", `%${title}%`)
        .whereIn("name", filteredTags)
        .innerJoin("movie_notes", "movie_notes.id", "movie_tags.note_id")
        .orderBy("title");

    } else {
      movie_notes = await knex("movie_notes")
        .where({ user_id })
        .whereLike("title", `%${title}%`)
        .orderBy("title");
    }

    const userTags = await knex('movie_tags').where({ user_id })
    const notesWithTags = movie_notes.map(movie_note => {
      const noteMovieTag = userTags.filter(movie_tag => movie_tag.note_id == movie_note.id);
      return {
        ...movie_note,
        tags: noteMovieTag
      }
    })
    return response.json(notesWithTags);
  }
}

module.exports = MovieNotesController;