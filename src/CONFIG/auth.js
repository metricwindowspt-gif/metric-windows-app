import { 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from './firebase';

// Login
export const fazerLogin = async (email, senha) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, senha);
    return { sucesso: true, user: userCredential.user };
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    let mensagem = 'Erro ao fazer login';
    
    if (error.code === 'auth/wrong-password') {
      mensagem = 'Senha incorreta';
    } else if (error.code === 'auth/user-not-found') {
      mensagem = 'Usuário não encontrado';
    } else if (error.code === 'auth/invalid-email') {
      mensagem = 'Email inválido';
    }
    
    return { sucesso: false, erro: mensagem };
  }
};

// Logout
export const fazerLogout = async () => {
  try {
    await signOut(auth);
    return true;
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
    return false;
  }
};

// Verificar se está logado
export const verificarUsuarioLogado = (callback) => {
  return onAuthStateChanged(auth, callback);
};
