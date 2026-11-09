// Unknown address: 404 { "error": "Not found." }
export function notFound(req, res) {
  res.status(404).json({ error: 'Not found.' });
}

// Unexpected error: 500 { "error": "Something went wrong." }
// (Express recognizes an error handler by its four parameters.)
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  // Broken JSON, or a body that is too large, is the client's mistake: 400.
  if (err.type === 'entity.parse.failed' || err.type === 'entity.too.large') {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  // Log only the message for the team. Never send a stack trace to the client,
  // and never log passwords or tokens.
  console.error('Unexpected error:', err.message);
  return res.status(500).json({ error: 'Something went wrong.' });
}
