This is a API starter is bootstrapped with [`create-api-starter`](https://www.npmjs.com/package/create-api-starter).

## Getting Started

Install npm packages and run the development server:

// azure web service configuration in package.json
npx ts-node -> node node_modules/ts-node/dist/bin.js
npx tsc -> node_modules/typescript/bin/tsc
copyfiles -> node_modules/copyfiles/copyfiles

// for aws
"prestart": "npm i && node_modules/typescript/bin/tsc && node_modules/copyfiles/copyfiles -u 1 src/\*_/_.{ico,html,png,jpg,jpeg,svg} build",

```
npm install
npm run dev
```

Open [http://localhost:5000](http://localhost:5000) with your browser to see the result.

## Available Scripts

In the project directory, you can run:

### `npm run dev`

Runs the API in the development mode.\
Open [http://localhost:5000](http://localhost:5000) to view it in your browser.

### `npm run build`

Builds the API for production to the `build` folder.

Your app is ready to be deployed!

### `npm run start`

Runs the built app in production mode.
