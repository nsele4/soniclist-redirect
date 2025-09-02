import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://nbpxscwgiffppfkfrnsf.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5icHhzY3dnaWZmcHBma2ZybnNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxODc1MDEsImV4cCI6MjA2ODc2MzUwMX0.uz89XE2TbzkGih1Fci87uVI9Mqfn5A6qmFrx_vSkFbo'
const supabase = createClient(supabaseUrl, supabaseKey)

export default async function handler(req, res) {
  const { type, id } = req.query

  let title = 'SonicList'
  let description = 'Check out SonicList!'
  let image = 'https://soniclist-redirect.vercel.app/default-cover.png'

  try {
    if (type && id) {
      if (type === 'track') {
        const { data } = await supabase
          .from('tracks')
          .select('title, artist, cover_url')
          .eq('id', id)
          .single()
        if (data) {
          title = data.title
          description = `Track by ${data.artist}`
          image = data.cover_url
        }
      } else if (type === 'artist') {
        const { data } = await supabase
          .from('auth.users')
          .select('display_name, avatar_url')
          .eq('id', id)
          .single()
        if (data) {
          title = data.display_name
          description = `Artist on SonicList`
          image = data.avatar_url
        }
      } else if (type === 'event') {
        const { data } = await supabase
          .from('events')
          .select('title, image_url')
          .eq('id', id)
          .single()
        if (data) {
          title = data.title
          description = `Event on SonicList`
          image = data.image_url
        }
      } else if (type === 'recovery') {
        title = 'Password Reset'
        description = 'Reset your SonicList password'
        image = 'https://soniclist-redirect.vercel.app/default-cover.png'
      }
    }
  } catch (err) {
    console.error('Supabase fetch error:', err)
  }

  // Serve dynamic HTML
  const html = `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <meta property="og:title" content="${title}" />
      <meta property="og:description" content="${description}" />
      <meta property="og:image" content="${image}" />
      <meta property="og:url" content="https://soniclist-redirect.vercel.app/?type=${type}&id=${id}" />
      <meta name="twitter:card" content="summary_large_image" />
      <script>
        setTimeout(() => {
          const ua = navigator.userAgent
          if (ua.includes("Android")) {
            window.location.href = "https://play.google.com/store/apps/details?id=com.soniclist.app"
          } else if (ua.includes("iPhone") || ua.includes("iPad")) {
            window.location.href = "https://apps.apple.com/app/idYOUR_APP_ID"
          } else {
            window.location.href = "soniclist://open?type=${type}&id=${id}"
          }
        }, 1000)
      </script>
    </head>
    <body>
      <p>Opening SonicList...</p>
      <ul>
        <li><a href="https://play.google.com/store/apps/details?id=com.soniclist.app">Android Play Store</a></li>
        <li><a href="https://apps.apple.com/app/idYOUR_APP_ID">iOS App Store</a></li>
      </ul>
    </body>
  </html>
  `

  res.setHeader('Content-Type', 'text/html')
  res.status(200).send(html)
}
