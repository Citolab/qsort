import Excelprocessor from './excelprocessor';
import * as admin from 'firebase-admin';

// tslint:disable-next-line: no-floating-promises
(async () => {
    try {
        // const options = {
        //     key: process.cwd() + '/citolab-qsort-serviceaccountkey.json',
        //     database: 'https://citolab-qsort.firebaseio.com',
        //     excel: process.cwd() + '/data/empatisch_handelen.xlsx',
        //     title: 'empatisch handelen'
        // };
        // const options = {
        //     key: process.cwd() + '/sortboard-divisie-overleg-firebase.json',
        //     database: 'https://sortboard-divisie-overleg.firebaseio.com/',
        //     excel: process.cwd() + '/data/divisie-overleg-context.xlsx',
        //     title: 'divisie-overleg'
        // };
        const options = {
            key: process.cwd() + '/apps/functions/citolab-q-sort-corona-firebase-adminsdk',
            database: 'https://citolab-q-sort-corona.firebaseio.com/',
            excel: process.cwd() + '/apps/functions/files/situaties.xlsx',
            title: 'sortboard'
        };
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const serviceAccount = require(options.key);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: options.database
        });
        const excelprocessor = new Excelprocessor();
        await excelprocessor.process_statements(options.title, options.excel);
        //await excelprocessor.exportData();
        //}
        console.log("done seeding stuff");
    } catch (e) {
        // Deal with the fact the chain failed
        console.error(e);
    }
})();
