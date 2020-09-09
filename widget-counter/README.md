## Приложение счетчика виджетов

В этом примере показано, как подсчитать количество виджетов на доске с помощью Client SDK.

<img src="images/widget-counter-example.gif" alt="widget-counter-example" />

## Конфигурация

Вам необходимо обслуживать папку `widget-counter` на сервере через https, один из самых простых способов сделать это - разветвить это репо и использовать [GitHub Pages](https://pages.github.com/) для его обслуживания...

Следующим шагом будет создание приложения в miro, вы можете использовать этот [guid](https://developers.miro.com/docs/getting-started), он вам поможет.

Настройте приложение следующим образом:
- введите uri для ресурса `widget-counter` в разделе `Web-plugin`, например если вы используете GitHub Pages uri будет следующим: `https://<nickname>.github.io/app-examples/widget-counter/`;
- выберите `boards:read` объем.

<img src="images/app-configuration.png" width="400px" alt="app-configuration"/>

## Запуск

Установите приложение с помощью `Install app and get OAuth Token`, а затем откройте или создайте доску в группе, в которой вы устанавливаете приложение: вы увидите новый значок шириной <img src="images/widget-counter-icon24.svg" width="24" height="24" style="display: inline;"/> в нижней панели, как показано на изображении в формате gif в верхней части этого `readme`.
