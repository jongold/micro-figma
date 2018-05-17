require('now-env')
const querystring = require('querystring')
const axios = require('axios')
const { router, get } = require('microrouter')
const redirect = require('micro-redirect')
const uid = require('uid-promise')
const originalUrl = require('original-url')

const figmaUrl = process.env.FIGMA_HOST || 'www.figma.com'

const states = []

const redirectWithQueryString = (res, data) => {
  const location = `${process.env.REDIRECT_URL}?${querystring.stringify(data)}`
  redirect(res, 302, location)
}

const login = async (req, res) => {
  const state = await uid(20)

  const url = originalUrl(req).full.replace('login', 'callback')

  const params = querystring.stringify({
    client_id: process.env.FIGMA_CLIENT_ID,
    redirect_uri: url,
    scope: 'file_read',
    state,
    response_type: 'code'
  })

  states.push(state)
  redirect(
    res,
    302,
    `https://${figmaUrl}/oauth?${params}`,
  )
}

const callback = async (req, res) => {
  const { search, full } = originalUrl(req)

  const url = full.replace(search, '')

  res.setHeader('Content-Type', 'text/html')
  const { code, state } = req.query

  if (!code && !state) {
    redirectWithQueryString(res, {
      error: 'Provide code and state query param'
    })
  } else if (!states.includes(state)) {
    redirectWithQueryString(res, { error: 'Unknown state' })
  } else {
    states.splice(states.indexOf(state), 1)

    try {
      const { status, data } = await axios.post(`https://${figmaUrl}/api/oauth/token`,
        querystring.stringify({
          code,
          client_id: process.env.FIGMA_CLIENT_ID,
          client_secret: process.env.FIGMA_CLIENT_SECRET,
          redirect_uri: url,
          grant_type: 'authorization_code'
        })
      )

      if (status === 200) {
        if (data.error) {
          redirectWithQueryString(res, { error: data.error_description })
        } else {
          const { access_token, refresh_token, expires_in } = data
          redirectWithQueryString(res, {
            access_token, refresh_token, expires_in
          })
        }
      } else {
        redirectWithQueryString(res, { error: 'Figma server error.' })
      }
    } catch (err) {
      redirectWithQueryString(res, {
        error:
          'Please provide FIGMA_CLIENT_ID and FIGMA_CLIENT_SECRET as environment variables. (or Figma might be down)'
      })
    }
  }
}

module.exports = router(get('/login', login), get('/callback', callback))
