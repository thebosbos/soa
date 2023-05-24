/**
 * @swagger
 * tags:
 *   name: Jean
 *   description: Operations related to jeans
 * 
 * definitions:
 *   Jean:
 *     type: object
 *     properties:
 *       id:
 *         type: integer
 *       title:
 *         type: string
 *       description:
 *         type: string
 *       prix:
 *         type: number
 * 
 *   JeansResponse:
 *     type: object
 *     properties:
 *       jeans:
 *         type: array
 *         items:
 *           $ref: '#/definitions/Jean'
 * 
 *   JeanIdRequest:
 *     type: object
 *     properties:
 *       jean_id:
 *         type: integer
 * 
 * /jeanService/GetJeans:
 *   get:
 *     summary: Get a jean by ID
 *     description: Retrieve a jean by its ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/definitions/JeanIdRequest'
 *     responses:
 *       '200':
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Jean'
 * 
 * /jeanService/SearchJeans:
 *   post:
 *     summary: Search jeans
 *     description: Search jeans by a query string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             properties:
 *               query:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/JeansResponse'
 * 
 * /jeanService/CreateJean:
 *   post:
 *     summary: Create a new jean
 *     description: Create a new jean with the given details
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/definitions/Jean'
 *     responses:
 *       '200':
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Jean'
 * 
 * /jeanService/DeleteJean:
 *   post:
 *     summary: Delete a jean by ID
 *     description: Delete a jean by its ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/definitions/JeanIdRequest'
 *     responses:
 *       '200':
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                 success:
 *                   type: boolean
 */


// jeanMicroservice.js
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
var mysql = require('mysql');
// Charger le fichier jean.proto
const jeanProtoPath = 'jean.proto';
const jeanProtoDefinition = protoLoader.loadSync(jeanProtoPath, {
 keepCase: true,
 longs: String,
 enums: String,
 defaults: true,
 oneofs: true,
});

const jeanProto = grpc.loadPackageDefinition(jeanProtoDefinition).jean;

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'tp8',
});

const jeanService = {
    getjean: (call, callback) => {
        const { jean_id } = call.request;
        const query = 'SELECT * FROM jeans WHERE id = ?';
        const values = [jean_id];

        pool.query(query, values, (error, results) => {
            if (error) {
                callback(error);
            } else {
                const jean = results[0];
                callback(null, { jean });
            }
        });
    },
    searchjeans: (call, callback) => {
        const { query } = call.request;
        const searchQuery = 'SELECT * FROM jeans WHERE title LIKE ?';
        const values = [`%${query}%`];

        pool.query(searchQuery, values, (error, results) => {
            if (error) {
                callback(error);
            } else {
                const jeans = results;
                callback(null, { jeans });
            }
        });
    },
    createjean: (call, callback) => {
        const { title, description, prix } = call.request;
        const query = 'INSERT INTO jeans (title, description, prix) VALUES (?, ?, ?)';
        const values = [title, description, prix];

        pool.query(query, values, (error, results) => {
            if (error) {
                callback(error);
            } else {
                const insertedId = results.insertId;
                const jean = { id: insertedId, title, description, prix };
                callback(null, { jean });
            }
        });
    },
    deletejean: (call, callback) => {
        const { jean_id } = call.request;
        const query = 'DELETE FROM jeans WHERE id = ?';
        const values = [jean_id];
      
        pool.query(query, values, (error, results) => {
          if (error) {
            callback(error);
          } else {
            const success = results.affectedRows > 0;
            callback(null, { success });
          }
        });
      },
      
};



const server = new grpc.Server();
server.addService(jeanProto.jeanService.service, jeanService);
const port = 50051;
server.bindAsync(`0.0.0.0:${port}`, grpc.ServerCredentials.createInsecure(), 
(err, port) => {
 if (err) {
 console.error('Échec de la liaison du serveur:', err);
 return;
 }
 console.log(`Le serveur s'exécute sur le port ${port}`);
 server.start();
});

console.log(`Microservice de jeans en cours d'exécution sur le port ${port}`);
