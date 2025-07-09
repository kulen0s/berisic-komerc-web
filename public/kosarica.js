document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("kosarica-container");
    let kosarica = JSON.parse(localStorage.getItem("kosarica")) || [];

    if (kosarica.length === 0) {
        container.innerHTML = "<p>Košarica je prazna.</p>";
        return;
    }

    let ukupno = 0;

    kosarica.forEach((a, index) => {
        const cijenaJednog = parseFloat(a.cijena);
        const cijenaUkupno = cijenaJednog * a.kolicina;
        ukupno += cijenaUkupno;

        const item = document.createElement("div");
        item.className = "kosarica-item";
        item.innerHTML = `
            <img src="images/${a.slika}" alt="${a.naziv}">
            <div class="kosarica-item-details">
                <h4>${a.naziv}</h4>
                <p><strong>Cijena jednog:</strong> ${cijenaJednog.toFixed(2)} €</p>
                <p><strong>Količina:</strong> ${a.kolicina}</p>
                <p><strong>Ukupno za ovaj artikl:</strong> ${cijenaUkupno.toFixed(2)} €</p>
            </div>
            <button class="ukloni" data-index="${index}">Ukloni</button>
        `;
        container.appendChild(item);
    });

    // Prikaz ukupne cijene košarice
        const ukupnoDiv = document.createElement("div");
        ukupnoDiv.className = "ukupan-container";
        ukupnoDiv.textContent = `Ukupan iznos: ${ukupno.toFixed(2)} €`;
        container.appendChild(ukupnoDiv);

    // Funkcionalnost uklanjanja
    document.querySelectorAll(".ukloni").forEach(button => {
        button.addEventListener("click", () => {
            const index = parseInt(button.dataset.index);
            kosarica.splice(index, 1);
            localStorage.setItem("kosarica", JSON.stringify(kosarica));
            location.reload();
        });
    });
    document.getElementById("posaljiNarudzbu")?.addEventListener("click", () => {
    const ime = document.getElementById("imeKupca").value.trim();
    const email = document.getElementById("emailKupca").value.trim();

    if (!ime || !email) {
        alert("Molimo unesite ime i email.");
        return;
    }

    const narudzba = kosarica.map(a => ({
        naziv: a.naziv,
        kolicina: a.kolicina,
        cijena: parseFloat(a.cijena),
        ukupno: (a.kolicina * parseFloat(a.cijena)).toFixed(2)
    }));

    const zahtjev = {
        ime,
        email,
        narudzba
    };

    fetch("/api/posalji-narudzbu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(zahtjev)
    })
    .then(res => res.json())
    .then(data => {
        alert(data.poruka || "Narudžba poslana.");
        localStorage.removeItem("kosarica");
        location.reload();
    })
    .catch(err => {
        console.error("Greška:", err);
        alert("Greška pri slanju narudžbe.");
    });
});

    
});
