# LightningCat Frontend React SPA

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Getting started

Install dependencies:
```sh
npm i
```

Run local dev server:
```sh
npm start
```

## Build

```sh
npm run build
```

## Folder Structure

```
├── root/
│   ├── build/
│   ├── public/
│   │   ├── ...
│   ├── src/
│   │   ├── assets/
│   │   │   └── data/
│   │   │   └── images/
│   │   └── components/
│   │       ├── ...
│   │   └── contexts/
│   │       ├── ...
│   │   └── pages/
│   │   │   └── Account/
│   │   │   │   └── Bookings/
│   │   │   │   └── Listings/
│   │   │   │   │   └── CreateListing/
│   │   │   │   └── Profile/
│   │   │   │   └── Wallet/
│   │   │   │   │   └── TopUp/
│   │   │   │   │   └── TopUpComplete/
│   │   │   └── 404.jsx
│   │   │   └── Login.jsx
│   │   │   └── Logout.jsx
│   │   └── types/
│   │       ├── ...
│   │   └── App.jsx
│   │   └── index.jsx
│   │   └── routes.js
```

#### [index.jsx](src/index.jsx)

Entry point for entire application and injection into DOM. Providers are wrapped in the following sequence:
```jsx
<React.StrictMode>
  <ApolloProvider client={client}>
    <AuthProvider>
      <AppDataProvider>
        <NotificationProvider>
          <UserDataProvider>
            <RouterProvider router={router} />
          </UserDataProvider>
        </NotificationProvider>
      </AppDataProvider>
    </AuthProvider>
  </ApolloProvider>
</React.StrictMode>
```

#### [routes.js](src/routes.js)

Frontend routing is implemented using `react-router-dom` and our layout tree is registered using `createBrowserRouter`.

#### [App.jsx](src/App.jsx)

The meat of the application. The core of the application that bootstraps MapBox, fetches data from our backend and third-praty API to draw map layers and polygons. This feature is made available pre-login so that unauthenticated users can enjoy its features.

```jsx
// Step 1: Fetch data
useEffect(() => {
    Promise.all([
      fetch('https://api.chucklenuts.party/facilities'),
      fetch('/MasterPlan2019PlanningAreaBoundaryNoSea.processed.geojson'),
      fetch('/SportSGSportFacilitiesGEOJSON.geojson'),
      fetch('https://cc5224-bucket1.s3.ap-southeast-1.amazonaws.com/apidata/weather2h.json'),
      fetch('https://cc5224-bucket1.s3.ap-southeast-1.amazonaws.com/apidata/lightning10min.json'),
    ])
      .then((responses) => Promise.all(responses.map((r) => r.json())))
      // ...
})

// Step 2: Initialise MapBox
useEffect(() => {
  const mapInstance = new mapboxgl.Map({
    container: mapContainerRef.current,
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [103.8198, 1.3521],
    zoom: 11,
  });
  // ...
})

// Step 3: Add layers
useEffect(() => {
  if (!map) return;
  map.on('load', () => {
    if (townsGeoJson && !map.getSource('towns')) {
      map.addSource('towns', { type: 'geojson', data: townsGeoJson });
    }
  })
  // town layer, sports facility layer, lightning status layer
})
```

#### [contexts](src/contexts/)

Context providers and hooks are implemented in this folder, separating data boundaries by domain:
- [Global application data](src/contexts/appData.jsx)
- [Global notification service/data](src/contexts/notification.jsx)
- [Authentication data](src/contexts/auth.jsx)
- [User data](src/contexts/userData.jsx)

#### Frontend Structure

The application is conceptually organised by pages, with reusable components in [src/components](src/components/). Layout is composited by the [AppLayout](src/components/AppLayout.jsx) which structures the layout into 3 broad sections:
1. Navbar
2. Content body
3. Toast notifications

```jsx
<>
  <Navbar />
  <Outlet />
  <ToastContainer />
</>
```
