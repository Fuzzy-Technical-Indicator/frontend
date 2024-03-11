<script lang="ts">
	import { page } from '$app/stores';
	import Button, { Label, Icon } from '@smui/button';
	let showMenu: boolean;
	const toggleNavbar = () => {
		showMenu = !showMenu;
	};
	const closeNavbar = () => {
		showMenu = false;
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
					<img src="/favicon.png" alt="fzt-logo" width="50" height="50" class="mr-2" />
					<p
						class="font-yuji text-transparent text-xs sm:text-base md:text-xs md:hidden sm:flex lg:flex lg:text-base bg-clip-text bg-gradient-to-bl from-gray-900 via-white to-gray-900"
					>
						Fuzzy Technical Indicator
					</p>
				</a>
				<!-- Mobile menu button -->
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<div on:click={toggleNavbar} class="flex md:hidden">
					<button
						type="button"
						class="text-white hover:text-white focus:outline-none focus:text-white"
					>
						{#if !showMenu}
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
						{:else}
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="w-6 h-6"
								fill="currentColor"
								stroke="currentColor"
								stroke-width="1.5"
								viewBox="0 0 50 50"
							>
								<path
									d="M 7.71875 6.28125 L 6.28125 7.71875 L 23.5625 25 L 6.28125 42.28125 L 7.71875 43.71875 L 25 26.4375 L 42.28125 43.71875 L 43.71875 42.28125 L 26.4375 25 L 43.71875 7.71875 L 42.28125 6.28125 L 25 23.5625 Z"
								/>
							</svg>
						{/if}
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
					on:click={closeNavbar}
					href="/"><span class:text-white={$page.url.pathname === '/'}>CHART</span></a
				>
				<a
					class="font-nunito font-normal text-[#A6A6A6] transition duration-500 ease-in-out text-l hover:text-[#FFFFFF]"
					on:click={closeNavbar}
					href="/settings"
					><span class:text-white={$page.url.pathname.includes('/settings')}>SETTINGS</span></a
				>
				<a
					class="font-nunito font-normal text-[#A6A6A6] transition duration-500 ease-in-out text-l hover:text-[#FFFFFF]"
					on:click={closeNavbar}
					href="/backtests"
					><span class:text-white={$page.url.pathname.includes('/backtests')}>BACKTESTS</span></a
				>
				<a
					class="font-nunito font-normal text-[#A6A6A6] text-l hover:text-[#FFFFFF]"
					on:click={closeNavbar}
					href="/pso"><span class:text-white={$page.url.pathname.includes('/pso')}>PSO</span></a
				>
				<form method="POST" action="/?/logout">
					<Button variant="outlined" class="my-primary-button">
						<Icon class="material-icons">person_off</Icon>
						<Label>LOGOUT</Label>
					</Button>
				</form>
			</div>
		</nav>
	</div>
</div>
