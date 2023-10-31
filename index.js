import express from "express";
import mysql from "mysql";
import cors from "cors"
const app = express();
import multer from "multer";

const upload = multer({storage: multer.memoryStorage()});
// Utilisez une fonction pour créer une nouvelle connexion à chaque requête
const db = mysql.createConnection({

    host: "bobqn97loadpnxx0h2yw-mysql.services.clever-cloud.com", //localhost
    user: "uaeoubfztn9pjdip", //root
    password: "chaeOuBlBa8hQx5Udhpo",
    database: "bobqn97loadpnxx0h2yw"
  });

  app.use(express.json())
  app.use(cors())

app.get("/", (req, res) => {
  res.json("Hello this is the backend !");
});

app.get("/cars", (req, res) => {
  const q = "SELECT * FROM new_schema.car";
  

  db.query(q, (err, data) => {
    if (err) {
      res.json(err);
    } else {
      res.json(data);
    }

  });
});

 app.post("/cars", upload.single('cover'),(req, res) => {
   const q = "INSERT INTO new_schema.car (`title`, `description`, `cover`, `price`) VALUES (?)";
   const values = [
    req.body.title,
    req.body.description,
    req.file,
    req.body.price
    
   ];
   console.log(req.file);
   db.query(q, [values], (err, data) => {
    if (err) {
        res.json(err);
      } else {
        res.json("Car created successfully !");
      }
   })
 })

 app.delete("/cars/:id", (req, res) => {
   const carId = req.params.id;
   const q = "DELETE FROM new_schema.car WHERE idcar = ?";

   db.query(q, carId, (err, data) => {
     if (err) {
       return res.json(err);
     } else {
       return res.json("Car deleted successfully");
     }
   })
 })
 app.put("/cars/:id", (req, res) => {
  const carId = req.params.id;
  const q = "UPDATE car SET `title` = ?, `description` = ?, `cover` = ?, `price` = ? WHERE idcar = ?";
  const values = [
    req.body.title,
    req.body.description,
    req.body.cover,
    req.body.price
    
   ];
  db.query(q, [...values, carId], (err, data) => {
    if (err) {
      return res.json(err);
    } else {
      return res.json("Car deleted successfully");
    }
  })
})

app.listen(8800, () => {
  console.log("Backend server is running!");
});
