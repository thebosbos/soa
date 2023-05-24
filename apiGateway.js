const express = require("express");
const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@apollo/server/express4");
const bodyParser = require("body-parser");
const cors = require("cors");
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");

// Charger les fichiers proto jean and shirt
const jeanProtoPath = "jean.proto";
const shirtProtoPath = "shirt.proto";
const resolvers = require("./resolvers");
const typeDefs = require("./schema");

// Créer une nouvelle application Express
const app = express();
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
const clientjeans = new jeanProto.jeanService(
  "localhost:50051",
  grpc.credentials.createInsecure()
);
const clientshirts = new shirtProto.shirtService(
  "localhost:50052",
  grpc.credentials.createInsecure()
);

// Créer une instance ApolloServer avec le schéma et les résolveurs importés
const server = new ApolloServer({ typeDefs, resolvers });

// Appliquer le middleware ApolloServer à l'application Express
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
server.start().then(() => {
  app.use(cors(), expressMiddleware(server));
});

app.get("/jeans", (req, res) => {
  const client = new jeanProto.jeanService(
    "localhost:50051",
    grpc.credentials.createInsecure()
  );
  const { q } = req.query;
  client.searchjeans({ query: q }, (err, response) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(response.jeans);
    }
  });
});

app.post("/jean", (req, res) => {
  const { title, description, prix } = req.body;
  clientjeans.createjean(
    { title: title, description: description, prix: prix },
    (err, response) => {
      if (err) {
        res.status(500).send(err);
      } else {
        res.json(response.jean);
      }
    }
  );
});
app.delete("/jeans/:id", (req, res) => {
  const client = new jeanProto.jeanService(
    "localhost:50051",
    grpc.credentials.createInsecure()
  );
  const id = req.params.id;
  const request = { jean_id: id };
  client.deletejean(request, (err, response) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(response);
    }
  });
});

app.get("/jeans/:id", (req, res) => {
  const client = new jeanProto.jeanService(
    "localhost:50051",
    grpc.credentials.createInsecure()
  );
  const id = req.params.id;
  client.getjean({ jean_id: id }, (err, response) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(response.jean);
    }
  });
});

app.get("/shirts", (req, res) => {
  const client = new shirtProto.shirtService(
    "localhost:50052",
    grpc.credentials.createInsecure()
  );
  const { q } = req.query;
  client.searchshirts({ query: q }, (err, response) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(response.shi_rts);
    }
  });
});

app.post("/shirt", (req, res) => {
  const { title, description } = req.body;
  clientshirts.createshirt(
    { title: title, description: description },
    (err, response) => {
      if (err) {
        res.status(500).send(err);
      } else {
        res.json(response.shi_rt);
      }
    }
  );
});
app.delete("/shirt/:id", (req, res) => {
    const client = new shirtProto.shirtService(
      "localhost:50052",
      grpc.credentials.createInsecure()
    );
    const id = req.params.id;
    const request = { shi_rt: id };
    client.deleteshirt(request, (err, response) => {
      if (err) {
        res.status(500).send(err);
      } else {
        res.json(response);
      }
    });
  });
  

app.get("/shirts/:id", (req, res) => {
  const client = new shirtProto.shirtService(
    "localhost:50052",
    grpc.credentials.createInsecure()
  );
  const id = req.params.id;
  client.getshirt({ shirt_id: id }, (err, response) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(response.shi_rt);
    }
  });
});





// Démarrer l'application Express
const port = 3000;
app.listen(port, () => {
  console.log(`API Gateway en cours d'exécution sur le port ${port}`);
});
