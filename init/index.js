
const initdata=require("./data.js");
const mongoose=require("mongoose");
const listingmodels=require("../models/listing.js");
const url=process.env.ATLAS_DB;
console.log(url);
main()
.then(()=>
{
    console.log("sucessfull connected");
}).catch((err)=>{
    console.log(err);}
);
async function main(){
    await mongoose.connect("mongodb+srv://amlansahoo4feb:Y7wfVdZ4Unmaj04i@cluster0.yvgaw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");
}
const initdb= async()=>{
    await listingmodels.deleteMany({});
    initdata.data=initdata.data.map((obj)=>(
        {...obj,owner:'66bfa4bf321b75e0cf1568ed'}
    ));
    await listingmodels.insertMany(initdata.data);
    
    let models= await listingmodels.find({});
    console.log(models);
}
initdb();
