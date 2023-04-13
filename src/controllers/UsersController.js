const { hash } = require('bcryptjs');

const AppError = require('../utils/AppError');

const sqliteConnection = require('../database/sqlite');

class UsersController {
  async create(request, response) {
    const { name, email, password } = request.body;

    const database = await sqliteConnection();

    const checkIfUsersExists = await database.get(
      'SELECT * FROM users WHERE email = (?)',
      [email]
    )

    const hashedPassword = await hash(password, 8)

    if(checkIfUsersExists){
      throw new AppError('This e-mail is already used.');
    }

    await database.run(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    )

    return response.status(201).json();
  }
}

module.exports = UsersController;