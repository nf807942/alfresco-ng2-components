/*!
 * @license
 * Copyright © 2005-2023 Hyland Software, Inc. and its affiliates. All rights reserved.
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

import { $ } from 'protractor';
import { BrowserActions, BrowserVisibility, TogglePage } from '@alfresco/adf-testing';

export class UploadTogglesPage {
    togglePage = new TogglePage();
    multipleFileUploadToggle = $('#adf-multiple-upload-switch');
    uploadFolderToggle = $('#adf-folder-upload-switch');
    extensionFilterToggle = $('#adf-extension-filter-upload-switch');
    maxSizeToggle = $('#adf-max-size-filter-upload-switch');
    versioningToggle = $('#adf-version-upload-switch');
    extensionAcceptedField = $('[data-automation-id="accepted-files-type"]');
    maxSizeField = $('[data-automation-id="max-files-size"]');

    async enableMultipleFileUpload(): Promise<void> {
        await this.togglePage.enableToggle(this.multipleFileUploadToggle);
    }

    async disableMultipleFileUpload(): Promise<void> {
        await this.togglePage.disableToggle(this.multipleFileUploadToggle);
    }

    async enableFolderUpload(): Promise<void> {
        await this.togglePage.enableToggle(this.uploadFolderToggle);
    }

    async enableExtensionFilter(): Promise<void> {
        await this.togglePage.enableToggle(this.extensionFilterToggle);
    }

    async disableExtensionFilter(): Promise<void> {
        await this.togglePage.disableToggle(this.extensionFilterToggle);
    }

    async enableMaxSize(): Promise<void> {
        await this.togglePage.enableToggle(this.maxSizeToggle);
    }

    async disableMaxSize(): Promise<void> {
        await this.togglePage.disableToggle(this.maxSizeToggle);
    }

    async enableVersioning(): Promise<void> {
        await this.togglePage.enableToggle(this.versioningToggle);
    }

    async disableVersioning(): Promise<void> {
        await this.togglePage.disableToggle(this.versioningToggle);
    }

    async addExtension(extension: string): Promise<void> {
        await BrowserVisibility.waitUntilElementIsVisible(this.extensionAcceptedField);
        await this.extensionAcceptedField.sendKeys(',' + extension);
    }

    async addMaxSize(size): Promise<void> {
        await this.clearText();
        await this.maxSizeField.sendKeys(size);
    }

    async clearText(): Promise<void> {
        await BrowserActions.clearSendKeys(this.maxSizeField, '');
    }
}
