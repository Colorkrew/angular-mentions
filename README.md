# Angular Mentions (Forked)

Refer to [original repo](https://github.com/dmacfarlane/angular-mentions) for actual README, however the demo instructions are mostly invalid.

## Release Procedure

Update the version number in  `projects/angular-mentions/package.json` to modify the generated tarball version number.

Compile a tarball containing the compiled code for `npm install` to use

```bash
npm install
npm run package
```

Manually upload the tarball under the `dist` folder to the Github release, update the URL in `package.json` to reference the new tarball location.
