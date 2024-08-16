//packagess
if(process.env.NODE_ENV!="production")
{
    require("dotenv").config();
}
console.log(process.env.SECRET);
const  express=require("express");
const path=require("path");
const app=express();
const mongoose=require("mongoose");
const ejs_mate=require("ejs-mate");
const method_override=require("method-override");
const session=require("express-session");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const flash=require("connect-flash");
const multer=require("multer");
const {storage}=require("./cloudConfig.js");
const upload=multer({storage});
const MongoStore=require("connect-mongo");



const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken=process.env.MAP_TOKEN;
const geocodingClient=mbxGeocoding({accessToken:mapToken});



//models and middleware
const {listingSchema,reviewSchema}=require("./schema.js");
const listingmodels=require("./models/listing.js");
const reviews=require("./models/review.js");
const user=require("./models/usermodel.js");
const {isloggedIn}=require("./middleware.js");
const {saveRedirectUrl}=require("./middleware.js");



//express errors
function wrapAsync(fn){
    return(req,res,next)=>
    {
        fn(req,res,next).catch(next);
    };
};
class ExpressError extends Error
{
    constructor(statusCode,message){
        super();
        this.statusCode=statusCode;
        this.message=message;
    }
}



//validation of database
const validatelisting=(req,res,next)=>
{
    let {error}=listingSchema.validate(req.body.listing);
    if(error){
        let errMsg=error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errMsg);
}
else{
    next();
}};




const validatereviews=(req,res,next)=>
    {
        let {error}=reviewSchema.validate
    (req.body);
    if(error){
        let errMsg=error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errMsg);
    
    }
    else{
        next();
    }};
    


app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(method_override("_method"));
app.engine('ejs',ejs_mate);
app.use(express.static(path.join(__dirname,"/public")))

const url=process.env.ATLAS_DB;
main()
.then(()=>
{
    console.log("sucessfull connected");
}).catch((err)=>{
    console.log(err);}
);

async function main(){
    await mongoose.connect(url);
}
const store=MongoStore.create({
    mongoUrl:url,
    crypto:{
        secret:"mysupersecretcode",

    },
    touchAfter:24*3600,

});
store.on("error",()=>{
    console.log("something went wrong");
});

const sessionoption={
    store,
    secret:"mysupersecretcode",
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires:Date.now()+7*24*60*60*1000,
        maxAge:7*24*60*60*1000
    }
};
app.use(session(sessionoption));
app.use(flash());
// app.use((req,res,next)=>
// {
//     res.locals.success=req.flash("success");
//     res.locals.error=req.flash("error");
//     res.locals.currUser=req.user;
//     next();
// });
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(user.authenticate()));

passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());
app.use((req,res,next)=>
    {
        res.locals.success=req.flash("success");
        res.locals.error=req.flash("error");
        res.locals.currUser=req.user;
        next();
});
app.get("/",(req,res)=>
{
    res.render("home.ejs");
});
//signup
app.get("/signup",(req,res)=>
{
 res.render("user/signup.ejs");   
});



app.post("/signup",async(req,res)=>
{ 
    try{
    let{username,email,password}=req.body;
    const newuser=new user({username,email});
    const Newuser=await user.register(newuser,password);
    req.login(Newuser,(err)=>
    {
        if(err){
            return next(err);
        }
        req.flash("success","User Successfully login Also");
        res.redirect("/listing",);
    });
    } catch(e)
    {
        req.flash("error",e.message);
        res.redirect("/signup");
    }    
});



//login
app.get("/login",(req,res)=>
{
    res.render("user/login.ejs");
});
app.post("/login",saveRedirectUrl,passport.authenticate("local",{failureRedirect:"/login",failureFlash:true}),async(req,res)=>
    {  
        if(res.locals.redirectUrl)
        {req.flash("success","Welcome back to wanderlust");
        res.redirect(res.locals.redirectUrl);
        return;
        }
        req.flash("success","Welcome back to wanderlust");
        res.redirect("/listing");
    });



//logout
app.get("/logout",(req,res)=>
{
    req.logOut((err)=>{
          if(err)
          {
             return next();
          }
          req.flash("success","you are successfully logout");
          res.redirect("/listing");
});
});


//index route
app.get("/listing", async(req,res,next)=>
{
   const alllisting=await listingmodels.find({});
   res.render("index.ejs",{alllisting});
});


//new route
app.get("/listing/new",isloggedIn,async(req,res)=>
    {
        res.render("new.ejs")
    });


//show route
app.get("/listing/:id",isloggedIn,async(req,res) => {
    let {id}=req.params;
    const listing=await listingmodels.findById(id).populate({path:"reviews",populate:{path:"author"}
    }).populate("owner");
    res.render("show.ejs",{listing});
});



//edit route
app.post("/listing",isloggedIn,upload.single("listing[image]"),async(req,res,next)=>
{
    let response=await geocodingClient.forwardGeocode({
        query:req.body.listing.location,
        limit: 1
        }).send();
    let url=req.file.path;
    let filename=req.file.filename;
    
        const newlisting = new listingmodels(req.body.listing);
        newlisting.owner=req.user._id;
        newlisting.image={url,filename};
        newlisting.geometry=response.body.features[0].geometry;
        let newcoordinates=await newlisting.save();
        console.log(newcoordinates);
        req.flash("success","new listing is Added");
        res.redirect("/listing");
    
});


//update route
app.get("/listing/:id/edit",wrapAsync(async(req,res)=>
{
    
    let {id}=req.params;
    const listing=await listingmodels.findById(id);
    res.render("edit.ejs",{listing});
   
}));
app.put("/listing/:id",isloggedIn,upload.single("listing[image]"),async(req,res)=>
{
    let {id}=req.params;
   
    let listing1=await listingmodels.findById(id);
    if(!listing1.owner._id.equals(req.user._id))
    {
        req.flash("error","you don't have permission to edit");
        return res.redirect(`/listing/${id}`);
    }
    const listing=await listingmodels.findByIdAndUpdate(id,{...req.body.listing});
    if(typeof req.file!=="undefined")
   {
    let url=req.file.path;
    let filename=req.file.filename;
    listing.image={filename,url};
    await listing.save();
   }
   req.flash("success","listing is updated");
    res.redirect(`/listing/${id}`);
});



//delete route
app.delete("/listing/:id",isloggedIn,wrapAsync(async(req,res)=>{
    let {id}=req.params;
    
    let listing=await listingmodels.findById(id);
    if(!listing.owner._id.equals(req.user._id))
    {
        req.flash("error","you don't have permission to delete");
        return res.redirect(`/listing/${id}`);
    }
    await listingmodels.findByIdAndDelete(id);
    req.flash("success","listing is delete");
    res.redirect("/listing");
}));



//review routes
app.post("/listing/:id/reviews",isloggedIn,validatereviews,wrapAsync(async(req,res)=>
{
    let {id}=req.params;
    let listing=await listingmodels.findById(id);
    let newreview=new reviews(req.body.review);
    newreview.author=req.user._id;
    listing.reviews.push(newreview);
    await newreview.save();
    await listing.save();
    console.log("data save");
    req.flash("success","review is added");
    res.redirect(`/listing/${id}`);
}));

app.delete("/listing/:id/reviews/:reviewId",async(req,res)=>
{
    let{ id,reviewId}=req.params;
    let review=await reviews.findById(reviewId);
    if(!review.author._id.equals(req.user._id))
        {
            req.flash("error","you don't have permission to delete");
            return res.redirect(`/listing/${id}`);
        }
    await listingmodels.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
    await reviews.findByIdAndDelete(reviewId);
    req.flash("success","review is deleted");
    res.redirect(`/listing/${id}`);

});




//error middlewares
app.all("*",(req,res,next)=>
{
    next(new ExpressError(404,"page not found"));

});
app.use((err,req,res,next)=>
{
    let {statusCode=500,message="something went wrong"}=err;
    res.render("error.ejs",{message});
});
app.listen(8000,()=>
{
    console.log("app is listening");
});
