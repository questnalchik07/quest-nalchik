# Квест Ловушка — сайт v2

## Что изменено
- Более плотный коммерческий дизайн.
- Атмосферный первый экран без людей и без музыки.
- Исправлено закрытие формы: кнопка ×, кнопка Закрыть, клик по фону.
- Структура готова для GitHub Pages из корня.
- Заявки работают после подключения webhookUrl в config.js.

## Загрузка на GitHub
В корень репозитория загрузить:
index.html
config.js
assets/
apps-script/
README_SETUP.md

## Где менять цены
config.js → prices

## Где менять слоты
config.js → slots

## Подключение заявок
1. Создать Google Таблицу.
2. Расширения → Apps Script.
3. Вставить apps-script/Code.gs.
4. Deploy → New deployment → Web app.
5. Execute as: Me. Who has access: Anyone.
6. Web app URL вставить в config.js → webhookUrl.

## Харам
Сайт и бронирование не харам. Тему лучше подавать как квест-расследование без романтизации наркотиков, алкоголя и преступности.
