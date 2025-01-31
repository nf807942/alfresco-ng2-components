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

 /* eslint-disable @angular-eslint/component-selector, @angular-eslint/no-input-rename */

import { Component, ElementRef, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { WidgetComponent } from './../widget.component';

@Component({
    selector: 'analytics-number-widget',
    templateUrl: './number.widget.html',
    styleUrls: ['./number.widget.scss'],
    encapsulation: ViewEncapsulation.None
})
export class NumberWidgetAnalyticsComponent extends WidgetComponent implements OnInit {

    @Input()
    field: any;

    @Input('group')
    public formGroup: FormGroup;

    @Input('controllerName')
    public controllerName: string;

    @Input()
    required: boolean = false;

    constructor(public elementRef: ElementRef) {
        super();
    }

    ngOnInit() {
        if (this.required) {
            this.formGroup.get(this.controllerName).setValidators(Validators.required);
        }
    }
}
