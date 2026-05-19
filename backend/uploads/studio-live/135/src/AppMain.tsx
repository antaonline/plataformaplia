

//CÓDIGO REACT COMPLETO - INICIO DEL ARCHIVO

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BrowserRouter as Router, Route, Switch, Link } from 'react-router-dom';

const styles = ['HipHop', 'BreakDance', 'Popping', 'Locking', 'House'];

const Header = () => (
  <header className="bg-gray-900 text-white p-4">
    <h1 className="text-3xl font-bold text-center">Urban Vibe Studio</h1>
    <nav className="flex justify-center space-x-4 mt-2">
      {styles.map(style => (
        <Link key={style} to={`/${style.toLowerCase()}`} className="hover:underline">
          {style}
        </Link>
      ))}
    </nav>
  </header>
);

const Footer = () => (
  <footer className="bg-gray-900 text-white p-4 text-center mt-12">
    <p>&copy; 2023 Urban Vibe Studio</p>
  </footer>
);

const Home = () => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8">
    <h2 className="text-2xl font-bold mb-4">Bienvenido a Urban Vibe Studio</h2>
    <p className="mb-8">Descubre la energía inigualable de nuestros estilos de danza urbana en un ambiente creado para inspirarte y desafiarte todos los días.</p>
  </motion.div>
);

const StylePage = ({ match }) => {
  const styleName = match.params.style;
  const descriptions = {
    hiphop: 'El HipHop es un estilo energético y versátil que combina música, danza y expresión artística.',
    breakdance: 'El Break Dance es una expresión dinámica del cuerpo que combina ritmo, acrobacias y creatividad.',
    popping: 'El Popping se caracteriza por movimientos de explosión y contracción musculares ritmráched.',
    locking: 'El Locking destaca por sus movimientos de parada repentina y energía vibrante.',
    house: 'El House fusiona pasos rápidos, giros y una profunda conexión con la música house.'
  };

  return (
    <motion.div initial={{ x: -100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="p-8">
      <h2 className="text-2xl font-bold capitalize">{styleName}</h2>
      <p>{descriptions[styleName]}</p>
    </motion.div>
  );
};

const AppMain = () => {
  return (
    <Router>
      <div className="min-h-screen bg-black text-white flex flex-col">
        <Header />
        <main className="flex-grow">
          <Switch>
            <Route path="/:style" component={StylePage} />
            <Route path="/" component={Home} exact />
          </Switch>
        </main>
        <Footer />
      </div>
    </Router>
  );
};

export default AppMain;

//CÓDIGO REACT COMPLETO - FIN DEL ARCHIVO

