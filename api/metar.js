// 1. Импортируем 'parse' из библиотеки
import { parse } from 'metar-parser';

// Аэропорт, который нас интересует
const airportICAO = 'UAAA';

// Стандартный обработчик Vercel
export default async function handler(request, response) {

  // 2. ВОЗВРАЩАЕМ URL к 'format=json' (как просил!)
  const url = `https://aviationweather.gov/api/data/metar?ids=${airportICAO}&format=json`;

  try {
    const apiResponse = await fetch(url);
    if (!apiResponse.ok) {
      return response.status(apiResponse.status).json({ error: 'Ошибка при запросе к API погоды' });
    }

    // 3. Получаем ответ как JSON
    const data = await apiResponse.json();

    // 4. API возвращает массив, берем первый элемент
    const metarData = data[0];

    // 5. Проверяем, есть ли у него поле 'rawOb'
    if (!metarData || !metarData.rawOb) {
      return response.status(404).json({ error: 'Поле rawOb не найдено в ответе API' });
    }

    // 6. ИЗВЛЕКАЕМ сырую строку METAR
    const rawMetarString = metarData.rawOb;

    // 7. ВЫЗОВ БИБЛИОТЕКИ: парсим эту строку
    const parsedData = parse(rawMetarString);

    /*
      Теперь 'parsedData' — это JSON-объект, созданный 'metar-parser',
      например:
      {
        station: 'UAAA',
        time: { day: 6, hour: 8, minute: 0 },
        wind: { ... },
        ...
        raw: 'METAR UAAA 060800Z...'
      }
    */

    // 8. Отправляем этот новый JSON-объект нашему фронтенду
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate');
    
    return response.status(200).json(parsedData);

  } catch (error) {
    console.error(error);
    return response.status(500).json({ error: 'Внутренняя ошибка сервера при парсинге' });
  }
}