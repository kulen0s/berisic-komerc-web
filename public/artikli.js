document.addEventListener("DOMContentLoaded", async () => {
    const container = document.getElementById("artikli-container");
    const pretraga = document.getElementById("pretraga");
    const cijenaOd = document.getElementById("cijenaOd");
    const cijenaDo = document.getElementById("cijenaDo");
    const filtrirajBtn = document.getElementById("filtrirajBtn");

    let sviArtikli = [];

    try {
        const res = await fetch("/api/artikli");
        sviArtikli = await res.json();
        prikaziArtikle(sviArtikli);
        dodajEvente();  // ⬅️ OBAVEZNO!
    } catch (err) {
        console.error("Greška kod učitavanja artikala:", err);
    }

    filtrirajBtn.addEventListener("click", () => {
        const tekst = pretraga.value.toLowerCase();
        const od = parseFloat(cijenaOd.value);
        const doCijene = parseFloat(cijenaDo.value);

        const filtrirani = sviArtikli.filter(a => {
            const nazivMatch = a.naziv.toLowerCase().includes(tekst);
            const cijena = parseFloat(a.cijena);
            const odMatch = isNaN(od) || cijena >= od;
            const doMatch = isNaN(doCijene) || cijena <= doCijene;
            return nazivMatch && odMatch && doMatch;
        });

        prikaziArtikle(filtrirani);
        dodajEvente(); // ⬅️ OBAVEZNO!
    });

    function prikaziArtikle(lista) {
        container.innerHTML = "";
        lista.forEach(a => {
            const div = document.createElement("div");
            div.className = "kartica";
            div.innerHTML = `
                <img src="/images/${a.slika}" alt="${a.naziv}">
                <h3>${a.naziv}</h3>
                <p>${a.opis || ""}</p>
                <p><strong>${parseFloat(a.cijena).toFixed(2)} €</strong></p>
                <label>Količina: <input type="number" min="1" value="1" class="kolicina" data-id="${a.id}" style="width: 60px;"></label><br>
                <button class="dodaj-kosarica" data-id="${a.id}">Dodaj u košaricu</button>
            `;
            container.appendChild(div);
        });
    }

    function dodajEvente() {
        document.querySelectorAll(".dodaj-kosarica").forEach(button => {
            button.addEventListener("click", () => {
                const id = button.dataset.id;
                const artikl = sviArtikli.find(x => x.id == id);
                const input = document.querySelector(`.kolicina[data-id="${id}"]`);
                const kolicina = parseInt(input.value) || 1;
                dodajUKosaricu(artikl, kolicina);
            });
        });
    }

    function dodajUKosaricu(artikl, kolicina) {
        let kosarica = JSON.parse(localStorage.getItem("kosarica")) || [];
        const postoji = kosarica.find(x => x.id === artikl.id);

        if (postoji) {
            postoji.kolicina += kolicina;
        } else {
            kosarica.push({ ...artikl, kolicina });
        }

        localStorage.setItem("kosarica", JSON.stringify(kosarica));
        alert("Artikl dodan u košaricu!");
    }
});
