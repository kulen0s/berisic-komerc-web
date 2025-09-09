import { createClient } from 'https://esm.sh/@supabase/supabase-js'

// Supabase klijent – koristi podatke iz .env koje Render učitava
const supabase = createClient(
  "https://estokvtjkexhrnnbhtrc.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVzdG9rdnRqa2V4aHJubmJodHJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwNTMwNDYsImV4cCI6MjA2NzYyOTA0Nn0.ZvpyVoxa-nFAAgvaTgwzIs3w-jKvTTsj3yICMihD_Go"  
)

const form = document.getElementById("reg-form")
const msg = document.getElementById("msg")

form.addEventListener("submit", async (e) => {
  e.preventDefault()

  const email = document.getElementById("email").value
  const password = document.getElementById("password").value
  const password2 = document.getElementById("password2").value

  if (password !== password2) {
    msg.textContent = "Lozinke se ne podudaraju."
    msg.className = "error"
    return
  }

  const { error } = await supabase.auth.signUp({
    email: email,
    password: password
  })

  if (error) {
    msg.textContent = "Greška: " + error.message
    msg.className = "error"
  } else {
    msg.textContent = "Registracija uspješna! Možete se prijaviti."
    msg.className = "ok"
    setTimeout(() => {
      window.location.href = "login.html"
    }, 2000)
  }
})
