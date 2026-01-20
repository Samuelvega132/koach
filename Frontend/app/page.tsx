export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-4">🎤 Koach</h1>
      <p className="text-gray-600 mb-8">Karaoke Coach Vocal - Proyecto Académico</p>
      
      <div className="bg-white shadow-lg rounded-lg p-6 max-w-md">
        <h2 className="text-xl font-semibold mb-4">✅ Frontend funcionando</h2>
        <p className="text-sm text-gray-700 mb-4">
          Asegúrate de que el backend esté corriendo en:
        </p>
        <code className="block bg-gray-100 p-2 rounded text-sm mb-4">
          http://localhost:3001
        </code>
        
        <h3 className="text-lg font-semibold mt-6 mb-2">Próximos pasos:</h3>
        <ol className="list-decimal list-inside text-sm text-gray-700 space-y-1">
          <li>Configurar PostgreSQL</li>
          <li>Ejecutar prisma:migrate en Backend</li>
          <li>Ejecutar prisma:seed</li>
          <li>Construir interfaz paso a paso</li>
        </ol>
      </div>
    </main>
  );
}
