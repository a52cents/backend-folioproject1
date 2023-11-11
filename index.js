import express from "express";
import mysql from "mysql";
import cors from "cors"
import fileUpload from "express-fileupload";
const app = express();
import multer from "multer";
import path from "path";

app.use(fileUpload());
import fs from 'fs';

app.use(express.static('dist'));
app.use('/upload', express.static('upload'));
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
  const q = "SELECT * FROM bobqn97loadpnxx0h2yw.car";
  

  db.query(q, (err, data) => {
    if (err) {
      res.json(err);
    } else {
      res.json(data);
    }

  });
});

  

 app.post("/cars", (req, res) => {
   
   let uploadPath;
   const q = "INSERT INTO bobqn97loadpnxx0h2yw.car (`title`, `description`, `cover`, `price`) VALUES (?)";
   const values = [
    req.body.title,
    req.body.description,
    req.files.cover,
    req.body.price
    
   ];
   uploadPath = "./upload/" + req.files.cover.name;
   req.files.cover.mv(uploadPath,function(err){
     if(err){
       console.log(err);
     }
   });
   db.query(q, [values], (err, data) => {

    if (err) {
        res.json(err);
      } else {
        res.json("Car created successfully !");
      }
   })

 })

 app.delete("/cars/:id", async (req, res) => {
  const carId = req.params.id;

  // Récupérer le nom du fichier cover avant de supprimer la voiture
  const getCoverQuery = "SELECT cover FROM bobqn97loadpnxx0h2yw.car WHERE idcar = ?";
  db.query(getCoverQuery, carId, async (err, rows) => {
      if (err) {
          return res.json(err);
      }

      const coverFileName = rows[0].cover;

      const deleteCarQuery = "DELETE FROM bobqn97loadpnxx0h2yw.car WHERE idcar = ?";
      db.query(deleteCarQuery, carId, (deleteErr, deleteResult) => {
          if (deleteErr) {
              return res.json(deleteErr);
          }

          // Supprimer le fichier cover associé
          
          const filePath ="./upload/" + coverFileName;
          

          fs.unlink(filePath, (unlinkErr) => {
              if (unlinkErr) {
                  return res.json(unlinkErr);
              }

              return res.json("Car and image deleted successfully");
          });
      });
  });
});

 app.put("/cars/:id", (req, res) => {
  const carId = req.params.id;
  const q = "UPDATE bobqn97loadpnxx0h2yw.car SET `title` = ?, `description` = ?, `cover` = ?, `price` = ? WHERE idcar = ?";
  const values = [
    req.body.title,
    req.body.description,
    req.files.cover.name,
    req.body.price
    
   ];
  db.query(q, [...values, carId], (err, data) => {
    if (err) {
      return res.json(err);
      return res.json(values);
    } else {
      return res.json("Car deleted successfully");
    }
  })
})

app.listen(8800, () => {
  console.log("Backend server is running!");
});