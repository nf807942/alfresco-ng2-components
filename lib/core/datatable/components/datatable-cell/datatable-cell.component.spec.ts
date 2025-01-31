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

import { DateCellComponent } from '../date-cell/date-cell.component';
import { Subject } from 'rxjs';
import { AppConfigService } from '../../../app-config/app-config.service';
import { Node } from '@alfresco/js-api';
import { TestBed } from '@angular/core/testing';
import { CoreTestingModule } from '../../../testing';
import { AlfrescoApiService } from '../../../services/alfresco-api.service';
import { CoreModule } from '../../../core.module';
import { TranslateModule } from '@ngx-translate/core';

describe('DataTableCellComponent', () => {
    let alfrescoApiService: AlfrescoApiService;
    let appConfigService: AppConfigService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                CoreModule.forRoot(),
                TranslateModule.forRoot(),
                CoreTestingModule
            ]
        });
        alfrescoApiService = TestBed.inject(AlfrescoApiService);
        appConfigService = TestBed.inject(AppConfigService);
    });

    it('should use medium format by default', () => {
        const component = new DateCellComponent(null, null, appConfigService);
        expect(component.format).toBe('medium');
    });

    it('should use column format', () => {
        const component = new DateCellComponent(null, {
            nodeUpdated: new Subject<any>()
        } as any, appConfigService);
        component.column = {
            key: 'created',
            type: 'date',
            format: 'longTime'
        };

        component.ngOnInit();
        expect(component.format).toBe('longTime');
    });

    it('should update cell data on alfrescoApiService.nodeUpdated event', () => {
        const component = new DateCellComponent(
            null,
            alfrescoApiService,
            appConfigService
        );

        component.column = {
            key: 'name',
            type: 'text'
        };

        component.row = {
            cache: {
                name: 'some-name'
            },
            node: {
                entry: {
                    id: 'id',
                    name: 'test-name'
                }
            }
        } as any;

        component.ngOnInit();

        alfrescoApiService.nodeUpdated.next({
            id: 'id',
            name: 'updated-name'
        } as Node);

        expect(component.row['node'].entry.name).toBe('updated-name');
        expect(component.row['cache'].name).toBe('updated-name');
    });

    it('not should update cell data if ids don`t match', () => {
        const component = new DateCellComponent(
            null,
            alfrescoApiService,
            appConfigService
        );

        component.column = {
            key: 'name',
            type: 'text'
        };

        component.row = {
            cache: {
                name: 'some-name'
            },
            node: {
                entry: {
                    id: 'some-id',
                    name: 'test-name'
                }
            }
        } as any;

        component.ngOnInit();

        alfrescoApiService.nodeUpdated.next({
            id: 'id',
            name: 'updated-name'
        } as Node);

        expect(component.row['node'].entry.name).not.toBe('updated-name');
        expect(component.row['cache'].name).not.toBe('updated-name');
    });

    it('not should throw error if key not found', () => {
        const component = new DateCellComponent(
            null,
            alfrescoApiService,
            appConfigService
        );

        component.column = {
            key: 'contentSize.sizeInBytes',
            type: 'text'
        };

        component.row = {
            cache: {
                name: 'some-name'
            },
            node: {
                entry: {
                    id: 'id',
                    name: 'some-name',
                    contentSize: {
                        sizeInBytes: '12Mb'
                    }
                }
            }
        } as any;

        component.ngOnInit();

        alfrescoApiService.nodeUpdated.next({
            id: 'id',
            contentSize: { sizeInBytes: '11Mb' }
        } as any);

        expect(component.row['node'].entry.contentSize.sizeInBytes).toBe('11Mb');
        expect(component.row['cache']['contentSize.sizeInBytes']).toBe('11Mb');

        alfrescoApiService.nodeUpdated.next({
            id: 'id',
            name: 'updated-name'
        } as any);

        expect(component.row['node'].entry.name).toBe('updated-name');
        expect(component.row['cache']['contentSize.sizeInBytes']).toBe('');
    });
});
