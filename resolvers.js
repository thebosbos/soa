const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

// Charger les fichiers proto pour les films et les séries TV
const jeanProtoPath = 'jean.proto';
const shirtProtoPath = 'shirt.proto';

const jeanProtoDefinition = protoLoader.loadSync(jeanProtoPath, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});

const shirtProtoDefinition = protoLoader.loadSync(shirtProtoPath, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});

const jeanProto = grpc.loadPackageDefinition(jeanProtoDefinition).jean;
const shirtProto = grpc.loadPackageDefinition(shirtProtoDefinition).shirt;

const clientjeans = new jeanProto.jeanService('localhost:50051', grpc.credentials.createInsecure());
const clientshirts = new shirtProto.shirtService('localhost:50052', grpc.credentials.createInsecure());

// Définir les résolveurs pour les requêtes GraphQL
const resolvers = {
    Query: {
        jean: (_, { id }) => {
            // Effectuer un appel gRPC au microservice de jeans
            const client = new jeanProto.jeanService('localhost:50051',
                grpc.credentials.createInsecure());
            return new Promise((resolve, reject) => {
                client.getjean({ jean_id: id }, (err, response) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(response.jean);
                    }
                });
            });
        },
        jeans: () => {
            // Effectuer un appel gRPC au microservice de jeans
            const client = new jeanProto.jeanService('localhost:50051',
                grpc.credentials.createInsecure());
            return new Promise((resolve, reject) => {
                client.searchjeans({}, (err, response) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(response.jeans);
                    }
                });
            });
        },

        shirt: (_, { id }) => {
            // Effectuer un appel gRPC au microservice de shirt
            const client = new shirtProto.shirtService('localhost:50052',
                grpc.credentials.createInsecure());
            return new Promise((resolve, reject) => {
                client.getshirt({ shirt_id : id }, (err, response) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(response.shi_rt);
                    }
                });
            });
        },

        shirts: () => {
            // Effectuer un appel gRPC au microservice de shirt
            const client = new shirtProto.shirtService('localhost:50052',
                grpc.credentials.createInsecure());
            return new Promise((resolve, reject) => {
                client.searchshirts({}, (err, response) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(response.shi_rts);
                    }
                });
            });
        },
    },
    Mutation: {
        createjean: (_, { id, title, description, prix  }) => {
            return new Promise((resolve, reject) => {
                clientjeans.createjean({ jean_id: id, title: title, description: description, prix: prix }, (err, response) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(response.jean);
                    }
                });
            });
        },
        createshirt: (_, { id, title, description}) => {
            return new Promise((resolve, reject) => {
                clientshirts.createshirt({ shirt_id : id, title: title, description: description}, (err, response) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(response.shi_rt);
                    }
                });
            });
        },
    }
};

module.exports = resolvers;