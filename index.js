// require("dotenv").config();
// const express = require('express');
// const bodyParser = require('body-parser');
// const ejs = require("ejs");
// const mongoose = require("mongoose");
// //require database-model
// const Cal = require("./models/calculation");
// const _ = require("lodash");

// const app = express();
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(express.static("public"));
// app.set('view engine', 'ejs');

// const PORT = process.env.PORT || 3000;

// mongoose.set("strictQuery", false);

// main().catch(err => console.log(err));

// async function main() {
//   try {
//     await mongoose.connect(process.env.MONGO_URI);
//     console.log("DB connected");
//   } catch (err) {
//     console.log(err);
//     process.exit(1);
//   }
// }





// let resultCal = "";
// let inputValue = "";
// app.get("/", async (req, res) => {
//   const x = await fetchCalHistory();
//   res.render("calculator", {calHistory: x});
// });

// app.post("/", async (req, res) => {
//   if(req.body.inputValue||req.body.result){
// inputValue = req.body.inputValue;
// resultCal = req.body.result;
//   }

//   if (req.body.name) {
//     // console.log(inputValue,resultCal);
//     const userName = _.kebabCase(req.body.name);
//     await saveOrUpdateCalculation(userName,resultCal,inputValue);
//     res.redirect("/");
//   }

//   if (req.body.deleteName) {
//     const userName = req.body.deleteName;
//     await Cal.deleteOne({ name: userName });
//     res.redirect("/");
//   }
// });

// async function fetchCalHistory() {
//   return await Cal.find({});
// }



// async function saveOrUpdateCalculation(userName,resultCal,inputValue) {
  
//   const existingCal = await Cal.findOne({ name: userName }).exec();
//   if (!existingCal) {
//     result = String(resultCal).replace(/^0/, '').slice(0, 5);
//     const cal = new Cal({
//       name: userName,
//       calculation: inputValue,
//       result: resultCal
//     });
//     cal.save();
//   } else {
//     const filter = { name: userName };
//     const update = { calculation: inputValue, result: resultCal};
//     await Cal.findOneAndUpdate(filter, update, { new: true });
//   }
// }

// app.listen(PORT, () => {
//   console.log(`Server has started on port ${PORT}`);
// });
require("dotenv").config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require("ejs");
const mongoose = require("mongoose");
//require database-model
const Cal = require("./models/calculation");
const _ = require("lodash");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set('view engine', 'ejs');

mongoose.set("strictQuery", false);

main().catch(err => console.log(err));

let resultCal = "";
let inputValue = "";

// Flag to track if the server is already started
let serverStarted = false;

async function main() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("DB connected");
    startServer(); // Start the server after the database connection is established
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
}

app.get("/", async (req, res) => {
  const x = await fetchCalHistory();
  res.render("calculator", { calHistory: x });
});

app.post("/", async (req, res) => {
  if (req.body.inputValue || req.body.result) {
    inputValue = req.body.inputValue;
    resultCal = req.body.result;
  }

  if (req.body.name) {
    const userName = _.kebabCase(req.body.name);
    await saveOrUpdateCalculation(userName, resultCal, inputValue);
    res.redirect("/");
  }

  if (req.body.deleteName) {
    const userName = req.body.deleteName;
    await Cal.deleteOne({ name: userName });
    res.redirect("/");
  }
});

async function fetchCalHistory() {
  return await Cal.find({});
}

async function saveOrUpdateCalculation(userName, resultCal, inputValue) {
  const existingCal = await Cal.findOne({ name: userName }).exec();
  if (!existingCal) {
    result = String(resultCal).replace(/^0/, '').slice(0, 5);
    const cal = new Cal({
      name: userName,
      calculation: inputValue,
      result: resultCal
    });
    cal.save();
  } else {
    const filter = { name: userName };
    const update = { calculation: inputValue, result: resultCal };
    await Cal.findOneAndUpdate(filter, update, { new: true });
  }
}

function startServer() {
  if (!serverStarted) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server has started on port ${PORT}`);
    });
    serverStarted = true;
  }
}
