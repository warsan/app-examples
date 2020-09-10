miro.onReady(() => {
  // подписаться на выбранные пользователем виджеты
  miro.addListener(miro.enums.event.SELECTION_UPDATED, getWidget)
  getWidget()
})

// Получить элементы html для подсказки и текстового контейнера
const tipElement = document.getElementById('tip')
const widgetTextElement = document.getElementById('widget-text')

async function getWidget() {
  // Получить выбранные виджеты
  let widgets = await miro.board.selection.get()

  // Получить первый виджет из выбранных виджетов
  let text = widgets[0].text

  // Убедитесь, что у виджета есть текстовое поле
  if (typeof text === 'string') {

    // скрыть подсказку и показать текст на боковой панели
    tipElement.style.opacity = '0'
    widgetTextElement.value = text
  } else {

    // показать подсказку и чистый текст на боковой панели
    tipElement.style.opacity = '1'
    widgetTextElement.value = ''
  }
}

