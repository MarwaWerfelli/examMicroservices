const { gql } = require("apollo-server-express");

// Définir le schéma GraphQL
const typeDefs = gql`
  type Task {
    id: ID!
    title: String!
    description: String!
    completed: Boolean!
  }

  type User {
    id: ID!
    name: String!
    email: String!
  }

  type Notification {
    id: ID!
    message: String!
    seen: Boolean!
    userId: ID!
  }

  type Query {
    task(id: ID!): Task
    tasks: [Task]
    user(id: ID!): User
    users: [User]
    notification(id: ID!): Notification
    notifications: [Notification]
  }

  type Mutation {
    addTask(
      title: String!
      description: String!
      completed: Boolean!
      assignedTo: [String]!
    ): Task
    completeTask(id: ID!): Task
    addUser(name: String!, email: String!): User
    sendNotification(message: String!, userId: ID!): Notification
  }
`;

module.exports = typeDefs;
