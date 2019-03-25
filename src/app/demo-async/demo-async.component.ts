
import { switchMap, distinctUntilChanged, debounceTime, mergeMap, concatMap } from 'rxjs/operators';
import { Component, OnInit } from '@angular/core';
import { Http } from '@angular/http';

import { Observable ,  Subject } from 'rxjs';






@Component({
  selector: 'app-demo-async',
  templateUrl: './demo-async.component.html'
})
export class DemoAsyncComponent implements OnInit {
  httpItems: Observable<any[]>;
  private searchTermStream = new Subject();
  ngOnInit() {
    this.httpItems = this.searchTermStream.pipe(
      debounceTime(100),
      // distinctUntilChanged(),
      // mergeMap((term: string) => this.getItems(term)));
      concatMap((term: string) => this.getItems(term)));
  }
  search(term: string) {
    console.log('---searchしてやる');
    console.log({term});
    this.searchTermStream.next(term);
  }
  format(item: any): string {
    const username = item.last_name + ' ' + item.first_name;
    return `<span class="mention" contenteditable="false">${username}</span>`;
  }


  // this should be in a separate demo-async.service.ts file
  constructor(private http: Http) { }
  getItems(term): Promise<any[]> {
    console.log('getItems:', term);
    // return this.http.get('api/names') // get all names
    // return this.http.get('api/objects?label='+term) // get filtered names
    return this.http.get('https://reqres.in/api/users?limit=30&label=' + term) // get filtered names
               .toPromise()
               .then(response => response.json().data)
               .then(data => {
                 // console.log(data);
                 return data;
               })
               .catch(this.handleError);
  }
  handleError(e) {
    console.log(e);
  }

  selectedMention(item: Object) {
    console.log(item);
  }
}
