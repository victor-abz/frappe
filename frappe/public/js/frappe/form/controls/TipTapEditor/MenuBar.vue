<template>
	<EditorMenuBar :editor="editor">
      <div class="menubar" slot-scope="{ commands, isActive }">

        <button
          class="btn btn-default btn-xs"
          :class="{ 'active': isActive.bold() }"
          @click="commands.bold"
        >
          <icon name="bold" />
        </button>

        <button
          class="btn btn-default btn-xs"
          :class="{ 'active': isActive.italic() }"
          @click="commands.italic"
        >
          <icon name="italic" />
        </button>

        <button
          class="btn btn-default btn-xs"
          :class="{ 'active': isActive.strike() }"
          @click="commands.strike"
        >
          <icon name="strike" />
        </button>

        <button
          class="btn btn-default btn-xs"
          :class="{ 'active': isActive.underline() }"
          @click="commands.underline"
        >
          <icon name="underline" />
        </button>

        <button
          class="btn btn-default btn-xs"
          :class="{ 'active': isActive.code() }"
          @click="commands.code"
        >
          <icon name="code" />
        </button>

        <button
          class="btn btn-default btn-xs"
          :class="{ 'active': isActive.paragraph() }"
          @click="commands.paragraph"
        >
          <icon name="paragraph" />
        </button>

        <button
          class="btn btn-default btn-xs"
          :class="{ 'active': isActive.heading({ level: 1 }) }"
          @click="commands.heading({ level: 1 })"
        >
          H1
        </button>

        <button
          class="btn btn-default btn-xs"
          :class="{ 'active': isActive.heading({ level: 2 }) }"
          @click="commands.heading({ level: 2 })"
        >
          H2
        </button>

        <button
          class="btn btn-default btn-xs"
          :class="{ 'active': isActive.heading({ level: 3 }) }"
          @click="commands.heading({ level: 3 })"
        >
          H3
        </button>

        <button
          class="btn btn-default btn-xs"
          :class="{ 'active': isActive.bullet_list() }"
          @click="commands.bullet_list"
        >
          <icon name="ul" />
        </button>

        <button
          class="btn btn-default btn-xs"
          :class="{ 'active': isActive.ordered_list() }"
          @click="commands.ordered_list"
        >
          <icon name="ol" />
        </button>

        <button
          class="btn btn-default btn-xs"
          :class="{ 'active': isActive.blockquote() }"
          @click="commands.blockquote"
        >
          <icon name="quote" />
        </button>

        <button
          class="btn btn-default btn-xs"
          :class="{ 'active': isActive.code_block() }"
          @click="commands.code_block"
        >
          <icon name="code" />
        </button>

        <button
          class="btn btn-default btn-xs"
          @click="commands.horizontal_rule"
        >
          <icon name="hr" />
        </button>

        <button
          class="btn btn-default btn-xs"
          @click="commands.undo"
        >
          <icon name="undo" />
        </button>

        <button
          class="btn btn-default btn-xs"
          @click="commands.redo"
        >
          <icon name="redo" />
        </button>

		<button
          class="btn btn-default btn-xs"
          @click="showImagePrompt(commands.image)"
        >
          <icon name="image" />
        </button>

		<button
          class="btn btn-default btn-xs"
          :class="{ 'active': isActive.todo_list() }"
          @click="commands.todo_list"
        >
          <icon name="checklist" />
        </button>

		<button
			class="btn btn-default btn-xs"
			@click="commands.createTable({rowsCount: 3, colsCount: 3, withHeaderRow: false })"
		>
			<icon name="table" />
		</button>

		<span v-if="isActive.table()">
			<button
				class="btn btn-default btn-xs"
				@click="commands.deleteTable"
			>
				<icon name="delete_table" />
			</button>
			<button
				class="btn btn-default btn-xs"
				@click="commands.addColumnBefore"
			>
				<icon name="add_col_before" />
			</button>
			<button
				class="btn btn-default btn-xs"
				@click="commands.addColumnAfter"
			>
				<icon name="add_col_after" />
			</button>
			<button
				class="btn btn-default btn-xs"
				@click="commands.deleteColumn"
			>
				<icon name="delete_col" />
			</button>
			<button
				class="btn btn-default btn-xs"
				@click="commands.addRowBefore"
			>
				<icon name="add_row_before" />
			</button>
			<button
				class="btn btn-default btn-xs"
				@click="commands.addRowAfter"
			>
				<icon name="add_row_after" />
			</button>
			<button
				class="btn btn-default btn-xs"
				@click="commands.deleteRow"
			>
				<icon name="delete_row" />
			</button>
			<button
				class="btn btn-default btn-xs"
				@click="commands.toggleCellMerge"
			>
				<icon name="combine_cells" />
			</button>
		</span>
      </div>
    </EditorMenuBar>
</template>

<script>
import { EditorMenuBar } from 'tiptap';
import Icon from './Icon.vue';

export default {
	name: 'MenuBar',
	props: ['editor'],
	components: {
		EditorMenuBar,
		Icon
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
	padding: 8px 12px;
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
