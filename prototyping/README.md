# Плагин прототипирования
С помощью этого плагина пользователи могут создавать интерактивные прототипы, как в InVision или Overflow.
Очень подробный пример множества возможностей SDK, включая экспериментальные функции.

Установите и запустите плагин Prototyping для своего пользователя по этой ссылке:

https://miro.com/oauth/authorize/?response_type=token&client_id=3074457346759443169&redirect_uri=/ 

_Этот плагин был создан для демонстрационных целей, он не готов к производственному использованию._

# Как работает функция

<img src="proto.gif" />

# How to build
- Run `npm install`
- Run `npm run build` or `npm run watch` to compile app
- Run _http-server_ in `dist` folder: `http-server -p 8081`
- Run _ngrok_ for https: `ngrok http 8081`
- Замените APP_ID в файле конфигурации на свой _App ID_. Вы можете получить _App Id_ в настройках приложения.
- Получите https url от _ngrok_ и вставьте его в `iframe url` в настройках вашего приложения.    
