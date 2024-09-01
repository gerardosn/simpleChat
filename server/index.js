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

io.on('connection', (socket) => { //callback  segun lo que suceda con la conexion socket
    console.log('Nuevo cliente conectado');

    socket.on('disconnect', () => {
        console.log('Cliente desconectado');
      });

      socket.on('chat message', async (msg)=>{
        try{
            const sql = 'INSERT INTO salaPrincipal (content) VALUES (?)';
            const connection = await pool.getConnection();
            const [rows] = await connection.query(sql, [msg]);
            connection.release();
            console.log(rows);
            io.emit('chat message', msg, rows.insertId)
        } catch (e){
            console.error(e);
            return
        }
      })

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
  