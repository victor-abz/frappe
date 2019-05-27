<template>
	<button class="menu-button btn btn-xs">
		<span class="menu-button-icon" v-html="iconSvg" :data-icon="name"></span>
	</button>
</template>

<script>
import bold from './icons/bold.svg';
import italic from './icons/italic.svg';
import strike from './icons/strikethrough.svg';
import underline from './icons/underline.svg';
import code from './icons/code-view.svg';
import paragraph from './icons/paragraph.svg';
import ul from './icons/list-unordered.svg';
import ol from './icons/list-ordered.svg';
import quote from './icons/double-quotes-l.svg';
import hr from './icons/separator.svg';
import undo from './icons/arrow-go-back-line.svg';
import redo from './icons/arrow-go-forward-line.svg';
import image from './icons/image-line.svg';
import checklist from './icons/list-check-2.svg';
import table from './icons/table-2.svg';

export default {
	name: 'MenuButton',
	props: ['name'],
	computed: {
		iconSvg() {
			return {
				bold,
				italic,
				strike,
				underline,
				code,
				paragraph,
				ul,
				ol,
				quote,
				hr,
				undo,
				redo,
				image,
				checklist,
				table,
				heading1: 'H1',
				heading2: 'H2',
				heading3: 'H3'
			}[this.name];
		}
	}
}
</script>
<style lang="less">
@import "frappe/public/less/variables";

.menu-button.active {
	background-color: @btn-bg;
}
.menu-button-icon {
	display: flex;
}
.menu-button-icon svg {
	width: 16px;
	height: 16px;
}
</style>
