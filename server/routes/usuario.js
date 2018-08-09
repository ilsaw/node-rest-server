const express = require('express');

const bcrypt = require('bcrypt');
const _ = require('underscore');
const Usuario = require('../models/usuario');
const { verificaToken, verificaAdminRole } = require('../middlewares/autenticacion');
const app = express();

app.get('/usuario', verificaToken, (req, res) => {



    let desde = req.query.desde || 0;
    desde = Number(desde);
    let hasta = req.query.hasta || 5;
    hasta = Number(hasta);

    let filtros = { estado: true };

    Usuario.find(filtros, 'nombre email role estado google img')
        .skip(desde)
        .limit(hasta)
        .exec((err, usuarios) => {
            if (err) {
                res.status(400).json({
                    err
                });
            }

            Usuario.countDocuments(filtros, (err, conteo) => {
                res.json({ ok: true, usuarios, cuantos: conteo });
            });

        });

});

app.post('/usuario', [verificaToken, verificaAdminRole], (req, res) => {

    let body = req.body;

    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        role: body.role
    });

    usuario.save((err, usuarioDB) => {
        if (err) {
            res.status(400).json({
                ok: false,
                err
            });

        }

        //usuarioDB.password = null;

        res.json({
            ok: true,
            usuario: usuarioDB
        });

    });
});

app.put('/usuario/:id', [verificaToken, verificaAdminRole], (req, res) => {

    let id = req.params.id;
    let body = _.pick(req.body, ['nombre', 'email', 'img', 'role', 'estado']);

    Usuario.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, usuarioDB) => {
        if (err) {
            res.status(400).json({
                ok: false,
                err
            });
        }
        res.json({
            ok: true,
            usuario: usuarioDB
        });
    });
});

app.delete('/usuario/:id', [verificaToken], (req, res) => {
    let id = req.params.id;

    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
        if (err) {
            res.status(400).json({
                err
            });
        }

        if (!usuarioBorrado) {
            return res.status(400).json({ ok: false, err: { message: 'Usuario No encontrado' } });
        }
        res.json({ ok: true, usuario: usuarioBorrado });

    });

});

app.patch('/usuario/:id', [verificaToken], (req, res) => {

    let id = req.params.id;
    let cambiaEstado = {
        estado: false
    };

    Usuario.findByIdAndUpdate(id, cambiaEstado, { new: true }, (err, usuarioDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });

        }
        res.json({
            ok: true,
            usuario: usuarioDB
        });
    });
});
module.exports = app;