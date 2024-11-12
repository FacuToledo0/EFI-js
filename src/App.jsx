import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import UsersContainer from './Components/Users/UsersContainer';
import Accesorios from "./Components/CreateAccesorio";
import { Menubar } from 'primereact/menubar';
import Home from './Components/Home';
import CreateUser from './Components/Users/CreateUser';
import LoginUser from './Components/Users/LoginUser';
import './App.css';

function App() {

  const items = [
    { label:'Inicio', icon:'pi pi-home', url:'/'},
    { label:'Usuarios', icon:'pi pi-users', url:'/usuarios'},
    { label:'Accesorios', icon:'pi pi-users', url:'/accesorios'},
    { label:'Nuevo usuario', icon:'pi pi-user-plus', url:'/registered'},
    { label:'Iniciar sesión', icon:'pi pi-sign-in', url:'/inicio-sesion'},
  ]

  return (
    <BrowserRouter>
    <Menubar model={items} />
    <Routes>
      <Route path='/' element={<Home/>}/>
      <Route path='/usuarios' element={<UsersContainer/>} />
      <Route path='/accesorios' element={<Accesorios/>} />
      <Route path='/registered' element={<CreateUser/>} />
      <Route path='/inicio-sesion' element={<LoginUser  />}/>


    </Routes>
    </BrowserRouter>
  )
}

export default App
