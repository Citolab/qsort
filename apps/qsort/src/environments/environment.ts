// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  differSortLayout: true,
  enterName: false,
  showDefaultImage: false,
  showResult: false,
  left: 'Meer voor mezelf',
  right: 'Meer voor een ander',
  sortQuestion: 'Kies je meer voor jezelf of voor een ander?',
  categoryExplanation: 'Verdeel de situaties in twee stapels. Ben je het eens met de stelling of niet?',
  leftExplanation: 'hoe meer je kiest voor jezelf.',
  rightExplanation: 'hoe meer je kiest voor voor een ander.',
  categories: ['ik kies voor mezelf', 'ik kies voor de ander'],
  welcomeMessage: 'In Q-sort ga jij jouw mening over een onderwerp in beeld brengen.',
  firebase: {
    apiKey: 'AIzaSyCaGJaTw5yx8HmGDJniBnuBTR_vQOGidpE ',
    databaseURL: 'https://citolab-qsort.firebaseio.com',
    projectId: 'citolab-qsort'
  }
};
/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
