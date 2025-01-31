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

 /* eslint-disable @angular-eslint/component-selector */

import { FormFieldModel } from './form-field.model';
import { FormWidgetModel } from './form-widget.model';

export class ContainerModel extends FormWidgetModel {

    field: FormFieldModel;

    get isVisible(): boolean {
        return this.field.isVisible;
    }

    constructor(field: FormFieldModel) {
        super(field.form, field.json);

        if (field) {
            this.field = field;
        }
    }

}
