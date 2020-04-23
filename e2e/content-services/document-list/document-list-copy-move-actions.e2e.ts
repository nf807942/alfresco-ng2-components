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

import { browser } from 'protractor';
import {
    LoginPage,
    UploadActions,
    StringUtil,
    ContentNodeSelectorDialogPage,
    NotificationHistoryPage, BrowserActions
} from '@alfresco/adf-testing';
import { ContentServicesPage } from '../../pages/adf/content-services.page';
import { NavigationBarPage } from '../../pages/adf/navigation-bar.page';
import { AcsUserModel } from '../../models/ACS/acs-user.model';
import { AlfrescoApiCompatibility as AlfrescoApi } from '@alfresco/js-api';
import { FileModel } from '../../models/ACS/file.model';
import CONSTANTS = require('../../util/constants');

describe('Document List Component', () => {

    const loginPage = new LoginPage();
    const contentServicesPage = new ContentServicesPage();
    const navigationBarPage = new NavigationBarPage();
    const contentNodeSelector = new ContentNodeSelectorDialogPage();
    const notificationHistoryPage = new NotificationHistoryPage();

    this.alfrescoJsApi = new AlfrescoApi({
        provider: 'ECM',
        hostEcm: browser.params.testConfig.adf_acs.host
    });
    const uploadActions = new UploadActions(this.alfrescoJsApi);

    let uploadedFolder, uploadedFile, sourceFolder, destinationFolder, subFolder, subFolder2, copyFolder, subFile,
        duplicateFolderName;
    let acsUser = null, anotherAcsUser: AcsUserModel;
    let folderName, sameNameFolder, site;

    const pdfFileModel = new FileModel({
        name: browser.params.resources.Files.ADF_DOCUMENTS.PDF.file_name,
        location: browser.params.resources.Files.ADF_DOCUMENTS.PDF.file_path
    });

    const testFileModel = new FileModel({
        name: browser.params.resources.Files.ADF_DOCUMENTS.TEST.file_name,
        location: browser.params.resources.Files.ADF_DOCUMENTS.TEST.file_path
    });

    beforeAll(async () => {
        acsUser = new AcsUserModel();
        anotherAcsUser = new AcsUserModel();
        folderName = StringUtil.generateRandomString(5);
        sameNameFolder = StringUtil.generateRandomString(5);
        await this.alfrescoJsApi.login(browser.params.testConfig.adf.adminEmail, browser.params.testConfig.adf.adminPassword);
        await this.alfrescoJsApi.core.peopleApi.addPerson(acsUser);
        await this.alfrescoJsApi.core.peopleApi.addPerson(anotherAcsUser);
        site = await this.alfrescoJsApi.core.sitesApi.createSite({
            title: StringUtil.generateRandomString(8),
            visibility: 'PUBLIC'
        });
        await this.alfrescoJsApi.core.sitesApi.addSiteMember(site.entry.id, {
            id: anotherAcsUser.getId(),
            role: CONSTANTS.CS_USER_ROLES.COLLABORATOR
        });
        await this.alfrescoJsApi.login(acsUser.id, acsUser.password);
        uploadedFolder = await uploadActions.createFolder(folderName, '-my-');
        destinationFolder = await uploadActions.createFolder(StringUtil.generateRandomString(5), '-my-');
        sourceFolder = await uploadActions.createFolder(StringUtil.generateRandomString(5), '-my-');
        subFolder = await uploadActions.createFolder(sameNameFolder, sourceFolder.entry.id);
        subFolder2 = await uploadActions.createFolder(StringUtil.generateRandomString(5), subFolder.entry.id);
        copyFolder = await uploadActions.createFolder(StringUtil.generateRandomString(5), sourceFolder.entry.id);
        duplicateFolderName = await uploadActions.createFolder(sameNameFolder, '-my-');
        subFile = await uploadActions.uploadFile(testFileModel.location, testFileModel.name, subFolder.entry.id);
        await uploadActions.uploadFile(pdfFileModel.location, pdfFileModel.name, uploadedFolder.entry.id);
        await uploadActions.uploadFile(pdfFileModel.location, pdfFileModel.name, sourceFolder.entry.id);
        uploadedFile = await uploadActions.uploadFile(pdfFileModel.location, pdfFileModel.name, '-my-');
        await this.alfrescoJsApi.core.nodesApi.updateNode(sourceFolder.entry.id,
            {
                permissions: {
                    locallySet: [{
                        authorityId: anotherAcsUser.getId(),
                        name: 'Consumer',
                        accessStatus: 'ALLOWED'
                    }]
                }
            });

        await browser.driver.sleep(12000);
    });

    afterAll(async () => {
        await navigationBarPage.clickLogoutButton();

        await this.alfrescoJsApi.login(browser.params.testConfig.adf.adminEmail, browser.params.testConfig.adf.adminPassword);
        await uploadActions.deleteFileOrFolder(uploadedFolder.entry.id);
        await uploadActions.deleteFileOrFolder(uploadedFile.entry.id);
        await uploadActions.deleteFileOrFolder(sourceFolder.entry.id);
        await uploadActions.deleteFileOrFolder(destinationFolder.entry.id);
        await this.alfrescoJsApi.core.sitesApi.deleteSite(site.entry.id);
    });

    describe('Document List Component - Actions Move and Copy', () => {

        beforeAll(async () => {
            await loginPage.loginToContentServicesUsingUserModel(acsUser);
        });

        beforeEach(async () => {
            await BrowserActions.closeMenuAndDialogs();
            await navigationBarPage.clickContentServicesButton();

        });

        it('[C260128] Move - Same name file', async () => {
            await contentServicesPage.checkContentIsDisplayed(pdfFileModel.name);
            await contentServicesPage.getDocumentList().rightClickOnRow(pdfFileModel.name);
            await contentServicesPage.pressContextMenuActionNamed('Move');
            await contentNodeSelector.checkDialogIsDisplayed();
            await contentNodeSelector.typeIntoNodeSelectorSearchField(folderName);
            await contentNodeSelector.clickContentNodeSelectorResult(folderName);
            await contentNodeSelector.clickMoveCopyButton();
            await notificationHistoryPage.checkNotifyContains('This name is already in use, try a different name.');
        });

        it('[C260134] Move - folder with subfolder and file within it', async () => {
            await contentServicesPage.checkContentIsDisplayed(destinationFolder.entry.name);
            await contentServicesPage.checkContentIsDisplayed(sourceFolder.entry.name);
            await contentServicesPage.getDocumentList().rightClickOnRow(sourceFolder.entry.name);
            await contentServicesPage.pressContextMenuActionNamed('Move');
            await contentNodeSelector.checkDialogIsDisplayed();
            await contentNodeSelector.typeIntoNodeSelectorSearchField(destinationFolder.entry.name);
            await contentNodeSelector.clickContentNodeSelectorResult(destinationFolder.entry.name);
            await contentNodeSelector.clickMoveCopyButton();
            await contentServicesPage.checkContentIsNotDisplayed(sourceFolder.entry.name);
            await contentServicesPage.doubleClickRow(destinationFolder.entry.name);
            await contentServicesPage.checkContentIsDisplayed(sourceFolder.entry.name);
            await contentServicesPage.doubleClickRow(sourceFolder.entry.name);
            await contentServicesPage.checkContentIsDisplayed(subFolder.entry.name);
            await contentServicesPage.doubleClickRow(subFolder.entry.name);
            await contentServicesPage.checkContentIsDisplayed(subFile.entry.name);
        });

        it('[C260135] Move - Same name folder', async () => {
            await contentServicesPage.checkContentIsDisplayed(duplicateFolderName.entry.name);
            await contentServicesPage.getDocumentList().rightClickOnRow(duplicateFolderName.entry.name);
            await contentServicesPage.pressContextMenuActionNamed('Move');
            await contentNodeSelector.checkDialogIsDisplayed();
            await contentNodeSelector.typeIntoNodeSelectorSearchField(sourceFolder.entry.name);
            await contentNodeSelector.clickContentNodeSelectorResult(sourceFolder.entry.name);
            await contentNodeSelector.clickMoveCopyButton();
            await notificationHistoryPage.checkNotifyContains('This name is already in use, try a different name.');
        });

        it('[C260129] Copy - Same name file', async () => {
            await contentServicesPage.checkContentIsDisplayed(pdfFileModel.name);
            await contentServicesPage.getDocumentList().rightClickOnRow(pdfFileModel.name);
            await contentServicesPage.pressContextMenuActionNamed('Copy');
            await contentNodeSelector.checkDialogIsDisplayed();
            await contentNodeSelector.typeIntoNodeSelectorSearchField(folderName);
            await contentNodeSelector.clickContentNodeSelectorResult(folderName);
            await contentNodeSelector.clickMoveCopyButton();
            await notificationHistoryPage.checkNotifyContains('This name is already in use, try a different name.');
        });

        it('[C260136] Copy - Same name folder', async () => {
            await contentServicesPage.checkContentIsDisplayed(duplicateFolderName.entry.name);
            await contentServicesPage.getDocumentList().rightClickOnRow(duplicateFolderName.entry.name);
            await contentServicesPage.pressContextMenuActionNamed('Copy');
            await contentNodeSelector.checkDialogIsDisplayed();
            await contentNodeSelector.typeIntoNodeSelectorSearchField(sourceFolder.entry.name);
            await contentNodeSelector.clickContentNodeSelectorResult(sourceFolder.entry.name);
            await contentNodeSelector.clickMoveCopyButton();
            await notificationHistoryPage.checkNotifyContains('This name is already in use, try a different name.');
        });

        it('[C260124] should be able to move file using action menu and content node selector', async () => {
            await contentServicesPage.checkContentIsDisplayed(pdfFileModel.name);
            await contentServicesPage.moveContent(pdfFileModel.name);
            await contentNodeSelector.checkDialogIsDisplayed();
            await expect(await contentNodeSelector.getDialogHeaderText()).toBe(`Move '${pdfFileModel.name}' to...`);
            await contentNodeSelector.clickContentNodeSelectorResult(destinationFolder.entry.name);
            await contentNodeSelector.checkSelectedFolder(destinationFolder.entry.name);
            await contentNodeSelector.checkCopyMoveButtonIsEnabled();
            await contentNodeSelector.clickCancelButton();
            await contentNodeSelector.checkDialogIsNotDisplayed();
            await contentServicesPage.checkContentIsDisplayed(pdfFileModel.name);

            await contentServicesPage.moveContent(pdfFileModel.name);
            await contentNodeSelector.clickContentNodeSelectorResult(destinationFolder.entry.name);
            await contentNodeSelector.checkSelectedFolder(destinationFolder.entry.name);
            await contentNodeSelector.checkCopyMoveButtonIsEnabled();
            await contentNodeSelector.clickMoveCopyButton();
            await contentNodeSelector.checkDialogIsNotDisplayed();
            await contentServicesPage.checkContentIsNotDisplayed(pdfFileModel.name);
        });
    });

    describe('Document List actionns - Move, Copy on no permission folder', () => {

        beforeAll(async () => {
            await loginPage.loginToContentServicesUsingUserModel(anotherAcsUser);
            await BrowserActions.getUrl(`${browser.params.testConfig.adf.url}/files/${sourceFolder.entry.id}`);
            await contentServicesPage.getDocumentList().dataTablePage().waitTillContentLoaded();
        });

        it('[C260133] Move - no permission folder', async () => {
            await contentServicesPage.checkContentIsDisplayed(subFolder.entry.name);
            await contentServicesPage.getDocumentList().rightClickOnRow(subFolder.entry.name);
            await contentServicesPage.checkContextActionIsVisible('Move');
            await expect(await contentServicesPage.isContextActionEnabled('Move')).toBe(false);
            await contentServicesPage.closeActionContext();
        });

        it('[C260140] Copy - No permission folder', async () => {
            await contentServicesPage.checkContentIsDisplayed(subFolder.entry.name);
            await contentServicesPage.checkContentIsDisplayed(copyFolder.entry.name);
            await contentServicesPage.getDocumentList().rightClickOnRow(copyFolder.entry.name);
            await contentServicesPage.checkContextActionIsVisible('Copy');
            await expect(await contentServicesPage.isContextActionEnabled('Copy')).toBe(true);
            await contentServicesPage.pressContextMenuActionNamed('Copy');
            await contentNodeSelector.checkDialogIsDisplayed();
            await contentNodeSelector.contentListPage().dataTablePage().checkRowContentIsDisplayed(subFolder.entry.name);
            await contentNodeSelector.contentListPage().dataTablePage().checkRowContentIsDisabled(subFolder.entry.name);
            await contentNodeSelector.clickContentNodeSelectorResult(subFolder.entry.name);
            await contentNodeSelector.contentListPage().dataTablePage().checkRowByContentIsSelected(subFolder.entry.name);
            await expect(await contentNodeSelector.checkCopyMoveButtonIsEnabled()).toBe(false);
            await contentNodeSelector.contentListPage().dataTablePage().doubleClickRowByContent(subFolder.entry.name);
            await contentNodeSelector.contentListPage().dataTablePage().waitTillContentLoaded();
            await contentNodeSelector.contentListPage().dataTablePage().checkRowContentIsDisplayed(subFolder2.entry.name);
        });

        it('[C261160] should disable copy/move button when user is not allowed in a specific folder', async () => {
            await contentServicesPage.checkContentIsDisplayed(pdfFileModel.name);
            await contentServicesPage.copyContent(pdfFileModel.name);
            await contentNodeSelector.checkDialogIsDisplayed();
            await contentNodeSelector.clickContentNodeSelectorResult(subFolder.entry.name);
            await contentNodeSelector.checkSelectedFolder(subFolder.entry.name);
            await expect(await contentNodeSelector.checkCopyMoveButtonIsEnabled()).toBe(false);
            await contentNodeSelector.clickCancelButton();
            await contentNodeSelector.checkDialogIsNotDisplayed();
            await contentServicesPage.checkContentIsDisplayed(pdfFileModel.name);
        });

        it('[C261990] should enable copy/move button when user selects own site\'s documentLibrary', async () => {
            await contentServicesPage.checkContentIsDisplayed(pdfFileModel.name);
            await contentServicesPage.copyContent(pdfFileModel.name);
            await contentNodeSelector.checkDialogIsDisplayed();
            await expect(await contentNodeSelector.checkCopyMoveButtonIsEnabled()).toBe(false);
            await contentNodeSelector.typeIntoNodeSelectorSearchField(site.entry.title);
            await contentNodeSelector.doubleClickContentNodeSelectorResult(site.entry.id);
            await contentNodeSelector.clickContentNodeSelectorResult('documentLibrary');
            await expect(await contentNodeSelector.checkCopyMoveButtonIsEnabled()).toBe(true);
            await contentNodeSelector.clickCancelButton();
            await contentNodeSelector.checkDialogIsNotDisplayed();
            await contentServicesPage.checkContentIsDisplayed(pdfFileModel.name);
        });

        it('[C260137] should disable delete action when user has no permission', async () => {
            await contentServicesPage.checkContentIsDisplayed(pdfFileModel.name);
            await contentServicesPage.checkDeleteIsDisabled(pdfFileModel.name);

            await loginPage.loginToContentServicesUsingUserModel(acsUser);
            await BrowserActions.getUrl(`${browser.params.testConfig.adf.url}/files/${sourceFolder.entry.id}`);
            await contentServicesPage.getDocumentList().dataTablePage().waitTillContentLoaded();

            await contentServicesPage.checkContentIsDisplayed(pdfFileModel.name);
            await contentServicesPage.deleteContent(pdfFileModel.name);
            await contentServicesPage.checkContentIsNotDisplayed(pdfFileModel.name);
        });
    });
});
