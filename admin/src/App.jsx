import React from 'react'
import {createBrowserRouter,RouterProvider} from 'react-router-dom'
import Admin from './Components/Admin/Admin';
import ErrorLayout from './Components/ErrorLayout/ErrorLayout';
import Complaints from './components/Complaints/Complaints';
import Logs from './components/logs/logs';
import LeaveApproval from './components/LeaveApproval/leaveApproval';
import Home from './components/Home/Home';
const App = () => {
  let router=createBrowserRouter([
    {
      path:'',
      element:<Admin />,
      errorElement:<ErrorLayout />,
      children:[
        {
          path:'',
          element: <Home/>
        },
        {
          path:'complaints',
          element: <Complaints/>
        },
        {
          path:'logs',
          element: <Logs/>
        },
        {
          path:'leaveApproval',
          element: <LeaveApproval/>
        },
      ]
    }
  ])
  return (
    <div className='app'>
      <RouterProvider router={router}></RouterProvider>
    </div>
  )
}

export default App