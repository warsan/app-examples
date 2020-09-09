# Плагин Spreadsheet Sync

Этот плагин является примером синхронизации данных на борту с Google Таблицами.

## Конфигурация

Вам необходимо обслуживать папку `spreadsheet-sync` на сервере через https, один из самых простых способов сделать это - разветвить это репо и использовать [GitHub Pages](https://pages.github.com/) для его обслуживания...

Следующим шагом будет создание приложения в miro, вы можете использовать этот [guid](https://developers.miro.com/docs/getting-started), он вам поможет.

Настройте приложение следующим образом:

- введите uri для ресурса `spreadsheet-sync` в разделе `Web-plugin`, например если вы используете GitHub Pages uri будет следующим: `https://<nickname>.github.io/app-examples/spreadsheet-sync/`;
- выберите области `boards:read` и `boards:write`.

<img src="images/app-configuration.png" width="400px" alt="app-configuration" />

## Запуск

Установите приложение с помощью `Install app and get OAuth Token`, а затем откройте или создайте доску в группе, в которой вы устанавливаете приложение: вы увидите новый значок <img src="images/spreadsheet-sync.svg" width="24" height="24" style="display: inline;"/> в нижней панели ..
