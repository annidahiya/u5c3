const express = require("express");
const {v4}= require("uuid");
const fs=require("fs")

const app = express();

app.use(express.urlencoded({ extended: true }))
app.use(express.json())


app.post("/user/create", (req,res) => {
    var newuser = req.body;
    newuser = { ...newuser, id: v4() }
    fs.readFile("./db.json", (err, data) => {
        const parsed = JSON.parse(data);
        parsed.users = [...parsed.users, newuser];
      const id=newuser.id
        fs.writeFile("./db.json", JSON.stringify(parsed),{encoding:"utf-8"}, () => {
            res.status(201).send({status:"user created",id})
        })

        // res.send("data added")
    })

    console.log("its coming")
})

app.post("/user/login", (req, res) => {

    const {username,password}=req.body
    console.log(username,password)
    if (username==undefined || password==undefined) {
        return res.status(400).send({status:"please provide username and password"})
    }

    fs.readFile("./db.json", { encoding: "utf-8" }, (err, data) => {
        const parsed = JSON.parse(data);
        const arr = parsed.users;
        const find = arr.filter((elm) => elm.username == username && elm.password == password);
        if (find.length ==0) {
            return res.status(401).send({ status: "Invalid Credentials" })
        } else {
            const id = find[0].id;
            const token = v4();
            
            var trr=arr.map((elm) => elm.id === id ? { ...elm, token } : elm);
            parsed.users=trr
            fs.writeFile("./db.json", JSON.stringify(parsed), { encoding: "utf-8" }, () => {
                res.send({ status: "Login Successful", token })
            })
            
        }
    })
    
})

app.post("/user/logout", (req, res) => {
    const query = req.query;
  console.log(query)
    fs.readFile("./db.json", { encoding: "utf-8" }, (err, data) => {
        const parsed = JSON.parse(data);
        var arr = parsed.users;
        var ar = arr.map((elm) => {
            if (elm.token === query.apiKey) {
                obj = {};
                for (var x in elm) {
                    if (x !== "token") {
                        obj[x]=elm[x]
                    }
                }
                return obj
            } else {
               return elm 
            }  
        });
        parsed.users = ar;
        fs.writeFile("./db.json", JSON.stringify(parsed), { encoding: "utf-8" }, () => {
            res.send({ status: "user logged out successfully" })
        })
    })
     
    
    // res.send("me")
    
  })


app.get("/db", (req, res) => {
    fs.readFile("./db.json", { encoding: "utf-8" }, (err,data) => {
        const parsed = JSON.parse(data)
          return res.send(parsed.users)
      })
})
  app.post("/db", (req, res) => {
    fs.readFile("./db.json", { encoding: "utf-8" }, (err,data) => {
        const parsed = JSON.parse(data)
          parsed.users=[req.body]
        fs.writeFile("./db.json", JSON.stringify(parsed), { encoding: "utf-8" }, () => {
            res.send("override")
        })
      })
})


app.get("/", (req, res) => {
    res.end("it is working")
})


const PORT=process.env.PORT || 8080

app.listen(PORT, () => {
    console.log("server started in server http://localhost:8080");
})