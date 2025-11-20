import React, { useState } from 'react';
import { register } from '../api/service';
import './RegisterComponent.css';

// Définition des options de rôles (Correspond aux constantes de votre backend)
const ROLES_OPTIONS = [
  'COMPTABLE',
  'FORMATEUR',
  'COORDINATEUR',
];

function RegisterComponent({ onRegistrationComplete }) {
  // 🚨 État initial avec tous les champs requis par le DTO
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    password: '',
    n_cin: '', 
    rib: '',
    banque: '',
    role: ROLES_OPTIONS[0], // Défaut à 'ADMIN' ou un rôle par défaut souhaité
  });
  
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Gère la mise à jour des champs du formulaire
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Gère la soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setSuccess(false);

    try {
      // 1. Appel de l'API d'inscription
      await register(formData);
      
      setSuccess(true);
      // 2. Redirection automatique vers la connexion après 3 secondes
      setTimeout(() => onRegistrationComplete(), 3000); 

    } catch (err) {
      // 3. Gestion des erreurs (ex: Email déjà utilisé, données invalides)
      const errorMessage = err.response?.data?.message || "Erreur lors de l'inscription. Vérifiez les données.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // --- Rendu conditionnel du message de succès ---
  if (success) {
    return (
      <div className="success-container">
        <h2>✅ Inscription Réussie</h2>
        <p>Votre compte a été créé. Il est en **attente d'activation** par un administrateur.</p>
        <p>Redirection vers la page de connexion...</p>
      </div>
    );
  }

  // --- Rendu du formulaire d'inscription ---
  return (
    <div className="register-page">
            <div className="register-container">
                <h2>Inscription 📝</h2>
                {/* Utilisation de la classe CSS pour l'erreur */}
                {error && <p className="error-message">{error}</p>}
                
                {/* Utilisation de la classe CSS pour le formulaire */}
                <form onSubmit={handleSubmit} className="register-form">
                    
                    {/* Informations de base et d'authentification */}
                    <input name="nom" type="text" placeholder="Nom" value={formData.nom} onChange={handleChange} required disabled={loading} />
                    <input name="prenom" type="text" placeholder="Prénom" value={formData.prenom} onChange={handleChange} required disabled={loading} />
                    <input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} required disabled={loading} />
                    <input name="password" type="password" placeholder="Mot de passe" value={formData.password} onChange={handleChange} required disabled={loading} />

                    {/* Informations Identité/Bancaires */}
                    <input name="n_cin" type="text" placeholder="N° CIN (Ex: 121163...)" value={formData.n_cin} onChange={handleChange} required disabled={loading} />
                    <input name="rib" type="text" placeholder="RIB (Ex: 141474...)" value={formData.rib} onChange={handleChange} required disabled={loading} />
                    <input name="banque" type="text" placeholder="Nom de la banque" value={formData.banque} onChange={handleChange} required disabled={loading} />

                    {/* Sélecteur de Rôle */}
                    <label htmlFor="role">Sélectionnez le Rôle :</label>
                    <select 
                        id="role"
                        name="role" 
                        value={formData.role} 
                        onChange={handleChange} 
                        required
                        disabled={loading}
                    >
                        {/* Génération dynamique des options */}
                        {ROLES_OPTIONS.map((role, index) => (
                            <option key={index} value={role}>
                                {role}
                            </option>
                        ))}
                    </select>

                    {/* Utilisation de la classe CSS pour le bouton */}
                    <button type="submit" disabled={loading} className="register-button">
                        {loading ? "Enregistrement en cours..." : "S'inscrire"}
                    </button>
                </form>
                
                {/* Lien de basculement vers la connexion (géré par le composant App) */}
                <p>
                    Déjà un compte ? <a href="#" onClick={(e) => { e.preventDefault(); onRegistrationComplete(); }}>Se connecter</a>
                </p>
            </div>
        </div>
  );
}

export default RegisterComponent;