const express = require('express');
const mongoose = require('mongoose');
const bodyparser = require('body-parser');
const { json } = require('express');

const app = express();
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());
const port = process.env.PORT || 8000;

var dburl = "mongodb+srv://tushar:tushar52002@cluster0.wlx9v.mongodb.net/TeAmo?retryWrites=true&w=majority";
// var dburl = 'mongodb://localhost:27017/TeAmo';

//mongoDB connection
mongoose.connect(dburl)
.then(()=>{
  console.log("Connected To DataBase: TeAmoDB!");
})
.catch(err => {
  console.log("Can't connect to database!");
  console.log(err);
})

// category schema and model
const CategorySchema = new mongoose.Schema({
  name: String
});
const category = mongoose.model('category', CategorySchema);

// currentOrder schema and model
const currentOrderSchema = new mongoose.Schema({
  item_name: String,
  quantity: String,
  isVeg: Boolean,
  price: Number,
  table_no: Number 
});
const current_Order = mongoose.model('current_order', currentOrderSchema);

// items schema and model
const itemsSchema = new mongoose.Schema({
  name: String,
  category_id: String,
  isVeg: Boolean
});
const items = mongoose.model('items', itemsSchema);

//quantity_price schema and model
const quantityPriceSchema = new mongoose.Schema({
  type: String,
  price: Number,
  item_id: String
});
const quantity_price = mongoose.model('quantity_price', quantityPriceSchema);

//transactions schema and model
const transactionSchema = new mongoose.Schema({
  table: Number,
  amount: Number,
  date: String
});
const transactions = mongoose.model('transactions', transactionSchema);

//users schema and model
const usersSchema = new mongoose.Schema({
  name: String,
  ph_no: String,
  email: String,
  res_name: String,
  tables: Number,
  password: String
});
const users = mongoose.model('users', usersSchema);

// result object
var obj = {"status": true , "message": "" , "data":""};

//reset obj (for => after sending response)
function reset(){
  obj.status = true;
  obj.message = "";
  obj.data = "";
  console.log("obj reset done!");
}

//server succesfull message
app.get('/',async (req, res) => {
  res.send(`server is running succesfully on port ${port}`);
});

//add users
app.post('/users',async (req, res) => {

  //inserting data into db
  await users.insertMany(req.body, function(error, docs) {
    if(error){
      obj.status = false;
      obj.message = "can't save user";
      res.send(obj);
      reset();
      return;
    }
    
    console.log("user saved!");
    obj.message = `user with name: ${req.body[0].name} has been saved successfully!`;
    res.send(obj);
    reset();
  });

});

//get users
app.get('/users', async (req, res) => {
  const result = await users.find({});

  obj.message = "users get successfully!";
  obj.data = result;
  res.send(obj);
  reset();
});

//login
app.post('/login',async (req, res) => {

  const result = await users.find({email:req.body[0].email});
  if(result[0]==undefined){
    obj.message = "user not found!";
    res.send(obj);
    reset();
  }
  else if(result[0].password != req.body[0].password){
    obj.message = `password not matched for email: ${req.body[0].email}`;
    res.send(obj);
    reset();
  }
  else{
    obj.message = "password matched successfully!";
    res.send(obj);
    reset();
  }
});

//add category section
app.post('/category',async (req, res) => {
  await category.insertMany(req.body,(error, docs)=>{
    if(error){
      obj.status = false;
      obj.message = "can't save category";
      res.send(obj);
      reset();
      return;
    }

    console.log("category saved!");;
    obj.message = "category saved successfully!";
    res.send(obj);
    reset();
  });
});

//get category
app.get('/category',async (req, res) => {
  const result = await category.find({});
  obj.message = "category get successfully! ";
  obj.data = result;
  res.send(obj);
  reset();
});

//save items section
app.post('/items',async(req, res)=>{

  var data;

  //saving items
  function save_items() {
    return new Promise((resolve, reject) => {
  
      items.insertMany(req.body,(error, docs)=>{
        if(error){
          obj.status = false;
          obj.message = "can't save item! please try again...";
          res.send(obj);
          reset();
          resolve();
        }
    
        console.log("items saved!");
        resolve(data = docs);
      });
  
    });
  }
  await save_items();

  // making array of objects for quanity price
  let arrObj = [];
  let num = 0;
  for(let i = 0 ; i < req.body.length ; i++){
    for(let j = 0 ; j < req.body[i].quantity_price.length ; j++){
      req.body[i].quantity_price[j].item_id = data[i].id;
      arrObj[num] = req.body[i].quantity_price[j];
      num++;
    }
  }

  // saving price of products
  quantity_price.insertMany(arrObj,(error, docs)=>{
    if(error){
      obj.status = false;
      obj.message = "can't save quantity price! please try again...";
      res.send(obj);
      reset();
      return;
    }

    //sending response
    console.log("price saved!");
    obj.message = "all dishes has been saved successfully!";
    res.send(obj);
    reset();
  });

});

//get items (with or without category id)
app.get('/items',async (req, res) => {

  //getting items and price
  var item = await items.find(req.query,{id:1,name:1,category_id:1,isVeg:1})
  var price = await quantity_price.find({});
  var result = JSON.parse(JSON.stringify(item));

  // adding price in items
  for(let i = 0 ; i < item.length ; i++){
    let arr = [];
    let num = 0;
    for(let j = 0 ; j < price.length ; j++){
      if(item[i].id == price[j].item_id){
        arr[num] = price[j];
        num++;
      }
    }
    result[i].quantity_price = arr;
  }
  console.log("done");

  //sending response
  obj.message = "items get successfully";
  obj.data = result;
  res.send(obj);
  reset();
});

//current table section(add order)
app.post('/order', (req, res) => {

  current_Order.insertMany(req.body,(error, docs)=>{
    if(error){
      obj.status = false;
      obj.message = "can't add order! please try again...";
      res.send(obj);
      reset();
      return;
    }

    console.log("order added");
    obj.message = "order added successfully";
    res.send(obj);
    reset();
  });
});

//get orders with table_no
app.get('/order',async (req, res) => {

  const order = await current_Order.find(req.query);
  obj.message = "order get successfully";
  obj.data = order;
  res.send(obj);
  reset();
});

//delete order with order_id
app.delete('/order',async (req, res) => {
  const del = await current_Order.deleteMany({_id:req.body[0].id});
  if(del.deletedCount == 0){
    obj.status = false;
    obj.message = "no order with this id exist!";
    res.send(obj);
    reset();
  }
  else{
    console.log(del);
    obj.message = "order deleted successfully";
    res.send(obj);
    reset();
  }
});

// order finish section
app.post('/orderfinish',async (req, res) => {

  // getting price from table
  const price = await current_Order.find({table_no:req.body[0].table_no},{id:1,price:1});

  // getting total price
  let total = 0;
  for(let i = 0 ; i < price.length ; i++){
    let p = parseFloat(price[i].price);
    total += p;
  }
  console.log(total);

  //getting current date
  var datetime = new Date();
  datetime = datetime.toISOString().slice(0,10);
  console.log(datetime);

  // inserting in transactions
  var insertobj = [{"table_no":req.body[0].table_no, "amount":total ,"date":datetime}];
  transactions.insertMany(insertobj,(error, docs)=>{
    if(error){
      obj.status = false;
      obj.message = "can't add transaction! please try again...";
      res.send(obj);
      reset();
      return;
    }
    console.log("order added in transaction");
  });

  // deleting order from current order with tableNo
  const del = await current_Order.deleteMany({table_no:req.body[0].table_no});
  if(del.deletedCount == 0){
    obj.status = false;
    obj.message = "no order with this tableNo exist!";
    res.send(obj);
    reset();
  }
  else{
    console.log("orders deleted");
    obj.message = "order finished";
    res.send(obj);
    reset();
  }
});

//get transaction
app.get('/transactions',async (req, res) => {

  const transaction = await transactions.find({});
  obj.message = "transactions get successfully";
  obj.data = transaction;
  res.send(obj);
  reset();
});

app.listen(port, () => console.log(`server started on port ${port}`));