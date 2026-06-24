export default {
    async fetch(request) {
        // Обработка CORS preflight (OPTIONS) запроса
        if (request.method === 'OPTIONS') {
            return new Response(null, {
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type',
                },
            });
        }

        // Разрешаем только POST-запросы
        if (request.method !== 'POST') {
            return new Response('Method Not Allowed', { 
                status: 405,
                headers: { 'Access-Control-Allow-Origin': '*' }
            });
        }

        try {
            const requestData = await request.json();
            const message = requestData.message;

            if (!message) {
                return new Response(JSON.stringify({ error: 'Message is required' }), {
                    status: 400,
                    headers: { 
                        'Content-Type': 'application/json', 
                        'Access-Control-Allow-Origin': '*' 
                    }
                });
            }

            // ПРАВИЛЬНО: переменные окружения через env
            const token = env.BOT_TOKEN;
            const chatId = env.CHAT_ID;

            if (!token || !chatId) {
                console.error('BOT_TOKEN or CHAT_ID is not set in environment variables.');
                return new Response(JSON.stringify({ error: 'Server configuration error' }), {
                    status: 500,
                    headers: { 
                        'Content-Type': 'application/json', 
                        'Access-Control-Allow-Origin': '*' 
                    }
                });
            }

            // Отправляем запрос в Telegram
            const url = `https://api.telegram.org/bot${token}/sendMessage`;
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: message,
                    parse_mode: 'Markdown'
                })
            });

            const data = await response.json();
            return new Response(JSON.stringify(data), {
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });

        } catch (error) {
            console.error('Worker error:', error);
            return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
                status: 500,
                headers: { 
                    'Content-Type': 'application/json', 
                    'Access-Control-Allow-Origin': '*' 
                }
            });
        }
    }
};
