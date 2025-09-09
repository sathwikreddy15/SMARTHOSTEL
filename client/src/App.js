import React from 'react'
import {createBrowserRouter,RouterProvider} from 'react-router-dom'
import Admin from './Components/Admin/Admin';
import ErrorLayout from './Components/ErrorLayout/ErrorLayout';
import Givecomplaint from './Components/Givecomplaint/Givecomplaint';
import LeaveRequest  from './Components/leaveRequest/leaveRequest'
import SelectRoom from './Components/SelectRoom/SelectRoom'
import Home from './Components/Home/Home';

function App() {
  let router=createBrowserRouter([
    {
      path:'',
      element:<Admin />,
      errorElement:<ErrorLayout />,
      children:[
        {
          path:'',
          element:<Home />
        },
        {
          path:'givecomplaint',
          element:<Givecomplaint />
        },
        {
          path:'leavreq',
          element:<LeaveRequest/>
        },
        {
          path:'selectroom',
          element:<SelectRoom/>
        },
      ]
    }
  ])
  return (
    <div className='app'>
      <RouterProvider router={router}></RouterProvider>
    </div>
  );
}

export default App;
