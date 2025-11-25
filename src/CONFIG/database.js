import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  getDocs 
} from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';

// ========== LOGO ==========
export const salvarLogo = async (logoBase64) => {
  try {
    const logoRef = ref(storage, 'configuracoes/logo.png');
    await uploadString(logoRef, logoBase64, 'data_url');
    const url = await getDownloadURL(logoRef);
    
    await setDoc(doc(db, 'configuracoes', 'logo'), {
      url: url,
      base64: logoBase64,
      updatedAt: new Date()
    });
    
    return url;
  } catch (error) {
    console.error('Erro ao salvar logo:', error);
    throw error;
  }
};

export const carregarLogo = async () => {
  try {
    const logoDoc = await getDoc(doc(db, 'configuracoes', 'logo'));
    if (logoDoc.exists()) {
      return logoDoc.data().base64;
    }
    return null;
  } catch (error) {
    console.error('Erro ao carregar logo:', error);
    return null;
  }
};

// ========== MODELOS ==========
export const salvarModelo = async (modelo) => {
  try {
    const modeloRef = doc(db, 'modelos', modelo.id.toString());
    await setDoc(modeloRef, {
      ...modelo,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return true;
  } catch (error) {
    console.error('Erro ao salvar modelo:', error);
    throw error;
  }
};

export const carregarModelos = async () => {
  try {
    const modelosSnapshot = await getDocs(collection(db, 'modelos'));
    const modelos = [];
    modelosSnapshot.forEach((doc) => {
      modelos.push(doc.data());
    });
    return modelos;
  } catch (error) {
    console.error('Erro ao carregar modelos:', error);
    return [];
  }
};

export const deletarModelo = async (id) => {
  try {
    await deleteDoc(doc(db, 'modelos', id.toString()));
    return true;
  } catch (error) {
    console.error('Erro ao deletar modelo:', error);
    throw error;
  }
};

// ========== ORÇAMENTOS ==========
export const salvarOrcamento = async (orcamento) => {
  try {
    const orcamentoRef = doc(db, 'orcamentos', orcamento.id.toString());
    await setDoc(orcamentoRef, {
      ...orcamento,
      updatedAt: new Date()
    });
    return true;
  } catch (error) {
    console.error('Erro ao salvar orçamento:', error);
    throw error;
  }
};

export const carregarOrcamentos = async () => {
  try {
    const orcamentosSnapshot = await getDocs(collection(db, 'orcamentos'));
    const orcamentos = [];
    orcamentosSnapshot.forEach((doc) => {
      orcamentos.push(doc.data());
    });
    return orcamentos;
  } catch (error) {
    console.error('Erro ao carregar orçamentos:', error);
    return [];
  }
};

export const deletarOrcamento = async (id) => {
  try {
    await deleteDoc(doc(db, 'orcamentos', id.toString()));
    return true;
  } catch (error) {
    console.error('Erro ao deletar orçamento:', error);
    throw error;
  }
};