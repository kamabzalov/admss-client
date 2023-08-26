import { Router as RemixRouter } from '@remix-run/router/dist/router';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';
import App from 'App';
import Dashboard from 'dashboard';
import NotFound from 'not-found';
import Home from './dashboard/home';
import Inventory from './dashboard/inventory';
import SignIn from './sign/sign-in';

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
                path: '/dashboard',
                element: <Dashboard />,
                children: [
                    {
                        path: '',
                        element: <Home />,
                    },
                    {
                        path: 'inventory',
                        element: <Inventory />,
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

root.render(<RouterProvider router={router} />);
