const express = require('express');
const mysql = require('mysql')
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

//mysql connection
const pool = mysql.createPool({
  connectionLimit: 10,
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'restaurant_management'
});

//server succesfull message
app.get('/', (req, res) => {
  res.send(`server is running succesfully on port ${port}`);
});

//login
app.post('/login', (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) throw err;
    console.log("connected to database");

    var query = `SELECT email,password FROM users where email="${req.body.email}"`;

    connection.query(query, (err, rows) => {
      if (err) throw err;
      else res.send(rows);
    });
  });
});

//add users
app.post('/add/users', (req, res) => {

  //4 digit random number
  var ran = Math.floor(1000 + Math.random() * 9000);

  pool.getConnection((err, connection) => {
    if (err) throw err;
    console.log("connected to database");
    const params = req.body

    var password = `${params.name}${ran}`;
    var email = params.email;

    console.log(`Password: ${password}`);


    //sql query
    connection.query('INSERT INTO users SET ?, `password` = ?',[params,password], (err, rows) => {
      if (err) throw err;
      else res.send(`data with name: ${params.name} has been added and your password has been send to ${email}`);
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
});

//add items section
app.post('/add/category', (req, res) => {

  pool.getConnection((err, connection) => {
    if (err) throw err;
    console.log("connected to database");

    //add category
    connection.query(`INSERT INTO category (name) VALUES ('${req.body.category}')`, (err, rows) => {
      if (err) console.log(err);

      console.log("category saved");
      console.log(`row id: ${rows.insertId}`);
      res.send("category saved");
    });
  });
});

//save items section
app.post('/add/items', (req, res) => {

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

//get users
app.get('/get/users', (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) throw err;
    console.log("connected to database");

    var query = "SELECT * FROM users";

    connection.query(query, (err, rows) => {
      if (err) throw err;
      res.send(rows);
    });
  });
});

//get category
app.get('/get/category', (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) throw err;
    console.log("connected to database");

    var query = "SELECT * FROM category";

    connection.query(query, (err, rows) => {
      if (err) throw err;
      res.send(rows);
    });
  });
});

//get items
app.get('/get/items', (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) throw err;
    console.log("connected to database");

    var query = "SELECT * FROM items";

    connection.query(query, (err, rows) => {
      if (err) throw err;
      res.send(rows);
    });
  });
});

//get items with category id
app.post('/get/items', (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) throw err;
    console.log("connected to database");

    connection.query('SELECT * FROM items WHERE ?',req.body, (err, rows) => {
      if (err) throw err;
      res.send(rows);
    });
  });
});

app.listen(port, () => console.log(`server started on port ${port}`));