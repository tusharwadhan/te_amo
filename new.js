const mongoose = require('mongoose');

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


// customers.findOne({})
// .then(m => {
//     console.log(m);
// })