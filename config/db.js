import { createPool } from 'mysql2/promise';

const pool = createPool({
    host: process.env.MYSQL_ADDON_HOST,
    user: process.env.MYSQL_ADDON_USER,
    password: process.env.MYSQL_ADDON_PASSWORD,
    database: process.env.MYSQL_ADDON_DB,
    waitForConnections: true,
    connectionLimit: 5
});

pool.getConnection()//getConnection es una promesa pendiente
.then(connection => {
    pool.releaseConnection(connection);
    console.log('Conexion a bd: Exitosa.');
})
.catch(err => {//manejo del error
    console.error('Error al conectar la bd: ', err);
});


export default pool;//exporta el objeto pool para utilizarlo en cada ruta