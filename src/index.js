import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Уверете се, че този файл съществува и съдържа необходимите стилове
import App from './App';
import reportWebVitals from './reportWebVitals'; // Това е опционално, зависи от нуждите на вашето приложение

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Ако искате да започнете измерване на представянето на приложението, предайте функция
// за логване на резултатите (например: reportWebVitals(console.log))
// или изпратете до аналитичен крайна точка. Научете повече: https://bit.ly/CRA-vitals
reportWebVitals();
