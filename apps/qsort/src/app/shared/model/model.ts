import { SafeResourceUrl } from '@angular/platform-browser';

export class DragglebleStatementList {
    id: string;
    category: string;
    statements: Array<StatementWithResponseAndImage>;
}

export class DragglebleStatementListWithValue extends DragglebleStatementList {
    value: string;
}
export class GridTile {
    value: number;
    rowIndex: number;
}

export class Item {
    id: string;
    title: string;
    sequenceNumber: number;
    statements: Statement[]
}

export class Image {
    id!: string;
    base64Image!: string;
}

export class ItemWithImageAndResponses extends Item {
    state: ItemState;
    statements!: StatementWithResponseAndImage[]
}

export class Statement {
    id: string;
    text: string;
    title: string;
    context: string;
    left: string;
    right: string;
}

export class StatementWithResponseAndImage extends Statement {
    image: string;
    category?: string;
    value?: string;
}

export class Session {
    id: string;
    name: string;
    startDate: Date;
    endDate?: Date;
    state: SessionState;
    items: ItemWithImageAndResponses[];
}

export enum SessionState {
    inprogress = 0,
    finished = 1
}

export enum ItemState {
    notstarted = 0,
    categorize = 1,
    sort = 2,
    finished = 3
}

// export enum Category {
//     agree,
//     neutral,
//     disagree,
//     none
// }