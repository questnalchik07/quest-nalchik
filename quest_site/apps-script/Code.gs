/**
 * Google Apps Script для приёма заявок с сайта.
 * 1) Создайте Google Таблицу.
 * 2) Расширения → Apps Script → вставьте этот код.
 * 3) Настройте Script Properties:
 *    SHEET_NAME = Заявки
 *    TELEGRAM_BOT_TOKEN = token бота, если нужны уведомления
 *    TELEGRAM_CHAT_ID = id чата/группы, если нужны уведомления
 * 4) Deploy → New deployment → Web app:
 *    Execute as: Me
 *    Who has access: Anyone
 * 5) URL Web App вставьте в config.js → webhookUrl.
 */

function doPost(e) {
  try {
    const p = e.parameter || {};
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheetName = PropertiesService.getScriptProperties().getProperty('SHEET_NAME') || 'Заявки';
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      sheet.appendRow(['Создано', 'Квест', 'Дата', 'Время', 'Цена', 'Имя', 'Телефон', 'Комментарий', 'Источник', 'Статус']);
    }

    const row = [
      new Date(),
      p.quest || '',
      p.date || '',
      p.time || '',
      p.price || '',
      p.name || '',
      p.phone || '',
      p.comment || '',
      p.source || '',
      'Новая'
    ];
    sheet.appendRow(row);

    sendTelegram_(p);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function sendTelegram_(p) {
  const props = PropertiesService.getScriptProperties();
  const token = props.getProperty('TELEGRAM_BOT_TOKEN');
  const chatId = props.getProperty('TELEGRAM_CHAT_ID');
  if (!token || !chatId) return;

  const text = [
    '🎯 Новая заявка на квест',
    'Квест: ' + (p.quest || ''),
    'Дата: ' + (p.date || ''),
    'Время: ' + (p.time || ''),
    'Цена: ' + (p.price || '') + ' ₽',
    'Имя: ' + (p.name || ''),
    'Телефон: ' + (p.phone || ''),
    'Комментарий: ' + (p.comment || '-')
  ].join('\n');

  UrlFetchApp.fetch('https://api.telegram.org/bot' + token + '/sendMessage', {
    method: 'post',
    payload: { chat_id: chatId, text: text }
  });
}
