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

      if(!socket.recovered){//si es distinto a una recuperacion de conexion
        try{
            const connection = await pool.getConnection();
            const sql = 'SELECT * FROM salaPrincipal ORDER BY id DESC LIMIT 5';
            const [rows] = await connection.query(sql);
            connection.release();
            rows.reverse().forEach((row) => {
                io.emit('chat message', row.content)
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
  