import express from 'express';
import logger from 'morgan';
import { createServer } from 'node:http';
import { Server } from 'socket.io';

import 'dotenv/config';
import pool from '../config/db.js';

const port = process.env.PORT ?? 3000

const app = express(); //app de expres q tmb es un servidor
const server = createServer(app); //servidor http
const io = new Server(server,{
    connectionStateRecovery: {}//para recuperar los msj perdidos
}); //servidor in out websocket

io.on('connection', async (socket) => { //callback  segun lo que suceda con la conexion socket
    console.log('Nuevo cliente conectado');

    socket.on('disconnect', () => {
        console.log('Cliente desconectado');
      });

      socket.on('chat message', async (msg)=>{//cuando el socket esta conectado intenta enviar los msj al evento chat message y los mete a la bd
        let rows;

        try{
            const sql = 'INSERT INTO salaPrincipal (content) VALUES (?)';
            const connection = await pool.getConnection();
             [rows] = await connection.query(sql, [msg]);
            connection.release();
            console.log('insertando en bd: ',rows);
        } catch (e){
            console.error(e);
            return
        }

        io.emit('chat message', msg, rows.insertId)

      })

      if(!socket.recovered){//si es distinto a una recuperacion de conexion
        try{
            const connection = await pool.getConnection();
            const arg = socket.handshake.auth.serverOffset ?? 0;
            console.log('posicion en el server serveroffset',arg);
            const sql = 'SELECT * FROM salaPrincipal WHERE id > ?';
            const [rows] = await connection.query(sql, arg);
            connection.release();
            rows.forEach((row) => {
                socket.emit('chat message', row.content)//es un socket.emit i no un io.emit, el ultimo les envia a todos. el 1ro le envia solo a los nuevos
            });
        } catch (e){
            console.log(e);
        }
      }

    });

// Configurar logger en modo dev
app.use(logger('dev'));


// Ruta para servir el archivo HTML
app.get('/', (req, res) => {
    res.sendFile(process.cwd() + '/client/index.html');
    //res.send('<h1> estoy funcionando </h1>');
  });

  // Iniciar servidor y escuchado el server http
server.listen(port, () => {
    console.log('Servidor iniciado en el puerto', port);
  });
  