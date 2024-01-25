<script lang="ts">
	import { api } from '$lib/apiClient';
	import { ShapeType, type FuzzySet, type LinguisticVariable } from '$lib/types';
	import { createMutation, useQueryClient } from '@tanstack/svelte-query';
	import omit from 'ramda/src/omit';
	import TriangleInputs from './TriangleInputs.svelte';
	import TrapezoidInputs from './TrapezoidInputs.svelte';

	import Accordion, { Panel, Header, Content } from '@smui-extra/accordion';
	import IconButton, { Icon } from '@smui/icon-button';
	import Textfield from '@smui/textfield';
	import Button, { Label } from '@smui/button';

	export let info: LinguisticVariable;
	export let name: string;
	export let preset: string;

	let lowerBoundary = info.lowerBoundary;
	let upperBoundary = info.upperBoundary;

	type Shapes = Record<string, Omit<FuzzySet, 'data' | 'latex'>>;

	let shapes: Shapes;
	$: shapes = info.shapes;

	const handleRemoveFuzzySet = (name: string) => {
		shapes = omit([name], shapes);
	};

	let newFuzzySetType = ShapeType.Triangle;
	let newFuzzySetName = '';
	let newFuzzySetTriangleParameters: Record<string, number> = {
		center: 0,
		width: 0,
		height: 0
	};
	let newFuzzySetTrapezoidParameters: Record<string, number> = {
		a: 0,
		b: 0,
		c: 0,
		d: 0,
		height: 0
	};

	const handleAddNewFuzzySet = () => {
		if (!(newFuzzySetName in shapes)) {
			$updateMutation.mutate({
				...shapes,
				[newFuzzySetName]: {
					shapeType: newFuzzySetType,
					parameters:
						newFuzzySetType === ShapeType.Triangle
							? newFuzzySetTriangleParameters
							: newFuzzySetTrapezoidParameters
				}
			});
		} else {
			alert('Fuzzy set with that name already exists');
		}
	};

	const client = useQueryClient();
	const updateMutation = createMutation({
		mutationFn: (shapes: Shapes) =>
			api().updateLinguisticVars(
				{
					[name]: {
						lowerBoundary,
						upperBoundary,
						shapes: Object.fromEntries(
							Object.entries(shapes).map(([k, v]) => {
								return [k, { shapeType: v.shapeType, parameters: v.parameters }];
							})
						),
						kind: info.kind
					}
				},
				preset
			),
		onSuccess: async (resp) => {
			if (resp.status === 200) {
				client.invalidateQueries({ queryKey: ['settings'] });
				newFuzzySetName = '';
				newFuzzySetTriangleParameters = {
					center: 0,
					width: 0,
					height: 0
				};
				newFuzzySetTrapezoidParameters = {
					a: 0,
					b: 0,
					c: 0,
					d: 0,
					height: 0
				};
			} else {
				const errMsg = await resp.text();
				alert(errMsg);
			}
		}
	});

	const deleteMutation = createMutation({
		mutationFn: () => api().deleteLinguisticVar(name, preset),
		onSuccess: () => {
			client.invalidateQueries({ queryKey: ['settings'] });
		}
	});

	let universePanelOpen = false;
	let shapesPanelOpen = false;
</script>

<div class="pt-8 pb-4">
	<div class="bg-[#000000] border border-[#313131] rounded">
		<div class="accordion-container">
			<Accordion multiple>
				<Panel bind:open={universePanelOpen}>
					<Header
						>Universe
						<span slot="description">Edit universe's boundary</span>
						<IconButton slot="icon" toggle pressed={universePanelOpen}>
							<Icon class="material-icons" on>expand_less</Icon>
							<Icon class="material-icons">expand_more</Icon>
						</IconButton>
					</Header>
					<Content>
						<div class="my-4 text-center bg-[#1A1A1A] border border-[#313131] rounded py-4">
							<Textfield
								class="mr-4"
								variant="filled"
								bind:value={lowerBoundary}
								label="Lower Boundary"
							/>
							<Textfield variant="filled" bind:value={upperBoundary} label="Upper Boundary" />
						</div>
					</Content>
				</Panel>

				<Panel bind:open={shapesPanelOpen}>
					<Header
						>Shapes
						<span slot="description">Edit shapes's parameters</span>
						<IconButton slot="icon" toggle pressed={shapesPanelOpen}>
							<Icon class="material-icons" on>expand_less</Icon>
							<Icon class="material-icons">expand_more</Icon>
						</IconButton>
					</Header>
					<Content>
						<div>
							{#each Object.entries(shapes) as [name, shape] (name)}
								<div class="my-4 bg-[#1A1A1A] border border-[#313131] rounded py-4">
									<div class="mx-4 mb-2 flex justify-between">
										<p class="font-bold text-lg text-center">{`${name} - ${shape.shapeType}`}</p>
										<button
											class="bg-[#1A1A1A] text-[#FFFFFF] rounded px-2"
											on:click={() => handleRemoveFuzzySet(name)}
											><Icon class="material-icons" on>delete</Icon></button
										>
									</div>
									<div class="mx-8">
										{#if shape.shapeType === ShapeType.Triangle}
											<TriangleInputs bind:parameters={shapes[name].parameters} />
										{:else if shape.shapeType === ShapeType.Trapezoid}
											<TrapezoidInputs bind:parameters={shapes[name].parameters} />
										{/if}
									</div>
								</div>
							{/each}
						</div>
						<div class="py-4">
							<div class="my-3">
								<div class="flex justify-between my-4">
									<div>
										<Textfield class="mr-4" bind:value={newFuzzySetName} label="Name" />
										<select
											class="bg-[#232428] text-[#F8F9FA] pl-2 rounded custom-select"
											bind:value={newFuzzySetType}
										>
											{#each Object.values(ShapeType) as t}
												<option value={t}>{t}</option>
											{/each}
										</select>
									</div>
									<div>
										<Button variant="raised" on:click={handleAddNewFuzzySet}>
											<Icon class="material-icons">add</Icon>
											<Label>Add new shape</Label>
										</Button>
									</div>
								</div>
								<div>
									{#if newFuzzySetType === ShapeType.Triangle}
										<TriangleInputs bind:parameters={newFuzzySetTriangleParameters} />
									{:else if newFuzzySetType === ShapeType.Trapezoid}
										<TrapezoidInputs bind:parameters={newFuzzySetTrapezoidParameters} />
									{/if}
								</div>
							</div>
						</div>
					</Content>
				</Panel>
			</Accordion>
		</div>
	</div>
	<div class="pt-4">
		<Button
			variant="outlined"
			on:click={() => {
				$updateMutation.mutate(shapes);
			}}
		>
			<Icon class="material-icons">save</Icon>
			<Label>Save</Label>
		</Button>
		<Button
			variant="outlined"
			on:click={() => {
				$deleteMutation.mutate();
			}}
		>
			<Icon class="material-icons">delete</Icon>
			<Label>Remove</Label>
		</Button>
	</div>
</div>
