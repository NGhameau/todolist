//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));



mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser: true});





//create Schema
const itemsSchema = {
  name: String
}
/*const itemsSchema = new mongoose.Schema({
  name:{
  type: String,
  required: [true, "Please enter some text"]
},
});*/

// create model -> CAPITALASE THE FIRST LETTRE
const Item = mongoose.model("Item", itemsSchema);


//create 3 new documents
const item1 = new Item({
  name: "welcome to the todolist",
});
const item2 = new Item({
  name: "hit the + button",
});
const item3 = new Item({
  name: "or the checkbox to delete",
});



const defaultItems = [item1, item2, item3];

Item.insertMany(defaultItems, function(err){
  if (err){
    console.log(err);
  }else{
    console.log("initialisation OK");
  }
});

app.get("/", function(req, res) {

  res.render("list", {listTitle: "Today", newListItems: items});

});




app.post("/", function(req, res){

  const item = req.body.newItem;

  if (req.body.list === "Work") {
    workItems.push(item);
    res.redirect("/work");
  } else {
    items.push(item);
    res.redirect("/");
  }
});

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
