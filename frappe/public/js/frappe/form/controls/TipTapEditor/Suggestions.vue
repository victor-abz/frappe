<template>
	<div class="suggestion-list" v-show="showSuggestions" ref="suggestions">
		<template v-if="hasResults">
			<div
			v-for="(user, index) in filteredUsers"
			:key="user.id"
			class="suggestion-list__item"
			:class="{ 'is-selected': navigatedUserIndex === index }"
			@click="selectUser(user)"
			>
			{{ user.name }}
			</div>
		</template>
		<div v-else class="suggestion-list__item is-empty">
			No users found
		</div>
	</div>
</template>
