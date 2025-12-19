import { initializeApp } from 'firebase/app'
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, deleteDoc } from 'firebase/firestore'

// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBKL7VQ9r0OYEZFfUsHGjW_wqSoN5x-kMo",
    authDomain: "metric-windows-app.firebaseapp.com",
    projectId: "metric-windows-app",
    storageBucket: "metric-windows-app.firebasestorage.app",
    messagingSenderId: "312624050015",
    appId: "1:312624050015:web:df2d0c0ea0a43b7d7e0c6a"
}

// Inicializar Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

// ========== FUNÇÕES DE LOGO ==========
export const carregarLogo = async () => {
    try {
        const docRef = doc(db, 'configuracoes', 'logo')
        const docSnap = await getDoc(docRef)
        
        if (docSnap.exists()) {
            return docSnap.data().logoBase64
        }
        return null
    } catch (error) {
        console.error('❌ Erro ao carregar logo:', error)
        return null
    }
}

export const salvarLogo = async (logoBase64) => {
    try {
        await setDoc(doc(db, 'configuracoes', 'logo'), {
            logoBase64: logoBase64,
            dataAtualizacao: new Date().toISOString()
        })
        console.log('✅ Logo salvo no Firebase!')
        return true
    } catch (error) {
        console.error('❌ Erro ao salvar logo:', error)
        throw error
    }
}

// ========== FUNÇÕES DE MODELOS ==========
export const carregarModelos = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, 'modelos'))
        const modelos = []
        
        querySnapshot.forEach((doc) => {
            modelos.push({
                id: doc.id,
                ...doc.data()
            })
        })
        
        console.log(`✅ ${modelos.length} modelos carregados do Firebase`)
        return modelos
    } catch (error) {
        console.error('❌ Erro ao carregar modelos:', error)
        return []
    }
}

export const salvarModelo = async (modelo) => {
    try {
        console.log('🔄 [DATABASE] Salvando modelo no Firebase...', modelo.id)
        console.log('📊 [DATABASE] Dados do modelo:', modelo)
        
        await setDoc(doc(db, 'modelos', modelo.id.toString()), {
            nome: modelo.nome,
            descricao: modelo.descricao || '', // ← SALVAR DESCRIÇÃO
            foto: modelo.foto,
            dataCriacao: modelo.dataCriacao
        })
        
        console.log('✅ [DATABASE] Modelo salvo no Firebase!')
        return true
    } catch (error) {
        console.error('❌ [DATABASE] Erro ao salvar modelo:', error)
        console.error('❌ [DATABASE] Código do erro:', error.code)
        console.error('❌ [DATABASE] Mensagem do erro:', error.message)
        throw error
    }
}

export const deletarModelo = async (id) => {
    try {
        console.log('🔄 [DATABASE] Deletando modelo...', id)
        await deleteDoc(doc(db, 'modelos', id.toString()))
        console.log('✅ [DATABASE] Modelo deletado do Firebase!')
        return true
    } catch (error) {
        console.error('❌ [DATABASE] Erro ao deletar modelo:', error)
        throw error
    }
}

// ========== FUNÇÕES DE ORÇAMENTOS ==========
export const carregarOrcamentos = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, 'orcamentos'))
        const orcamentos = []
        
        querySnapshot.forEach((doc) => {
            orcamentos.push({
                id: doc.id,
                ...doc.data()
            })
        })
        
        console.log(`✅ ${orcamentos.length} orçamentos carregados do Firebase`)
        return orcamentos
    } catch (error) {
        console.error('❌ Erro ao carregar orçamentos:', error)
        return []
    }
}

export const salvarOrcamento = async (orcamento) => {
    try {
        console.log('🔄 [DATABASE] Salvando orçamento no Firebase...', orcamento.id)
        console.log('📊 [DATABASE] Dados do orçamento:', orcamento)
        
        await setDoc(doc(db, 'orcamentos', orcamento.id.toString()), {
            dataCriacao: orcamento.dataCriacao,
            dataModificacao: orcamento.dataModificacao,
            cliente: orcamento.cliente,
            janelas: orcamento.janelas,
            condicoesFornecimento: orcamento.condicoesFornecimento,
            temLogo: orcamento.temLogo
        })
        
        console.log('✅ [DATABASE] Orçamento salvo no Firebase!')
        return true
    } catch (error) {
        console.error('❌ [DATABASE] Erro ao salvar orçamento:', error)
        console.error('❌ [DATABASE] Código do erro:', error.code)
        console.error('❌ [DATABASE] Mensagem do erro:', error.message)
        throw error
    }
}

export const deletarOrcamento = async (id) => {
    try {
        console.log('🔄 [DATABASE] Deletando orçamento...', id)
        await deleteDoc(doc(db, 'orcamentos', id.toString()))
        console.log('✅ [DATABASE] Orçamento deletado do Firebase!')
        return true
    } catch (error) {
        console.error('❌ [DATABASE] Erro ao deletar orçamento:', error)
        throw error
    }
}