const express = require('express');
const _ = require('underscore');
let { verificaToken, verificaAdminRole } = require('../middlewares/autenticacion');

let app = express();

let Categoria = require('../models/categoria');

//Muestra todas las categorias
app.get('/categoria', verificaToken, (req, res) => {

    Categoria.find({})
        .sort('descripcion')
        .populate('usuario', 'nombre email')
        .exec((err, categorias) => {
            if (err) {
                res.status(400).json({
                    ok: false,
                    err
                });
            }

            Categoria.countDocuments({}, (err, conteo) => {
                res.json({ ok: true, categorias, cuantos: conteo });
            });

        });
});

//Muestra una por las categorias
app.get('/categoria/:id', (req, res) => {

    let id = req.params.id;

    Categoria.findById(id)
        .populate('usuario', 'nombre email')
        .exec((err, categorias) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            if (!categorias) {
                return res.status(400).json({
                    ok: true,
                    err: { message: 'No se encontró la categoria' }
                });
            }

            res.json({
                ok: true,
                categorias
            });

        });

});


//Guarda una por las categorias
app.post('/categoria', [verificaToken, verificaAdminRole], (req, res) => {

    let body = req.body;

    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: req.usuario._id
    });

    categoria.save((err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });

        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        //usuarioDB.password = null;

        res.json({
            ok: true,
            categoria: categoriaDB
        });

    });
    //regresa nueva categoria
    //req.usuario._id

});

//Actualiza una por las categorias
app.put('/categoria/:id', verificaToken, (req, res) => {

    let id = req.params.id;
    //let body = _.pick(req.body, ['descripcion']);
    let body = req.body;

    let descCategoria = {
        descripcion: body.descripcion
    };

    Categoria.findByIdAndUpdate(id, descCategoria, { new: true, runValidators: true }, (err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });

        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        });
    });

});
//Delete una por las categorias
app.delete('/categoria/:id', [verificaToken, verificaAdminRole], (req, res) => {

    let id = req.params.id;

    Categoria.findByIdAndRemove(id, (err, categoriaBorrado) => {
        if (err) {
            return res.status(400).json({
                err
            });
        }

        if (!categoriaBorrado) {
            return res.status(400).json({ ok: false, err: { message: 'Categoría No encontrada' } });
        }
        res.json({ ok: true, categoria: categoriaBorrado });

    });

});


module.exports = app;