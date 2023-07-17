const session = require('express-session');
const {collection1,collection2} = require('../../model/mongodb');
const { ObjectId } = require('mongodb');
const bcrypt = require("bcrypt")

//============================= middleware to check the if session is existing or not ================//
exports.sessionChecker = (req, res, next)=> {
      if(!req.session.userId){
            res.redirect('/')
      }else{
            next()
      }
}


//========================== inserting data to database===================================//
exports.registerUser = async (req, res) => {
      try{
            // hashing the passowrd using bcrypt
            const hashedPassword = await bcrypt.hash(req.body.password,10)
            const data = {
                name:  req.body.name,
                email : req.body.email,
                password : hashedPassword
            }

            //giving data to mongoDB
            await collection1.insertMany([data])
            // console.log(data)
            res.redirect('/')

      }
      catch(err){
            console.log(err)
            res.redirect('/register')
      }
}


//=========================== validating login credentials before login ==========================//
exports.loginUser = async (req, res)=> {
    try{
            const check = await collection1.findOne({email:req.body.email})
            req.session.userId = check._id;
            const userId = req.session.userId
            bcrypt.compare(req.body.password,check.password)
            .then(doMatch=>{
                if(doMatch ){
                    res.redirect('/todoPage')
               } else{
                     res.send("Wrong passoword")
               }
       })
    }
    catch(err){
        res.send('Wrong details')
       }
          
}



//=============================== adding new todo to database ============================//
exports.addNewTodo = async(req, res)=> {
      try{
            userId=req.params.id
            const data = await collection2.find({userId : userId})
            const todo={
                userId: userId,
                name:  req.body.name,
                place : req.body.place,
                phone : req.body.phone
            }

            //giving data to mongoDB
            await collection2.insertMany([todo])
            // console.log(todo)
           
            res.redirect(`/add_todo/${userId}`)

      }
      catch(err){
            console.log(err)
            res.redirect(`/add_todo/${userId}`)
      }
}


//========================== updating existing todos ==========================//
exports.update_Todo = async(req, res) => {
      const todoId = req.params.id;
      console.log(req.body)
      console.log(todoId)
      const update = { $set: {name:req.body.name, place:req.body.place, phone:req.body.phone} };

      await collection2.updateOne({_id: new ObjectId(todoId)}, update)
       .then(result => {
            // console.log('Document updated successfully');
            // console.log(result.modifiedCount); // Number of documents modified
            res.status(200).send('<script>alert(Data Updated Successfully!);</script>')
          })
          .catch(error => {
            console.error('Failed to update document:', error);
          });
}


//==================== delete todo ===========================//
exports.deleteTodo = async(req, res)=> {
      const todoId = req.params.id;
      console.log('Reached the delete route')

       await collection2.deleteOne({_id:new ObjectId(todoId)})
       .then(result => {
            // console.log("Document deleted successfully")
            // console.log(result.modifiedCount)
            res.status(200).send('<script>alert(Data deleted Successfully!);</script>')
       })
       .catch(error => {
            console.error('Failed to update document' , error);
       })
}