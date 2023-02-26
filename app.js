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

const changeCaseForDistrict = (obj) => {
  return {
    districtId: obj.district_id,
    districtName: obj.district_name,
    stateId: obj.state_id,
    cases: obj.cases,
    cured: obj.cured,
    active: obj.active,
    deaths: obj.deaths,
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

//API 2

app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;
  const getSingleState = ` 
    SELECT * FROM 
    state WHERE state_id = ${stateId};`;
  const singleStateArray = await database.get(getSingleState);
  response.send(changeCase(singleStateArray));
});

//api3 post method

app.post("/districts/", (request, response) => {
  const { districtName, stateId, cases, cured, active, deaths } = request.body;
  const addDistrictQuery = `INSERT INTO 
  district (district_name,state_id,cases,cured,active,deaths)
  VALUES ("${districtName}",
  ${stateId}, 
  ${cases},
  ${cured},
  ${active},
  ${deaths});`;
  const addingDistrict = database.run(addDistrictQuery);
  response.send("District Successfully Added");
});

//API 4
app.get("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const queryForGetDistrict = `SELECT * FROM district 
    WHERE district_id = ${districtId}`;
  const specificDis = await database.get(queryForGetDistrict);
  response.send(changeCaseForDistrict(specificDis));
});

//API 5 DELETE

app.delete("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const deleteDistrictQuery = `DELETE FROM district 
    WHERE district_id = ${districtId};`;
  await database.run(deleteDistrictQuery);
  response.send("District Removed");
});

//API 6 put

app.put("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const { districtName, stateId, cases, cured, active, deaths } = request.body;
  const queryToUpdateDistrict = `UPDATE district 
   SET district_name="${districtName}",
  state_id = ${stateId}, 
  cases=${cases},
  cured=${cured},
  active=${active},
  deaths=${deaths};`;
  await database.run(queryToUpdateDistrict);
  response.send("District Details Updated");
});

//API 7

app.get("/states/:stateId/stats/", async (request, response) => {
  const { stateId } = request.params;
  const getStatsQuery = `SELECT cases,cured,active,deaths FROM district 
    WHERE state_id = ${stateId};`;
  const statsResponse = await database.all(getStatsQuery);
  let newObj = {
    totalCases: 0,
    totalCured: 0,
    totalActive: 0,
    totalDeaths: 0,
  };
  statsResponse.map((obj) => {
    newObj.totalCases = obj.cases + newObj.totalCases;
    newObj.totalCured = obj.cured + newObj.totalCured;
    newObj.totalActive = obj.active + newObj.totalActive;
    newObj.totalDeaths = obj.deaths + newObj.totalDeaths;
  });
  response.send(newObj);
});

//api8

app.get("/districts/:districtId/details/", async (request, response) => {
  const { districtId } = request.params;
  const getStateNameQuery = `SELECT state_id 
    from district WHERE district_id = ${districtId};`;
  const stateId = await database.get(getStateNameQuery);

  const idOfState = stateId.state_id;
  const getState = `
    SELECT state_Name
    FROM state 
    WHERE 
    state_id = ${idOfState};`;
  const SpecificState = await database.get(getState);
  response.send({ stateName: SpecificState.state_name });
});
module.exports = app;
