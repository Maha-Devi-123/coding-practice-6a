const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const app = express();
app.use(express.json());

//db and server installation
const databasePath = path.join(__dirname, "covid19India.db");
let database = null;
const connectServerAndDB = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running Successfully");
    });
  } catch (error) {
    console.log(`Database Error: ${error.message}`);
    process.exit(1);
  }
};
connectServerAndDB();

//case changing function
const changeCase = (obj) => {
  return {
    stateId: obj.state_id,
    stateName: obj.state_name,
    population: obj.population,
  };
};

//get method API 1

app.get("/states/", async (request, response) => {
  const getAllStates = `
    SELECT * 
    FROM state 
    ORDER BY 
    state_id;`;
  const statesArray = await database.all(getAllStates);
  response.send(statesArray.map(changeCase));
});
