# BETTER Web-app

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

## Directory Structure

The code has been broadly divided into the `src`, and `assets` folders. The `src` folder consists of react code and application logic, and the `assets` folder consists of static assets such as images and documents.

The entry-point for the React application lies in the `src\index.js` file.

### Components

The React components and associated styles are present in the path `src\components`. These form the JSX component tree which then translates to the DOM and JS logic of the application. Each component would exist in a directory of its own.

### Hooks

Custom React hooks are present in the path `src\hooks`. Use these to abstract out logical components/information (if any) that repeat across different components in the application.  

### Services

The path `src\services` consists of services to be used by the React components. These files abstract away underlying data sources (Eg: REST APIs) and expose domain-specific JS methods for use by components/hooks.
