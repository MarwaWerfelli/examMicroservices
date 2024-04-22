const { gql } = require("apollo-server-express");

// Définir le schéma GraphQL
const typeDefs = gql`
  type Task {
    title: String!
    description: String!
    completed: Boolean!
    assignedTo: [ID]!
    createdAt: String
    thumbsUp: Int
    thumbsDown: Int
  }

  type User {
    name: String!
    email: String!
    createdAt: String
    thumbsUp: Int
    thumbsDown: Int
  }

  type Notification {
    message: String!
    seen: Boolean!
    userId: ID!
    createdAt: String
    thumbsUp: Int
    thumbsDown: Int
  }

  type Query {
    task(ID: ID!): Task!
    tasks(amount: Int): [Task]
    user(ID: ID!): User
    users(amount: Int): [User]
    notification(ID: ID!): Notification
    notifications(amount: Int): [Notification]
  }

  input TaskInput {
    title: String!
    description: String!
    completed: Boolean!
    assignedTo: [String]!
  }

  input NotifyInput {
    message: String!
    userId: ID!
  }

  input userInput {
    name: String!
    email: String!
  }

  type Mutation {
    addTask(TaskInput: TaskInput): Task!
    completeTask(id: ID!): Task!
    addUser(userInput: userInput): User!
    sendNotification(NotifyInput): Notification!
  }
`;

module.exports = typeDefs;
