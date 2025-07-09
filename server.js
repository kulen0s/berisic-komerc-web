require('dotenv').config();
const express = require("express");
const path = require("path");
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const nodemailer = require("nodemailer");
const PDFDocument = require("pdfkit");
const fs = require("fs");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Dohvati artikle sa Supabase
app.get("/api/artikli", async (req, res) => {
  try {
    const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/artikli`, {
      headers: {
        apikey: process.env.SUPABASE_KEY,
        Authorization: `Bearer ${process.env.SUPABASE_KEY}`,
      }
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("❌ Greška kod dohvata iz Supabase:", err);
    res.status(500).json({ error: "Greška na serveru" });
  }
});

// Slanje narudžbe s PDF-om
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

  doc.on("finish", async () => {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    try {
      await transporter.sendMail({
        from: `"Webshop" <${process.env.EMAIL_USER}>`,
        to: "berisic0s@gmail.com",
        subject: "Nova narudžba",
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
      res.status(500).json({ poruka: "Slanje nije uspjelo." });
    }
  });
});

// Pokreni server
app.listen(port, () => {
  console.log(`✅ Server radi na http://localhost:${port}`);
});


