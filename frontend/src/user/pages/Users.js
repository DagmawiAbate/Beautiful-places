import React from 'react'

import UsersList from '../components/UsersList'

const Users = () => {
  const USERS = [
    {
      id: 'u1',
      name: 'Dagmawi Abate',
      image: 'https://images.unsplash.com/photo-1658828911599-067ee5eb6a7e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=388&q=80',
      places: 3
    }
  ]

  return <UsersList items={USERS} />
}

export default Users
