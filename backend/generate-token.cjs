const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Usar o mesmo secret que o backend (default-secret)
const JWT_SECRET = 'your-super-secret-jwt-key';

// Gerar um deviceId e userId
const deviceId = crypto.randomUUID();
const userId = 'demo-user-123';

// Criar o payload
const payload = {
  deviceId,
  userId,
  iat: Date.now()
};

// Gerar o token
const token = jwt.sign(payload, JWT_SECRET);

console.log('Device ID:', deviceId);
console.log('User ID:', userId);
console.log('Token JWT:', token);

// Verificar se o token é válido
try {
  const decoded = jwt.verify(token, JWT_SECRET);
  console.log('Token válido:', decoded);
} catch (error) {
  console.error('Token inválido:', error.message);
}