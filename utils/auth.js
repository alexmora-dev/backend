const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const JWT_SECRET = process.env.JWT_SECRET;

//función para generar un token después de un logueo exitoso
const generateToken = (payload) => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' }); //Token es válido por una hora
}

//Middleware para verificar el token en cada petición
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({ message: 'Token no proporcionado' });
    }
    try {
        const decoded = jwt.verify(token.split(' ')[1], JWT_SECRET);
        req.user = decoded; //Añade la información del usuario a la petición
        next(); //Permitir que la petición continúe
    } catch (error) {
        return res.status(401).json({ message: 'Token inválido' })
    }
};

module.exports = { generateToken, verifyToken };