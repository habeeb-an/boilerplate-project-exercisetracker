const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const bodyparser=require('body-parser')

app.use(bodyparser.urlencoded({extended:true}))
app.use(bodyparser.json())

const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI, {
   useNewUrlParser: true,
   useUnifiedTopology: true
});


//userSchema

const userSchema=new mongoose.Schema({
  username:{type:String,required:true}
})
//Schemas
let exerciseSchema=new mongoose.Schema({
  userId: {type:String,required:true},
  description: {type:String,required:true},
  duration: {type:Number,required:true},
  date: {type:Date,default:new Date()}
  
})



let Exercise=mongoose.model("Exercise",exerciseSchema)
let User=mongoose.model("User",userSchema)

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

//username and id
app.post("/api/users",(req,res)=>{
  let username=req.body.username;
  console.log(req.body);
const newUser=new User({
  username:username
})
newUser.save((err,data)=>{
  if(err){
    return console.log(err)}
    else{
      res.json(data)
    }
  })
})
//get a list of all users.
app.get("/api/users",(req,res)=>{
  User.find({},(err,array)=>{
    if(!err){
      res.json(array)
    }
  })
})



//post for exercise
app.post("/api/users/:_id/exercises",(req,res)=>{

console.log(req.body);
let userId=req.params._id;
let exerciseObj={
  userId:userId,
  description:req.body.description,
  duration:req.body.duration,
  date:req.body.date
}
let newExercise=new Exercise(exerciseObj)
User.findById(userId,(err,data)=>{
  if(err) console.log(err);

  newExercise.save();
  res.json({
    _id:data._id,
    username:data.username,
    description:newExercise.description,
    duration:newExercise.duration,
    date:newExercise.date.toDateString()
  })

})
})
/*
console.log(`req.body`,req.body)
let {description,date}=req.body
let newExercise=new Exercise({
  description,
  duration:parseInt(req.body.duration),
  date:new Date(date)
})

User.findById(req.params._id,
  (err,updatedUser)=>{
    if(!err){
      newExercise.save();
    let responceObject={}
    responceObject['_id']=updatedUser.id
    responceObject['username']=updatedUser.username
    responceObject['date']=newExercise.date.toDateString()
    responceObject['description']=newExercise.description
    responceObject['duration']=newExercise.duration
    res.json(responceObject)
    }
  }) 
})
*/


//log
app.get('/api/users/:_id/logs',(req,res)=>{
let id=req.params._id


let limit=parseInt(req.query.limit)
let toParam=req.query.to;
let fromParam=req.query.from;




  User.findById(id,(err,result)=>{
    if(err){console.log(err)}
    let userId=result._id;
    let username=result.username;
    let responseObject={_id:userId,username:username}


    let queryObj={userId:userId}
if(fromParam|| toParam){
  queryObj.date={};
}
if (fromParam){
  queryObj.date['gte']=fromParam;
}
if(toParam){
  queryObj.date['lte']=toParam;
}
    
    
  
  Exercise.find({userId}).limit(limit).exec((err,exercises)=>{
    if(err) console.log(err);


    responseObject.log=exercises.map((x)=>{
      return{
      description:x.description,
      duration:x.duration,
      date:x.date.toDateString()
    }

    })
    responseObject.count = exercises.length;
  
    res.json(responseObject)
  })
    
  })

})








const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})

