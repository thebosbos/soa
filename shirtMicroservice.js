const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const mysql = require('mysql');

const shirtProtoPath = 'shirt.proto';
const shirtProtoDefinition = protoLoader.loadSync(shirtProtoPath, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});

const shirtProto = grpc.loadPackageDefinition(shirtProtoDefinition).shirt;

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'tp8',
});

const shirtService = {
    getshirt: (call, callback) => {
        const { shirt_id  } = call.request;
        const query = 'SELECT * FROM shirts WHERE id = ?';
        const values = [shirt_id ];

        pool.query(query, values, (error, results) => {
            if (error) {
                callback(error);
            } else {
                const shi_rt = results[0];
                callback(null, { shi_rt });
            }
        });
    },
    searchshirts: (call, callback) => {
        const { query } = call.request;
        const searchQuery = 'SELECT * FROM shirts WHERE title LIKE ?';
        const values = [`%${query}%`];

        pool.query(searchQuery, values, (error, results) => {
            if (error) {
                callback(error);
            } else {
                const shi_rts = results;
                callback(null, { shi_rts });
            }
        });
    },
    createshirt: (call, callback) => {
        const { title, description } = call.request;
        const query = 'INSERT INTO shirts (title, description) VALUES (?, ?)';
        const values = [title, description];

        pool.query(query, values, (error, results) => {
            if (error) {
                callback(error);
            } else {
                const insertedId = results.insertId;
                const shi_rt = { id: insertedId, title, description };
                callback(null, { shi_rt });
            }
        });
    },
    deleteshirt: (call, callback) => {
        const { shi_rt } = call.request;
        const query = 'DELETE FROM shirts WHERE id = ?';
        const values = [shi_rt];
      
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
server.addService(shirtProto.shirtService.service, shirtService);
const port = 50052;
server.bindAsync(`0.0.0.0:${port}`, grpc.ServerCredentials.createInsecure(), (err, port) => {
    if (err) {
        console.error('Failed to bind the server:', err);
        return;
    }
    console.log(`The server is running on port ${port}`);
    server.start();
});

console.log(`shirt microservice is running on port ${port}`);
