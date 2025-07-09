const express = require("express");
const { Pool } = require("pg");
const path = require("path");
const nodemailer = require("nodemailer");
const PDFDocument = require("pdfkit");
const fs = require("fs");
require('dotenv').config();



const app = express();
const port = 3000;

// KONFIGURACIJA ZA POSTGRES – prilagodi svojim postavkama
/*
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "webshop",
  password: "Kamion20", // ← zamijeni svojom lozinkom
  port: 5432,
});
*/

const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
  ssl: process.env.PGHOST.includes("supabase") || process.env.PGHOST.includes("railway") 
       ? { rejectUnauthorized: false } 
       : false
});

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// API ruta za artikle
app.get("/api/artikli", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM artikli");
    res.json(result.rows);
  } catch (err) {
    console.error("Greška kod dohvaćanja artikala:", err);
    res.status(500).json({ error: "Greška na serveru" });
  }
});

pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("❌ Neuspješna konekcija s bazom:", err);
  } else {
    console.log("✅ Konekcija s bazom uspješna:", res.rows[0]);
  }
});


app.post("/api/posalji-narudzbu", async (req, res) => {
    const { ime, email, narudzba } = req.body;

    const pdfPath = `narudzba_${Date.now()}.pdf`;
    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream(pdfPath));

    doc.fontSize(18).text("PONUDA / NARUDŽBA", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`Kupac: ${ime}`);
    doc.text(`Email: ${email}`);
    doc.moveDown();

    doc.text("Artikli:");
    doc.moveDown();

    let ukupno = 0;
    narudzba.forEach(a => {
        const ukupnoArtikl = a.kolicina * a.cijena;
        ukupno += ukupnoArtikl;
        doc.text(`${a.naziv} | Količina: ${a.kolicina} | Cijena: ${a.cijena.toFixed(2)} € | Ukupno: ${ukupnoArtikl.toFixed(2)} €`);
    });

    doc.moveDown();
    doc.text(`Ukupan iznos: ${ukupno.toFixed(2)} €`, { align: "right" });
    doc.end();

    // SAMO JEDNA FUNKCIJA - kada PDF završi
    doc.on("finish", async () => {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: "eberisic02@gmail.com",
                pass: "cnslrsuwgzxflbea"
            }
        });

        try {
            await transporter.sendMail({
                from: `"Webshop" <eberisic02@gmail.com>`,
                to: "berisic0s@gmail.com",
                subject: "Nova narudžba s webshopa",
                text: `Kupac: ${ime}, Email: ${email}`,
                attachments: [
                    {
                        filename: "narudzba.pdf",
                        path: pdfPath
                    }
                ]
            });

            fs.unlinkSync(pdfPath);
            res.json({ poruka: "Narudžba poslana kao PDF!" });

        } catch (err) {
            console.error("❌ Greška kod slanja emaila:", err);
            res.status(500).json({ poruka: "Slanje narudžbe nije uspjelo." });
        }
    });
});



// Pokretanje servera
app.listen(port, () => {
  console.log(`Server radi na http://localhost:${port}`);
});

