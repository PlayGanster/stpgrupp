// app/api/callback/route.ts
export async function POST(request: Request) {
  const { phone, city, cityName, productName, type, page } = await request.json()

  const TELEGRAM_BOT_TOKEN = "7647075796:AAEsiMeMRdXpWb0xRqVdGs0Nlh1KDUfKcZE"
  const TELEGRAM_CHAT_ID = "-4948988069"

  let message = ''

  if (type === 'callback') {
    message = `📞 *Новый запрос на обратный звонок*

📱 *Телефон:* ${phone}
🏙️ *Город:* ${cityName} (${city})
💻*Страница:* ${page}
${productName ? `🛠️ *Техника:* ${productName}\n` : ''}
⏰ *Время заявки:* ${new Date().toLocaleString('ru-RU')}

_Срочно перезвоните в течение 2 минут!_`
  } else {
    message = `📝 *Новая заявка на консультацию*

📱 *Телефон:* ${phone}
🏙️ *Город:* ${cityName} (${city})
💻*Страница:* ${page}
${productName ? `🛠️ *Техника:* ${productName}\n` : ''}
⏰ *Время заявки:* ${new Date().toLocaleString('ru-RU')}

_Не забудьте перезвонить в течение 2 минут!_`
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'Markdown'
      })
    })

    const data = await response.json()

    if (data.ok) {
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    } else {
      return new Response(JSON.stringify({ success: false, error: data.description }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: 'Network error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}