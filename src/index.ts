type Listener<T> = (items: T[]) => void;

abstract class Component<T extends HTMLElement, U extends HTMLElement> {
    templateElem: HTMLTemplateElement;
    renderElem: T;
    element: U;

    constructor(templateId: string, renderElemId: string, insertAtStart: boolean, newElemId?: string) {

        this.templateElem = document.getElementById(templateId)! as HTMLTemplateElement;
        this.renderElem = document.getElementById(renderElemId)! as T;
        const importedNode = document.importNode(this.templateElem.content, true);
        this.element = importedNode.firstElementChild as U;
        if (newElemId) this.element.id = newElemId;
        this.attach(insertAtStart);
    }

    private attach(insert: boolean) {
        this.renderElem.insertAdjacentElement(insert ? 'afterbegin' : 'beforeend', this.element);
    }

    abstract configure(): void;
    abstract contentRender(): void;
}

class ListenerState<T> {
    protected listeners: Listener<T>[] = [];

    addListener(listenerFn: Listener<T>) {
        this.listeners.push(listenerFn);
    }
}

class State extends ListenerState<Item>{
    private listData: Item[] = [];
    private static instance: State;
    private constructor() {
        super();
    }
    static getInstance() {
        if (this.instance) return this.instance;
        this.instance = new State();
        return this.instance;
    }

    setList(listData: object[]) {
        this.listData = listData.map((item, index) => new Item(item, index));
        this.updateListeners();
    }

    getList() {
        return this.listData;
    }

    addItem(data: object) {
        this.listData.push(new Item(data, this.listData.length-1));
        this.updateListeners();
    }

    changeSelectItem(listId: number[]) {
        this.listData = this.listData.map(item => {
            if (listId.includes(item.id)) item.changeSelect();
            return item;
        });
        this.updateListeners();
    }

    private updateListeners() {
        for (const listenerFn of this.listeners) {
            listenerFn(this.listData.slice());
        }
    }
}

class StatePreSelected extends ListenerState<number>{
    private listData: number[] = [];
    private static instance: StatePreSelected;
    private constructor() {
        super();
    }
    static getInstance() {
        if (this.instance) return this.instance;
        this.instance = new StatePreSelected();
        return this.instance;
    }

    preChangeSelected(id: number) {
        this.listData.push(id);
        this.updateListeners();
    }

    movePreChangeSelected(id: number) {
        this.listData.forEach((item, index) => {
            if (item === id) this.listData.splice(index, 1);
        });
        this.updateListeners();
    }

    clear() {
        this.listData = [];
        this.updateListeners();
    }

    private updateListeners() {
        for (const listenerFn of this.listeners) {
            listenerFn(this.listData.slice());
        }
    }
}

class OptionItem {
    targetClass: string;
    targetValue: string;
    constructor(targetClass: string, targetValue: string) {
        this.targetClass = targetClass;
        this.targetValue = targetValue;
    }
}

class Item {
    id: number;
    selected: boolean;
    data: object;
    constructor(data: object, index:number, selected = false) {
        this.data = data;
        this.id = new Date().getTime();
        this.id += index;
        this.selected = selected;
    }

    changeSelect() {
        this.selected = !this.selected;
    }
}

class ItemRender extends Component<HTMLUListElement, HTMLLIElement> {
    private isResponsive: boolean;
    private item: Item;
    private preSelected: boolean;
    private arrayLabel: OptionItem[] = [];

    constructor(hostId: string, item: Item, arrayLabel: OptionItem[], preSelected: boolean) {
        super(hostId === "picklist-responsive" ? "item-responsive" : "item", hostId, false, hostId === "picklist-responsive" ? `item-responsive-${item.id}` : `item-${item.id}`);
        this.isResponsive = hostId === "picklist-responsive";
        this.item = item;
        this.preSelected = preSelected;
        this.arrayLabel = arrayLabel;
        this.contentRender();
        this.configure();
    }

    configure() {
        if (this.isResponsive) {
            this.element.querySelector("input")!.checked = this.item.selected;
            this.element.querySelector(`input`)!.addEventListener("click", () => prjState.changeSelectItem([this.item.id]));
        }else{
            if (this.preSelected) {
                this.element.classList.add("preSelected");
                this.element.querySelector(".btn")!.addEventListener("click", () => statePreSelected.movePreChangeSelected(this.item.id));
            }else{
                this.element.querySelector(".btn")!.addEventListener("click", () => statePreSelected.preChangeSelected(this.item.id));
            }
        }
    }

    contentRender(){
        this.arrayLabel.forEach((item: OptionItem) => {
            let valueText = "";
            Object.entries(this.item.data).forEach(([key, value]) => {
                if (key === item.targetValue) {
                    valueText = value;
                }
            });
            const itemElem = this.element.querySelector(`.${item.targetClass}`) as HTMLParagraphElement;
            itemElem.innerText = valueText;
        });
    }
}

class PickList extends Component<HTMLDivElement, HTMLFormElement> {

    isResponsive: boolean = false;
    widthResponsive: number = 450;

    arrayLabel: OptionItem[];
    arrayData: Item[] = [];
    arrayDataPreSelected: number[] = [];

    arrayDataFiltered: Item[] = [];
    functionFilter: Function | null | undefined;
    stringFilter: string = "";
    labelTri: string | string[] | null | undefined;

    title: string | null | undefined;

    constructor(private type: 'available' | 'selected',
                arrayLabel: OptionItem[],
                option?: {
                    widthResponsive?: number,
                    labelTri?: string | string[] | null,
                    functionFilter?: Function | null,
                    title?: string | null
                }
    ) {
        super('picklist', 'app', false, `${type}-section-picklist`);
        this.arrayLabel = arrayLabel;
        if (option) {
            this.widthResponsive = option.widthResponsive || this.widthResponsive;
            this.labelTri = option.labelTri || null;
            this.functionFilter = option.functionFilter || null;
            this.title = option.title || null;
        }
        this.configure();
        this.contentRender();
    }

    private filter(value: any) {
        if (this.functionFilter !== null && this.functionFilter !== undefined) {
            return this.functionFilter(value);
        }
        return value.toString().toLowerCase().includes(this.stringFilter);
    }

    private _handleFilter(event: Event) {
        event.preventDefault();
        const target = event.target as HTMLInputElement;
        this.stringFilter = target.value.toString().toLowerCase();
        if (this.stringFilter !== "") {
            this.arrayDataFiltered = this.arrayData.filter(item => {
                for (const [key, value] of Object.entries(item.data)) {
                    if (this.labelTri) {
                        if (typeof this.labelTri == "string" ? key === this.labelTri : this.labelTri.includes(key)) {
                            if (this.filter(value)) return true;
                        }
                    }else{
                        if (this.filter(value)) return true;
                    }
                }
                return false;
            });
        }else{
            this.arrayDataFiltered = this.arrayData;
        }
        this.itemsRender();
    }

    configure(){
        this.isResponsive = this.widthResponsive >= window.innerWidth;
        this.element.querySelector(".item-responsive .filter")!.addEventListener("change", this._handleFilter.bind(this));
        this.element.querySelector(".item .filter")!.addEventListener("change", this._handleFilter.bind(this));
        prjState.addListener((items: Item[]) => {
            this.stringFilter = "";
            let inputFilterResponsive = this.element.querySelector(".item-responsive .filter") as HTMLInputElement;
            inputFilterResponsive.value = "";
            let inputFilter = this.element.querySelector(".item .filter") as HTMLInputElement;
            inputFilter.value = "";
            this.arrayData = this.isResponsive ? items : items.filter((item: Item) => this.type === 'available' ? !item.selected : item.selected);
            this.arrayDataFiltered = this.arrayData;
            this.itemsRender();
        });
        statePreSelected.addListener((items: number[]) => {
            this.arrayDataPreSelected = items;
            this.itemsRender();
        });
        window.addEventListener('resize', (e) => {
            let res = this.widthResponsive >= window.innerWidth;
            if (this.isResponsive !== res) {
                this.isResponsive = res;
                this.arrayData = this.isResponsive ? prjState.getList() : prjState.getList().filter((item: Item) => this.type === 'available' ? !item.selected : item.selected);
                this.arrayDataFiltered = this.arrayData;
                this.contentRender();
            }
        });
    }

    contentRender() {
        if (!this.isResponsive) {
            this.element.querySelector(".item")!.classList.remove("isHidden");
            this.element.querySelector(".item-responsive")!.classList.add("isHidden");
            this.element.querySelector('.item ul')!.id = `${this.type}-picklist`;
            const h2 = this.element.querySelector('.item h2') as HTMLHeadingElement;
            h2.innerText = this.title ? this.title : `${this.type.toUpperCase()} ITEM`;
            this.element.querySelector(".item .btn")!.addEventListener("click", () => {
                prjState.changeSelectItem(this.arrayDataPreSelected);
                statePreSelected.clear();
                const inputFilter = this.element.querySelector(".filter") as HTMLInputElement;
                inputFilter.value = "";
                this.arrayDataFiltered = this.arrayData;
                this.itemsRender();
            });
            this.itemsRender();
        }else if (this.type === 'available') {
            this.arrayDataFiltered = this.arrayData;
            this.element.querySelector(".item")!.classList.add("isHidden");
            this.element.querySelector(".item-responsive")!.classList.remove("isHidden");
            const h2 = this.element.querySelector('.item-responsive h2') as HTMLHeadingElement;
            h2.innerText = this.title ? this.title : `${this.type.toUpperCase()} ITEM`;
            this.element.querySelector('.item-responsive ul')!.id = `picklist-responsive`;
            prjState.changeSelectItem(this.arrayDataPreSelected);
            statePreSelected.clear();
            this.itemsRender();
        }else{
            prjState.changeSelectItem(this.arrayDataPreSelected);
            statePreSelected.clear();
            this.arrayDataFiltered = this.arrayData;
            this.element.querySelector(".item")!.classList.add("isHidden");
            this.element.querySelector(".item-responsive")!.classList.add("isHidden");
        }

    }

    private itemsRender() {
        if (!this.isResponsive || this.type === 'available') {
            let stringElement = !this.isResponsive ? `${this.type}-picklist` : `picklist-responsive`;
            const listEl = <HTMLUListElement>document.getElementById(stringElement);
            listEl.innerHTML = '';
            let dataRender = this.stringFilter !== "" ? this.arrayDataFiltered : this.arrayData;
            for (let [index, prjItem] of dataRender.entries()) {
                new ItemRender(stringElement, prjItem, this.arrayLabel, this.arrayDataPreSelected.includes(prjItem.id));
            }
        }
    }
}


/////////////////////////////////////////////////////


const prjState = State.getInstance();
const statePreSelected = StatePreSelected.getInstance();

let ArrayLabel: OptionItem[] = [
    new OptionItem('title','title'),
    new OptionItem('description','description'),
    new OptionItem('status','people')
];

let option = {
    labelTri: ["people","title"],
    title: "fez",
    widthResponsive: 900
}

let option2 = {
    widthResponsive: 900,
    title: "test",
    labelTri: 'people'
}


const PickListAvailable = new PickList(
    "available",
    ArrayLabel, option);
const PickListSelected = new PickList(
    "selected",
    ArrayLabel, option2);


// class de test
class ItemTest {
    constructor(public id: string, public title: string, public description: string, public people: number, public status: 0) { }
}

const listData: ItemTest[] = [];

for (let i = 0; i < 10; i++) {
    let test = new ItemTest(i.toString(), Math.random().toString()+' test', 'test', i+20, 0);
    listData.push(test);
    // prjState.addItem(test);
}
prjState.setList(listData);
