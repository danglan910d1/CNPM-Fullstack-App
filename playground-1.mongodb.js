/* global use, db */
// MongoDB Playground
// Use Ctrl+Space inside a snippet or a string literal to trigger completions.

// Select database
const database = "personal_finance";
use(database);

// Create collections
db.createCollection("users");
db.createCollection("categories");
db.createCollection("transactions");

// Delete existing data (to avoid duplicates)
db.users.deleteMany({});
db.categories.deleteMany({});
db.transactions.deleteMany({});

// Insert a sample user
const userResult = db.users.insertOne({
  name: "Nguyen Van A",
  email: "a@example.com",
  password: "$2b$10$hashedpassword", // example hashed password
  createdAt: new Date(),
  updatedAt: new Date(),
});
// Get the _id of the newly created user
const userId = userResult.insertedId;

// Insert a sample categories
const categoryResult = db.categories.insertOne({
  userId: userId,
  name: "Ăn uống",
  type: "expense",
  createdAt: new Date(),
  updatedAt: new Date(),
});
// Get the _id of the newly created category
const categoryId = categoryResult.insertedId;

// Insert a sample transaction
db.transactions.insertOne({
  userId: userId,
  categoryId: categoryId,
  amount: 200000,
  date: new Date("2025-11-06T18:00:00Z"),
  description: "Ăn tối",
  createdAt: new Date(),
  updatedAt: new Date(),
});

// The prototype form to create a collection:
/* db.createCollection( <name>,
  {
    capped: <boolean>,
    autoIndexId: <boolean>,
    size: <number>,
    max: <number>,
    storageEngine: <document>,
    validator: <document>,
    validationLevel: <string>,
    validationAction: <string>,
    indexOptionDefaults: <document>,
    viewOn: <string>,
    pipeline: <pipeline>,
    collation: <document>,
    writeConcern: <document>,
    timeseries: { // Added in MongoDB 5.0
      timeField: <string>, // required for time series collections
      metaField: <string>,
      granularity: <string>,
      bucketMaxSpanSeconds: <number>, // Added in MongoDB 6.3
      bucketRoundingSeconds: <number>, // Added in MongoDB 6.3
    },
    expireAfterSeconds: <number>,
    clusteredIndex: <document>, // Added in MongoDB 5.3
  }
)*/

// More information on the `createCollection` command can be found at:
// https://www.mongodb.com/docs/manual/reference/method/db.createCollection/
