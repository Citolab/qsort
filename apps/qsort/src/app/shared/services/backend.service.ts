
import { Injectable } from '@angular/core';
import {
    Item, Session, StatementWithResponseAndImage,
    ItemWithImageAndResponses, ItemState, SessionState
} from '../model/model';
import { AngularFirestore } from '@angular/fire/firestore';
import { map, take, tap } from 'rxjs/operators';
import { Guid, sort } from './../utils';
import { from, of } from 'rxjs';
import { Router } from '@angular/router';
@Injectable()
export class BackendService {
    public nextEnabled = false;
    public nextText = '';
    public currentSession: Session = null;
    // public nextButtonInfo$ = new BehaviorSubject<{ enabled: boolean, text: string }>({
    //     enabled: false, text: 'Volgende'
    // });
    public currentItem: ItemWithImageAndResponses;

    constructor(private afs: AngularFirestore, private router: Router) { }

    next() {
        this.getCurrentSession().pipe(
            take(1),
            tap(session => {
                if (session) {
                    const currentItem = session.items.find(i => i.state !== ItemState.finished);
                    if (currentItem.state === ItemState.categorize) {
                        this.storeItem({ ...currentItem, state: ItemState.sort }).subscribe(_ => {
                            this.router.navigate(['sort', currentItem.id]);
                        });
                    } else {
                        this.storeItem({ ...currentItem, state: ItemState.finished }).subscribe(_ => {
                            const nextItem = sort(session.items, i => i.sequenceNumber)
                                .find(i => i.state !== ItemState.finished
                                    && i.id !== currentItem.id);
                            if (nextItem) {
                                nextItem.state = ItemState.categorize;
                                this.storeItem(nextItem).subscribe(_ => {
                                    this.checkNextButtonState();
                                    this.router.navigate(['categorize', nextItem.id]);
                                });

                            } else {
                                this.checkNextButtonState();
                                this.done();
                            }
                        });
                    }
                } else {
                    this.restart();
                }
            })).subscribe();
    }

    storeSession(session: Session) {
        this.currentSession = session;
        return from(this.afs.doc<Session>(`session/${session.id}`).set(session));
    }

    storeItem(itemToStore: ItemWithImageAndResponses) {
        itemToStore.statements = itemToStore.statements.map(s => {
            const clonedStatement = { ...s };
            delete clonedStatement['image'];
            return clonedStatement
        });
        this.currentSession = {
            ... this.currentSession,
            items: this.currentSession.items.map(item => {
                return (item.id === itemToStore.id) ?
                    itemToStore : item
            })
        };
        this.checkNextButtonState();
        return from(this.afs.doc<Session>(`session/${this.currentSession.id}`).set(this.currentSession));
    }

    private checkNextButtonState() {
        const currentItem = this.currentSession.items.find(i => i.state !== ItemState.finished);
        // check next button state
        if (!currentItem) {
            this.notifyNextButton(false, '');
        }
        if (currentItem && currentItem.state === ItemState.sort) {
            this.notifyNextButton(!currentItem.statements.find(i => !i.value),
                this.currentSession.items
                    .filter(i => i.state !== ItemState.finished).length > 1 ?
                    'Volgende' : 'Inleveren');
        }
        if (currentItem && currentItem.state === ItemState.categorize) {
            this.notifyNextButton(!currentItem.statements.find(i => !i.category), 'Volgende');
        }
    }

    private notifyNextButton(enabled: boolean, text: string) {
        this.nextEnabled = enabled;
        this.nextText = text;
    }

    getCurrentItem() {
        return this.getCurrentSession().pipe(map(s => {
            let currentItem: ItemWithImageAndResponses = null;
            if (s) {
                currentItem = s.items.find(i => i.state !== ItemState.finished);
            }
            if (!currentItem) {
                // seems all items have the finished state. 
                // set the session, state clear local sessionId
                // route to home
                this.restart();
            }
            this.currentItem = currentItem;
            return currentItem;
        }))
    }

    restart() {
        this.sessionId = null;
        this.currentSession = null;
        this.router.navigate(['/']);
    }

    done() {
        this.storeSession({
            ...this.currentSession,
            endDate: new Date(),
            state: SessionState.finished
        }).subscribe();
        this.currentItem = null;
        this.sessionId = null;
        this.currentSession = null;
        this.router.navigate(['/done']);
    }

    getCurrentSession() {
        return this.currentSession ?
            of(this.currentSession) :
            this.getSession(this.sessionId).pipe(map(session => {
                if (session.state !== SessionState.finished) {
                    this.currentSession = session;
                    this.checkNextButtonState();
                    return session;
                } else {
                    this.sessionId = null;
                    this.currentSession = null;
                    return null;
                }
            }));
    }
    getSession(id: string) {
        return this.afs.doc<Session>(`session/${id}`)
            .valueChanges()
            .pipe(take(1), map(session => {
                return {
                    ...session, items: session.items.map(item => {
                        return {
                            ...item, statements: item.statements.map(statement => {
                                return { ...statement, image: `assets/images/${this.replaceAll(statement.title.toLowerCase().trim(), ' ', '-')}.jpg` };
                            })
                        };
                    })
                };
            }));
    }

    getExtremeValues() {
        return this.afs.collection<Session>('session').valueChanges().pipe(map(sessions => {
            const extremes = sessions.map(s => {
                // only check the first item
                if (s.items.length === 1) {
                    const item = s.items[0];
                    const left = item.statements.find(statement => statement.value === '0_0');
                    const right = item.statements.find(statement => statement.value === '6_0');
                    if (right && left) {
                        return {
                            user: s.name,
                            left,
                            right
                        }
                    }
                }
                return null;
            }).filter(v => !!v);
            return extremes;
        }));
    }


    startSession(name: string) {
        return this.afs.collection<Item>('item').valueChanges().pipe(
            take(1),
            map(items => {
                const session = {
                    id: Guid.newGuid().toString(),
                    startDate: new Date(),
                    endDate: null,
                    state: SessionState.inprogress,
                    items: items.map((i, index) => {
                        return {
                            ...i, statements: i.statements.map(s => {
                                return {
                                    ...s,
                                    category: null,
                                    image: `assets/images/${this.replaceAll(s.title.toLowerCase(), ' ', '-')}.jpg`
                                } as StatementWithResponseAndImage
                            }),
                            state: index === 0 ? ItemState.categorize : ItemState.notstarted,
                        } as ItemWithImageAndResponses
                    })
                } as Session;
                if (name) {
                    session.name = name;
                }
                this.afs.collection<Session>('session').doc(session.id).set(session);
                this.sessionId = session.id;
                return session;
            }));
    }

    replaceAll(value: string, search: string, replace: string) {
        return value.split(search).join(replace);
    }

    get sessionId(): string {
        return localStorage.getItem('SESSION_ID');
    }
    set sessionId(value: string) {
        localStorage.setItem('SESSION_ID', value);
    }

}
