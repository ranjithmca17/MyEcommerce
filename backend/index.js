const port = 4000;
import express from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import multer from 'multer';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
import { Products } from './models/productSchema.js';
import User from './models/userSchema.js';
import { error } from 'console';
dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO)
.then(()=>{
    console.log('MongoDb connected')
})
.catch((err)=>{
    console.log(err)
})


app.get('/', (req,res)=>{
    res.json("hellooooooooooooooo")
})

const storage = multer.diskStorage({
    destination: './uploads/images',
    filename: (req, file,cb)=>{
  return cb(null, `${file.filename}_${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({storage: storage});
app.use('/images', express.static('uploads/images'));
app.post('/upload',upload.single('product'), async(req,res)=>{
  res.json({
    success: 1,
    image_url: `http://localhost:${port}/images/${req.file.filename}`
  })
});

app.get("/", async (req, res) => {
    try {
      // Sending a success response if everything works fine
      res.json({ success: true, message: "API is working successfully" });
    } catch (error) {
      // Logging the error to the console for debugging
      console.error("Error:", error);
      
      // Sending an error response to the client
      res.status(500).json({ success: false, message: "Error occurred", error: error.message });
    }
  });
  
app.post('/add-product', async(req,res)=>{
    try {
       let products = await Products.find({});
       let id;
       if(products.length > 0){
        let last_product_array = products.slice(-1);
        let last_product = last_product_array[0];
        id = last_product.id + 1;
       }else{
        id = 1;
       }
        const product = new Products({
            id: id,
            name: req.body.name,
            image: req.body.image,
            category: req.body.category,
            new_price: req.body.new_price,
            old_price: req.body.old_price
        });

        console.log(product)
      const saved = await product.save()

      res.json({success: true, name: req.body.name})
    } catch (error) {
        console.log(error.message)
    }
});

app.post('/removeproduct', async(req, res)=>{
    await Products.findOneAndDelete({_id: req.body.id});
    console.log("Removed");
    res.json({
        success: true,
        name: req.body.name
    })
})

app.get('/allproducts', async(req, res)=>{
    let products = await Products.find({});
    console.log("all products fetched");
    console.log(products)
    res.send(products)
})

app.post('/signup', async(req, res)=>{
try {

    console.log(req.body)
    let check = await User.findOne({email: req.body.email});

    if(check){
        return res.status(400).json({success: false, error: "existing user found with same email Id !"});
    }
    let cart = {};
    for (let i = 0; i < 300; i++) {
        cart[i] = 0;        
    }

    const user = new User({
        name: req.body.username,
        email: req.body.email,
        password: req.body.password,
        cartData: cart
    })

    await user.save();

    const data = {
        user: {
            id: user.id
        }
    }

    const token = jwt.sign(data, 'secret_ecommerce');

    res.json({success: true, token});
} catch (error) {
    console.log(error.message)
}
})

app.post('/login', async(req, res)=>{
    let user = await User.findOne({email: req.body.email});

    if(user){
        let passVerify = req.body.password === user.password;

        if(passVerify){
            const data = {
                user: {
                    id: user.id
                }
            }

            const token = jwt.sign(data, 'secret_ecommerce');

            res.status(200).json({success: true, token})
        }else{
            res.status(400).json({success: false, error: "Wrong password !"});
        }
    }else{
        res.status(400).json({success: false, error: "Wrong email id"});
    }
})

app.get('/newcollections', async(req, res)=>{
    try {
        let product = await Products.find({});
        let newCollection = product.slice(1).slice(-8);
        console.log("New Collection fetched");

        res.json(newCollection)
    } catch (error) {
        console.log(error.message)
    }
})

app.get('/popularinwomen', async(req, res)=>{
   try {
    let products = await Products.find({category: "women"});
    let popular_in_women = products.slice(0, 4);
    console.log("Popular in women fetched");
    res.json(popular_in_women)
   } catch (error) {
    console.log(error.message)
   }
})

const fetchUser = async(req, res, next)=>{
   try {
    const token = req.header('auth-token');
    if(!token){
        res.status(401).send({error: "Please authenticate using valid token."})
    }else{
        try {
            const data = jwt.verify(token, 'secret_ecommerce');
            req.user = data.user;
            next();
        } catch (error) {
            res.status(401).send({errors: "Please authenticate using a valid token"});
        }
    }
   } catch (error) {
    console.log(error.message)
   }
}


app.post('/addtocart',fetchUser, async(req, res)=>{
   try {
    console.log("Added", req.body.itemId);

    let userData = await User.findOne({_id: req.user.id});
    userData.cartData[req.body.itemId] += 1;
   // console.log(userData.cartData)
    const updated  = await User.findOneAndUpdate({_id: req.user.id}, {cartData: userData.cartData});
    if(updated){
        res.send("Added to cart");
    }else{
        console.log("Failed updating cart");
    }
   } catch (error) {
    console.log(error.message)
   }
})

app.post('/removefromcart', fetchUser, async(req, res)=>{
    try {
        console.log("Removed", req.body.itemId);
        let userData = await User.findOne({_id: req.user.id});
        if(userData.cartData[req.body.itemId] > 0){
            userData.cartData[req.body.itemId] -= 1;
        }
     const updated =  await User.findOneAndUpdate({_id: req.user.id}, {cartData: userData.cartData});

     if(updated){
  res.send(removed);
     }else{
        console.log("Failed tto remove product from the cart");
     }
    } catch (error) {
        console.log(error.data)
    }
})

app.listen(port, ()=>{
    console.log('Server is running on port 4000!!!');
});

