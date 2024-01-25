<script lang="ts">
	import { api } from '$lib/apiClient';
	import {
		LinguisticVarKind,
		type FuzzyRule,
		type LinguisticVariable,
		type NewFuzzyRule
	} from '$lib/types';
	import { createMutation, useQueryClient } from '@tanstack/svelte-query';
	import {
		createSvelteTable,
		flexRender,
		getCoreRowModel,
		type ColumnDef,
		type TableOptions
	} from '@tanstack/svelte-table';
	import { mergeAll } from 'ramda';
	import { writable } from 'svelte/store';
	import Button, { Label } from '@smui/button';
	import { Icon } from '@smui/icon-button';

	type Rules = {
		[k: string]: string;
	};

	export let linguisticVariables: Record<string, LinguisticVariable>;
	export let fuzzyRules: FuzzyRule[];
	export let currPreset: string;
	const client = useQueryClient();

	const deleteMutation = createMutation({
		mutationFn: (id: unknown) => api().deleteFuzzyRule(id as string, currPreset),
		onSuccess: () => client.invalidateQueries({ queryKey: ['settings'] })
	});

	const addMutataion = createMutation({
		mutationFn: (newRule: NewFuzzyRule) => api().addFuzzyRules(newRule, currPreset),
		onSuccess: async (resp) => {
			if (resp.status === 200) {
				client.invalidateQueries({ queryKey: ['settings'] });
			} else {
				const errMsg = await resp.text();
				alert(errMsg);
			}
		}
	});

	let inputVar: [string, LinguisticVariable][];
	let outputVar: [string, LinguisticVariable][];
	$: {
		inputVar = Object.entries(linguisticVariables).filter(
			([, info]) => info.kind === LinguisticVarKind.Input
		);
		outputVar = Object.entries(linguisticVariables).filter(
			([, info]) => info.kind === LinguisticVarKind.Output
		);
	}

	// this need to be reactive, fuck all of this is so ugly
	let defaultColumns: ColumnDef<Rules>[];
	$: defaultColumns = [
		{
			header: 'Valid',
			id: 'valid',
			accessorKey: 'valid'
		},
		{
			header: 'Input',
			columns: inputVar.map(([name]) => ({
				accessorKey: name,
				cell: (info) => info.getValue()
			}))
		},
		{
			header: 'Output',
			columns: outputVar.map(([name]) => ({
				accessorKey: name,
				cell: (info) => info.getValue()
			}))
		},
		{
			header: 'Action',
			id: 'actions',
			accessorKey: 'id'
		}
	];

	let newRule: NewFuzzyRule = { input: {}, output: {} };

	$: ruleOptions = inputVar
		.map(([name, linguisticVar]) => {
			let options: (string | null)[] = Object.keys(linguisticVar.shapes);
			options.push(null);
			return {
				kind: linguisticVar.kind,
				name,
				options
			};
		})
		.concat(
			outputVar.map(([name, linguisticVar]) => {
				let options: (string | null)[] = Object.keys(linguisticVar.shapes);
				options.push(null);
				return { kind: linguisticVar.kind, name, options };
			})
		);

	$: data = fuzzyRules.map((r) => mergeAll([r.input, r.output, { id: r.id }, { valid: r.valid }]));
	let options = writable<TableOptions<Rules>>({
		data,
		columns: defaultColumns,
		getCoreRowModel: getCoreRowModel()
	});
	$: options.update(() => ({
		data,
		columns: defaultColumns,
		getCoreRowModel: getCoreRowModel()
	}));

	const table = createSvelteTable(options);
</script>

<div class="py-4 px-64">
	<table class="border-collapse w-full border border-[#313131]">
		<thead>
			{#each $table.getHeaderGroups() as headerGroup}
				<tr>
					{#each headerGroup.headers as header}
						<td class="bg-[#1A1A1A] border-[#313131] text-center p-3 font-bold" class:border-b={!header.isPlaceholder} class:border-l={!header.isPlaceholder} class:border-r={!header.isPlaceholder} colSpan={header.colSpan}>
							{#if !header.isPlaceholder}
								<div>
									<svelte:component
									this={flexRender(header.column.columnDef.header, header.getContext())}
								/>
								</div>
							{/if}
						</td>
					{/each}
				</tr>
			{/each}
		</thead>
		<tbody>
			{#each $table.getRowModel().rows as row}
				<tr>
					{#each row.getVisibleCells() as cell}
						<td class="border border-[#313131] p-2">
							{#if cell.column.columnDef.id === 'actions'}
								<div class="text-center">
								<Button class="" variant="outlined" on:click={() => $deleteMutation.mutate(cell.getValue())}>
									<Icon class="material-icons">delete</Icon>
									<Label>Remove</Label>
								</Button>
								</div>
							{:else}
								<div class="text-center">
									<svelte:component
									this={flexRender(cell.column.columnDef.cell, cell.getContext())}
								/>
								</div>
							{/if}
						</td>
					{/each}
				</tr>
			{/each}
		</tbody>
		<tfoot>
			<tr>
				<th />
				{#each ruleOptions as ruleOpt}
					<th class="p-2">
						<select
							class="bg-[#1A1A1A] text-[#A6A6A6] border border-[#313131] rounded-md"
							bind:value={newRule[ruleOpt.kind][ruleOpt.name]}
						>
							{#each ruleOpt.options as opt}
								<option value={opt}>{opt}</option>
							{/each}
						</select>
					</th>
				{/each}
				<th class="p-2">
					<Button class="" variant="outlined" on:click={() => $addMutataion.mutate(newRule)}>
						<Icon class="material-icons">add</Icon>
						<Label>Add Rule</Label>
					</Button>
				</th>
			</tr>
		</tfoot>
	</table>
</div>