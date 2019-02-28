import { Component } from '@angular/core';

import { COMMON_NAMES } from '../common-names';

@Component({
  selector: 'app-demo-template',
  templateUrl: './demo-template.component.html',
  styleUrls: ['./demo-template.component.scss']
})
export class DemoTemplateComponent {

  format = (item: any) => {
    return `@${item.username}`;
  }

  onNext(searchKeyword: string) {
    let objects = COMMON_NAMES.map(name => {
      return {label: name, username: name.toLowerCase(), src: `https://dummyimage.com/20x20/249e24/fff&text=Taro+Tokyo${name}`};
    });
    objects = objects.filter(e => e['label'].toLowerCase().startsWith(searchKeyword));
    return objects;
  }

  complexItems: any[] = COMMON_NAMES.map(name => {
    return {label: name, username: name.toLowerCase(), src: `https://dummyimage.com/20x20/249e24/fff&text=Taro+Tokyo${name}`};
  });
}
