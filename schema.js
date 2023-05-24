const { gql } = require('@apollo/server');
// Définir le schéma GraphQL
const typeDefs = `#graphql
 type jean {
 id: String!
 title: String!
 description: String!
 prix: String!
 }
 type shirt {
 id: String!
 title: String!
 description: String!
 prix: String!
 }
 type Query {
 jean(id: String!): jean
 jeans: [jean]
 shirt(id: String!): shirt
 shirts: [shirt]
 }

 type Mutation {
    createjean(title: String!, description: String!, prix: String!): jean
    deleteJean(id: ID!): Boolean
    createshirt(title: String!, description: String!): shirt
    deleteshirt(id: ID!): Boolean
}
`;
module.exports = typeDefs
