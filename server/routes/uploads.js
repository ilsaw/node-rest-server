const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();

const Usuario = require('../models/usuario');
const Producto = require('../models/producto');
const fs = require('fs');
const path = require('path');
// default options
app.use(fileUpload());

app.put('/upload/:tipo/:id', function(req, res) {
    let tipo = req.params.tipo;
    let id = req.params.id;

    if (!req.files) {
        return res.status(400).json({ ok: false, err: { message: 'No ha seleccionado ningún arhivo' } });
    }

    //Valida tipos
    let tiposValidos = ['productos', 'usuarios'];
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Los tipos permitidos son:' + tiposValidos.join(', ')
            },
            tipo
        });
    }

    let archivo = req.files.archivo;

    //Extensiones permitidas

    let extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];
    let nombreCortado = archivo.name.split('.');
    let extension = nombreCortado[nombreCortado.length - 1];

    if (extensionesValidas.indexOf(extension) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Las extensiones permitidas son:' + extensionesValidas.join(', ')
            },
            extension
        });
    }

    //Cambiar nombre al archivo
    let nombreArchivo = `${id}-${ new Date().getMilliseconds() }.${extension}`;

    archivo.mv(`uploads/${tipo}/${nombreArchivo}`, (err) => {
        if (err) {
            return res.status(500).json({ ok: false, err });
        }
        //Actualizar img
        switch (tipo) {
            case 'usuarios':
                imagenUsuario(id, res, nombreArchivo);
                break;
            case 'productos':
                imagenProducto(id, res, nombreArchivo);
                break;
            default:
                break;
        }

    });
});

function imagenUsuario(id, res, nombreArchivo) {
    Usuario.findById(id, (err, usuarioBD) => {
        if (err) {
            borraArchivo(nombreArchivo, 'usuarios');
            return res.status(500).json({ ok: false, err });
        }
        if (!usuarioBD) {
            borraArchivo(nombreArchivo, 'usuarios');
            return res.status(400).json({ ok: false, err: { message: 'Usuario no existe' } });
        }

        borraArchivo(usuarioBD.img, 'usuarios');

        usuarioBD.img = nombreArchivo;

        usuarioBD.save((err, usuarioUPD) => {
            if (err) {
                return res.status(500).json({ ok: false, err });
            }
            res.json({ ok: true, usuario: usuarioUPD, img: nombreArchivo });
        });


    });
}

function imagenProducto(id, res, nombreArchivo) {
    Producto.findById(id, (err, productoBD) => {
        if (err) {
            borraArchivo(nombreArchivo, 'productos');
            return res.status(500).json({ ok: false, err });
        }
        if (!productoBD) {
            borraArchivo(nombreArchivo, 'productos');
            return res.status(400).json({ ok: false, err: { message: 'Producto no existe' } });
        }

        borraArchivo(productoBD.img, 'productos');

        productoBD.img = nombreArchivo;

        productoBD.save((err, productoUPD) => {
            if (err) {
                return res.status(500).json({ ok: false, err });
            }
            res.json({ ok: true, producto: productoUPD, img: nombreArchivo });
        });


    });
}

function borraArchivo(nombreImagen, tipo) {

    let pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${nombreImagen}`);
    if (fs.existsSync(pathImagen)) {
        fs.unlinkSync(pathImagen);
    }


}

module.exports = app;