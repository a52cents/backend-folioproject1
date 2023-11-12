import express from "express";
import mysql from "mysql";
import cors from "cors";
import fileUpload from "express-fileupload";
import ImageKit from "imagekit";

const app = express();
const db = mysql.createConnection({
  host: "bobqn97loadpnxx0h2yw-mysql.services.clever-cloud.com",
  user: "uaeoubfztn9pjdip",
  password: "chaeOuBlBa8hQx5Udhpo",
  database: "bobqn97loadpnxx0h2yw",
});

const imagekit = new ImageKit({
  publicKey: "public_ATgppscC5DJiUtyH4SBqAaZ7CG4=",
  privateKey: "private_+ZaPrO7t+MKYBF2z5fKZo4CoCig=",
  urlEndpoint: "https://ik.imagekit.io/naohoghhc",
});

app.use(fileUpload());
app.use(express.static('dist'));
app.use('/upload', express.static('upload'));
app.use(express.json());
app.use(cors());

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

  // Utilisez imagekit.upload pour envoyer l'image à ImageKit
  imagekit.upload(
    {
      file: req.files.cover.data, // Les données binaires de l'image
      fileName: req.files.cover.name, // Le nom de fichier de l'image
      useUniqueFileName: true, // Utiliser un nom de fichier unique
    },
    (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
      } else {
        const imageUrl = result.url; // Obtenez l'URL de l'image depuis la réponse

        // Ajoutez l'URL de l'image à votre base de données
        const q = "INSERT INTO bobqn97loadpnxx0h2yw.car (`title`, `description`, `cover`, `price`) VALUES (?, ?, ?, ?)";
        const values = [req.body.title, req.body.description, imageUrl, req.body.price];

        db.query(q, values, (err, data) => {
          if (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
          } else {
            res.json("Car created successfully !");
          }
        });
      }
    }
  );
});

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

  // Vérifiez si une nouvelle image a été téléchargée
  if (req.files && req.files.cover) {
    imagekit.upload(
      {
        file: req.files.cover.data,
        fileName: req.files.cover.name,
        useUniqueFileName: true,
      },
      (err, result) => {
        if (err) {
          console.error(err);
          res.status(500).json({ error: 'Internal Server Error' });
          return;
        }

        const imageUrl = result.url;

        // Mettez à jour la voiture avec la nouvelle URL de l'image
        const q = "UPDATE bobqn97loadpnxx0h2yw.car SET `title` = ?, `description` = ?, `cover` = ?, `price` = ? WHERE idcar = ?";
        const values = [
          req.body.title,
          req.body.description,
          imageUrl,
          req.body.price,
          carId,
        ];

        db.query(q, values, (err, data) => {
          if (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
          } else {
            res.json("Car updated successfully");
          }
        });
      }
    );
  } else {
    // Si aucune nouvelle image n'a été téléchargée, mettez à jour la voiture sans changer l'URL de l'image
    const q = "UPDATE bobqn97loadpnxx0h2yw.car SET `title` = ?, `description` = ?, `price` = ? WHERE idcar = ?";
    const values = [req.body.title, req.body.description, req.body.price, carId];

    db.query(q, values, (err, data) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
      } else {
        res.json("Car updated successfully");
      }
    });
  }
});

app.listen(8800, () => {
  console.log("Backend server is running!");
});