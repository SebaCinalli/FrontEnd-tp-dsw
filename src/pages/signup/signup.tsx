import { useState } from "react";
import "./signup.css"
import {useNavigate} from "react-router-dom"


type CreateUserProps = {
    children?: React.ReactNode;
}

const CreateUser = ({children}: CreateUserProps) =>{
    const navigate = useNavigate();
    const GoToLogin =() =>{navigate("/login")}
    return(
        <div className="container-createUser-form">
            <h2>Crear Usuario</h2>
            <form>
                <label>Email</label>
                <input
                type="email" 
                placeholder="ingrese su correo electronico"></input>
                
                <label>Nombre</label>
                <input placeholder="ingrese su nombre"></input>

                <label>Apellido</label>
                <input placeholder="ingrese su apellido"></input>

                <label>Nombre de Usuario</label>
                <input placeholder="ingrese su nombre de usuario"></input>

                <label>Telefono</label>
                <input placeholder="ingrese su telefono"></input>

                <label>Contraseña</label>
                <input 
                type="password"
                placeholder="ingrese su contraseña"
                ></input>

                <label>Confirmar Contraseña</label>
                <input placeholder="ingrese su contraseña nuevamente"></input>


                <button>Crear Usuario</button>
                <button onClick={GoToLogin}>Volver</button>
            </form>
            {children}
        </div>
    )
}

export {CreateUser};