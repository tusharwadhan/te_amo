const express = require('express');
const mongoose = require('mongoose');
const mail = require('nodemailer');
const bodyparser = require('body-parser');
const { json } = require('express');

const app = express();
const port = process.env.PORT || 8000;
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

//mail connection
var transporter = mail.createTransport({
  service: 'gmail',
  auth: {
    user: 'tushar.code05@gmail.com',
    pass: 'bot@@123'
  }
});

//mongoDB connection
mongoose.connect('mongodb://localhost:27017/TeAmo')
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
var obj = {"success": true , "message": "" , "data":""};

//reset obj (for => after sending response)
function reset(){
  obj.success = true;
  obj.message = "";
  obj.data = "";
  console.log("obj reset done!");
}

//server succesfull message
app.get('/', (req, res) => {
  res.send(`server is running succesfully on port ${port}`);
});

//add users
app.post('/users',async (req, res) => {

  //4 digit random number
  var ran = await Math.floor(1000 + Math.random() * 9000);

  //making password and saving
  const params = req.body[0]
  var password = `${params.name}${ran}`;
  var email = params.email;
  console.log(`Password: ${password}`);
  req.body[0].password = password;

  //inserting data into db
  await users.insertMany(req.body, function(error, docs) {
    if(error) throw error;

    console.log("user saved!");
    obj.message = "user saved successfully!";
    res.send(obj);
    reset();
  });

  //sending mail
  var mailOptions = {
    from: 'tushar.code05@gmail.com',
    to: email,
    subject: 'Your password! don`t share with anyone.',
    text: `your password is "${password}"`
  };
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    }
    else {
      console.log('Email sent: ' + info.response);
    }
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
app.post('/login', (req, res) => {
  pool.getConnection(async(err, connection) => {
    if (err) throw err;
    console.log("connected to database");

    let response;
    function get() {
      return new Promise((resolve, reject) => {

        connection.query(`SELECT email,password FROM users WHERE email="${req.body.email}"`, (err, rows) => {
          if (err) throw err;
          resolve(response = rows);
        });
        
      });
    }

    function check1() {
      return new Promise((resolve, reject) => {

        if(JSON.stringify(response) == "[]"){
          obj.success = true;
          obj.message = "user not found";
          obj.data = response
          resolve(res.send(obj));
        }
        else{
          resolve(console.log("breaked"));
        }
        
      });
    }

    function check2() {
      return new Promise((resolve, reject) => {

        if(response[0].password != req.body.password){
          obj.success = true;
          obj.message = "password does not match";
          obj.data = {};
          resolve(res.send(obj));
        }
        else{
          resolve(console.log("breaked"));
        }
        
      });
    }

    function check3() {
      return new Promise((resolve, reject) => {

        if(response[0].password == req.body.password){
          obj.success = true;
          obj.message = "password matched successfully";
          obj.data = response;
          resolve(res.send(obj));
        }
        else{
          resolve(console.log("breaked"));
        }
        
      });
    }

    await get();
    await check1();
    await check2();
    await check3();

  });
});

//add category section
app.post('/category',async (req, res) => {
  await category.insertMany(req.body, function(error, docs) {
    if(error) throw error;

    console.log("category saved!");
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
app.post('/items', (req, res) => {

  pool.getConnection(async (err, connection) => {
    if (err) throw err;
    console.log("connected to database");

    let values = "";
    let params = req.body;
    size = req.body.length;

    //making values for items query
    for (let i = 0; i < size; i++) {
      values += `('${params[i].name}',${params[i].category_id},'${params[i].veg_non}')`;
      if (i == size - 1) break;
      values += ",";
    }

    let id = 0;

    //add items
    function save_items() {
      return new Promise((resolve, reject) => {

        connection.query(`INSERT INTO items (name,category_id,veg_non) values ${values}`, (err, rows) => {
          if (err) throw err;

          console.log("item saved");
          resolve(id = rows.insertId);
        });

      });
    }
    await save_items();

    //making values for price query
    values = "";
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < params[i].price.length; j++) {
        values += `('${params[i].price[j]}','${params[i].price[++j]}',${id})`;
        if (j == params[i].price.length - 1) break;
        values += ",";
      }
      if (i == size - 1) break;
      id++;
      values += ",";
    }

    //saving price
    connection.query(`INSERT INTO quantity_price (type,price,item_id) values ${values}`, (err, rows) => {
      if (err) throw err;

      console.log("price saved");
      res.send("items saved succesfully");
    });
  });
});

//get all items
app.get('/items',async (req, res) => {

  await get("SELECT * FROM items");
  let items = obj.data;
  await get("SELECT * FROM quantity_price");
  let price = obj.data;

  // combining items with price
  for(let i = 0 ; i < items.length ; i++){
    let arr = "[";
    for(let j = 0 ; j < price.length ; j++){
      if(items[i].id == price[j].item_id){
        arr += JSON.stringify(price[j]);
        if(price[j+1] == undefined || items[i].id != price[j + 1].item_id){
          arr += "]";
          break;
        }
        arr += ",";
      }
    }
    items[i].quantity_price = JSON.parse(arr);
  }

  //sending response
  obj.success = true;
  obj.message = "get items successfully";
  obj.data = items;
  res.send(obj);
});

//get items with category id
app.post('/filteritems',async (req, res) => {

  await get(`SELECT * FROM items WHERE category_id = ${req.body.category_id}`);
  let items = obj.data;
  await get("SELECT * FROM quantity_price");
  let price = obj.data;

  //combining items with price
  for(let i = 0 ; i < items.length ; i++){
    let arr = "[";
    for(let j = 0 ; j < price.length ; j++){
      if(items[i].id == price[j].item_id){
        arr += JSON.stringify(price[j]);
        if(price[j+1] == undefined || items[i].id != price[j + 1].item_id){
          arr += "]";
          break;
        }
        arr += ",";
      }
    }
    items[i].quantity_price = JSON.parse(arr);
  }

  //sending response
  obj.success = true;
  obj.message = `items get succesfully with category no:'${req.body.category_id}'`;
  obj.data = items;
  res.send(obj);
});

//current table section(add order)
app.post('/order', (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) throw err;
    console.log("connected to database");

    let values = "";
    let params = req.body;

    for (let i = 0; i < params.length; i++) {
      values += `('${params[i].item_name}','${params[i].quantity}','${params[i].veg_non}','${params[i].price}',${params[i].table_no})`;
      if (i == params.length - 1) break;
      values += ",";
    }

    connection.query(`INSERT INTO current_order (item_name,quantity,veg_non,price,table_no) VALUES ${values}` , (err, rows) => {
      if (err) throw err;
      res.send(rows);
    });
  });
});

//get orders with table_no
app.get('/order/:table_no',async (req, res) => {

  await get(`SELECT * FROM current_order WHERE table_no = ${req.params.table_no}`);
  obj.message = `orders get succesfully with table no:'${req.params.table_no}'`;
  res.send(obj);
});

//delete order with order_id
app.delete('/order', (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) throw err;
    console.log("connected to database");

    connection.query('DELETE FROM current_order WHERE ?',req.body, (err, rows) => {
      if (err) throw err;
      res.send("order deleted successfully");
    });
  });
});

// order finish section
app.post('/orderfinish', (req, res) => {
  pool.getConnection(async(err, connection) => {
    if (err) throw err;
    console.log("connected to database");

    let price;

    function get_price() {
      return new Promise((resolve, reject) => {

        connection.query('SELECT price FROM current_order WHERE ?',req.body, (err, rows) => {
          if (err) throw err;
          resolve(price = rows);
        });

      });
    }
    
    await get_price();
    let total = 0;

    for(let i = 0 ; i < price.length ; i++){
      let p = parseFloat(price[i].price);
      total += p;
    }

    connection.query('INSERT INTO `transactions` (`id`, `table`, `amount`, `date`) VALUES (NULL,? , ?, CURRENT_DATE())' , [req.body.table_no,JSON.stringify(total)], (err, rows) => {
      if (err) throw err;
      console.log("transaction added");
    });

    connection.query('DELETE FROM current_order WHERE ?',req.body, (err, rows) => {
      if (err) throw err;
      console.log("order deleted successfully");
      res.send("operation done successfully");
    });
  });
});

//get transaction
app.get('/transactions',async (req, res) => {

  await get('SELECT * FROM transactions');
  res.send(obj);
});

app.listen(port, () => console.log(`server started on port ${port}`));