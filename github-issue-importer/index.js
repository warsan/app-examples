const axios = require('axios');
const appConfig = require('./config');

class GithubApiService {
    constructor(githubProperties) {
        this._github = githubProperties
    }

    async readIssues() {
        const response = await axios.get('https://api.github.com/issues?state=all', {
            headers: {
                'Authorization': `token ${this._github.token}`,
                'User-Agent': 'Miro Importer'
            }
        });
        return response.data
    }
}

class MiroBoardApiService {
    constructor(miroProperties) {
        this._miro = miroProperties
    }

    async createWidget(widgetData) {
        if (!widgetData.parentFrameId) {
            widgetData.parentFrameId = this._miro.inboxFrameId;
        }
        const response = await axios.post(
            `https://api.miro.com/v1/boards/${this._miro.boardId}/widgets`,
            widgetData, {
                headers: {
                    'Authorization': `Bearer ${this._miro.token}`
                }
            });
        return response.data
    }
}

class ConversionService {
    static _styleByIssue(issue) {
        switch(issue.state){
            case 'open':
                return { backgroundColor: '#0ca789' }
            case 'closed':
                return { backgroundColor: '#f24726'}
            default:
                return { backgroundColor: '#808080'}
        }
    }

    static convert2Card(issue) {
        let cardData = {
            type: 'card',
            title: `<a href="${issue.html_url}">${issue.title}</a>`,
            description: `${issue.body}<br /><br />
                          ------------------------------------<br />
                          repo: <a href="${issue.repository.html_url}">${issue.repository.full_name}</a>`,
            card: {
                customFields: [{
                    value: `${issue.repository.full_name}`,
                    iconUrl: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png'
                }]
            }
        };
        issue.assignees.forEach(assignee => {
            cardData.card.customFields.push({
                value: `${assignee.login}`,
                iconUrl: `${assignee.avatar_url}`,
            });
        });
        cardData.style = this._styleByIssue(issue)
        return cardData;
    }
}

const githubService = new GithubApiService(appConfig.github)
const boardApiService = new MiroBoardApiService(appConfig.miro)

githubService.readIssues().then(issues => issues.forEach(issue => {
    const cardData = ConversionService.convert2Card(issue)
    boardApiService.createWidget(cardData)
        .then(value => console.log(`card widget ${value.id} был создан из проблемы ${issue.url}`))
        .catch(reason => console.error(`*** ошибка создания виджета карты: ${reason.response.status} ${JSON.stringify(reason.response.data)}`))
})).catch(reason => console.error(`*** ошибки чтения GitHub: ${reason.response.status} ${JSON.stringify(reason.response.data)}`));
