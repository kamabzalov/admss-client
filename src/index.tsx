import { Router as RemixRouter } from '@remix-run/router/dist/router';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';
import reportWebVitals from './reportWebVitals';
import App from 'App';
import Dashboard from 'dashboard';
import SignIn from 'auth/sign-in';
import SignUp from 'auth/sign-up';
import NotFound from 'not-found';
import Home from './dashboard/home';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

const router: RemixRouter = createBrowserRouter([
    {
        path: '/',
        element: <App />,
        errorElement: <NotFound />,
        children: [
            {
                path: '',
                element: <SignIn />,
            },
            {
                path: 'sign-up',
                element: <SignUp />,
            },
            {
                path: '/dashboard',
                element: <Dashboard />,
                children: [
                    {
                        path: '',
                        element: <Home />,
                    },
                    {
                        path: 'inventory',
                        element: <h1>Inventory</h1>,
                    },
                    {
                        path: 'contacts',
                        element: <h1>Contacts</h1>,
                    },
                    {
                        path: 'deals',
                        element: <h1>Deals</h1>,
                    },
                    {
                        path: 'accounts',
                        element: <h1>Accounts</h1>,
                    },
                    {
                        path: 'reports',
                        element: <h1>Reports</h1>,
                    },
                ],
            },
        ],
    },
]);

root.render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
