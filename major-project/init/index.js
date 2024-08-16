
const intdata=require("./data.js");
const mongoose=require("mongoose");
const listingmodels=require("../models/listing.js");
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
const initdb= async()=>{
    await listingmodels.deleteMany({});
    await listingmodels.insertMany(intdata.data);
    let models= await listingmodels.find({});
    console.log(models);
}
initdb();