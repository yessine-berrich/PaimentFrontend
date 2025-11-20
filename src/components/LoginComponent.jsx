import React, { useState } from "react";
import { login } from "../api/service";
import './LoginComponent.css';
function LoginComponent({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // ... (imports et états)

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Si la connexion réussit (token retourné)
      const token = await login(email, password);
      
      localStorage.setItem('jwtToken', token);
      onLoginSuccess(token);

    } catch (err) {
      // 🚨 GESTION DES ERREURS DU FRONTEND ET DU BACKEND 🚨
      
      let errorMessage = "Échec de la connexion. Veuillez réessayer.";

      // 1. Récupérer le message de l'erreur lancée par notre service (cas 'success: false')
      if (err instanceof Error) {
        errorMessage = err.message; // Ex: "Votre compte n'est pas encore actif..."
      } 
      // 2. Gérer les erreurs HTTP standard (ex: 404 du proxy, 500 du serveur)
      else if (err.response && err.response.data) {
        // Axios a capturé une erreur HTTP (si le backend utilisait parfois des 4xx)
        errorMessage = err.response.data.message || errorMessage;
      }
      
      console.error("Erreur de connexion:", err);
      setError(errorMessage);

    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="login-page">
            <div className="login-container">
                <h2>Connexion 🔑</h2>
                <form onSubmit={handleSubmit} className="login-form">
                    
                    {error && <p className="error-message">{error}</p>}

                    <div>
                        <label htmlFor="email">Email:</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>

                    <div>
                        <label htmlFor="password">Mot de passe:</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>

                    
                    <button type="submit" disabled={loading} className="login-button">
                        {loading ? "Connexion en cours..." : "Se connecter"}
                    </button>
                    {/* ❌ LIEN DECONNEXION SUPPRIMÉ ICI pour éviter le doublon visible sur l'image */}
                </form>
                {/* Ajout d'un message pour le lien d'inscription, mais sans lien actif.
                  L'inscription est gérée par le composant App.js
                */}
                <p>Pas encore de compte ? S'inscrire</p>
                
            </div>
        </div>
  );
}

export default LoginComponent;
