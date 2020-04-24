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

import { AlfrescoApiService, AppConfigService, LogService } from '@alfresco/adf-core';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { ProcessInstanceCloud } from '../models/process-instance-cloud.model';
import { ProcessPayloadCloud } from '../models/process-payload-cloud.model';
import { ProcessDefinitionCloud } from '../models/process-definition-cloud.model';
import { BaseCloudService } from '../../../services/base-cloud.service';

@Injectable({
    providedIn: 'root'
})
export class StartProcessCloudService extends BaseCloudService {

    constructor(apiService: AlfrescoApiService,
                private logService: LogService,
                appConfigService: AppConfigService) {
        super(apiService, appConfigService);
    }

    /**
     * Gets the process definitions associated with an app.
     * @param appName Name of the target app
     * @returns Array of process definitions
     */
    getProcessDefinitions(appName: string): Observable<ProcessDefinitionCloud[]> {
        if (appName || appName === '') {
            const url = `${this.getBasePath(appName)}/rb/v1/process-definitions`;

            return this.get(url).pipe(
                map((res: any) => {
                    return res.list.entries.map((processDefs) => new ProcessDefinitionCloud(processDefs.entry));
                })
            );
        } else {
            this.logService.error('AppName is mandatory for querying task');
            return throwError('AppName not configured');
        }
    }

    /**
     * Create a process based on a process definition, name, form values or variables.
     * @param appName name of the Application
     * @param payload Details of the process (definition key, name, variables, etc)
     * @returns Details of the process instance just created
     */
    createProcess(appName: string, payload: ProcessPayloadCloud): Observable<ProcessInstanceCloud> {
        const url = `${this.getBasePath(appName)}/rb/v1/process-instances/create`;

        return this.post(url, payload).pipe(
            map((result: any) => result.entry),
            map(processInstance => new ProcessInstanceCloud(processInstance))
        );
    }

    /**
     * Starts an already created process using the process instance id.
     * @param createdProcessInstanceId process instance id of the process previously created
     * @returns Details of the process instance just started
     */
    startCreatedProcess(appName: string, createdProcessInstanceId: string): Observable<ProcessInstanceCloud> {
        const url = `${this.getBasePath(appName)}/rb/v1/process-instances/${createdProcessInstanceId}/start`;

        return this.post(url).pipe(
            map((result: any) => result.entry),
            map(processInstance => new ProcessInstanceCloud(processInstance.entry))
        );
    }

    /**
     * Starts a process based on a process definition, name, form values or variables.
     * @param appName name of the Application
     * @param payload Details of the process (definition key, name, variables, etc)
     * @returns Details of the process instance just started
     */
    startProcess(appName: string, payload: ProcessPayloadCloud): Observable<ProcessInstanceCloud> {
        const url = `${this.getBasePath(appName)}/rb/v1/process-instances`;

        return this.post(url, payload).pipe(
            map(processInstance => new ProcessInstanceCloud(processInstance))
        );
    }
}
