import { writable, type Writable } from 'svelte/store';
import type { Post } from '$lib/types/reddit';

const selected_post: Writable<Post> = writable();
export default selected_post
