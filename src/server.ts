import { Client } from "pg";
import { config } from "dotenv";
import express from "express";
import cors from "cors";
import filePath from "./filePath";

config(); //Read .env file lines as though they were env vars.

//Call this script with the environment variable LOCAL set if you want to connect to a local db (i.e. without SSL)
//Do not set the environment variable LOCAL if you want to connect to a heroku DB.

//For the ssl property of the DB connection config, use a value of...
// false - when connecting to a local DB
// { rejectUnauthorized: false } - when connecting to a heroku DB
const herokuSSLSetting = { rejectUnauthorized: false };
const sslSetting = process.env.LOCAL ? false : herokuSSLSetting;
const dbConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: sslSetting,
};

const app = express();

app.use(express.json()); //add body parser to each following route handler
app.use(cors()); //add CORS support to each following route handler

const client = new Client(dbConfig);
client.connect();

app.get("/", async (req, res) => {
  const pathToFile = filePath("../public/index.html");
  res.sendFile(pathToFile);
});

app.get("/breeds", async (req, res) => {
  try {
    const queryRes = await client.query(
      "SELECT * FROM breedvotes ORDER BY vote DESC"
    );
    res.status(200).json(queryRes.rows);
  } catch (error) {
    res.status(404).send(error.stack);
  }
});

app.post<{}, {}, { dogbreed: string }>("/breeds", async (req, res) => {
  try {
    const newBreed = req.body.dogbreed;
    const query = `INSERT INTO breedvotes (dogbreed)  
                VALUES ($1)
                Returning *`;
    const queryRes = await client.query(query, [newBreed]);
    if (queryRes.rowCount === 0) {
      res.status(400);
    } else {
      res.status(201).send(queryRes.rows);
    }
  } catch (error) {
    res.status(404).send(error.stack);
  }
});

app.put<{ id: string }, {}, { vote: number }>(
  "/breeds/:id",
  async (req, res) => {
    try {
      const breedId = req.params.id;
      const currentBreedVote = req.body.vote;
      const newBreedVote = currentBreedVote + 1;
      const query = `UPDATE breedvotes
  SET vote = $1
  WHERE id = $2
  RETURNING *;`;
      const queryRes = await client.query(query, [newBreedVote, breedId]);
      if (queryRes.rowCount === 0) {
        res.status(400).send("ID doesn't exist");
      } else {
        res.status(201).send(queryRes.rows);
      }
    } catch (error) {
      res.status(404).send(error.stack);
    }
  }
);

//Start the server on the given port
const port = process.env.PORT;
if (!port) {
  throw "Missing PORT environment variable.  Set it in .env file.";
}
app.listen(port, () => {
  console.log(`Server is up and running on port ${port}`);
});
