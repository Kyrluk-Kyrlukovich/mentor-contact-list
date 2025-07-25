export interface IContactItem {
    name: string;
    vacancy: string;
    phone: string;
}

export interface IListContacts {
    items: IContactItem[];
    add: (item: IContactItem) => void;
    saveItems: () => void;
    remove: (name: string) => void;
    updateElem: (name: string, newValue: IContactItem) => void;
    clearList: () => void;
    getElemByName: (name: string) => IContactItem;
    search: (str: string) => IContactItem[];
}

export interface IContactListHtml {
    contactListHMTL?: HTMLAllCollection;
    getTemplate: (item: IContactItem, withEdit: boolean) => string;
    drawContactList: () => void;
}