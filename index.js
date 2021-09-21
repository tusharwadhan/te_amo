const express = require('express');
const mysql = require('mysql')
const mail = require('nodemailer');
const bodyparser = require('body-parser');

const app = express();

app.use(bodyparser.urlencoded({extended: false}));
app.use(bodyparser.json());

var transporter = mail.createTransport({
    service: 'gmail',
    auth: {
      user: 'tushar.code05@gmail.com',
      pass: 'bot@@123'
    }
  });

const pool = mysql.createPool({
    connectionLimit : 10,
    host            : 'localhost',
    user            : 'root',
    password        : 'password',
    database        : 'restaurant_management'
});

app.get('/' , (req , res)=>{
    res.send(`server is running succesfully on port ${port}`);
});
app.get('/api/getmembers' , (req , res)=>{
    pool.getConnection((err,connection)=>{
        if(err) throw err;
        console.log("connected to database");

        var query = "select * from users";

        connection.query(query , (err,rows)=>{
            if(err) console.log(err);
            else res.send(rows);
        });
    });
});

app.post('/api/add' , (req , res)=>{
    var ran = Math.floor(1000 + Math.random() * 9000);

    pool.getConnection((err,connection)=>{
        if(err) throw err;
        console.log("connected to database");
        const params = req.body

        var password = `${params.name}${ran}`;
        var email = params.email;
         
        console.log(`Password: ${password}`);

        connection.query(`INSERT INTO users (name,ph_no,email,res_name,tables,password) VALUES ('${params.name}','${params.ph_no}','${params.email}','${params.res_name}','${params.tables}','${password}')` , (err,rows)=>{
            if(err) console.log(err);
            else res.send(`data with name: ${params.name} has been added and your password has been send to ${email}`);
        });

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
  
const port = process.env.PORT || 8000;

app.listen(port , () => console.log(`server started on port ${port}`));