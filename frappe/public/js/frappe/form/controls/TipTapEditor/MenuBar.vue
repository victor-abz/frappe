<template>
	<EditorMenuBar :editor="editor">
		<div class="menubar" slot-scope="{ commands, isActive }">

		<MenuButton
			name="bold"
			:class="{ 'active': isActive.bold() }"
			@click.native="commands.bold"
		/>
		<MenuButton
			name="italic"
			:class="{ 'active': isActive.italic() }"
			@click.native="commands.italic"
		/>

		<MenuButton
			name="strike"
			:class="{ 'active': isActive.strike() }"
			@click.native="commands.strike"
		/>

		<MenuButton
			name="underline"
			:class="{ 'active': isActive.underline() }"
			@click.native="commands.underline"
		/>

		<MenuButton
			name="code"
			:class="{ 'active': isActive.code() }"
			@click.native="commands.code"
		/>

		<MenuButton
			name="paragraph"
			:class="{ 'active': isActive.paragraph() }"
			@click.native="commands.paragraph"
		/>

		<MenuButton
			name="heading1"
			:class="{ 'active': isActive.heading({ level: 1 }) }"
			@click.native="commands.heading({ level: 1 })"
		/>

		<MenuButton
			name="heading2"
			:class="{ 'active': isActive.heading({ level: 2 }) }"
			@click.native="commands.heading({ level: 2 })"
		/>

		<MenuButton
			name="heading3"
			:class="{ 'active': isActive.heading({ level: 3 }) }"
			@click.native="commands.heading({ level: 3 })"
		/>

		<MenuButton
			name="ul"
			:class="{ 'active': isActive.bullet_list() }"
			@click.native="commands.bullet_list"
		/>

		<MenuButton
			name="ol"
			:class="{ 'active': isActive.ordered_list() }"
			@click.native="commands.ordered_list"
		/>

		<MenuButton
			name="quote"
			:class="{ 'active': isActive.blockquote() }"
			@click.native="commands.blockquote"
		/>

		<MenuButton
			name="code"
			:class="{ 'active': isActive.code_block() }"
			@click.native="commands.code_block"
		/>

		<MenuButton
			name="hr"
			@click.native="commands.horizontal_rule"
		/>

		<MenuButton
			name="undo"
			@click.native="commands.undo"
		/>

		<MenuButton
			name="redo"
			@click.native="commands.redo"
		/>

		<MenuButton
			name="image"
			@click.native="showImagePrompt(commands.image)"
		/>

		<MenuButton
			name="checklist"
			:class="{ 'active': isActive.todo_list() }"
			@click.native="commands.todo_list"
		/>

		<MenuButton
			name="table"
			@click.native="commands.createTable({rowsCount: 3, colsCount: 3, withHeaderRow: true })"
		/>

		<span v-if="isActive.table()">
			<MenuButton
				name="delete_table"
				@click.native="commands.deleteTable"
			/>
			<MenuButton
				name="add_col_before"
				@click.native="commands.addColumnBefore"
			/>
			<MenuButton
				name="add_col_after"
				@click.native="commands.addColumnAfter"
			/>
			<MenuButton
				name="delete_col"
				@click.native="commands.deleteColumn"
			/>
			<MenuButton
				name="add_row_before"
				@click.native="commands.addRowBefore"
			/>
			<MenuButton
				name="add_row_after"
				@click.native="commands.addRowAfter"
			/>
			<MenuButton
				name="delete_row"
				@click.native="commands.deleteRow"
			/>
			<MenuButton
				name="combine_cells"
				@click.native="commands.toggleCellMerge"
			/>
		</span>
		</div>
	</EditorMenuBar>
</template>

<script>
import { EditorMenuBar } from 'tiptap';
import MenuButton from './MenuButton.vue';

export default {
	name: 'MenuBar',
	props: ['editor'],
	components: {
		EditorMenuBar,
		MenuButton
	},
	methods: {
		showImagePrompt(command) {
			let uploader = new frappe.ui.FileUploader({
				allow_multiple: false,
				restrictions: {
					allowed_file_types: ['image/*']
				},
				on_success(file_doc) {
					command({
						src: file_doc.file_url
					});
				}
			});
		},
	},
}
</script>

<style lang="less">
@import "frappe/public/less/variables";

.menubar {
	padding: 8px;
	border-bottom: 1px solid @border-color;
}

ul[data-type="todo_list"] {
	padding-left: 0;
}
li[data-type="todo_item"] {
	display: flex;
	flex-direction: row;
}
.todo-checkbox {
	border: 2px solid @text-dark;
	height: 0.9em;
	width: 0.9em;
	box-sizing: border-box;
	margin-right: 10px;
	margin-top: 0.3rem;
	user-select: none;
	-webkit-user-select: none;
	cursor: pointer;
	border-radius: 0.2em;
	background-color: transparent;
	transition: 0.4s background;
}
.todo-content {
	flex: 1;
}
li[data-done="true"] {
	text-decoration: line-through;
}
li[data-done="true"] .todo-checkbox {
	background-color: @text-dark;
}

li[data-done="false"] {
	text-decoration: none;
}

.column-resize-handle {
	cursor: col-resize;
	background-color: @indicator-yellow;
	width: 2px;
	height: 100%;
}
</style>
