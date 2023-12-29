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

	type Rules = {
		[k: string]: string;
	};

	export let linguisticVariables: Record<string, LinguisticVariable>;
	export let fuzzyRules: FuzzyRule[];

	const client = useQueryClient();
	const deleteMutation = createMutation({
		mutationFn: (id: unknown) => api().deleteFuzzyRule(id as string),
		onSuccess: () => client.invalidateQueries({ queryKey: ['settings'] })
	});

	const addMutataion = createMutation({
		mutationFn: (newRule: NewFuzzyRule) => api().addFuzzyRules(newRule),
		onSuccess: async (resp) => {
			if (resp.status === 200) {
				client.invalidateQueries({ queryKey: ['settings'] });
			} else {
				const errMsg = await resp.text();
				alert(errMsg);
			}
		}
	});

	// this is so ugly but necessary for the options to work
	let inputVar = Object.entries(linguisticVariables).filter(
		([, info]) => info.kind === LinguisticVarKind.Input
	);
	let outputVar = Object.entries(linguisticVariables).filter(
		([, info]) => info.kind === LinguisticVarKind.Output
	);
	$: inputVar = Object.entries(linguisticVariables).filter(
		([, info]) => info.kind === LinguisticVarKind.Input
	);
	$: outputVar = Object.entries(linguisticVariables).filter(
		([, info]) => info.kind === LinguisticVarKind.Output
	);

	const defaultColumns: ColumnDef<Rules>[] = [
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
	//$: console.log(newRule);

	// inputVar and outputVar is not reactive -_-
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

	const options = writable<TableOptions<Rules>>({
		data,
		columns: defaultColumns,
		getCoreRowModel: getCoreRowModel()
	});
	$: options.update((options) => ({
		...options,
		data
	}));

	const table = createSvelteTable(options);
</script>

<div class="p-4">
	<table>
		<thead>
			{#each $table.getHeaderGroups() as headerGroup}
				<tr>
					{#each headerGroup.headers as header}
						<th colSpan={header.colSpan}>
							{#if !header.isPlaceholder}
								<svelte:component
									this={flexRender(header.column.columnDef.header, header.getContext())}
								/>
							{/if}
						</th>
					{/each}
				</tr>
			{/each}
		</thead>
		<tbody>
			{#each $table.getRowModel().rows as row}
				<tr>
					{#each row.getVisibleCells() as cell}
						<td>
							{#if cell.column.columnDef.id === 'actions'}
								<button class="bg-[#ff3232] text-[#FFFFFF] border border-[#313131] rounded-md text-md font-thin px-2" on:click={() => $deleteMutation.mutate(cell.getValue())}>delete</button>
							{:else}
								<svelte:component
									this={flexRender(cell.column.columnDef.cell, cell.getContext())}
								/>
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
					<th>
						<select class="bg-[#1A1A1A] text-[#A6A6A6] border border-[#313131] rounded-md" bind:value={newRule[ruleOpt.kind][ruleOpt.name]}>
							{#each ruleOpt.options as opt}
								<option value={opt}>{opt}</option>
							{/each}
						</select>
					</th>
				{/each}
				<th>
					<button class="bg-[#4e7ffa] text-[#FFFFFF] border border-[#313131] rounded-md text-md font-thin px-2" on:click={() => $addMutataion.mutate(newRule)}>add</button>
				</th>
			</tr>
		</tfoot>
	</table>
</div>

<style>
	table {
		border: 1px solid lightgray;
	}

	tbody {
		border-bottom: 1px solid lightgray;
	}

	th {
		border-bottom: 1px solid lightgray;
		border-right: 1px solid lightgray;
		padding: 2px 4px;
	}
</style>
