# API для управления страницами журнала

## Эндпоинт

```
GET /api/book/pages
```

## Ответ

```json
[
  {
    "src": "https://cdn.example.com/images/page1.webp",
    "width": "292.98%",
    "height": "100%",
    "left": "0.05%",
    "top": "0.02%"
  },
  {
    "src": "https://cdn.example.com/images/page2.webp",
    "width": "292.98%",
    "height": "100%",
    "left": "-99.91%",
    "top": "0%"
  }
]
```

## Структура объекта страницы

| Поле | Тип | Обязательное | Описание |
|------|-----|--------------|----------|
| src | string | да | URL изображения страницы |
| width | string | нет | Ширина отображения (по умолчанию "100%") |
| height | string | нет | Высота отображения (по умолчанию "100%") |
| left | string | нет | Смещение по X (по умолчанию "0%") |
| top | string | нет | Смещение по Y (по умолчанию "0%") |

## Поведение

1. Если API возвращает пустой массив или ошибку — используется `DEFAULT_PAGES` из `mediaBookData.js`
2. Если в URL есть параметр `?images=url1,url2,...` — он имеет приоритет над API
3. При успешной загрузке страниц из API происходит динамическое обновление журнала

## Пример запроса для админки (Node.js/Express)

```javascript
app.get('/api/book/pages', async (req, res) => {
  try {
    // Получаем страницы из БД
    const pages = await db.query('SELECT * FROM book_pages ORDER BY position');
    
    const result = pages.map(page => ({
      src: page.image_url,
      width: page.width || '100%',
      height: page.height || '100%',
      left: page.left || '0%',
      top: page.top || '0%'
    }));
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching book pages:', error);
    res.status(500).json({ error: 'Failed to load pages' });
  }
});
```

## Пример SQL таблицы для хранения страниц

```sql
CREATE TABLE book_pages (
  id SERIAL PRIMARY KEY,
  image_url VARCHAR(500) NOT NULL,
  width VARCHAR(20) DEFAULT '100%',
  height VARCHAR(20) DEFAULT '100%',
  left VARCHAR(20) DEFAULT '0%',
  top VARCHAR(20) DEFAULT '0%',
  position INTEGER DEFAULT 0
);

-- Пример данных
INSERT INTO book_pages (image_url, width, height, left, top, position) VALUES
('https://cdn.example.com/page1.webp', '292.98%', '100%', '0.05%', '0.02%', 1),
('https://cdn.example.com/page2.webp', '292.98%', '100%', '-99.91%', '0%', 2);
```
