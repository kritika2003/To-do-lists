const express= require("express");
const bodyparser = require("body-parser");
const app= express();
const _ = require("lodash");
const mongoose= require('mongoose');
const List = require("./models/list");


app.set("view engine","ejs");
app.use(bodyparser.urlencoded({extended:true}));
app.use("/css", express.static(__dirname + "/public/css"));
app.use(express.static(__dirname+"/public"));
mongoose.connect("mongodb://127.0.0.1:27017/todolistdb",{useNewUrlParser: true, useUnifiedTopology: true,
serverSelectionTimeoutMS: 5000,
autoIndex: false, // Don't build indexes
maxPoolSize: 10, // Maintain up to 10 socket connections
serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
family: 6 // Use IPv4, skip trying IPv6
});
app.get("/", async (req, res) => {
  try {
    const foundItems = await List.find({});

    if (foundItems.length === 0) {
      console.log("No items found");
      return res.render("list", {
        list: [
          {
            name: "Welcome to Todo List",
            items: [{ name: "please enter data" }],
          },
        ],
      });
    }
    console.log(foundItems);
    res.render("list", { list: foundItems });
  } catch (error) {
    console.log(error);
  }
});
app.post("/", async (req, res) => {
  var itemName = req.body.newitem;
  const listName = req.body.listname;
  const ListData = await List.findOne({ name: listName });
  if (!ListData) {
    console.log("No list found");
    await List.insertMany({
      name: listName,
      isCompleted: false,
      dateOfList: Date.now(),
      items: [
        {
          id: Math.floor(Math.random() * 1000) + 1,
          name: itemName,
        },
      ],
    });
    return res.redirect("/");
  }
  List.findOne({ name: listName }).then((foundList) => {
    foundList.items.push(
      {
        id: Math.floor(Math.random() * 1000) + 1,
        name: itemName,
      },
    );
     foundList.save();
    res.redirect("/");
  });
});
app.post("/delete/:listName/:checkedItemId", async (req, res)=> {
  const checkedItemId = req.params.checkedItemId;
  const listName = req.params.listName;
  console.log(req.params);
  try{
    const listData= await List.findOne({name: listName});
    if(listData.items.length===1 || listData.items.length===0){
      console.log("No items found");
      await List.deleteOne({name: listName});
      return res.redirect("/");
    }
    const updatedList = await List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { id: checkedItemId } } },
      { new: true } // Set the `new` option to true to return the updated document.
    );
    if (updatedList) {
      console.log(`Successfully removed item with id ${checkedItemId} from ${listName}.`);
      return res.redirect("/");
    } else {
      console.log(`List with name ${listName} not found.`);
      return res.redirect("/");
    }
  } catch (error) {
    console.error(`Error occurred while removing item from list: ${error}`);
  }
});

/*const itemSchema= new mongoose.Schema({
  name: String
});
const Item= mongoose.model("Item", itemSchema);
const item1 = new Item({
  name:"Buy Food"
});
const item2 = new Item({
  name:"Cook Food"
});
const item3 = new Item({
  name:"Eat Food"
});
const defaultItems=[item1, item2, item3];
Item.insertMany(defaultItems);
const listSchema={
  name:String,
  items:[itemSchema]
};
const List = mongoose.model("List", listSchema);
app.get("/" , async function(req,res){
  try{
  const foundItems = await Item.find({});
  if(foundItems.length===0){
    await Item.insertMany(defaultItems);
    res.redirect("/");
  }
  else{
    res.render("list",{listTitle: "Today", newlistitem: foundItems});
 }
}
 catch(error){
  console.log(error);
 }
});

app.post("/", function(req, res){
  var itemName=req.body.newitem;
  const listName = req.body.list;
  const item= new Item({
    name: itemName
  });
  if(listName === "Today"){
  item.save();
  res.redirect("/");
}
else{
  List.findOne({name:listName})
    .then(foundList=>{
     foundList.items.push(item);
     foundList.save();
     res.redirect("/"+listName);
    });
}
});
app.post("/delete", function(req, res){
   const checkedItemId= req.body.checkbox;
   const listName= req.body.listName
   if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemId)
     .then(error=>{
      if(!error){
        console.log("Successfully deleted");
        res.redirect("/");
      }
     });
  }
  else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},function(error, foundList){
      if(!error){
        res.redirect("/"+listName);
      }
    });
  }
   });

app.get("/:customListName",function(req,res){
  const customListName = _.capitalize(req.params.customListName);
List.findOne({name:customListName})
   .then(err=>{
  if(!err){
       new Promise(foundList=>{
     if(!foundList){
     // Create new List
     const list = new List({
      name:customListName,
      items: defaultItems
      });
      list.save();
      res.redirect("/" + customListName);
      }
      {
      // Show an existing List
      res.render("list",{listTitle:foundList.name, newlistitem:foundList.items});
    }
  });
  }
});
});*/
 
app.listen(4000, function(){
  console.log("Server is up and running at port at 4000");
});
