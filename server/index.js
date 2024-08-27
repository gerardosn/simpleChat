import express from 'express';
import logger from 'morgan';


const port = process.env.PORT ?? 3000

const app = express();
// Configurar logger en modo dev
app.use(logger('dev'));


// Ruta para servir el archivo HTML
app.get('/', (req, res) => {
    // res.sendFile(__dirname + '/index.html');
    res.send('<h1> estoy funcionando </h1>');
  });

  // Iniciar servidor
app.listen(port, () => {
    console.log('Servidor iniciado en el puerto', port);
  });
  