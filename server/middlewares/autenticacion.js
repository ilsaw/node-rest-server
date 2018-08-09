const jwt = require('jsonwebtoken');
//Verificar token
let verificaToken = (req, res, next) => {

    let token = req.get('auth');

    jwt.verify(token, process.env.SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({ ok: false, err: { message: 'Invalid Token' } });
        }

        req.usuario = decoded.usuario;
        next();
    });

};

//Verifica ADMIN_ROLE
let verificaAdminRole = (req, res, next) => {
    let usuario = req.usuario;

    if (usuario.role === 'ADMIN_ROLE') {
        next();
    } else {
        return res.json({ ok: false, err: { message: 'Usuario no es admin' } });
    }
}

module.exports = { verificaToken, verificaAdminRole };