## GitHub выдает приложение для импорта

В этом примере показано, как импортировать задачи из GitHub на доску с настраиваемыми полями с помощью Miro API.

<img src="images/run-app.gif" alt="run-app" />

## Общая настройка

Клонируйте репо и установите зависимости

```bash
git clone https://github.com/miroapp/app-examples.git
cd app-examples/github-issue-importer
```

```bash
npm install
```

## Конфигурация

Все свойства конфигурации хранятся в `config.js`:
```javascript
{
    github: {
        token: 'github-token',
    },
    miro: {
        token: 'miro-token',
        boardId: 'board-id',
        inboxFrameId: 'frame-id'
    }
}
```

Свойства, которые необходимо настроить:
- `github-token` - Токен GitHub с разрешениями на чтение, например с объемом `репо`;
- `miro-token` - токен miro с областью действия `board:write`;
- `board-id` - идентификатор платы, к которой имеет доступ `miro-token`;
- `frame-id` - идентификатор кадра, который будет содержать созданные виджеты

> **Как получить идентификатор кадра?**
> 
> Нажмите «Копировать ссылку», как показано на скриншоте ниже:
>
> <img src="images/tip-copy-link-to-widget.png" alt="copy-link-to-widget-screenshot" />
>
> Скопированная ссылка будет иметь идентификатор кадра в параметре запроса moveToWidget,> например: `https://miro.com/app/board/<board-id>/?moveToWidget=3074457346806294028`

## Пуск

Чтобы импортировать данные на доску, запустите следующее

```bash
npm start
```
