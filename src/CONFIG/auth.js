// src/config/auth.js

// Importa as funções de autenticação necessárias do Firebase Authentication
import { 
  signInWithEmailAndPassword, // Função para fazer login com e-mail e senha
  signOut,                    // Função para fazer logout
  onAuthStateChanged          // Função para observar o estado de autenticação do usuário
} from 'firebase/auth';

// Importa a instância de autenticação do seu arquivo de configuração do Firebase
// Certifique-se de que 'auth' está sendo exportado corretamente de './firebase'
import { auth } from './firebase';

/**
 * @function fazerLogin
 * @description Realiza o login de um usuário com e-mail e senha no Firebase.
 * Inclui validações básicas e tratamento de erros detalhado.
 * @param {string} email - O e-mail do usuário.
 * @param {string} senha - A senha do usuário.
 * @returns {Promise<{sucesso: boolean, user?: object, erro?: string, codigo?: string, mensagem?: string}>}
 * Retorna um objeto com o status da operação, o objeto do usuário (se sucesso) ou a mensagem/código de erro.
 */
export const fazerLogin = async (email, senha) => {
  const timestamp = new Date().toISOString(); // Para logs detalhados

  // 1. Validação de entrada
  if (!email || email.trim() === '') {
    console.error(`[${timestamp}] Erro de validação: E-mail não pode ser vazio.`);
    return { sucesso: false, erro: 'O campo de e-mail não pode ser vazio.' };
  }
  if (!senha || senha.trim() === '') {
    console.error(`[${timestamp}] Erro de validação: Senha não pode ser vazia.`);
    return { sucesso: false, erro: 'O campo de senha não pode ser vazio.' };
  }
  if (senha.length < 6) {
    console.error(`[${timestamp}] Erro de validação: Senha deve ter no mínimo 6 caracteres.`);
    return { sucesso: false, erro: 'A senha deve ter no mínimo 6 caracteres.' };
  }

  try {
    console.log(`[${timestamp}] Tentando login para o e-mail: ${email}`);
    // Tenta autenticar o usuário com e-mail e senha
    const userCredential = await signInWithEmailAndPassword(auth, email, senha);
    console.log(`[${timestamp}] Login bem-sucedido para o usuário: ${userCredential.user.email}`);
    // Retorna sucesso e o objeto do usuário
    return { sucesso: true, user: userCredential.user, mensagem: "Login bem-sucedido" };
  } catch (error) {
    console.error(`[${timestamp}] Erro ao fazer login:`, error.code, error.message);
    let mensagemErroUsuario = 'Ocorreu um erro desconhecido ao tentar fazer login. Tente novamente.';

    // Mapeamento de códigos de erro do Firebase para mensagens amigáveis em português
    switch (error.code) {
      case 'auth/wrong-password':
        mensagemErroUsuario = 'A senha fornecida está incorreta. Verifique e tente novamente.';
        break;
      case 'auth/user-not-found':
      case 'auth/invalid-credential': // Firebase v9+ pode usar invalid-credential para user-not-found ou wrong-password
        mensagemErroUsuario = 'Nenhum usuário encontrado com este e-mail. Verifique o e-mail ou crie uma conta.';
        break;
      case 'auth/invalid-email':
        mensagemErroUsuario = 'O formato do e-mail é inválido. Por favor, insira um e-mail válido.';
        break;
      case 'auth/too-many-requests':
        mensagemErroUsuario = 'Muitas tentativas de login falhas. Sua conta foi temporariamente bloqueada. Tente novamente mais tarde.';
        break;
      case 'auth/network-request-failed':
        mensagemErroUsuario = 'Problema de conexão com a internet. Verifique sua conexão e tente novamente.';
        break;
      default:
        // Para outros erros não mapeados, exibe a mensagem padrão
        mensagemErroUsuario = `Erro: ${error.message}`;
        break;
    }
    
    // Retorna falha com a mensagem de erro amigável e o código do erro original
    return { sucesso: false, erro: mensagemErroUsuario, codigo: error.code };
  }
};

/**
 * @function fazerLogout
 * @description Realiza o logout do usuário atualmente autenticado no Firebase.
 * @returns {Promise<{sucesso: boolean, erro?: string, mensagem?: string}>}
 * Retorna um objeto com o status da operação e uma mensagem.
 */
export const fazerLogout = async () => {
  const timestamp = new Date().toISOString(); // Para logs detalhados
  try {
    console.log(`[${timestamp}] Tentando fazer logout...`);
    await signOut(auth);
    // Se houver dados de usuário armazenados localmente (ex: localStorage, sessionStorage),
    // este é o lugar para limpá-los. Ex: localStorage.removeItem('userData');
    console.log(`[${timestamp}] Logout realizado com sucesso.`);
    return { sucesso: true, mensagem: "Logout realizado" };
  } catch (error) {
    console.error(`[${timestamp}] Erro ao fazer logout:`, error.code, error.message);
    let mensagemErroUsuario = 'Ocorreu um erro ao tentar fazer logout. Tente novamente.';
    // Você pode adicionar mapeamento de erros específicos para logout aqui, se necessário
    return { sucesso: false, erro: mensagemErroUsuario, codigo: error.code };
  }
};

/**
 * @function verificarUsuarioLogado
 * @description Configura um observador para o estado de autenticação do usuário.
 * O callback é chamado sempre que o estado de autenticação muda (login, logout, inicialização).
 * @param {(user: object | null) => void} callback - A função a ser chamada com o objeto do usuário (ou null).
 * @returns {() => void} Uma função para cancelar a inscrição do observador (unsubscribe).
 */
export const verificarUsuarioLogado = (callback) => {
  const timestamp = new Date().toISOString(); // Para logs detalhados
  console.log(`[${timestamp}] Configurando observador de estado de autenticação.`);

  // onAuthStateChanged retorna uma função de unsubscribe
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log(`[${timestamp}] Estado de autenticação mudou: Usuário logado (${user.email}).`);
    } else {
      console.log(`[${timestamp}] Estado de autenticação mudou: Usuário deslogado.`);
    }
    // Chama o callback fornecido com o objeto do usuário ou null
    callback(user);
  });

  // Retorna a função de unsubscribe para que o componente possa limpá-la
  return unsubscribe;
};