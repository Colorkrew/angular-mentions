# Angular Mentions

Simple Angular mentions inspired by [Ment.io](https://github.com/jeff-collins/ment.io).

[Click here for a Demo](http://dmacfarlane.github.io/angular-mentions/)

Provides auto-complete suggestions for @mentions in text input fields, text areas,
and content editable fields. Not fully browser tested and comes without warranty!

To install and start the demo application:

    git clone https://github.com/dmacfarlane/angular-mentions.git
    cd angular-mentions
    npm install
    ng serve

### Usage
Add the package as a dependency to goalous project using:

    npm install --save angular-mentions


Add the module to your app.module imports:

```typescript
import { MentionModule } from 'angular-mentions/mention';
...

@NgModule({
    imports: [ MentionModule ],
    ...
})
```

Add the `[mention]` directive to your input element:

```html
<input type="text" [mention]="items">
```


#### Configuration Options

The following optional configuration items can be used.

| Option        | Default  | Description |
| ---           | ---      | ---         |
| items         |          | An array of strings or objects to suggest. |
| triggerChar   | @        | The character that will trigger the menu behavior. |
| labelKey      | label    | The field to be used as the item label (when the items are objects). |
| disableSort   | false    | Disable sorting of suggested items. |
| disableSearch | false    | Disable internal filtering (only useful if async search is used). |
| dropUp        | false    | Show the menu above the cursor instead of below. |
| maxItems      | ∞        | Limit the number of items shown in the text. The default is no limit. |
| mentionSelect |          | An optional function to format the selected item before inserting the text. |

For Example: 

```html
<input type="text" [mention]="items" [mentionConfig]="{triggerChar:'#',maxItems:10,labelKey:'name'}">
```

#### Output Events

- `(searchTerm)=""` event emitted whenever the search term changes. Can be used to trigger async search.

### Alternative Usage

The component can also be used by only specifying the mentionConfig object:

```html
<input type="text" [mentionConfig]="mentionConfig">
```

With the following structure:

```javascript
let mentionConfig = {
    items: [ "Noah", "Liam", "Mason", "Jacob", ... ],
    triggerChar: "@",
    ...
}
```

In this way, multiple config objects can be used:

```javascript
let mentionConfig = {
    mentions: [
        {
            items: [ "Noah", "Liam", "Mason", "Jacob", ... ],
            triggerChar: '@'
        },
        {
            items: [ "Red", "Yellow", "Green", ... ],
            triggerChar: '#'
        },
    }]
}
```
This allows different lists and trigger characters to be configured.

Note that becuase objects are mutable, changes to the items within the config will not be picked up unless a new mentionConfig object is created.

### How to update angular-mentions library
1. build package
```
cd ~/angular-mentions
npm run dist
```

2. git commit & push build files

3. npm install on frontend
```
cd ~/frontend(goalous-front-end repo)
npm uninstall angular-mentions && npm i -S https://github.com/IsaoCorp/angular-mentions.git\#{release tag | branch}
```

If you fix angular-mentions and use in goalous-front-end as local testing
e.g. `GL-0001` is topic branch
```
npm uninstall angular-mentions && npm i -S https://github.com/IsaoCorp/angular-mentions.git\#GL-0001
```

If you finished fixing angular-mentions and set new release tag
e.g. `1.0.3` is new release tag
```
npm uninstall angular-mentions && npm i -S https://github.com/IsaoCorp/angular-mentions.git\#1.0.3
```

