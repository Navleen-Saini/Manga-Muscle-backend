//Name: Navleen Saini
//StudID: 3176358

const express = require('express');
const path = require('path');
const cors = require('cors');
const User = require('./models/ContactModels')
const mongoose = require('mongoose');
const {MONGODB} = require("./credentials");
const bcrypt = require('bcrypt');
//const cookieParser = require('cookie-parser');
const session = require('express-session');
const { default: MongoStore } = require('connect-mongo');

const app = express();
const PORT = 3001;

//Remeber to transfer these to some other secret file
const saltRounds = 10;
const cookieSecret = 'iLoveBeeroAndItIsAtopSecret';

const MONGODB_URI = `mongodb+srv://${MONGODB.user}:${MONGODB.login}@${MONGODB.cluster}?retryWrites=true&w=majority`;
mongoose.connect(MONGODB_URI).then( ()=> {
    console.log("Connected to Mongo");
}).catch( (err) => {
    console.error("MONGO CONNECTION ERROR: ", err);
});

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors()); //for cross platform communication Node with React

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');  
//app.use(cookieParser(cookieSecret));

app.use(express.static(path.join(__dirname, 'Front-End')));

app.use(session({
    secret: cookieSecret,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        client: mongoose.connection.getClient(),
        collectionName: 'sessions'
    }),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 3,
        httpOnly: true,
        secure: false
    }
}));

//Helper Function for Authentication purposes
const isAuthenticated = (req, res, next) => {
    if(req.session.userId){
        next();
    } else {
        res.redirect('/login');
    }
};

//Session routes to remeber last visited exercise
//getting the muscle group and saving it in sessoin cookie
app.get('/exercise', (req, res) => {
    const muscle = req.query.muscle;

    if (muscle) {
        req.session.last_muscle_group = muscle; 
        console.log(`Session updated. Last muscle: ${req.session.last_muscle_group}`);
    }
    
    res.sendFile(path.join(__dirname, '/Front-End/exercise.html')); 
});
 
//calling api to get last visited muscle group
app.get('/api/session-data', (req, res) => {
    const lastMuscle = req.session.last_muscle_group || null;

    res.json({
        last_muscle_group: lastMuscle
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname,'/Front-End/index.html'));
    console.log(`Client connected, serving index.html`);
});

app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, '/Front-End/login.html'));
});

app.post("/login", async (req, res) => {
    try{
        const {email, password} = req.body;

        if(!email || !password){return res.status(400).json({error: "Email and password are required to login"});}

        const user = await User.findOne({email});

        if(!user){return res.status(401).json({error: "Invalid Credentials"});}

        //First confirming the password
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){return res.status(401).json({error: 'Incorrect password'});}

        //Saving info cookie
        req.session.userId = user._id;
        res.status(200).json({message: "Login succesful", userId: user._id});
    } catch (err) {
        console.error(err);
        next(err);
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if(err) {
            return res.redirect('/dashboard');
        }
        res.clearCookie('connect.sid');
        res.redirect('/');
    });
});

app.get("/registration-form", (req, res) => {
    res.sendFile(path.join(__dirname,'/Front-End/RegForm.html'));
});

app.post('/register', async (req, res, next) => {
    try{
        const { name, email, password, planId, currency, planPrice } = req.body;

        let cleanedPlanPrice = planPrice;
        if (typeof planPrice === 'string') {
            cleanedPlanPrice = planPrice.replace(/,/g, ''); 
        }
        const priceValue = parseFloat(cleanedPlanPrice);

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'All fields (Name, Email, Password) are required.' });
        }

        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const existingUser = await User.findOne({ email });

        if(existingUser){
            return res.status(409).json({ error: 'User with this email already exists.' });
        }

        const newUser = new User( { name, email, password: hashedPassword, planId, currency, planPrice: priceValue } );
        await newUser.save();

        res.status(201).json({message: `User ${email} registered succesfully`});
    } catch (error) {
        console.error(error);
        //Using our cusotm error500 handler
        next(error);
    }
});

app.get("/registration-plans", (req, res) => {
    res.sendFile(path.join(__dirname, '/Front-End/regPlans.html'));
})
.post("/register-plan", (req, res) => {
    res.status(200);
});

app.get("/contacts", isAuthenticated, async (req, res, next) => {
    try{
        const users = await User.find().lean();
        console.log(users);
        //if(!users) return next();
        res.render('contacts', {users, title: 'RegisteredUsers'});
    } catch (err) {
        console.error(err);
        next(err);
    }
});

app.post("/contacts", async (req, res, next) => {
    try{
        const {name, email, password, planId, currency, planPrice } = req.body;

        let cleanedPlanPrice = planPrice;
        if (typeof planPrice === 'string') {
            cleanedPlanPrice = planPrice.replace(/,/g, ''); 
        }
        const priceValue = parseFloat(cleanedPlanPrice);


        if(!name || !email || !password){
            return res.status(400).json({error: "All fields msut be filled mandatory"});
        }

        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const existingUser = await User.findOne({email});

        if(existingUser){
            return res.status(409).json({error: "User with this email already exists"});
        }

        const newUser = new User({ name, email, password: hashedPassword, planId, currency, planPrice: priceValue});
        await newUser.save();
        res.status(201).json(newUser);
    } catch(err) {
        console.error(err);
        next(err);
    }
});

app.get('/contacts/:id', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).lean();
    if (!user) return next();

    res.render('contact', {user, title: user.name});
  } catch (err) {
    console.error(err);
    next(err);
  }
});

app.put("/contacts/:id", async (req, res, next) => {
    try{
        const userId = req.params.id;
        const updatedData = req.body;

        if(updatedData.password) {
            updatedData.password = await bcrypt.hash(updatedData.password, saltRounds);
        }
        let updatedUser = await User.findByIdAndUpdate(userId, updatedData, {new: true, runValidators: true});

        if(updatedUser){
            res.status(200).json(updatedUser);
        } else {
            return next();
        }
    } catch(err){
        console.error(err);
        next(err);
    }
});

app.delete("/contacts/:id", async (req, res, next) => {
    try{
        const userId = req.params.id;
        let deletedUser = await User.findByIdAndDelete(userId);

        if(deletedUser){
            res.status(200).json(deletedUser);
        } else {
            return next();
        }
    } catch(err){
        console.error(err);
        next(err);
    }
});

app.get("/test-500", (req, res, next) => {
    throw new Error('Forced Server Crash for 500 Test');
});

app.use((err, req, res, next) => {
    if(res.headersSent){
        return next(err);
    }
    console.error(err.stack);
    res.status(500);
    res.sendFile(path.join(__dirname, "/Front-End/err500.html"));
});

app.use((req, res, next) => {
    if (res.headersSent){
        return;
    }
    res.status(404);
    res.sendFile(path.join(__dirname, "/Front-End/err404.html"));
});

app.listen(PORT, () => {
    console.log(`Server is running! Access at http://localhost:${PORT}`);
});
