import { createClient } from 'https://esm.sh/@supabase/supabase-js'

const SUPABASE_URL = 'https://estokvtjkexhrnnbhtrc.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,   // da ostane ulogiran
    autoRefreshToken: true, // da mu se sesija obnavlja
  }
})

const uiError = (msg, err = null) => {
  console.error(msg, err || '')
  const el = document.getElementById('greska')
  if (el) el.textContent = msg
}

const form = document.getElementById('login-form')

console.log('[AUTH] Page origin:', window.location.origin)
console.log('[AUTH] Using Supabase URL:', SUPABASE_URL)

try {
 
  const { data: pingData, error: pingError } = await supabase.from('_noop_').select().limit(1)

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

    if (!email || !password) {
      return uiError('Unesi email i lozinku.')
    }

    console.log('[AUTH] Trying signInWithPassword for:', email)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    console.log('[AUTH] Sign-in result:', { data, error })

    if (error) {
      if (error.status === 400 || error.status === 401) {
        return uiError('Pogrešan email ili lozinka.')
      }
      if (error.status === 429) {
        return uiError('Previše pokušaja. Pokušaj opet za par minuta.')
      }
      return uiError('Prijava nije uspjela. Provjeri mrežu i pokušaj ponovo.', error)
    }

    const { data: sessionData, error: sessionErr } = await supabase.auth.getSession()
    console.log('[AUTH] Current session:', { sessionData, sessionErr })

    window.location.href = 'artikli.html'
  })
}

try {
  const { data: userData } = await supabase.auth.getUser()
  console.log('[AUTH] Current user:', userData?.user?.email || 'Nema')
} catch (e) {
  console.log('[AUTH] getUser failed:', e)
}
