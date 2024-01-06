import { browser } from '$app/environment';
import { writable } from 'svelte/store';

export const username = writable<string>((browser && localStorage.getItem('username')) || '');

username.subscribe((value) => {
	// check for localStorage, this won't run on SSR
	if (browser) return localStorage.setItem('username', value);
});
