const express = require('express');
const mongoose = require('mongoose');
const bodyparser = require('body-parser');
const { json } = require('express');
const session = require('express-session');
const MongoStore = require("connect-mongo");

var dburl = "mongodb+srv://tushar:tushar52002@cluster0.wlx9v.mongodb.net/TeAmo?retryWrites=true&w=majority";
// var dburl = 'mongodb://localhost:27017/TeAmo';

const app = express();
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());
app.set("trust proxy", 1);

const store = new MongoStore({
  mongoUrl: dburl,
  secret: 'secret'
})
store.on("error",function(e){
  console.log("session error" , e);
})

app.use(session({
  store,
  secret:'secret',
  name: 'session',
  resave: false,
  saveUninitialized: true,
  cookie:{
    httpOnly:false,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7
  }
}))
const port = process.env.PORT || 8000;


app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "https://te-am-o.herokuapp.com");
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
  res.header("Access-Control-Allow-Credentials",true)
  next();
});

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
  item_id: String,
  quantity_id: String,
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

  if(req.body.name == "" ||
     req.body.ph_no == "" ||
     req.body.email == "" ||
     req.body.res_name == "" ||
     req.body.tables == (null||undefined) ||
     req.body.password == ""){

      obj.status = false;
      obj.message = "please fill all the fields properly!!";
      res.send(obj);
      reset();
      return;
     }

  //inserting data into db
  await users.create(req.body,(error, docs)=> {
    if(error){
      obj.status = false;
      obj.message = "can't save user.. Please try again later!!";
      res.send(obj);
      reset();
      return;
    }
    
    console.log("user saved!");
    obj.message = `Registered successfully!`;
    obj.data = docs;
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

  let result = await users.find({email:req.body.email});
  if(result[0]==undefined){
    obj.status = false;
    obj.message = "user not found!";
    res.send(obj);
    reset();
  }
  else if(result[0].password != req.body.password){
    obj.status = false;
    obj.message = `password not matched for email: ${req.body.email}`;
    res.send(obj);
    reset();
  }
  else{
    req.session.cookie.user_id = result[0]._id
    req.session.cookie.user_name = result[0].name
    result = JSON.parse(JSON.stringify(result));
    delete result[0].password;
    obj.message = "Logged In successfully";
    obj.data = result[0];
    res.send(obj);
    reset();
  }
});

//check login
app.get('/isLogin' , async (req,res)=>{
  if(req.session.user_id){
    obj.message = `welcome back ${req.session.user_name}`;
    res.send(obj);
    reset();
    return;
  }
  obj.status = false;
  obj.message = 'please login';
  res.send(obj);
  reset();
})

//add category section
app.post('/category',async (req, res) => {
  await category.create(req.body,(error, docs)=>{
    if(error){
      obj.status = false;
      obj.message = "can't save category";
      res.send(obj);
      reset();
      return;
    }

    console.log("category saved!");;
    obj.message = "category saved successfully!";
    obj.data = docs;
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
app.post('/order',async (req, res) => {

  for(let i = 0 ; i < req.body.length ; i++){
    const price = await quantity_price.find({_id:req.body[i].quantity_id});
    if(JSON.stringify(price) == "[]"){
      obj.status = false;
      obj.message = "QuantityID is wrong or doesn't exist.. please try again";
      res.send(obj);
      reset();
      return;
    }
    req.body[i].price = price[0].price;
  }

  current_Order.insertMany(req.body,(error, docs)=>{
    if(error){
      obj.status = false;
      obj.message = "can't add order! please try again...";
      res.send(obj);
      reset();
      return;
    }

    console.log("order added",docs);
    obj.message = "order added successfully";
    res.send(obj);
    reset();
  });
});

//get orders with table_no
app.get('/order',async (req, res) => {

  const order = await current_Order.find(req.query).lean();

  if(JSON.stringify(order) == "[]"){
    obj.status = false;
    obj.message = "This table have no orders";
    res.send(obj);
    reset();
  }
  else{
    for(let i = 0 ; i < order.length ; i++){
      const quantity = await quantity_price.find({_id:order[i].quantity_id})
      const item = await items.find({_id:order[i].item_id});
      let qp = {"type":quantity[0].type , "price":order[i].price};
      order[i].name = item[0].name;
      order[i].quantity_price = qp;
      delete order[i].quantity_id;
      delete order[i].item_id;
      delete order[i].price;
    }
    obj.message = "order get successfully";
    obj.data = order;
    res.send(obj);
    reset();
  }
});

//delete order with order_id
app.delete('/order',async (req, res) => {
  const del = await current_Order.deleteMany({_id:req.body.id});
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
  const price = await current_Order.find(req.body,{id:1,price:1});

  if(JSON.stringify(price) == "[]"){
    obj.status = false;
    obj.message = "no order exist!";
    res.send(obj);
    reset();
    return;
  }

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
  var insertobj = [{"table_no":req.body.table_no, "amount":total ,"date":datetime}];
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
  const del = await current_Order.deleteMany({table_no:req.body.table_no});
  console.log("orders deleted ",del);
  obj.message = "order finished";
  res.send(obj);
  reset();
});

//get transaction
app.get('/transactions',async (req, res) => {

  const transaction = await transactions.find({});
  obj.message = "transactions get successfully";
  obj.data = transaction;
  res.send(obj);
  reset();
});

app.get('*',async (req, res) => {

  obj.status = false;
  obj.message = "this link does not exist.. please go to right route!!";
  res.send(obj);
  reset();
});

app.listen(port, () => console.log(`server started on port ${port}`));