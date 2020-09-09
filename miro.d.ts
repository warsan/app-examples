declare const miro: SDK.Root

declare module SDK {
	interface Root {
		// Использовать SDK после вызова обратного вызова
		onReady(callback: () => void): void

		// Доступно только в main.js на странице форума
		initialize(config?: IPluginConfig): Promise<void>

		// Доступно только при запуске веб-плагина на странице настроек
		initializeSettings(config?: IPluginSettingsConfig): Promise<void>

		// Доступно только при запуске веб-плагина на странице форума.
		board: IBoardCommands

		// Аккаунт, на котором установлен веб-плагин
		account: IAccountCommands

		currentUser: ICurrentUserCommands

		enums: IEnums

		// Для некоторых событий требуется область действия: ДОСКИ: ЧИТАТЬ
		// Доступно только при запуске веб-плагина на странице форума.
		addListener(event: EventType, listener: (e: Event) => void): void

		// Доступно только при запуске веб-плагина на странице форума.
		removeListener(event: EventType, listener: (e: Event) => void): void

		// Передайте некоторые данные всем остальным фреймам.
		// Другие iframe могут получить эти данные из события DATA_BROADCASTED
		broadcastData(data: any): void

		showNotification(text: string): Promise<void>

		showErrorNotification(text: string): void

		// Убедитесь, что текущий пользователь разрешил вашему веб-плагину делать запросы API от его имени.
		isAuthorized(): Promise<boolean>

		// Получите токен OAuth, чтобы текущий пользователь мог делать запросы REST API
		getToken(): Promise<string>

		// Открывает всплывающее окно авторизации.
		// Чтобы браузер не блокировал это всплывающее окно, вызывайте miro.authorize только из обработчика кликов в вашем домене.
		// Метод возвращает токен, который вы можете использовать для выполнения запросов REST API от имени текущего пользователя.
		authorize(options: AuthorizationOptions): Promise<string>

		// Возвращает clientId, который вы можете найти в настройках приложения.
		// clientId должен использовать метаданные виджетов
		getClientId(): string

		// Вы можете сохранить состояние, разделяемое всеми фреймами.
		__setRuntimeState<T = any>(data: T): Promise<T>
		__getRuntimeState<T = any>(): Promise<T>
	}

	type EventType =
		| 'SELECTION_UPDATED'
		| 'WIDGETS_CREATED'
		| 'WIDGETS_DELETED'
		| 'WIDGETS_TRANSFORMATION_UPDATED'
		| 'ESC_PRESSED' //Экспериментальное мероприятие
		| 'ALL_WIDGETS_LOADED' //Экспериментальное мероприятие
		| 'COMMENT_CREATED' //Экспериментальное мероприятие
		| 'CANVAS_CLICKED' //Экспериментальное мероприятие
		| 'DATA_BROADCASTED' //Экспериментальное мероприятие
		| 'RUNTIME_STATE_UPDATED' //Экспериментальное мероприятие
		| 'METADATA_CHANGED' //Экспериментальное мероприятие
		| 'ONLINE_USERS_CHANGED' //Экспериментальное мероприятие

	interface Event {
		type: string | EventType
		data: any
	}

	interface AuthorizationOptions {
		response_type: 'code' | 'token'
		scope?: string
		redirect_uri?: string
		state?: string
	}

	interface IPluginSettingsConfig {
		iframeHeight: number
	}

	interface IPluginConfig {
		extensionPoints: IPluginConfigExtensionPoints
	}

	interface IPluginConfigExtensionPoints {
		toolbar?: ButtonExtensionPoint<ToolbarButton>
		bottomBar?: ButtonExtensionPoint<BottomBarButton>
		exportMenu?: ButtonExtensionPoint<ExportMenuButton>

		// Обещание должно быть разрешено в течение 400 мс, в противном случае кнопки не будут отображаться в меню виджетов.
		// Один плагин может добавить до 3-х кнопок в меню виджетов.
		getWidgetMenuItems?: (widgets: IWidget[], editMode: boolean) => Promise<IWidgetMenuItem | IWidgetMenuItem[]>
	}

	type ButtonExtensionPoint<T> = T | (() => Promise<T | void>)

	interface ToolbarButton {
		title: string
		toolbarSvgIcon: string
		librarySvgIcon: string
		onClick: () => void
	}

	interface BottomBarButton {
		title: string
		svgIcon: string
		onClick: () => void
	}

	interface ExportMenuButton {
		title: string
		svgIcon: string
		onClick: () => void
	}

	interface IWidgetMenuItem {
		tooltip: string
		svgIcon: string
		onClick: () => void
	}

	interface IBoardCommands {
		info: IBoardInfoCommands
		widgets: IBoardWidgetsCommands
		tags: IBoardTagsCommands

		ui: IBoardUICommands
		viewport: IBoardViewportCommands
		selection: IBoardSelectionCommands

		utils: IBoardUtils

		__getBoardURLWithParams(params: any): Promise<string>
		__getParamsFromURL(): Promise<any>
		__enableLeftClickOnCanvas(): void
		__disableLeftClickOnCanvas(): void
	}

	interface DraggableItemsContainerOptions {
		dragDirection?: string // Ценности 'horizontal' | 'vertical' // 'horizontal' по умолчанию

		// css-селектор для перетаскиваемых элементов
		draggableItemSelector: string

		// Перетаскивание началось
		getDraggableItemPreview: (
			targetElement: HTMLElement
		) => {
			width?: number // 100 по умолчанию
			height?: number // 100 по умолчанию
			url: string // Поддерживаемые схемы: 'https://', 'data:image/svg+xml', 'data:image/png;base64'
		}

		// По желанию. Был нажат перетаскиваемый элемент
		onClick?: (targetElement: HTMLElement) => void

		// Перетаскиваемый элемент был сброшен
		onDrop: (canvasX: number, canvasY: number, targetElement: HTMLElement) => void

		// По желанию. Перетаскиваемый элемент упал не под холст
		onCancel?: () => void
	}

	interface IAccountCommands {
		/**
		 * Требуется объем: TEAM:READ
		 */
		get(): Promise<IAccountInfo>
	}

	interface ICurrentUserCommands {
		getId(): Promise<string>
		isSignedIn(): Promise<boolean>
		getScopes(): Promise<string[]>

		/**
		 * Требуется объем: IDENTITY:READ
		 */
		getCurrentBoardPermissions(): Promise<BoardPermission[]>

		/**
		 * Требуется объем: IDENTITY:READ
		 */
		getCurrentAccountPermissions(): Promise<AccountPermission[]>

		/**
		 * Требуется объем: IDENTITY:READ
		 */
		isMemberOfCurrentAccount(): Promise<boolean>
	}

	type InputWidget = string | {id: string}
	type InputWidgets = string | string[] | {id: string} | {id: string}[]

	interface IBoardInfoCommands {
		get(): Promise<IBoardInfo>
	}

	interface IBoardUICommands {
		// Обещание разрешится, когда боковая панель закроется
		openLeftSidebar(iframeURL: string, options?: {width?: number}): Promise<any>

		// Обещание разрешится, когда библиотека закроется
		openLibrary(iframeURL: string, options: {title: string}): Promise<any>

		// Обещание разрешится при закрытии модального окна
		openModal(iframeURL: string, options?: {width?: number; height?: number} | {fullscreen: boolean}): Promise<any>

		// Promise разрешится, когда bottomPanel закроется
		// options.width: default is 120px, min is 80px, max is 320px
		// options.height: default is 48px, min is 48px, max is 200px
		openBottomPanel(iframeURL: string, options?: {width?: number; height?: number}): Promise<any>

		// Выдает ошибку, если боковая панель открыта не этим плагином
		closeLeftSidebar(data?: any): void

		// Выдает ошибку, если библиотека открыта не этим плагином
		closeLibrary(data?: any): void

		// Выдает ошибку, если модальное окно открыто не этим плагином
		closeModal(data?: any): void

		closeBottomPanel(data?: any): void

		// Изменить размер текущего iFrame внутри боковой панели или модального окна (в настоящее время поддерживается только нижняя панель)
		// Вы можете передать HTMLElement, селектор CSS или размер
		resizeTo(value: HTMLElement | string | {width?: number; height?: number}): void

		// Добавить возможность перетаскивать объекты из настраиваемого представления на холст
		initDraggableItemsContainer(container: HTMLElement, options: DraggableItemsContainerOptions): void

		// Переключить текущий инструмент в режим выбора
		__selectDefaultTool(): void

		__hideButtonsPanels(panels: 'all' | UIPanel | UIPanel[]): void

		__showButtonsPanels(panels: 'all' | UIPanel | UIPanel[]): void

		__limitToolbarMode(mode: 'editor' | 'commentor' | 'viewer'): void

		__clearToolbarModeLimit(): void
	}

	type UIPanel = 'toolbar' | 'top' | 'bottomBar' | 'map'

	interface IBoardUtils {
		/** Вычислить границы объединения виджетов */
		unionWidgetBounds(widgets: {bounds: IBounds}[]): IBounds
	}

	interface IViewportOptions {
		/**  Получите размер зазора между результатом и целевым окном просмотра. Нулевое заполнение по умолчанию  */
		padding?: IOffset
		animationTimeInMS?: number // По умолчанию анимация отсутствует
	}

	interface IBoardViewportCommands {
		get(): Promise<IRect>
		set(viewport: IRect, options?: IViewportOptions): Promise<IRect>

		getScale(): Promise<number>

		/** Получить размер панелей пользовательского интерфейса по умолчанию на сторонах области просмотра.
		 *  Return value: {left: 60, top: 60, right: 0, bottom: 60} */
		getBoardUIPadding(): IOffset

		// [Экспериментальная функция] Добавьте чёрную маску на холст
		__mask(viewport: IRect, padding?: IOffset): void

		// [Экспериментальная функция] Удалить маску
		__unmask(): void
	}

	interface IBoardSelectionCommands {
		/**
		 * Возвращает выбранные виджеты
		 * Требуется объем: BOARDS:READ
		 */
		get(): Promise<IWidget[]>

		/**
		 * Выберите целевые виджеты
		 * Возвращает выбранные виджеты
		 * Requires scope: BOARDS:READ
		 */
		selectWidgets(widgetIds: InputWidgets): Promise<IWidget[]>

		/**
		 * Отменить выбор всех виджетов
		 */
		clear(): Promise<void>

		/**
		 * Получить идентификатор выбранного виджета после того, как пользователь выберет его
		 * В настоящее время пользователь может выбрать только один виджет.
		 * Предупреждение! Используйте эту команду только в основном iframe.
		 */
		enterSelectWidgetsMode(): Promise<{selectedWidgets: IWidget[]}>
	}

	interface IBoardWidgetsCommands {
		/**
		 * 'type' необходимо
		 * Requires scope: BOARDS:WRITE
		 * Requires BoardPermission.EDIT_CONTENT для текущего пользователя
		 */
		create<T extends IWidget>(widgets: OneOrMany<{type: string; [index: string]: any}>): Promise<T[]>

		/**
		 * filterBy использует https://lodash.com/docs/4.17.11#filter
		 * Requires scope: BOARDS:READ
		 */
		get<T extends IWidget>(filterBy?: Object): Promise<T[]>

		/**
		 * 'id' необходимо
		 * Requires scope: BOARDS:WRITE
		 * Requires BoardPermission.EDIT_CONTENT для текущего пользователя
		 */
		update<T extends IWidget>(widgets: OneOrMany<{id: string; [index: string]: any}>): Promise<T[]>

		/**
		 * Requires scope: BOARDS:WRITE
		 * Requires BoardPermission.EDIT_CONTENT для текущего пользователя
		 */
		transformDelta(
			widgetIds: InputWidgets,
			deltaX?: number,
			deltaY?: number,
			deltaRotation?: number
		): Promise<IWidget[]>

		/**
		 * Requires scope: BOARDS:WRITE
		 * Requires BoardPermission.EDIT_CONTENT для текущего пользователя
		 */
		deleteById(widgetIds: InputWidgets): Promise<void>

		/**
		 * Requires scope: BOARDS:WRITE
		 * Requires BoardPermission.EDIT_CONTENT для текущего пользователя
		 */
		bringForward(widgetId: InputWidgets): Promise<void>

		/**
		 * Requires scope: BOARDS:WRITE
		 * Requires BoardPermission.EDIT_CONTENT для текущего пользователя
		 */
		sendBackward(widgetId: InputWidgets): Promise<void>

		/**
		 * Проверяет, все ли виджеты на доске загружены
		 */
		areAllWidgetsLoaded(): Promise<boolean>

		/**
		 * Requires scope: BOARDS:READ
		 * [Экспериментальная функция] Найти все виджеты, пересекающиеся с пройденной областью
		 */
		__getIntersectedObjects(pointOrRect: IPoint | IRect): Promise<IWidget[]>

		/**
		 * [Экспериментальная функция] Анимация моргания для целевого виджета
		 */
		__blinkWidget(widgets: InputWidgets): Promise<void>
	}

	type InputTags = string | string[] | {id: string} | {id: string}[]
	type CreateTagRequest = {title: string; color: number | string; widgetIds?: InputWidgets}
	type UpdateTagRequest = {id: string; title?: string; color?: number | string; widgetIds?: InputWidgets}

	// API для тегов экспериментальный.
	// Он станет стабильным в июне 2020 года.
	// В течение экспериментального периода API для тегов мог измениться.
	interface IBoardTagsCommands {
		/**
		 * 'title' is required
		 * Requires scope: BOARDS:READ
		 */
		get(filterBy?: Object): Promise<ITag[]>

		/**
		 * Requires scope: BOARDS:WRITE
		 * Requires BoardPermission.EDIT_CONTENT для текущего пользователя
		 */
		create(tags: OneOrMany<CreateTagRequest>): Promise<ITag[]>

		/**
		 * 'id' is required
		 * Requires scope: BOARDS:WRITE
		 * Requires BoardPermission.EDIT_CONTENT для текущего пользователя
		 */
		update(tags: OneOrMany<UpdateTagRequest>): Promise<ITag[]>

		/**
		 * 'title' is required
		 * Requires scope: BOARDS:WRITE
		 * Requires BoardPermission.EDIT_CONTENT для текущего пользователя
		 */
		delete(tags: InputTags): Promise<void>
	}

	interface IBoardCommentsCommands {
		/**
		 * Requires scope: BOARDS:READ
		 */
		get(): Promise<IComment[]>
	}

	interface IBoardGroupsCommands {
		/**
		 * Requires scope: BOARDS:READ
		 */
		get(): Promise<IGroup[]>
	}

	interface IGroup {
		id: string
		bounds: IBounds
		childrenIds: string[]
	}

	interface ITag {
		id: string
		title: string
		color: string | number
		widgetIds: string[]
	}

	////////////////////////////////////////////////////////////////////////
	// Типы данных виджета
	////////////////////////////////////////////////////////////////////////

	type OneOrMany<T> = T | T[]

	type WidgetMetadata = {[x: string]: any}

	type WidgetCapabilities = {editable: boolean}

	interface IWidgetNamespaces {
		metadata: WidgetMetadata
		capabilities: WidgetCapabilities
		clientVisible: boolean
	}

	type WidgetNamespacesKeys = keyof IWidgetNamespaces

	interface IWidget extends IWidgetNamespaces {
		readonly id: string
		readonly type: string
		readonly bounds: IBounds
		readonly groupId?: string
		readonly createdUserId: string
		readonly lastModifiedUserId: string
	}

	interface ITextWidget extends IWidget {
		type: 'TEXT'
		x: number
		y: number
		width: number
		scale: number
		rotation: number
		text: string
		style: {
			backgroundColor: BackgroundColorStyle
			backgroundOpacity: BackgroundOpacityStyle
			borderColor: BorderColorStyle
			borderWidth: BorderWidthStyle
			borderStyle: BorderStyle
			borderOpacity: BorderOpacityStyle
			fontFamily: FontFamily
			textColor: TextColorStyle
			textAlign: TextAlign
			highlighting: HighlightingStyle
			italic: ItalicStyle
			strike: StrikeStyle
			underline: UnderlineStyle
			bold: BoldStyle
		}
	}

	interface IImageWidget extends IWidget {
		type: 'IMAGE'
		x: number
		y: number
		rotation: number
		scale: number
		title: string
		url: string
	}

	interface IStickerWidget extends IWidget {
		type: 'STICKER'
		x: number
		y: number
		scale: number

		/** Текст с символами HTML */
		text: string

		/** Очистить текст без символов HTML */
		plainText: string
		style: {
			stickerBackgroundColor: BackgroundColorStyle
			fontSize: FontSizeStyle
			textAlign: TextAlign
			textAlignVertical: TextAlignVertical
			stickerType: StickerType
			fontFamily: FontFamily
		}

		readonly tags: ITag[]
	}

	interface IShapeWidget extends IWidget {
		type: 'SHAPE'
		x: number
		y: number
		width: number
		height: number
		rotation: number

		/** Текст с символами HTML */
		text: string

		/** Очистить текст без символов HTML */
		plainText: string
		style: {
			shapeType: ShapeType
			backgroundColor: BackgroundColorStyle
			backgroundOpacity: BackgroundOpacityStyle
			borderColor: BorderColorStyle
			borderWidth: BorderWidthStyle
			borderStyle: BorderStyle
			borderOpacity: BorderOpacityStyle
			fontSize: FontSizeStyle
			fontFamily: FontFamily
			textColor: TextColorStyle
			textAlign: TextAlign
			textAlignVertical: TextAlignVertical
			highlighting: HighlightingStyle
			italic: ItalicStyle
			strike: StrikeStyle
			underline: UnderlineStyle
			bold: BoldStyle
		}
	}

	// В настоящее время линии можно создавать только между двумя виджетами.
	// Поля startWidgetId и endWidgetId необходимы для создания.
	interface ILineWidget extends IWidget {
		type: 'LINE'
		startWidgetId: string | undefined
		endWidgetId: string | undefined
		readonly startPosition: IPoint
		readonly endPosition: IPoint
		readonly captions: {text: string}[]
		style: {
			lineColor: LineColorStyle
			lineThickness: LineThicknessStyle
			lineStyle: LineStyle
			lineType: LineType
			lineStartStyle: LineArrowheadStyle
			lineEndStyle: LineArrowheadStyle
		}
	}

	interface IWebScreenshotWidget extends IWidget {
		type: 'WEBSCREEN'
		x: number
		y: number
		scale: number
		readonly url: string
	}

	interface IFrameWidget extends IWidget {
		type: 'FRAME'
		x: number
		y: number
		width: number
		height: number
		title: string
		readonly frameIndex: number
		readonly childrenIds: string[]
		style: {
			backgroundColor: BackgroundColorStyle
		}
	}

	interface ICurveWidget extends IWidget {
		type: 'CURVE'
		x: number
		y: number
		scale: number
		rotation: number
		points: IPoint[]
		style: {
			lineColor: LineColorStyle
			lineWidth: LineThicknessStyle
		}
	}

	interface IEmbedWidget extends IWidget {
		type: 'EMBED'
		x: number
		y: number
		scale: number
		html: string
	}

	interface IPreviewWidget extends IWidget {
		type: 'PREVIEW'
		x: number
		y: number
		scale: number
		readonly url: string
	}

	interface ICardWidget extends IWidget {
		type: 'CARD'
		x: number
		y: number
		scale: number
		rotation: number
		title: string
		description: string
		date?: string // date in "YYYY-MM-DD" format
		assignee?: {
			userId: string
		}
		card: {
			customFields?: {
				value?: string
				mainColor?: string
				fontColor?: string
				iconUrl?: string
				roundedIcon?: boolean
			}[]
			logo?: {
				iconUrl: string
			}
		}
		style: {
			backgroundColor: BackgroundColorStyle
		}

		readonly tags: ITag[]
	}

	interface IDocumentWidget extends IWidget {
		type: 'DOCUMENT'
		x: number
		y: number
		rotation: number
		scale: number
		title: string
	}

	interface IMockupWidget extends IWidget {
		type: 'MOCKUP'
		x: number
		y: number
		rotation: number
		readonly mockupType: string
	}

	interface IComment extends IWidget {
		type: 'COMMENT'
		color: number
		resolved: boolean
	}

	interface IWidgetShortData {
		id: string
		type?: string
		metadata?: any
	}

	////////////////////////////////////////////////////////////////////////
	// Данные помощников
	////////////////////////////////////////////////////////////////////////

	type BoardPermission = 'EDIT_INFO' | 'EDIT_CONTENT' | 'EDIT_COMMENTS'
	type AccountPermission = 'MANAGE_APPS'

	interface IBoardInfo {
		id: string
		title: string
		description: string
		owner?: IUserInfo
		picture: IPictureInfo
		currentUserPermissions: BoardPermission[]
		lastModifyingUser: IUserInfo
		lastViewedByMeDate: string
		modifiedByMeDate: string
		createdAt: string
		updatedAt: string
	}

	interface IUserInfo {
		id: string
		name: string
		email: string
		picture: IPictureInfo
	}

	interface IAccountInfo {
		id: string
		title: string
		currentUserPermissions: AccountPermission[]
		createdAt: string
		picture: IPictureInfo
	}

	interface IPictureInfo {
		big: string
		medium: string
		small: string
		image: string //исходное изображение
	}

	interface IRect {
		x: number
		y: number
		width: number
		height: number
	}

	interface IOffset {
		top: number
		left: number
		bottom: number
		right: number
	}

	interface IPoint {
		x: number
		y: number
	}

	interface IBounds {
		x: number
		y: number
		top: number
		left: number
		bottom: number
		right: number
		width: number
		height: number
	}

	/////////////////////////////////////////////
	// Типы стилей
	/////////////////////////////////////////////
	type BackgroundColorStyle = string | number
	type BackgroundOpacityStyle = number
	type BorderColorStyle = string | number
	type BorderWidthStyle = number
	type BorderOpacityStyle = number
	type FontSizeStyle = number
	type TextColorStyle = string | number
	type HighlightingStyle = string | number
	type ItalicStyle = 0 | 1
	type StrikeStyle = 0 | 1
	type UnderlineStyle = 0 | 1
	type BoldStyle = 0 | 1
	type LineColorStyle = string | number
	type LineThicknessStyle = number

	enum ShapeType {
		RECTANGLE = 3,
		CIRCLE = 4,
		TRIANGLE = 5,
		BUBBLE = 6,
		ROUNDER = 7,
		RHOMBUS = 8,
		PARALL = 10,
		STAR = 11,
		ARROW_RIGHT = 12,
		ARROW_LEFT = 13,
		TEXT_RECT = 14,
		PILL = 15,
		PENTAGON = 16,
		HEXAGON = 17,
		OCTAGON = 18,
		TRAPEZE = 19,
		PREDEFINED_PROCESS = 20,
		ARROW_LEFT_RIGHT = 21,
		CLOUD = 22,
		BRACE_LEFT = 23,
		BRACE_RIGHT = 24,
		CROSS = 25,
		BARREL = 26,
	}

	enum StickerType {
		SQUARE = 0,
		RECTANGLE = 1,
	}

	enum BorderStyle {
		DOTTED = 0,
		DASHED = 1,
		NORMAL = 2,
	}

	enum FontFamily {
		ARIAL = 0,
		CURSIVE = 1,
		ABRIL_FATFACE = 2,
		BANGERS,
		EB_GARAMOND,
		GEORGIA,
		GRADUATE,
		GRAVITAS_ONE,
		FREDOKA_ONE,
		NIXIE_ONE,
		OPEN_SANS,
		PERMANENT_MARKER,
		PT_SANS,
		PT_SANS_NARROW,
		PT_SERIF,
		RAMMETTO_ONE,
		ROBOTO,
		ROBOTO_CONDENSED,
		ROBOTO_SLAB,
		CAVEAT,
		TIMES_NEW_ROMAN,
		TITAN_ONE,
		LEMON_TUESDAY,
		ROBOTO_MONO,
		NOTO_SANS,
		PLEX_SANS,
		PLEX_SERIF,
		PLEX_MONO,
	}

	enum TextAlign {
		LEFT = 'l',
		CENTER = 'c',
		RIGHT = 'r',
	}

	enum TextAlignVertical {
		TOP = 't',
		MIDDLE = 'm',
		BOTTOM = 'b',
	}

	enum LineStyle {
		DASHED = 1,
		NORMAL = 2,
		STRONG = 3,
		DOTTED = 4,
	}

	enum LineType {
		LINE = 1,
		ARROW = 2,
		ARROW_SKETCH = 9,
	}

	enum LineArrowheadStyle {
		NONE = 0,
		ARC_ARROW = 1,
		RHOMBUS = 2,
		FILLED_RHOMBUS = 3,
		CIRCLE = 4,
		FILLED_CIRCLE = 5,
		ARROW = 6,
		OPEN_ARROW = 7,
		FILLED_ARROW = 8,
	}

	interface IEnums {
		shapeType: typeof ShapeType
		stickerType: typeof StickerType
		borderStyle: typeof BorderStyle
		fontFamily: typeof FontFamily
		textAlign: typeof TextAlign
		textAlignVertical: typeof TextAlignVertical
		lineStyle: typeof LineStyle
		lineType: typeof LineType
		lineArrowheadStyle: typeof LineArrowheadStyle
	}
}
