import React, { useState, useEffect } from 'react';

function App() {
  const [empleados, setEmpleados] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/empleados')
      .then(response => response.json())
      .then(data => setEmpleados(data))
      .catch(error => console.error('Error:', error));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Sistema de Gestión</h1>
      <h2 className="text-xl mb-3">Empleados</h2>
      
      <ul className="list-disc pl-5">
        {empleados.map(empleado => (
          <li key={empleado.id} className="mb-2">
            {empleado.nombre} - {empleado.puesto}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;