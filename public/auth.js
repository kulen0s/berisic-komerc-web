// public/auth.js
import { createClient } from 'https://esm.sh/@supabase/supabase-js'

// ⬇️ UPIŠI SVOJ URL I ANON PUBLIC KEY (publican je i smije biti na klijentu)
const SUPABASE_URL = 'https://estokvtjkexhrnnbhtrc.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVzdG9rdnRqa2V4aHJubmJodHJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwNTMwNDYsImV4cCI6MjA2NzYyOTA0Nn0.ZvpyVoxa-nFAAgvaTgwzIs3w-jKvTTsj3yICMihD_GoY'

/**
 * persistSession: false -> izbjegava probleme s cookiejima na nekim uređajima/preglednicima.
 * Možeš kasnije vratiti na true ako želiš trajnu sesiju (onda provjeri da je stranica na HTTPS-u).
 */
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    flowType: 'pkce', // moderniji flow, stabilniji preko različitih browsera/uređaja
  }
})

// Helper za logiranje – sve ide i u konzolu i u #greska
const uiError = (msg, err = null) => {
  console.error(msg, err || '')
  const el = document.getElementById('greska')
  if (el) el.textContent = msg
}

const form = document.getElementById('login-form')

// Diagnoza okoline – pokaži u konzoli osnovne info
console.log('[AUTH] Page origin:', window.location.origin)
console.log('[AUTH] Using Supabase URL:', SUPABASE_URL)

try {
  // Dodatno: testiraj da li backend uopće “čuje” nas (CORS/Network)
  const { data: pingData, error: pingError } = await supabase.from('_noop_').select().limit(1)
  // _noop_ tabela vjerojatno ne postoji -> očekujemo error 42P01 (table does not exist),
  // ali je bitno da DOĐE odgovor (znači CORS/Network nije blokiran)
  if (pingError) {
    console.log('[AUTH] Ping response (ok je da je error jer tablica ne postoji):', pingError.code)
  } else {
    console.log('[AUTH] Ping data:', pingData)
  }
} catch (e) {
  uiError('Nismo uspjeli doći do Supabase-a (mogući CORS ili mrežni problem).', e)
}

if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault()

    const email = document.getElementById('email')?.value?.trim()
    const password = document.getElementById('password')?.value

    // Osnovne validacije
    if (!email || !password) {
      return uiError('Unesi email i lozinku.')
    }

    console.log('[AUTH] Trying signInWithPassword for:', email)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    // Detaljni logovi za dijagnostiku
    console.log('[AUTH] Sign-in result:', { data, error })

    if (error) {
      // Korisne poruke ovisno o statusu
      if (error.status === 400 || error.status === 401) {
        return uiError('Pogrešan email ili lozinka.')
      }
      if (error.status === 429) {
        return uiError('Previše pokušaja. Pokušaj opet za par minuta.')
      }
      // Opća poruka + log
      return uiError('Prijava nije uspjela. Provjeri mrežu i pokušaj ponovo.', error)
    }

    // Ako koristiš “Confirm email”, a korisnik nije potvrdio — možeš upozoriti:
    // (Supabase ne vraća uvijek jasan signal, pa po potrebi odkomentiraj i testiraj)
    // if (!data?.user?.confirmed_at) {
    //   return uiError('Potvrdi email pa se prijavi ponovno.')
    // }

    // Po želji provjeri trenutnu sesiju (iako je persistSession: false)
    const { data: sessionData, error: sessionErr } = await supabase.auth.getSession()
    console.log('[AUTH] Current session:', { sessionData, sessionErr })

    // Gotovo — uđi u aplikaciju
    window.location.href = 'artikli.html'
  })
}

// (Neobavezno) Prikaži je li korisnik već logiran
try {
  const { data: userData } = await supabase.auth.getUser()
  console.log('[AUTH] Current user:', userData?.user?.email || 'Nema')
} catch (e) {
  console.log('[AUTH] getUser failed:', e)
}
