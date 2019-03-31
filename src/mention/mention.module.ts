import { CommonModule } from '@angular/common';
import { NgModule, ModuleWithProviders } from '@angular/core';

import { MentionDirective } from './mention.directive';
import { MentionListComponent } from './mention-list.component';
import 'hammerjs';
import { UserAgentService } from './user-agent.service';

@NgModule({
    imports: [
        CommonModule
    ],
    exports: [
        MentionDirective,
        MentionListComponent,
    ],
    entryComponents: [
        MentionListComponent
    ],
    declarations: [
        MentionDirective,
        MentionListComponent
    ],
    providers: [UserAgentService]
})
export class MentionModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: MentionModule
        };
    }
}
