//Puerto
process.env.PORT = process.env.PORT || 3000;

//Entorno
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';


//Vencimiento del token
process.env.CADUCIDAD_TOKEN = '48h';

//Seed TOKEN
process.env.SEED = process.env.SEED || 'este-es-el-seed-desarrollo';

//BD
let urlDB;

if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost:27017/cafe';
} else {
    urlDB = process.env.MONGO_URI;
}

process.env.URLDB = urlDB;

//Google Client ID
process.env.CLIENT_ID = process.env.CLIENT_ID || '330763711180-dgo7s4icc0h846rerlc10ustkav3hql3.apps.googleusercontent.com';