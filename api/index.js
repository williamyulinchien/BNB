const express = require('express')
const cors = require('cors');
const {default: mongoose } = require('mongoose');
const User = require('./models/User');
const Booking = require('./models/Booking.js');
const Place = require('./models/Place.js');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const jwtSecret = 'dsfhdjskfhkdsjfhuhu'
const bcryptSalt = bcrypt.genSaltSync(12)
const cookieParser  = require('cookie-parser');
const imageDownloader = require('image-downloader')
const multer = require('multer'); //upload 到 local directory
const {S3Client,PutObjectCommand} = require('@aws-sdk/client-s3') //能使用S3的服務
const fs = require('fs');
const session = require('express-session');
const bucket = 'william-booking-app';
const path = require('path');
const mime = require('mime-types')
const svgCaptcha = require('svg-captcha');
require('dotenv').config() // use dotenv to import mongoose connection...
const app = express();
const nodemailer = require('nodemailer');

app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(__dirname+'/uploads'));
//解決跨域問題
const whitelist = ['http://127.0.0.1:5173', 'http://localhost:5173','*','https://bnb-yulinchi-buffaloedu.vercel.app/']; // 列出允許的網域

const corsOptions = {
  credentials: true, // 這個很重要
  origin: (origin, callback) => {
    if(whitelist.includes(origin))
      return callback(null, true)

      callback(new Error('Not allowed by CORS'));
  }
}

app.use(cors(corsOptions));


// app.use(cors({
//     credentials: true,
//     origin:'http://127.0.0.1:5173',
//   }));
app.use(
    session({
      secret: 'dsfhdjskfhkdsjfhuhu',
      resave: false,
      saveUninitialized: true,
    })
  );
//Upload 到 AWS S3
async function uploadToS3(path,originalFilename,mimetype){
  const client = new S3Client({
    region: 'us-east-1',
    credentials:{
      accessKeyId: process.env.S3_ACCESS_KEY,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    }
  })
  const parts = originalFilename.split('.');
  const ext = parts[parts.length - 1];
  const newFilename = Date.now() + '.' + ext;
  console.log({newFilename})

  await client.send(new PutObjectCommand({
    Bucket: bucket,
    Body: fs.readFileSync(path),
    Key: newFilename,
    ContentType: mimetype,
    ACL: 'public-read',
  }));
  return `https://${bucket}.s3.amazonaws.com/${newFilename}`;
}

function getUserDataFromReq(req) {
  return new Promise((resolve, reject) => {
    jwt.verify(req.cookies.token, jwtSecret, {}, async (err, userData) => {
      if (err) throw err;
      resolve(userData);
    });
  });
}


app.get('/api/test', (req,res) => {
  mongoose.connect(process.env.MONGO_URL);
  res.json('test ok');
});


app.post('/api/register',async(req,res)=>{
  // connect the Mongo database
  // password: VG8emIUxfi81Vgr0
  const {name,email,password} = req.body;
  try{const userDoc = await User.create({
    name,
    email,
    password:bcrypt.hashSync(password,bcryptSalt) // password加密
  });
  res.json(userDoc);
  }catch(e){
    res.status(422).json(e)
    console.log(e)
  }
})

app.get('/api/captcha', (req, res) => {
  mongoose.connect(process.env.MONGO_URL); 
  const captcha = svgCaptcha.create();
  console.log(captcha.text)
  req.session.captcha = captcha.text;
  res.type('svg').send(captcha.data);
});

// Login
app.post('/api/login', async (req,res) => {
  //需要用到資料庫的,另外連線！
  mongoose.connect(process.env.MONGO_URL); 
  const {email,password,captcha} = req.body;
  const userDoc = await User.findOne({email});
  //透過user的email找到相關資料
  if (userDoc) { //
    const captchaOk = captcha === req.session.captcha;
    if (!captchaOk) {
      res.json('captcha not ok');
      return;
    }
    const passOk = bcrypt.compareSync(password, userDoc.password);
    // 密碼比對後正確
    if (passOk) {
        jwt.sign({
          email:userDoc.email,
          id:userDoc._id,
          name:userDoc.name,
        }, jwtSecret, {}, (err,token) => { 
          if (err) throw err;
            res.cookie('token', token).json(userDoc);
          });
          console.log('log in success')
          }else {
          res.json('password not ok');
          }
    }else {
      //找不到相關email
      res.json('not found');}
        });
// Reset password after login 
app.put('/api/reset-password',async(req,res)=>{
  mongoose.connect(process.env.MONGO_URL); 
  const {token} = req.cookies;
  const {newPassword,oldPassword} = req.body;
  if (token){
    jwt.verify(token, jwtSecret, {}, async (err, userData) => {
      if (err) throw err;
      const userDoc = await User.findById(userData.id);
      const passOk = bcrypt.compareSync(oldPassword,userDoc.password);
      // console.log('passOk:',passOk)
      if (passOk){
        userDoc.set({password:bcrypt.hashSync(newPassword,bcryptSalt)})
        await userDoc.save()
        res.json('update successfully')
      }else{
        res.json('old password is not correct')}
    });
  } else {
    res.json('not login');
  }
});

// Reset password by email
app.post('/api/password-email', async (req, res) => {
  mongoose.connect(process.env.MONGO_URL);
  try{
    const { email } = req.body;
    
    const user = await User.findOne({email});
    // console.log(user)
    if (!user) {
      return res.json('not found')};
    const token = jwt.sign({ id:user.id }, jwtSecret, { expiresIn: '1h' });
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASS
      }
    });
    const mailOptions = {
      from: '"Your App" <no-reply@yourapp.com>', // sender address
      to: user.email, // list of receivers
      subject: 'Password Reset', // Subject line
      text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.
          Please click on the following link, or paste this into your browser to complete the process within one hour of receiving it:
          http://localhost:5173/reset-password-email?token=${token}
          If you did not request this, please ignore this email and your password will remain unchanged.`
          };
      transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
              console.log(err);
              res.status(500).json({ message: 'Error sending email.' });
            } else {
              console.log(info);
              res.status(200).json({ message: 'Reset link sent.' });
            }
          });
    } catch (error) {
          console.log(error);
          res.status(500).json({ message: 'Internal server error.' });
        }
      
    })
//    
app.post('/api/reset-password-email', async (req, res) => {
      mongoose.connect(process.env.MONGO_URL);
      const {token,password1,password2 } = req.body;  
      if (password1 !== password2) {
        res.status(400).json({ message: 'Passwords do not match.' });
        return;}
      if (!token ||!password1||!password2) {
        return res.status(400).json({ message: 'Both token and new password are required.' });
      }
    
      let decoded;
      try {
        decoded = jwt.verify(token, jwtSecret);
      } catch (error) {
        return res.status(403).json({ message: 'Invalid or expired token.' });
      }
    
      const {id} = decoded;
    
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({message: 'User not found.' });
      }  
      user.password = bcrypt.hashSync(password1, bcryptSalt);
      await user.save();
      res.json({ message: 'Password reset successful.' });
    });

app.get('/api/profile',(req,res)=>{
  const {token} = req.cookies;

  if (token){
    jwt.verify(token, jwtSecret, {}, async (err, userData) => {
      if (err) throw err;
      const {name,email,_id} = await User.findById(userData.id);
      res.json({name,email,_id});
    });
  } else {
    res.json(null);
  }
});

//logout page!!!
app.post('/api/logout', (req,res) => {
  try {
    const {token} = req.cookies
    res.clearCookie('token', { sameSite: 'none', secure: true })
    res.json({message: "Logged out successfully"});
  } catch (error) {
    console.error(error);
    res.status(500).json({message: "An error occurred while logging out"});
  }
});
// upload-by-link
console.log(__dirname)
app.post('/upload-by-link', async (req,res) => {
  const {link} = req.body;
  if (!link) {
    return res.status(400).send({ error: 'The link is required' });
  }

  // const newName = 'photo' + Date.now() + '.jpg';
  // //本地端的file
  // await imageDownloader.image({
  //   url: link,
  //   dest: __dirname +'/uploads/' + newName,
  // });

  res.json(newName)
  await imageDownloader.image({
    url: link,
    dest: '/tmp/' + newName,
  });
  const url = await uploadToS3('/tmp/' +newName, newName, mime.lookup('/tmp/' +newName));
  res.json(url);
});
const photosMiddleware = multer({dest:'/tmp'});
app.post('/api/upload', photosMiddleware.array('photos', 100), async (req,res) => {
  const uploadedFiles = [];
  for (let i = 0; i < req.files.length; i++) {
    const {path,originalname,mimetype} = req.files[i];
    //本地端的files
    // const parts = originalname.split('.');
    // const ext = parts[parts.length-1];
    // const newPath = path +'.'+ext;
    // fs.renameSync(path,newPath)
    // uploadedFiles.push(newPath.replace('uploads/',''));
    // console.log(mimetype);

    //Upload files 到 S3
    const url = await uploadToS3(path, originalname, mimetype);
    uploadedFiles.push(url)
  }
  res.json(uploadedFiles);
});
//處理儲存的places
app.post('/api/places', (req,res) => {
  mongoose.connect(process.env.MONGO_URL);
  const {token} = req.cookies; //必須利用token找到User的id
  const {
    title,address,addedPhotos,description,price,
    perks,extraInfo,checkIn,checkOut,maxGuests,
  } = req.body;
  jwt.verify(token, jwtSecret, {}, async (err, userData) => {
    if (err) throw err;
    const placeDoc = await Place.create({
      owner:userData.id,
      price,title,address,
      photos:addedPhotos,description,
      perks,extraInfo,checkIn,checkOut,maxGuests,
    });
    res.json(placeDoc);
  });
});

app.get('/api/user-places', (req, res) => {
  mongoose.connect(process.env.MONGO_URL);
  const { token } = req.cookies;
  // console.log(token)
  // 確認 token 是否存在
  if (!token) {
    return res.status(401).json({ error: 'Token not provided' });
  }

  jwt.verify(token, jwtSecret, {}, async (err, userData) => {
    if (err) {
      // 如果驗證失敗，返回一個錯誤訊息
      return res.status(401).json({ error: 'Invalid token' });
    }
    // console.log(userData)
    const { id } = userData;
    res.json(await Place.find({ owner: id }));
  });
});


app.get('/api/places/:id', async (req,res) => {
  mongoose.connect(process.env.MONGO_URL);
  const {id} = req.params;
  res.json(await Place.findById(id));
});


// 更新places
app.put('/api/places', async (req,res) => {
  mongoose.connect(process.env.MONGO_URL);
  const {token} = req.cookies;
  const {
    id, title,address,addedPhotos,description,
    perks,extraInfo,checkIn,checkOut,maxGuests,price,
  } = req.body;
  jwt.verify(token, jwtSecret, {}, async (err, userData) => {
    if (err) throw err;
    const placeDoc = await Place.findById(id);
    if (userData.id === placeDoc.owner.toString()) {
      placeDoc.set({
        title,address,photos:addedPhotos,description,
        perks,extraInfo,checkIn,checkOut,maxGuests,price,
      });
      await placeDoc.save();
      res.json('ok');
    }
  });
});

app.get('/api/places', async (req,res) => {
  mongoose.connect(process.env.MONGO_URL);
  res.json(await Place.find() );
});


app.post('/api/bookings', async (req, res) => {
  mongoose.connect(process.env.MONGO_URL);
  const userData = await getUserDataFromReq(req);
  const {
    place,checkIn,checkOut,numberOfGuests,name,phone,price,
  } = req.body;
  Booking.create({
    place,checkIn,checkOut,numberOfGuests,name,phone,price,
    user:userData.id,
  }).then((doc) => {
    res.json(doc);
  }).catch((err) => {
    throw err;
  });
});


app.get('/api/bookings', async (req,res) => {
  mongoose.connect(process.env.MONGO_URL);
  const userData = await getUserDataFromReq(req);
  res.json(await Booking.find({user:userData.id}).populate('place') );
});
  
// app.listen(4000);
const port = 4000
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});