/*!
 * @license
 * Copyright 2019 Alfresco Software, Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { setupTestBed } from '@alfresco/adf-core';
import { TagActionsComponent } from './tag-actions.component';
import { ContentTestingModule } from '../testing/content.testing.module';
import { TranslateModule } from '@ngx-translate/core';

declare let jasmine: any;

describe('TagActionsComponent', () => {

    let component: any;
    let fixture: ComponentFixture<TagActionsComponent>;
    let element: HTMLElement;

    setupTestBed({
        imports: [
            TranslateModule.forRoot(),
            ContentTestingModule
        ]
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(TagActionsComponent);

        element = fixture.nativeElement;
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    afterEach(() => {
        fixture.destroy();
    });

    const dataTag = {
        list: {
            pagination: {
                count: 3,
                hasMoreItems: false,
                totalItems: 3,
                skipCount: 0,
                maxItems: 100
            },
            entries: [{
                entry: {tag: 'test1', id: '0ee933fa-57fc-4587-8a77-b787e814f1d2'}
            }, {entry: {tag: 'test2', id: 'fcb92659-1f10-41b4-9b17-851b72a3b597'}}, {
                entry: {tag: 'test3', id: 'fb4213c0-729d-466c-9a6c-ee2e937273bf'}
            }]
        }
    };

    describe('Rendering tests', () => {

        beforeEach(() => {
            jasmine.Ajax.install();
        });

        afterEach(() => {
            jasmine.Ajax.uninstall();
        });

        it('Tag list relative a single node should be rendered', (done) => {
            component.nodeId = 'fake-node-id';

            component.result.subscribe(() => {
                fixture.detectChanges();

                expect(element.querySelector('#tag_name_test1').innerHTML.trim()).toBe('test1');
                expect(element.querySelector('#tag_name_test2').innerHTML.trim()).toBe('test2');
                expect(element.querySelector('#tag_name_test3').innerHTML.trim()).toBe('test3');

                expect(element.querySelector('#tag_delete_test1')).not.toBe(null);
                expect(element.querySelector('#tag_delete_test2')).not.toBe(null);
                expect(element.querySelector('#tag_delete_test3')).not.toBe(null);

                done();
            });

            component.ngOnChanges();

            jasmine.Ajax.requests.mostRecent().respondWith({
                status: 200,
                contentType: 'json',
                responseText: dataTag
            });
        });

        it('Tag list click on delete button should delete the tag', (done) => {
            component.nodeId = 'fake-node-id';

            component.result.subscribe(() => {
                fixture.detectChanges();

                const deleteButton: any = element.querySelector('#tag_delete_test1');
                deleteButton.click();

                expect(jasmine.Ajax.requests.at(1).url)
                    .toBe('http://localhost:9876/ecm/alfresco/api/-default-/public/alfresco/versions/1/nodes/fake-node-id/tags/0ee933fa-57fc-4587-8a77-b787e814f1d2');
                expect(jasmine.Ajax.requests.at(1).method).toBe('DELETE');

                jasmine.Ajax.requests.mostRecent().respondWith({
                    status: 200,
                    contentType: 'json'
                });

                done();
            });

            component.ngOnChanges();

            jasmine.Ajax.requests.mostRecent().respondWith({
                status: 200,
                contentType: 'json',
                responseText: dataTag
            });
        });

        it('Add tag', (done) => {
            component.nodeId = 'fake-node-id';
            component.newTagName = 'fake-tag-name';

            fixture.detectChanges();

            component.successAdd.subscribe(() => {
                done();
            });

            component.result.subscribe(() => {
                fixture.detectChanges();

                const addButton: any = element.querySelector('#add-tag');
                addButton.click();

                jasmine.Ajax.requests.mostRecent().respondWith({
                    status: 200
                });
            });

            component.ngOnChanges();

            jasmine.Ajax.requests.mostRecent().respondWith({
                status: 200,
                contentType: 'json',
                responseText: dataTag
            });

        });

        it('The input box should be cleared after add tag', (done) => {
            component.nodeId = 'fake-node-id';
            component.newTagName = 'fake-tag-name';

            fixture.detectChanges();

            component.successAdd.subscribe(() => {
                expect(component.newTagName).toBe('');
                done();
            });

            component.result.subscribe(() => {
                fixture.detectChanges();

                const addButton: any = element.querySelector('#add-tag');
                addButton.click();

                jasmine.Ajax.requests.mostRecent().respondWith({
                    status: 200
                });
            });

            component.ngOnChanges();

            jasmine.Ajax.requests.mostRecent().respondWith({
                status: 200,
                contentType: 'json',
                responseText: dataTag
            });
        });

        it('Add tag should be disabled by default', () => {
            component.nodeId = 'fake-node-id';
            component.newTagName = 'fake-tag-name';

            fixture.detectChanges();

            const addButton: any = element.querySelector('#add-tag');
            expect(addButton.disabled).toEqual(true);
        });

        it('Add tag should return an error if the tag is already present', (done) => {
            component.nodeId = 'fake-node-id';
            component.newTagName = 'test1';

            fixture.detectChanges();

            component.error.subscribe(() => {
                done();
            });

            component.result.subscribe(() => {
                fixture.detectChanges();

                const addButton: any = element.querySelector('#add-tag');
                addButton.click();
            });

            component.ngOnChanges();

            jasmine.Ajax.requests.mostRecent().respondWith({
                status: 200,
                contentType: 'json',
                responseText: dataTag
            });
        });

        it('Add tag should be disabled if the node id is not a correct node', (done) => {
            component.nodeId = 'fake-node-id';
            component.newTagName = 'fake-tag-name';

            component.result.subscribe(() => {
                const addButton: any = element.querySelector('#add-tag');
                expect(addButton.disabled).toEqual(true);
                done();
            });

            component.ngOnChanges();

            jasmine.Ajax.requests.mostRecent().respondWith({
                status: 404
            });
        });

        it('Add tag should be enable if the node id is a correct node', (done) => {
            component.nodeId = 'fake-node-id';
            component.newTagName = 'fake-tag-name';

            component.result.subscribe(() => {
                fixture.detectChanges();

                const addButton: any = element.querySelector('#add-tag');
                expect(addButton.disabled).toEqual(false);
                done();
            });

            component.ngOnChanges();

            jasmine.Ajax.requests.mostRecent().respondWith({
                status: 200,
                contentType: 'json',
                responseText: dataTag
            });
        });
    });
});
