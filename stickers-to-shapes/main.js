miro.onReady(() => {
  miro.initialize({
    extensionPoints: {
      bottomBar: {
        title: 'Sticker to shapes',
        svgIcon: '<circle cx="12" cy="12" r="9" fill="none" fill-rule="evenodd" stroke="currentColor" stroke-width="2"/>',
        positionPriority: 1,
        onClick: async () => {

          // Получить выбранные виджеты
          let selectedWidgets = await miro.board.selection.get()

          // Фильтровать стикеры из выбранных виджетов
          let stickers = selectedWidgets.filter(widget => widget.type === 'STICKER')

          // Удалить выбранные стикеры
          await miro.board.widgets.deleteById(stickers.map(sticker => sticker.id))

          // Создание фигур из выбранных наклеек
          await miro.board.widgets.create(stickers.map(sticker => ({
            type: 'shape',
            text: sticker.text,
            x: sticker.x,
            y: sticker.y,
            width: sticker.bounds.width,
            height: sticker.bounds.height,
          })))

          // Показать сообщение об успехе
          miro.showNotification('Наклейки были преобразованы')
        }
      }
    }
  })
})
