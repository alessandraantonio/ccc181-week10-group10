// Demo users live in this list (no database is needed for this activity).
// Passwords are stored HASHED with bcrypt, never as plain text.
import bcrypt from 'bcryptjs';

const users = [
  {
    id: 1,
    name: 'Demo Student',
    email: 'student@campusconnect.test',
    // Demo password for the exam: Campus26 (only the hash is stored)
    passwordHash: bcrypt.hashSync('Campus26', 10),
  },
];

// Emails are compared in lowercase, so the caller should lowercase first.
export function findUserByEmail(email) {
  return users.find((user) => user.email === email);
}

export function findUserById(id) {
  return users.find((user) => String(user.id) === String(id));
}

// The only shape of a user that may leave the server: never the password hash.
export function toPublicUser(user) {
  return { id: user.id, name: user.name, email: user.email };
}
