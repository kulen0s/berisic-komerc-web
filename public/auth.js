import { createClient } from 'https://esm.sh/@supabase/supabase-js'

const supabase = createClient(
  'https://estokvtjkexhrnnbhtrc.supabase.co',  
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVzdG9rdnRqa2V4aHJubmJodHJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwNTMwNDYsImV4cCI6MjA2NzYyOTA0Nn0.ZvpyVoxa-nFAAgvaTgwzIs3w-jKvTTsj3yICMihD_Go'                      // ⬅️ tvoj anon public key
)

const form = document.getElementById('login-form')
const greska = document.getElementById('greska')

form.addEventListener('submit', async (e) => {
  e.preventDefault()

  const email = document.getElementById('email').value
  const password = document.getElementById('password').value

  const { error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password
  })

  if (error) {
    greska.textContent = "Pogrešan email ili lozinka."
  } else {
    window.location.href = "artikli.html"
  }
})
