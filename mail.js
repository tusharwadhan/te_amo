// const mail = require('nodemailer');

// //mail connection
// var transporter = mail.createTransport({
//   service: 'gmail',
//   auth: {
//     user: 'tushar.code05@gmail.com',
//     pass: 'bot@@123'
//   }
// });

  //4 digit random number
  // var ran = await Math.floor(1000 + Math.random() * 9000);

  //making password and saving
  // const params = req.body[0]
  // var password = `${params.name}${ran}`;
  // var email = params.email;
  // console.log(`Password: ${password}`);
  // req.body[0].password = password;

    //sending mail
  // var mailOptions = {
  //   from: 'tushar.code05@gmail.com',
  //   to: email,
  //   subject: 'Your password! don`t share with anyone.',
  //   text: `your password is "${password}"`
  // };
  // transporter.sendMail(mailOptions, function (error, info) {
  //   if (error) {
  //     console.log(error);
  //   }
  //   else {
  //     console.log('Email sent: ' + info.response);
  //   }
  // });

  var arr = [];

  var obj = [{"hello":"hi there","hello1":"hello2"},{"hello":"hi there","hello1":"hello2"}];

  obj.hello3 = [
    {
      _id: '61976107487ac6536ca29339',
      type: 'half',
      price: 50,
      item_id: '61976107487ac6536ca29336',
      __v: 0
    },
    {
      _id: '61976107487ac6536ca2933a',
      type: 'full',
      price: 100,
      item_id: '61976107487ac6536ca29336',
      __v: 0
    }
  ]

  // arr[0] = obj;
    // arr[0] = obj;
    // arr[1] = obj;
  console.log(obj);