const  express=require("express");
const path=require("path");
const app=express();
const {listingSchema,reviewSchema}=require("./schema.js");

const mongoose=require("mongoose");
const listingmodels=require("./models/listing.js");
const ejs_mate=require("ejs-mate");
const method_override=require("method-override");
const session=require("express-session");
const flash=require("connect-flash");


const passport=require("passport");
const LocalStrategy=require("passport-local");
const reviews=require("./models/review.js");
const user=require("./models/usermodel.js");


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


main()
.then(()=>
{
    console.log("sucessfull connected");
}).catch((err)=>{
    console.log(err);}
);

async function main(){
    await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
}


app.use(
    session({
        secret: "mysuperkey", // Replace with your actual secret
        resave: false,
        saveUninitialized: true,
        cookie:{
            expires:Date.now()+1000*60*60*24*7,
            maxAge:1000*60*60*24*7,
            httpOnly:true
        },
}));
app.use(flash());
app.use(passport.initialize);
app.use(passport.session);


passport.use(new LocalStrategy(
    // function(username, password, done) {
    //   user.findOne({ username: username }, function (err, user) {
    //     if (err) { return done(err); }
    //     if (!user) { return done(null, false); }
    //     if (!user.verifyPassword(password)) { return done(null, false); }
    //     return done(null, user);
    //   });
    // } 
user.authenticate()));

passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());
app.use((req,res,next)=>
{
 res.locals.success=req.flash("success");
 res.locals.error=req.flash("error");
next();
});




//home route
app.get("/",(req,res)=>
{
    res.send("home page");
});

// demouser
app.get("/demo",async(req,res)=>
{
    let fakeuser=new user({
        email:"amlansahoo@gmail.com",
        username:"amlan"
    });
    let newuser=await user.register(fakeuser,"amlan2003");
    res.send(newuser);
});
//index route
app.get("/listing", async(req,res,next)=>
{
   const alllisting=await listingmodels.find({});
   res.render("index.ejs",{alllisting});
});

//new route
app.get("/listing/new",async(req,res)=>
    {
        res.render("new.ejs")
    });

//show route
app.get("/listing/:id",async(req,res) => {
    let {id}=req.params;
    const listing=await listingmodels.findById(id).populate("reviews");
    if(!listing)
    {
        req.flash("error","Sorry listing doesn't found");
        res.redirect("/listing");
    }
    res.render("show.ejs",{listing});
});



//edit route
app.post("/listing",wrapAsync(async(req,res,next)=>
{
    let result=listingSchema.validate(req.body);
    if(result.error){
        throw new ExpressError(400,result.error);
    }
    if(!req.body.listing){
        throw new ExpressError(400,"send valid data for listing");

    }
        const newlisting = new listingmodels(req.body.listing);
        req.flash("success","New listing is Added");
    if(!newlisting.description)
        {
            throw new ExpressError(400,"description is missing");
        }
    if(!newlisting.title)
        {
            throw new ExpressError(400,"title is missing");
        }
    if(!newlisting.location)
        {
            throw new ExpressError(400,"location is missing");
        }
    if(!newlisting.country)
        {
                throw new ExpressError(400," country is messsing");
        }
    await newlisting.save();
    res.redirect("/listing");
    
}));

//update route
app.get("/listing/:id/edit",wrapAsync(async(req,res)=>
{
    let {id}=req.params;
    const listing=await listingmodels.findById(id);
    req.flash("success","listing is Edited");
    res.render("edit.ejs",{listing});
   
}));
app.put("/listing/:id",async(req,res)=>
{
    let {id}=req.params;
    await listingmodels.findByIdAndUpdate(id,{...req.body.listing});
    req.flash("success","listing is Edited");
    res.redirect(`/listing/${id}`);
});
//delete route
app.delete("/listing/:id",wrapAsync(async(req,res)=>{
    let {id}=req.params;
    await listingmodels.findByIdAndDelete(id);
    req.flash("success","listing is deleted");
    res.redirect("/listing");
}));


app.post("/listing/:id/reviews",validatereviews,wrapAsync(async(req,res)=>
{
    let {id}=req.params;
    let listing=await listingmodels.findById(id);
    let newreview=new reviews(req.body.review);
    listing.reviews.push(newreview);
    await newreview.save();
    await listing.save();
    console.log("data save");
    req.flash("success","New review added");
    res.redirect(`/listing/${id}`);
}));

app.delete("/listing/:id/reviews/:reviewId",async(req,res)=>
{
    let{ id,reviewId}=req.params;
    await listingmodels.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
    await reviews.findByIdAndDelete(reviewId);
    req.flash("success","New review deleted");
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