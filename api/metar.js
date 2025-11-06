// Это бессерверная функция Vercel (Node.js)

// 'export default' - это стандартный способ определения функции для Vercel
export default async function handler(request, response) {
  
  // Аэропорт, который нас интересует (из вашего примера)
  const airportICAO = 'UAAA';
  const url = `https://aviationweather.gov/api/data/metar?ids=${airportICAO}&format=json`;

  try {
    // 1. Делаем запрос к API aviationweather.gov с сервера Vercel
    const apiResponse = await fetch(url);

    // 2. Проверяем, успешен ли был запрос к API
    if (!apiResponse.ok) {
      // Если API погоды вернуло ошибку, передаем ее клиенту
      return response.status(apiResponse.status).json({ error: 'Ошибка при запросе к API погоды' });
    }

    // 3. Получаем JSON данные
    const data = await apiResponse.json();

    // 4. API возвращает массив, даже если мы просим один аэропорт.
    // Мы берем первый (и единственный) элемент.
    const metarData = data[0]; 

    // 5. Настраиваем заголовки ответа
    // Разрешаем нашему сайту (и другим) обращаться к этому API
    response.setHeader('Access-Control-Allow-Origin', '*');
    // Кэшируем результат на 10 минут (600 секунд), чтобы не нагружать API
    response.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate');

    // 6. Отправляем чистые данные METAR обратно на нашу веб-страницу (index.html)
    return response.status(200).json(metarData);

  } catch (error) {
    // Обработка внутренних ошибок (если наш сервер упал)
    console.error(error);
    return response.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
}
