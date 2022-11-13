
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
const personnage = {
    id: 'id',
    titleHtml: 'Titre',
    description: 'description',
    status: 'image',
    selected: 'selected'
};

let ArrayLabel: OptionItem[] = [
    new OptionItem('titleHtml', personnage.name),

    new OptionItem('descriptionHtml', 'description'),

    new OptionItem('statusHtml','status')
];
```

Dans cet exemple, on affiche les valeurs title, description et status dans les champs correspondant du html. Le rendu sera donc : 
```html
<p class="titleHtml">Titre</p>
<p class="descriptionHtml">description</p>
<p class="statusHtml">image</p>
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
    title?: string // titre du picklist,
    placeholderFilter?: string // placeholder du filtre
}
```

## Exemple

```html
<template id="item">
    <li draggable="true">
        <p class="title"></p>
        <p class="description"></p>
        <p class="status"></p>
    </li>
</template>

<template id="item-responsive">
    <li>
        <div class="box1">
            <input type="checkbox">
        </div>
        <div class="box2">
            <p class="title"></p>
            <p class="description"></p>
            <p class="status"></p>
        </div>
    </li>
</template>

<template id="picklist">
    <section>
        <div class="item-responsive">
            <header>
                <h2></h2>
            </header>
            <input type="text" class="filter">
            <ul></ul>
        </div>
        <div class="item">
            <header>
                <h2></h2>
            </header>
            <input type="button" class="btn" value="submit">
            <input type="text" class="filter">
            <ul></ul>
        </div>
    </section>
</template>

<div id="app"></div>
```




