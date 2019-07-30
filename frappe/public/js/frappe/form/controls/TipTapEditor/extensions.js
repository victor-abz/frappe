import {
	Blockquote,
	CodeBlock,
	HardBreak,
	Heading,
	HorizontalRule,
	OrderedList,
	BulletList,
	ListItem,
	TodoItem,
	TodoList,
	Bold,
	Code,
	Italic,
	Link,
	Strike,
	Underline,
	History,
	Image,
	Table,
	TableHeader,
	TableCell,
	TableRow,
	Mention
} from 'tiptap-extensions';

import {
	tableEditing,
	columnResizing,
} from 'prosemirror-tables'

import { TableView } from 'prosemirror-tables/src/tableview';

class TableViewClass extends TableView {
	constructor(node, cellMinWidth) {
		super(node, cellMinWidth);
		this.table.className = 'table table-bordered table-fixed';
	}
}

class TableWithClass extends Table {
	get plugins() {
		return [
			columnResizing({ View: TableViewClass }),
			tableEditing(),
		]
	}
}

export default {
	data() {
		return {
			query: null,
			suggestionRange: null,
			filteredUsers: [],
			navigatedUserIndex: 0,
			insertMention: () => {},
			observer: null,
		}
	},
	methods: {
		get_extensions() {
			return [
				new Blockquote(),
				new BulletList(),
				new CodeBlock(),
				new HardBreak(),
				new Heading({ levels: [1, 2, 3] }),
				new HorizontalRule(),
				new ListItem(),
				new OrderedList(),
				new TodoItem(),
				new TodoList(),
				new Bold(),
				new Code(),
				new Italic(),
				new Link(),
				new Strike(),
				new Underline(),
				new History(),
				new Image(),
				// new Table(),
				new TableWithClass(),
				new TableHeader(),
				new TableCell(),
				new TableRow(),
				new Mention({
					// a list of all suggested items
					items: () => [
						{ id: 1, name: 'Philipp Kühn' },
						{ id: 2, name: 'Hans Pagel' },
						{ id: 3, name: 'Kris Siepert' },
						{ id: 4, name: 'Justin Schueler' },
					],
					// is called when a suggestion starts
					onEnter: ({
						items, query, range, command, virtualNode,
					}) => {
						this.query = query
						this.filteredUsers = items
						this.suggestionRange = range
						this.renderPopup(virtualNode)
						// we save the command for inserting a selected mention
						// this allows us to call it inside of our custom popup
						// via keyboard navigation and on click
						this.insertMention = command
					},
					// is called when a suggestion has changed
					onChange: ({
						items, query, range, virtualNode,
					}) => {
						this.query = query
						this.filteredUsers = items
						this.suggestionRange = range
						this.navigatedUserIndex = 0
						this.renderPopup(virtualNode)
					},
					// is called when a suggestion is cancelled
					onExit: () => {
						// reset all saved values
						this.query = null
						this.filteredUsers = []
						this.suggestionRange = null
						this.navigatedUserIndex = 0
						this.destroyPopup()
					},
					// is called on every keyDown event while a suggestion is active
					onKeyDown: ({ event }) => {
						// pressing up arrow
						if (event.keyCode === 38) {
						this.upHandler()
						return true
						}
						// pressing down arrow
						if (event.keyCode === 40) {
						this.downHandler()
						return true
						}
						// pressing enter
						if (event.keyCode === 13) {
						this.enterHandler()
						return true
						}
						return false
					},
					// is called when a suggestion has changed
					// this function is optional because there is basic filtering built-in
					// you can overwrite it if you prefer your own filtering
					// in this example we use fuse.js with support for fuzzy search
					onFilter: (items, query) => {
						if (!query) {
						return items
						}
						const fuse = new Fuse(items, {
						threshold: 0.2,
						keys: ['name'],
						})
						return fuse.search(query)
					},
					}),
			];
		}
	}
}
