const express = require('express');
const mysql = require('mysql')
const mail = require('nodemailer');
const bodyparser = require('body-parser');
const { json } = require('express');

const app = express();

app.use(bodyparser.urlencoded({extended: false}));
app.use(bodyparser.json());

//string slice
function slice(str){
  var result = "";
  for(var i = 1 ; i < str.length -1 ; i++){
    result += str[i];
  }
  return result;
}
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
    connectionLimit : 10,
    host            : 'localhost',
    user            : 'root',
    password        : 'password',
    database        : 'restaurant_management'
});

//server succesfull message
app.get('/' , (req , res)=>{
    res.send(`server is running succesfully on port ${port}`);
});

//get users
app.get('/get/users' , (req , res)=>{
    pool.getConnection((err,connection)=>{
        if(err) throw err;
        console.log("connected to database");

        var query = "select * from users";

        connection.query(query , (err,rows)=>{
            if(err) console.log(err);
            else{ 
              rows = JSON.stringify(rows);
              var obj = JSON.parse(slice(rows));
              res.send(obj.res_name);
            }
        });
    });
});

//login
app.post('/login' , (req , res)=>{
  pool.getConnection((err,connection)=>{
      if(err) throw err;
      console.log("connected to database");

      var query = `SELECT email,password FROM users where email="${req.body.email}"`;

      connection.query(query , (err,rows)=>{
          if(err) console.log(err);
          else res.send(rows);
      });
  });
});

//add users
app.post('/add/users' , (req , res)=>{

  //4 digit random number
  var ran = Math.floor(1000 + Math.random() * 9000);

    pool.getConnection((err,connection)=>{
        if(err) throw err;
        console.log("connected to database");
        const params = req.body

        var password = `${params.name}${ran}`;
        var email = params.email;
         
        console.log(`Password: ${password}`);


        //sql query
        connection.query(`INSERT INTO users (name,ph_no,email,res_name,tables,password) VALUES ('${params.name}','${params.ph_no}','${params.email}','${params.res_name}','${params.tables}','${password}')` , (err,rows)=>{
            if(err) console.log(err);
            else res.send(`data with name: ${params.name} has been added and your password has been send to ${email}`);
        });


        //sending mail
        var mailOptions = {
            from: 'tushar.code05@gmail.com',
            to: email,
            subject: 'Your password! don`t share with anyone.',
            text: `your password is "${password}"`
          };
          
          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
          });
    });
});

//add items
app.post('/add/items' , (req , res)=>{
  pool.getConnection((err,connection)=>{
      if(err) throw err;
      console.log("connected to database");

      var category = `${req.body.category}`;

      var query = `SELECT * FROM category WHERE name="${category}"`;

      connection.query(query , (err,rows)=>{
        if(err) console.log(err);
        else{
          //if there is no cotegory
          if(rows = '[]'){
          
            connection.query(`INSERT INTO category (name) VALUES ("${category}")` , (err,rows)=>{
              if(err)throw err;
              else res.send("category saved");
            });
          }
        }  
      });
  });
});
 
const port = process.env.PORT || 8000;
app.listen(port , () => console.log(`server started on port ${port}`));