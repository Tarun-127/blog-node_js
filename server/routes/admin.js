const express  = require('express');
const router = express.Router();
const post = require('../models/post')
const User = require('../models/user')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const adminLayout = '../views/layouts/admin';
const jwtSecret = process.env.JWT_SECRET;

/**
 * GET /
 * check-login
*/
const authMiddleware = (req,res,next) => {
    const token  = req.cookies.token;
    if(!token){
        return res.status(401).json({message: 'unauthorized'});
    }

try{
    const decoded = jwt.verify(token, jwtSecret)
    req.userId = decoded.userId;
    next()
  } catch(error){
    res.status(401).json({message:'unauthorized'})
    }
}
/**
 * GET /
 * admin-login page
*/
router.get('/admin',async (req,res)=>{
try {
    const locals = {
        title:"Admin",
        description:"Simple blog created With NOde js"
    } 
 
    res.render('admin/index', {
        locals ,
        layout:adminLayout
    })
} catch (error) {
    console.log(error);
}
});
/**
 * GET /
 * admin- check login
*/
router.post('/admin',async (req,res)=>{
    try {
        const{ username,password } = req.body
        const user = await User.findOne({ username })
        if(!user){
            return res.status(401).json({ message: 'Invalid Credentials ' })
        }
        const isPasswordValid = await bcrypt.compare(password,user.password);
        if(!isPasswordValid){
            return res.status(401).json({ message: 'Invalid password'})
        }
        const token = jwt.sign({ userId: user._id}, jwtSecret)
        res.cookie('token', token, {httpOnly: true})

        res.redirect('/dashboard')
     
        
    } catch (error) {
            console.log(error);
         }
    });
/**
 * GET /
 * admin- dashboard
 * 
*/
router.get('/dashboard',async (req,res)=>{


try {
    const locals = {
        title:"Admin",
        description:"Simple blog created With NOde js"
    }
    const data = await post.find();
    res.render('admin/dashboard',{
        locals,
        data,
        layout:adminLayout
    });
    
} catch (error) {
    
}
    res.render('admin/dashboard');

});
/**
 * GET /
 * admin-creat new post
 * 
*/
router.get('/add-post',authMiddleware, async (req,res)=>{


    try {
        const locals = {
            title:"Add Post",
            description:"Simple blog created With NOde js"
        }
        const data = await post.find();
        res.render('admin/add-post',{
            locals,
            
            layout:adminLayout
        });
        
    } catch (error) {
        
    }
        res.render('admin/dashboard');
    
    });
/**
 * POST /
 * Admin - Create New Post
*/
router.post('/add-post', authMiddleware, async (req, res) => {
    try {
      try {
        const newPost = new post({
          title: req.body.title,
          body: req.body.body
        });
  
        await post.create(newPost);
        res.redirect('/dashboard');
      } catch (error) {
        console.log(error);
      }
  
    } catch (error) {
      console.log(error);
    }
  });
/**
 * PUT /
 * Admin - Create New Post
*/
router.put('/edit-post/:id', authMiddleware, async (req, res) => {
    try {
  
      await post.findByIdAndUpdate(req.params.id, {
        title: req.body.title,
        body: req.body.body,
        updatedAt: Date.now()
      });
  
      res.redirect(`/edit-post/${req.params.id}`);
  
    } catch (error) {
      console.log(error);
    }
  
  });
/**
 * GET /
 * Admin - Create New Post
*/
router.get('/edit-post/:id', authMiddleware, async (req, res) => {
    try {
  
      const locals = {
        title: "Edit Post",
        description: "Free NodeJs User Management System",
      };
  
      const data = await post.findOne({ _id: req.params.id });
  
      res.render('admin/edit-post', {
        locals,
        data,
        layout: adminLayout
      })
  
    } catch (error) {
      console.log(error);
    }
  
  });
/**
 * GET /
 * admin- register
*/
router.post('/register',async (req,res)=>{
    try {
        const { username, password} = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        try {
            const user = await User.create({ username, password:hashedPassword });
            res.status(201).json({ message: 'User Created', user });
          } catch (error) {
            if(error.code === 11000) {
              res.status(409).json({ message: 'User already in use'});
            }
            res.status(500).json({ message: 'Internal server error'})
          }
      
        } catch (error) {
          console.log(error);
        }
      });
/**
 * DELETE /
 * Admin - Delete Post
*/
router.delete('/delete-post/:id', authMiddleware, async (req, res) => {

    try {
      await post.deleteOne( { _id: req.params.id } );
      res.redirect('/dashboard');
    } catch (error) {
      console.log(error);
    }
  
  });
/**
 * GET /
 * Admin Logout
*/
router.get('/logout', (req, res) => {
    res.clearCookie('token');
    //res.json({ message: 'Logout successful.'});
    res.redirect('/');
  });
  
  
     
module.exports = router;




// router.post('/admin',async (req,res)=>{
    //     try {
    //         const{ username,password } = req.body
    //         if(req.body.username === 'admin' && req.body.password === 'password'){
    //             res.send('you are logged in.')
    //         }else{
    //             res.send("wrong username or password");
    //         }
         
            
    //     } catch (error) {
    //         console.log(error);
    //     }
    //     });
    