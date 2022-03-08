//jshint esversion:6

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
//connect to mongo db

// const { MongoClient, ServerApiVersion } = require('mongodb');
// const uri = "mongodb+srv://theopope:#ele%iki9@Xristos@cluster0.l8zxz.mongodb.net/todolistDB?retryWrites=true&w=majority";
// const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
// client.connect(err => {
//   const collection = client.db("test").collection("devices");
//   // perform actions on the collection object
//   client.close();
// });

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb+srv://adminTheo:nFd75mAWtzehPOLl@cluster0.l8zxz.mongodb.net/todolistDB?retryWrites=true');
}
//create a SCHEMA that sets out the fields each document will have and their datatypes
const itemsSchema = new mongoose.Schema({
  name: String
});

//create a MODEL
const Item = new mongoose.model("Item", itemsSchema);
//create a DOCUMENT
const item1 = new Item({
  name: "Welcome to your todolist"

});
const item2 = new Item({
  name: "<=== Click checkbox to delete"

});
const item3 = new Item({
  name: "Click on + after adding new item"

});

//save the document
//item.save()

const defaultItems = [item1, item2, item3];

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]
});


const List = mongoose.model("List", listSchema);



app.get("/", function(req, res) {
  Item.find({}, function(err, foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully saved default items to database");
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
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({
    name: customListName
  }, function(err, foundList) {
    if (!err) {
      if (!foundList) {
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        res.render("List", {
          listTitle: foundList.name,
          newListItems: foundList.items
        });
      }
    }
  });


});


app.post("/", function(req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName
  });
  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({
      name: listName
    }, function(err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }

});

app.post("/delete", function(req, res) {
  const checkedItemID = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {


    Item.findByIdAndRemove(checkedItemID, function(err) {
      if (!err) {
        console.log("Checked Item Removed");
        res.redirect("/");
      }

    });
  } else {
    List.findOneAndUpdate({
      name: listName
    }, {
      $pull: {
        items: {
          _id: checkedItemID
        }
      }
    }, function(err, foundList) {
      if (!err) {
        res.redirect("/" + listName);
      }
    });
  }



});

// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });

app.get("/about", function(req, res) {
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
