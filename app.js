//jshint esversion:6
require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));


mongoose.connect("mongodb+srv://"+process.env.USER_DB+":"+process.env.PW_DB+"@"+process.env.PATH_DB+"/todolistDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});






//create Schema
const itemsSchema = {
  name: String
}


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


//new Schema for list
const listSchema = ({
  name: String,
  items: [itemsSchema]
});


//create mongoose model
const List = mongoose.model("List", listSchema);




app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems) {


    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("initialisation OK");
        }
      });

      res.redirect("/");
    } else {
      res.render("list", {
        listTitle: "Today",
        newListItems: foundItems
      });
    }
  });
});


app.get("/:customListName", function(req, res) {
  //console.log(req.params.customListName);
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({
    name: customListName
  }, function(err, foundList) {
    if (!err) {
      if (!foundList) {
        console.log("create the list");
        //create a new list

        const list = new List({
          name: customListName,
          items: defaultItems
        });

        list.save();

        res.redirect("/" + customListName);
      } else {
        console.log("render the list " + customListName);
        //show an existing list
        res.render("list", {
          listTitle: customListName,
          newListItems: foundList.items
        });
      }
    }

  });
});





app.post("/", function(req, res) {

  const itemName = req.body.newItem;
  const item = new Item({
    name: itemName
  });


  const listTitle = req.body.list; //use te name of the HTML element

  if (listTitle === "Today") {
    item.save();
    res.redirect("/");
  } else {
    //console.log(listTitle);
    List.findOne({
      name: listTitle
    }, function(err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listTitle);
    })
  }



});

app.post("/delete", function(req, res) {
  //console.log(req.body);
  //console.log(req.body.checkbox);

  const checkedItemId = req.body.checkbox;
  const listTitle = req.body.listName;

  if (listTitle === "Today") {
    Item.findByIdAndRemove(checkedItemId, function(err) {
      if (err) {
        console.log(err);
      } else {
        console.log("item " + checkedItemId + " removed from Today's list");
        res.redirect("/");
      }
    });

  } else {
    //delete request comming from a custom list
    //remove document from an array
    List.findOneAndUpdate({
        name: listTitle
      }, {
        $pull: {
          items: {
            _id: checkedItemId
          }
        }
      },
      function(err, foundList) {
        if (!err) {
          res.redirect("/" + listTitle);
        }
      });

  }



});




app.get("/about", function(req, res) {
  res.render("about");
});



let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;

}

app.listen(port, function() {
  console.log("Server started on port " + port);
});
