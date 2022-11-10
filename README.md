
# Project PickList typescript

#### Baptiste Angot - Arthur Brunet

## Get started

#### Initialisez 2 state.
```js
const prjState = State.getInstance();
const statePreSelected = StatePreSelected.getInstance();
```
#### Configurez les valeurs a afficher dans le html.
```js
let ArrayLabel: OptionItem[] = [
    new OptionItem('title','title'),

    new OptionItem('description','description'),

    new OptionItem('status','people')
];
```
#### Initialisez 2 pickList ( un en type "available" et un autre en type "selected")

```js
const PickListAvailable = new PickList(
    "available",
    ArrayLabel, option);

const PickListSelected = new PickList(
    "selected",
    ArrayLabel, option);
```

#### Ajout d'éléments dans la liste
```js
const prjState = State.getInstance();
{...}
prjState.setList(["monObject", "monObject2", ...]);
prjState.addItem("monObject3");
```

## Doc
```js
OptionItem {
    targetClass: String,
    targetValue: String
}

PickList  {
    type: "available" | "selected", // le type available et aussi le type utilisé pour le responsive
    arrayLabel: OptionItem[],
    option?: {}
}

(facultatif) 
option {
    widthResponsive?: number, // taille en px pour le responsive
    labelTri?: string | string[], // le label qui sera effective au tri (peut-être un array)
    functionFilter?: Function, // fonction du filtre
    title?: string // titre du picklist
}
```




