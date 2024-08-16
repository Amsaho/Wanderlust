const mongoose=require("mongoose");
const passport=require("passport-local-mongoose");
const Schema=mongoose.Schema;
const userSchema=new Schema({
    email:{
        type:String,
        required:true
    }
});
userSchema.plugin(passport);
const user=mongoose.model("user",userSchema);
module.exports=user;

