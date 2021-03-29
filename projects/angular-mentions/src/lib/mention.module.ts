import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MentionDirective} from './mention.directive';
import {MentionListComponent} from './mention-list.component';
import {UserAgentService} from './user-agent.service';

@NgModule({
  declarations: [
    MentionDirective,
    MentionListComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    MentionDirective
  ],
  entryComponents: [
    MentionListComponent
  ],
  providers: [
    UserAgentService
  ]
})
export class MentionModule {}
