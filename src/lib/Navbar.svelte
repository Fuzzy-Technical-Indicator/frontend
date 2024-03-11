<script lang="ts">
	import { page } from '$app/stores';
	import Button, { Label, Icon } from '@smui/button';
	import { username } from './auth';
	let showMenu = false;
	const toggleNavbar = () => {
		showMenu = !showMenu;
	};
</script>

<div class="bg-black text-[#D4D4D4]">
	<div class="bg-black text-[#D4D4D4]">
		<nav
			class="container max-w-8xl bg-black py-8 px-16 mx-auto md:flex md:justify-between md:items-center"
		>
			<div class="flex items-center justify-between">
				<a
					class="text-lg inline-flex items-center font-extralight text-[#FFFFFF] md:text-xl"
					href="/"
				>
					<img src="/favicon.png" alt="fzt-logo" width="35" height="35" class="mr-2" />
					<p
						class="font-yuji text-transparent bg-clip-text bg-gradient-to-bl from-gray-900 via-gray-100 to-gray-900"
					>
						Fuzzy Technical Indicator
					</p>
				</a>
				<!-- Mobile menu button -->
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<div on:click={toggleNavbar} class="flex md:hidden">
					<button
						type="button"
						class="text-gray-800 hover:text-gray-400 focus:outline-none focus:text-gray-400"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.5"
							stroke="currentColor"
							class="w-6 h-6"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
							/>
						</svg>
					</button>
				</div>
			</div>

			<!-- Mobile Menu open: "block", Menu closed: "hidden" -->
			<div
				class="flex-col ml-4 mt-8 space-y-4 md:flex md:space-y-0 md:flex-row md:items-center md:space-x-10 md:mt-0 {showMenu
					? 'flex'
					: 'hidden'}"
			>
				<a
					class="font-normal text-[#A6A6A6] transition duration-500 ease-in-out text-l hover:text-[#FFFFFF]"
					href="/"><span class:text-white={$page.url.pathname === '/'}>CHART</span></a
				>
				<a
					class="font-nunito font-normal text-[#A6A6A6] transition duration-500 ease-in-out text-l hover:text-[#FFFFFF]"
					href="/settings"
					><span class:text-white={$page.url.pathname.includes('/settings')}>SETTINGS</span></a
				>
				<a
					class="font-nunito font-normal text-[#A6A6A6] transition duration-500 ease-in-out text-l hover:text-[#FFFFFF]"
					href="/backtests"
					><span class:text-white={$page.url.pathname.includes('/backtests')}>BACKTESTS</span></a
				>
				<a class="font-nunito font-normal text-[#A6A6A6] text-l hover:text-[#FFFFFF]" href="/pso"
					><span class:text-white={$page.url.pathname.includes('/pso')}>PSO</span></a
				>
				<form method="POST" action="/?/logout">
					<Button
						variant="outlined"
						class="my-primary-button"
						on:click={() => {
							username.set('');
						}}
					>
						<Icon class="material-icons">person_off</Icon>
						<Label>LOGOUT</Label>
					</Button>
				</form>
			</div>
		</nav>
	</div>
</div>
