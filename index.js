require("dotenv").config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require("ejs");
const mongoose = require("mongoose");
//require database-model
const Cal = require("./models/calculation")

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set('view engine', 'ejs');

const PORT = process.env.PORT || 3000;

mongoose.set("strictQuery", false);

main().catch(err => console.log(err));

async function main() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("DB connected");
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
}



app.listen(PORT, () => {
  console.log(`Server has started on port ${PORT}`);
});

let calculation = "";
let tempCal = "";
let result = 0;

app.get("/", async (req, res) => {
  calculation = "";
  tempCal = "";
  const x = await fetchCalHistory();
  res.render("calculator", { calculationScreen: calculation, calHistory: x });
});

app.post("/", async (req, res) => {
  const x = await fetchCalHistory();

  if (req.body.number || req.body.operation) {
    handleNumberOrOperation(req.body.number, req.body.operation);
    res.render("calculator", { calculationScreen: calculation, calHistory: x });
  }

  if (req.body.equal) {
    handleEqual();
    res.render("calculator", { calculationScreen: result, calHistory: x });
  }

  if (req.body.ac) {
    handleAC();
    res.render("calculator", { calculationScreen: result, calHistory: x });
  }

  if (req.body.DEL) {
    handleDel();
    res.render("calculator", { calculationScreen: calculation, calHistory: x });
  }

  if (req.body.percentage) {
    handlePercentage();
    res.render("calculator", { calculationScreen: result, calHistory: x });
    // result = "";
    // calculation = "";
  }

  if (req.body.name) {
    const userName = req.body.name;
    await saveOrUpdateCalculation(userName);
    res.redirect("/");
  }

  if (req.body.deleteName) {
    const userName = req.body.deleteName;
    let x = await Cal.findOne({ name: userName });
    await Cal.findByIdAndDelete(x.id);
    res.redirect("/");
  }
});

async function fetchCalHistory() {
  return await Cal.find({});
}

function handleNumberOrOperation(number, operation) {
  if (number) {
    calculation += number;
  }
  if (operation) {
    calculation += operation;
  }
}

function handleEqual() {
  try {
    result = eval(calculation);
  } catch (err) {
    result = "Syntax-Error";
  }
  tempCal = calculation;
  calculation = "";
}

function handleAC() {
  result = "";
  calculation = "";
}

function handleDel() {
  calculation = calculation.slice(0, -1);
}

function handlePercentage() {
  try {
    result = eval(calculation) / 100;
    tempCal = calculation + "%";
    calculation = "";
  } catch (err) {
    result = "Syntax-Error";
  }
}

async function saveOrUpdateCalculation(userName) {
  const existingCal = await Cal.findOne({ name: userName }).exec();
  if (!existingCal) {
    result = String(result).replace(/^0/, '').slice(0, 5);
    const cal = new Cal({
      name: userName,
      calculation: tempCal,
      result: result
    });
    cal.save();
  } else {
    const filter = { name: userName };
    const update = { calculation: tempCal, result: result };
    await Cal.findOneAndUpdate(filter, update, { new: true });
  }
}
