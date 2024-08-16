const mongoose=require("mongoose");
const Schema=mongoose.Schema;
const Review=require("./review.js");
const listingSchema=new Schema({
  title:{
    type:String,
    required:true},

  description:{
    type:String,
    requried:true},
  image:String,
  price:{
    type:Number,
    required:true},
  location:{
    type:String,
    required:true},
  country:{
    type:String,
    required:true},
  reviews:[{
    type:Schema.Types.ObjectId,
    ref:"reviews"
  }]
});
listingSchema.post("findOneAndDelete",async(listing)=>
{
  await Review.deleteMany({_id:{$in:listing.reviews}});
});
const listingmodels=mongoose.model("listingModels",listingSchema);
module.exports= listingmodels;