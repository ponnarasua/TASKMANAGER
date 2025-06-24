import React from 'react';
import { useUserAuth } from '../../hooks/useUserAuth';

const UserDashboard = () => {
  useUserAuth();
  return (
    <div>UserDashboard</div>
  )
}

export default UserDashboard