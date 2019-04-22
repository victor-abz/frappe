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
import TableNodes from 'tiptap-extensions/src/nodes/TableNodes';

class TableWithClass extends Table {
	get schema() {
		return Object.assign({}, TableNodes.table, {
			toDOM: function toDOM() {
				return ["table", { class: 'table table-bordered' }, ["tbody", 0]]
			}
		})
	}
}

export default [
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
	new TableWithClass(),
	new TableHeader(),
	new TableCell(),
	new TableRow()
]