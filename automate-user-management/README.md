## Вступление
В этом примере объясняется, как добавлять и удалять участников из вашей команды на основе данных из внешнего источника.

Например, добавьте нового пользователя Miro в команду, когда новый пользователь mew присоединяется к определенному каналу Slack, и удалите пользователя из команды Miro, когда пользователь покидает канал Slack.

### Поток данных варианта использования

Случай 1: Пригласите новых пользователей Slack в команду Miro

<img src="images/invite-user.png" alt="Invite new slack users" />
 
Случай 2: Удалить из команды Miro, которая покинула канал Slack

<img src="images/delete-user.png" alt="Remove from Miro team" />
 
## Подготовка

###### Шаг 1. Клонируйте репо и установите зависимости.

```bash 
git clone https://github.com/miroapp/app-examples.git
cd app-examples/automate-user-management
npm install
``` 

###### Шаг 2. Запустите сервер узла локально.

```bash
npm run start
```

###### Шаг 3. Подключите локальный веб-сервер к Интернету.

```bash
ngrok http 8000
```

###### Шаг 4. Создайте приложение в Slack

- В этом [руководстве](https://api.slack.com/start/overview#creating) показано, как создать приложение.

- Выбрать области: `channels:read`, `groups:read`, `users:read`, `users:read.email`

- Проверить URL-адрес запроса

- Включить события: `member_joined_channel`, `member_left_channel`

- Установите приложение и замените полученный токен Sack OAuth в файле `index.js`.

###### Шаг 5. Создайте приложение в Miro
- В этом [руководстве](https://developers.miro.com/docs/getting-started) показано, как это сделать.

- [Scopes](https://developers.miro.com/reference#scopes) используется в этом примере: `team:read`, `team:write`

- Установите приложение и замените полученный токен Miro OAuth в файле `index.js`.


###### Шаг 6. Перезагрузите сервер узла.
