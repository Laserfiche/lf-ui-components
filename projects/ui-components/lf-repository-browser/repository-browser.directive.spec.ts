import { ChangeDetectorRef, NgZone } from "@angular/core";
import { fakeAsync, tick } from "@angular/core/testing";
import { MatDialog } from "@angular/material/dialog";
import { AppLocalizationService } from "../shared/app-localization.service";
import { Entry, LfRepositoryService } from "./ILFRepositoryService";
import { RepositoryBrowserDirective } from "./repository-browser.directive";

class RepoBrowserDirectiveTest extends RepositoryBrowserDirective {
    resetSelection(): void {
        return;
    }
}

const rootEntry: Entry = {
    icon: '',
    id: '1',
    isContainer: true,
    isLeaf: false,
    isSelectable: true,
    name: 'root',
    path: ''
}

describe('RepositoryBrowserDirective', () => {
    let directive: RepositoryBrowserDirective;

    let changeRefMock: ChangeDetectorRef;
    let dataServiceMock: jasmine.SpyObj<LfRepositoryService>;
    let localizeServiceMock: AppLocalizationService;
    let matDialogMock: MatDialog;
    let ngZoneMock: NgZone;
    
    beforeEach(() => {
        changeRefMock = jasmine.createSpyObj('changeDetectorRef', ['detectChanges']);
        dataServiceMock = jasmine.createSpyObj('dataService', {
            'getData': Promise.resolve([]),
            'getRootEntryAsync': Promise.resolve(rootEntry),
            'getParentEntryAsync': Promise.resolve(undefined),
            'getEntryByIdAsync': Promise.resolve(undefined)
        });
        localizeServiceMock = jasmine.createSpyObj('localizeion', {
            getStringObservable: (value: string) => value
        });
        matDialogMock = jasmine.createSpyObj('matDialog', ['open']);
        ngZoneMock = jasmine.createSpyObj('ngZone', {
            run: (cb: Function) => cb()
        });

        directive = new RepoBrowserDirectiveTest(changeRefMock, matDialogMock, ngZoneMock, localizeServiceMock);
    });

    it('should create an instance', () => {
      expect(directive).toBeTruthy();
    });

    describe('initializeAsync', () => {

        it('should throw error when no dataService is defined', async () => {
            let error;
            try {
                await directive.initializeAsync();
            } catch(er) {
                error = er;
            }
            expect(error).not.toBeUndefined();
            expect(directive.hasError).toBeTrue();
        });
    
        it('should get the rootEntry when called without currentIdOrEntry parameter', async () => {
            
            dataServiceMock.getParentEntryAsync.and.returnValue(Promise.resolve(undefined));
      
            directive.dataService = dataServiceMock;
    
            await directive.initializeAsync();
    
            expect(directive.breadcrumbs[0]).toEqual(rootEntry);
    
        });
    
        it('should get data for the root entry when called without currentIdOrEntry parameter', async () => {
            dataServiceMock.getParentEntryAsync.and.returnValue(Promise.resolve(undefined));
      
            directive.dataService = dataServiceMock;
    
            await directive.initializeAsync();
    
            expect(dataServiceMock.getData).toHaveBeenCalledOnceWith(rootEntry.id, undefined, false);
    
        });
    
        it('should get the entry associated with the string passed to currentIdOrEntry parameter', async () => {
            const id = '2';
            const entryToGet: Entry = {
                icon: '',
                id,
                isContainer: true,
                isLeaf: false,
                isSelectable: true,
                name: 'test entry (2)',
                path: ''
            }
            dataServiceMock.getEntryByIdAsync.and.returnValue(Promise.resolve(entryToGet));
            dataServiceMock.getParentEntryAsync.and.returnValue(Promise.resolve(undefined));

            directive.dataService = dataServiceMock;

            await directive.initializeAsync(id);

            expect(directive.breadcrumbs[0]).toEqual(entryToGet);
            expect(dataServiceMock.getData).toHaveBeenCalledOnceWith(id, undefined, false);
        });

        it('should use the entry passed to currentIdOrEntry parameter as the root', async () => {
            const id = '3';
            const entryToGet: Entry = {
                icon: '',
                id,
                isContainer: true,
                isLeaf: false,
                isSelectable: true,
                name: 'test entry (3)',
                path: ''
            }

            dataServiceMock.getParentEntryAsync.and.returnValue(Promise.resolve(undefined));

            directive.dataService = dataServiceMock;

            await directive.initializeAsync(entryToGet);

            expect(directive.breadcrumbs[0]).toEqual(entryToGet);
            expect(dataServiceMock.getData).toHaveBeenCalledOnceWith(id, undefined, false);
        });

        it('should use the parent entry of the passed in entry if it is not a container entry', async () => {
            const id = '4';
            const parentId = '5';
            const entry: Entry = {
                icon: '',
                id,
                isContainer: false,
                isLeaf: false,
                isSelectable: true,
                name: 'test entry (4)',
                path: '5'
            };
            const parentEntry: Entry = {
                icon: '',
                id: parentId,
                isContainer: true,
                isLeaf: false,
                isSelectable: true,
                name: 'parent entry',
                path: ''
            };

            dataServiceMock.getParentEntryAsync.and.callFake((entry: Entry) => {
                if (entry.id === id) {
                    return Promise.resolve(parentEntry);
                }
                return Promise.resolve(undefined);
            });

            directive.dataService = dataServiceMock;

            await directive.initializeAsync(entry);

            expect(directive.breadcrumbs[0]).toEqual(parentEntry);
            expect(dataServiceMock.getData).toHaveBeenCalledOnceWith(parentId, undefined, false);
        });
    });

    it('initializeWithRootOpenAsync should throw an error when no dataService is defined', async () => {
        let error;
        try {
            await directive.initializeWithRootOpenAsync();
        } catch(er) {
            error = er;
        }
        expect(error).not.toBeUndefined();
        expect(directive.hasError).toBeTrue();
    });

    it('initializeWithRootOpenAsync should have an error if the dataService does not return a root entry', async () => {
        dataServiceMock.getRootEntryAsync.and.returnValue(Promise.resolve(undefined));
        directive.dataService = dataServiceMock;

        await directive.initializeWithRootOpenAsync();
       
        expect(directive.hasError).toBeTrue();
    });

    it('initializeWithRootOpenAsync should setup the repository browser with the root entry returned by the dataService', async () => {
        directive.dataService = dataServiceMock;

        await directive.initializeWithRootOpenAsync();

        expect(directive.breadcrumbs[0]).toEqual(rootEntry);
        expect(dataServiceMock.getData).toHaveBeenCalledOnceWith(rootEntry.id, undefined, false);
    });

    it('onBreadcrumbSelected should update the breadcrumbs and get new data for the selected entry', async () => {
        const id = '7'
        const entry: Entry = {
            icon: '',
            id,
            isContainer: true,
            isLeaf: true,
            isSelectable: true,
            name: 'test entry (7)',
            path: '8'
        };
        const parent: Entry = {
            icon: '',
            id: '8',
            isContainer: true,
            isLeaf: false,
            isSelectable: true,
            name: 'test entry (8)',
            path: ''
        };
        const newBreadCrumbs = [entry, parent];
        directive.dataService = dataServiceMock;

        await directive.onBreadcrumbClicked({breadcrumbs: newBreadCrumbs, selected: entry});

        expect(directive.breadcrumbs).toEqual(newBreadCrumbs);
        expect(dataServiceMock.getData).toHaveBeenCalledOnceWith(id, undefined, false);
    });

    it('openChildFolderAsync should update the breadcrumbs and get new data for the passed in entry', async () => {
        const entry: Entry = {
            icon: '',
            id: '9',
            isContainer: true,
            isLeaf: false,
            isSelectable: true,
            name: 'test entry (9)',
            path: ''
        };
        dataServiceMock.getData.and.returnValue(Promise.resolve([]));

        directive.dataService = dataServiceMock;

        await directive.openChildFolderAsync(entry);

        expect(directive.breadcrumbs).toEqual([entry]);
        expect(dataServiceMock.getData).toHaveBeenCalledOnceWith(entry.id, undefined, false);
    });

    it('openChildFolderAsync should correctly append the new entry to the breadcrumbs', async () => {
        const parent: Entry = {
            icon: '',
            id: '9',
            isContainer: true,
            isLeaf: false,
            isSelectable: true,
            name: 'test entry (9)',
            path: ''
        };
        const entry: Entry = {
            icon: '',
            id: '10',
            isContainer: true,
            isLeaf: true,
            isSelectable: true,
            name: 'test entry (10)',
            path: '9'
        };
        dataServiceMock.getData.and.returnValue(Promise.resolve([]));

        directive.dataService = dataServiceMock;

        await directive.openChildFolderAsync(parent);
        await directive.openChildFolderAsync(entry);

        expect(directive.breadcrumbs).toEqual([entry, parent]);
    });

    it('openChildFolderAsync should do nothing if the entry is not a container', async () => {
        const entry: Entry = {
            icon: '',
            id: '11',
            isContainer: false,
            isLeaf: true,
            isSelectable: true,
            name: 'test entry (11)',
            path: ''
        };

        directive.dataService = dataServiceMock;
        await directive.openChildFolderAsync(entry);

        expect(dataServiceMock.getData).not.toHaveBeenCalled();
    });

    describe('setNodeAsParentAsync', () => {
        const parent: Entry = {
            icon: '',
            id: '13',
            isContainer: true,
            isLeaf: false,
            isSelectable: true,
            name: 'test entry (13)',
            path: ''
        };
        const entryId = '12';
        const entry: Entry = {
            icon: '',
            id: entryId,
            isContainer: true,
            isLeaf: true,
            isSelectable: true,
            name: 'test entry (12)',
            path: ''
        };

        it('should build the breadcrumbs from the passed in parentEntry', async () => {
            dataServiceMock.getParentEntryAsync.and.callFake((entry: Entry) => {
                if (entry.id !== entryId) {
                    return Promise.resolve(undefined);
                }
                return Promise.resolve(parent);
            });

            directive.dataService = dataServiceMock;

            await directive.setNodeAsParentAsync(entry);

            expect(directive.breadcrumbs).toEqual([entry, parent]);
        });

        it('should set the breadcrumbs to be the be the parentEntry plus the listOfAncestorEntries', async () => {
            directive.dataService = dataServiceMock;

            await directive.setNodeAsParentAsync(entry, [parent]);

            expect(directive.breadcrumbs).toEqual([entry, parent]);
        });

        it('should get the new data when called', async () => {
            directive.dataService = dataServiceMock;

            await directive.setNodeAsParentAsync(parent);

            expect(dataServiceMock.getData).toHaveBeenCalledOnceWith(parent.id, undefined, false);
        });

        it('should not attempt to get any new data when the parentEntry is not a container', async () => {
            const notContainer: Entry = {
                icon: '',
                id: '16',
                isContainer: false,
                isLeaf: true,
                isSelectable: true,
                name: 'test entry (16)',
                path: ''
            };
            directive.dataService = dataServiceMock;
            
            await directive.setNodeAsParentAsync(notContainer);

            expect(dataServiceMock.getData).not.toHaveBeenCalled();
        });
    });

    describe('updateAllPossibleEntriesAsync', () => {
        let entry: Entry;
        beforeEach(() => {
            entry = {
                icon: '',
                id: '17',
                isContainer: true,
                isLeaf: true,
                isSelectable: true,
                name: 'test entry (17)',
                path: ''
            };
        })
        it('should set the component to error state when dataService has an error', async () => {
            dataServiceMock.getData.and.rejectWith(Promise.reject());
            directive.dataService = dataServiceMock;

            await directive.updateAllPossibleEntriesAsync(entry);

            expect(directive.hasError).toBeTrue();
        });

        it('should not be loading or errored when the dataService returns data', async () => {
            dataServiceMock.getData.and.returnValue(Promise.resolve([]));
            directive.dataService = dataServiceMock;

            await directive.updateAllPossibleEntriesAsync(entry);

            expect(directive.hasError).toBeFalse();
            expect(directive.isLoading).toBeFalse();
        });

        it('should reset the selection when call to dataService errors', async () => {
            const resetSpy = jasmine.createSpy('reset');
            dataServiceMock.getData.and.rejectWith(Promise.reject());
            directive.dataService = dataServiceMock;
            directive.resetSelection = resetSpy;

            await directive.updateAllPossibleEntriesAsync(entry);

            expect(resetSpy).toHaveBeenCalledOnceWith();
        });

        it('should reset the selection when dataService retrives the data', async () => {
            const resetSpy = jasmine.createSpy('reset');
            dataServiceMock.getData.and.returnValue(Promise.resolve([]));
            directive.dataService = dataServiceMock;
            directive.resetSelection = resetSpy;

            await directive.updateAllPossibleEntriesAsync(entry);

            expect(resetSpy).toHaveBeenCalledOnceWith();
        });
    })
});
