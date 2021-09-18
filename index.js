const express = require('express');
const app = express();
var mysql = require('mysql')

// var connection = mysql.createConnection({
//     host: 'localhost',
//     user: '',
//     password: '',
//     database: ''
//   })

const members = [{
    id : 1,
    name : 'Tushar',
    email : 'tusharwadhan@gmail.com'
},
{
    id : 2,
    name : 'Tushar_w',
    email : 'tushar_w@gmail.com'
},
{
    id : 3,
    name : 'Ketan',
    email : 'katen@gmail.com'
}]
app.get('/' , (req , res)=>{
    res.send(`server is running succesfully`);
});
app.get('/api/getmembers' , (req , res)=>{
    res.json(members);
});
const port =process.env.PORT || 5050;

app.listen(port , () => console.log(`server started on port ${port}`));