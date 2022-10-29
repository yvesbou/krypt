import React from 'react';
import { Footer, Loader, Navbar, Services, Transaction, Welcome } from './components'

const App = () => {

  return (
    <div className='min-h-screen'>
      <div className='gradient-bg-welcome'>
        <Navbar/>
        <Welcome/>
      </div>
      <div>
        <Services/>
        <Transaction/>
        <Footer/>
      </div>
    </div>
  )
}

export default App
