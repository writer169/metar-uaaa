// 1. Импортиуем модуль 'metar-parser' и корректно извлекаем функцию 'parse'.
// Это исправляет ошибку CommonJS/ES Modules.
import pkg from 'metar-parser';
const { parse } = pkg;

// Аэропорт, который нас интересует
const airportICAO = 'UAAA';

// Стандартный обработчик Vercel
export default async function handler(request, response) {

  // URL для запроса JSON-формата
  const url = `https://aviationweather.gov/api/data/metar?ids=${airportICAO}&format=json`;

  try {
    // 1. Запрашиваем данные с сервера Vercel
    const apiResponse = await fetch(url);
    if (!apiResponse.ok) {
      return response.status(apiResponse.status).json({ error: 'Ошибка при запросе к API погоды' });
    }

    // 2. Получаем ответ как JSON
    const data = await apiResponse.json();

    // 3. API возвращает массив, берем первый элемент
    const metarData = data[0];

    // 4. Проверяем наличие сырой строки METAR
    if (!metarData || !metarData.rawOb) {
      return response.status(404).json({ error: 'Поле rawOb не найдено в ответе API' });
    }

    // 5. ИЗВЛЕКАЕМ сырую строку METAR
    const rawMetarString = metarData.rawOb;

    // 6. ВЫЗОВ БИБЛИОТЕКИ: парсим эту строку
    const parsedData = parse(rawMetarString);

    // 7. Отправляем спарсенный объект на фронтенд
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate');
    
    return response.status(200).json(parsedData);

  } catch (error) {
    // Обработка ошибок сети или ошибок парсинга
    console.error(error);
    return response.status(500).json({ error: 'Внутренняя ошибка сервера или ошибка парсинга' });
  }
}