import * as Excel from 'exceljs';
import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

export default class Excelprocessor {


    // function to encode file data to base64 encoded string
    private base64_encode(file: string) {
        // read binary data
        const bitmap = fs.readFileSync(file);
        // convert binary data to base64 encoded string
        const imageString = bitmap.toString('base64');
        const extension = path.extname(file).replace('.', '');
        return `data:image/${extension};base64, ${imageString}`;
    }

    async process_statements(title: string, filepath: string) {
        const workbook = new Excel.Workbook();

        await workbook.xlsx.readFile(filepath);
        const sheet = workbook.getWorksheet(2);
        const items: Item[] = [];
        // const images: Image[] = [];
        sheet.eachRow(async (row, index) => {
            if (index === 1)
                return; // skip header row
            const itemSequence = row.getCell('A').value as number;
            const itemTitle = `${row.getCell('B').value}`;
            const itemId = `${title}_${itemSequence}`;
            const statementSequence = row.getCell('C').value as number;

            // const context = row.getCell('D').text;
            const isPositive = row.getCell('D').value as number === 0 ? false : true;
            const context = row.getCell('E').text;


            const statementTitle = row.getCell('F').text;
            const statementText = row.getCell('G').text;
            const statementId = `${statementTitle}-${statementSequence}`;
            const left = row.getCell('H').text;
            const right = row.getCell('I').text;
            //const statementImageFilename = path.join(path.dirname(filepath), imageName);
            //const base64StatementImage = this.base64_encode(statementImageFilename);
            let item = items.find(i => i.id === itemId);

            //const imageRef = admin.firestore().collection('image').doc(imageName);
            //const imageDoc = await imageRef.get();
            // if (!imageDoc.exists) {
            //     await admin.firestore().collection('image').doc(imageName).set({
            //         id: imageName,
            //         base64Image: base64StatementImage
            //     });
            // }
            if (!item) {
                item = {
                    id: itemId,
                    sequenceNumber: itemSequence,
                    title: itemTitle,
                    statements: []
                }
                items.push(item);
            }
            if (!item.statements.find(s => s.id === statementSequence.toString())) {
                item.statements.push({
                    id: statementId,
                    text: statementText,
                    title: statementTitle,
                    isPositive,
                    context,
                    left,
                    right,
                })
            }

        });
        items.forEach(async (i) => {
            await admin.firestore().collection('item').doc(i.id).set(i);
        });
    }
    async exportData() {
        //Creating New Workbook 
        const workbook = new Excel.Workbook();

        //Creating Sheet for that particular WorkBook
        const sheetName = 'Sheet1';
        const sheet = workbook.addWorksheet(sheetName);

        const columsn =
            //Header must be in below format
            sheet.columns = [
                { key: "groupId", header: "groupId" },
                { key: "groupName", header: "groupName" },
                { key: "itemId", header: "itemId" },
                { key: "statementId", header: "statementId" },
                { key: "statementTitle", header: "statementTitle" },
                { key: "stackSide", header: "stackSide" },
                { key: "position", header: "position" },
            ];

        const sessionsSnapshot = await admin.firestore().collection('session').get();
        const data: {
            groupId: string, groupName: string, itemId: string, statementId: string,
            statementTitle: string, stackSide: string, position: string
        }[] = [];
        sessionsSnapshot.forEach(doc => {
            const session = doc.data() as TestSession;
            session.items.forEach(item => {
                item.statements.forEach(statement => {
                    data.push({
                        groupId: session.id,
                        groupName: session.name,
                        itemId: item.id,
                        position: statement.value || '',
                        stackSide: statement.category || '',
                        statementId: statement.id,
                        statementTitle: statement.title
                    });
                });
            });

        });

        //Data must be look like below, key of data must be match to header.
        //var data = [{ name: "Kalai", age: 24 }, { name: "Vignesh", age: 24 }];

        //adding each in sheet
        for (const row of data) {
            sheet.addRow(row);
        }

        //Finally creating XLSX file
        const fileName = "sortboard-divisie.xlsx";
        await workbook.xlsx.writeFile(fileName);
    }

}

export interface Item {
    id: string;
    title: string;
    sequenceNumber: number;
    statements: Statement[]
}

// export interface Image {
//     id: string;
//     base64Image: string;
// }

export interface Statement {
    id: string;
    text: string;
    title: string;
    isPositive: boolean;
    context: string;
    left: string;
    right: string;
}
export interface ItemWithImageAndResponses extends Item {
    state: ItemState;
    statements: StatementWithResponseAndImage[]
}

export interface TestSession {
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


export interface Item {
    id: string;
    title: string;
    sequenceNumber: number;
    statements: Statement[]
}

export enum ItemState {
    notstarted = 0,
    categorize = 1,
    sort = 2,
    finished = 3
}

export interface Statement {
    id: string;
    text: string;
    title: string;
    context: string;
    left: string;
    right: string;
}

export interface StatementWithResponseAndImage extends Statement {
    image: string;
    category?: string;
    value?: string;
}