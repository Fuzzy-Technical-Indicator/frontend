<script lang="ts">
	import { LinguisticVarKind, type LinguisticVariable } from '$lib/types';
	import {
		createSvelteTable,
		flexRender,
		getCoreRowModel,
		type ColumnDef,
		type TableOptions
	} from '@tanstack/svelte-table';
	import { writable } from 'svelte/store';

	export let linguisticVariables: Record<string, LinguisticVariable>;

	type Rules = {
		[k: string]: string;
	};

	const inputVar = Object.entries(linguisticVariables).filter(
		([, info]) => info.kind === LinguisticVarKind.Input
	);
	const outputVar = Object.entries(linguisticVariables).filter(
		([, info]) => info.kind === LinguisticVarKind.Output
	);

	const defaultColumns: ColumnDef<Rules>[] = [
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
		}
	];

	const options = writable<TableOptions<Rules>>({
		data: [{ rsi: 'long', long: 'strong' }],
		columns: defaultColumns,
		getCoreRowModel: getCoreRowModel()
	});

	const table = createSvelteTable(options);
</script>

<div class="p-2">
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
							<svelte:component this={flexRender(cell.column.columnDef.cell, cell.getContext())} />
						</td>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
	<div class="h-4" />
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
