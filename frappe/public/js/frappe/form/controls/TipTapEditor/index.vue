<template>
	<div class="border rounded">
		<MenuBar :editor="editor" />
		<EditorContent :editor="editor" />
	</div>
</template>

<script>
import { Editor, EditorContent, EditorMenuBar } from 'tiptap';
import MenuBar from './MenuBar.vue';
import extensions from './extensions';

export default {
	mixins: [extensions],
	components: {
		EditorContent,
		EditorMenuBar,
		MenuBar
	},
	data() {
		return {
			editor: null,
		}
	},
	mounted() {
		this.editor = new Editor({
			content: '',
			extensions: this.get_extensions(),
			onUpdate: ({ getHTML }) => {
				this.$emit('change', getHTML());
			}
		})
	},
	beforeDestroy() {
		this.editor.destroy()
	},
}
</script>
