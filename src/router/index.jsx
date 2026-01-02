import { createBrowserRouter, Navigate } from 'react-router-dom'
import Login from '../pages/Login'
import Register from '../pages/Register'
import Dashboard from '../pages/Dashboard'
import DashboardHome from '../pages/DashboardHome'
import ProfileEdit from '../pages/ProfileEdit'
import LinksManage from '../pages/LinksManage'
import PublicProfile from '../pages/PublicProfile'
import ProtectedRoute from '../components/ProtectedRoute'

export const router = createBrowserRouter([
    {
        path: '/login',
        element: <Login />,
    },
    {
        path: '/register',
        element: <Register />,
    },
    {
        path: '/dashboard',
        element: (
            <ProtectedRoute>
                <Dashboard />
            </ProtectedRoute>
        ),
        children: [
            {
                index: true,
                element: <DashboardHome />,
            },
            {
                path: 'profile',
                element: <ProfileEdit />,
            },
            {
                path: 'links',
                element: <LinksManage />,
            },
        ],
    },
    {
        path: '/:username',
        element: <PublicProfile />,
    },
    {
        path: '/',
        element: <Navigate to="/login" replace />,
    },
])
