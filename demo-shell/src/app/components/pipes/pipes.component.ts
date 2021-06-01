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

import { Component } from '@angular/core';
import { AppConfigService } from '@alfresco/adf-core';

@Component({
    selector: 'app-pipes-page',
    templateUrl: './pipes.component.html',
    styleUrls: ['./pipes.component.scss']
})
export class PipesComponent {

    today = new Date();
    locale: string;
    format: string;
    number = 12345.56;
    decimalValues = {
        minIntegerDigits: undefined,
        minFractionDigits: undefined,
        maxFractionDigits: undefined
    };
    languages: any[];

    constructor(private appConfig: AppConfigService) {
        this.languages = this.appConfig.get('languages', []);
    }
}
